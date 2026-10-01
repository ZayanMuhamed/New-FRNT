import puppeteer from 'puppeteer-core'
import path from 'path'
import fs from 'fs'

const ARTIFACT_DIR = 'C:/Users/zayan/.gemini/antigravity-ide/brain/3d891c32-7c1e-42c1-bd98-75e23e79c230'
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5173'

function luminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

function contrastRatio(rgb1, rgb2) {
  const l1 = luminance(rgb1.r, rgb1.g, rgb1.b) + 0.05
  const l2 = luminance(rgb2.r, rgb2.g, rgb2.b) + 0.05
  return l1 > l2 ? l1 / l2 : l2 / l1
}

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (!match) return { r: 255, g: 255, b: 255, a: 1 }
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
    a: match[4] !== undefined ? parseFloat(match[4]) : 1,
  }
}

function compositeColor(fgRgba, bgRgb = { r: 4, g: 6, b: 13 }) {
  const a = fgRgba.a !== undefined ? fgRgba.a : 1
  return {
    r: Math.round(bgRgb.r * (1 - a) + fgRgba.r * a),
    g: Math.round(bgRgb.g * (1 - a) + fgRgba.g * a),
    b: Math.round(bgRgb.b * (1 - a) + fgRgba.b * a),
  }
}

async function run() {
  console.log('Starting Multi-Viewport and Accessibility Test Suite...')

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000'],
  })

  const page = await browser.newPage()
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text())
  })

  // Authenticate session via sessionStorage
  await page.goto(`${BASE_URL}/student`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    sessionStorage.setItem(
      'hermes_auth_session',
      JSON.stringify({
        id: 'stu_1',
        name: 'Alex Vance',
        email: 'alex.vance@hermes.edu',
        role: 'student',
        studentId: 'STU-2026-8942',
        token: 'mock_token',
      })
    )
  })

  const viewports = [
    { name: '360px', width: 360, height: 740, filename: 'viewport_360px.png' },
    { name: '768px', width: 768, height: 1024, filename: 'viewport_768px.png' },
    { name: '1024px', width: 1024, height: 768, filename: 'viewport_1024px.png' },
    { name: '1440px', width: 1440, height: 900, filename: 'viewport_1440px.png' },
  ]

  const overallResults = {
    testDate: new Date().toISOString(),
    viewportsTested: {},
    summary: {
      allPassed: true,
      horizontalScrollFailures: 0,
      tapTargetFailures: 0,
      focusRingFailures: 0,
      contrastFailures: 0,
      progressBarFailures: 0,
    },
  }

  for (const vp of viewports) {
    console.log(`\n==================================================`)
    console.log(`Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`)
    console.log(`==================================================`)

    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 })
    await page.goto(`${BASE_URL}/student/dashboard`, { waitUntil: 'networkidle0' })
    // Wait for skeleton/mock loading delay to settle
    await new Promise((r) => setTimeout(r, 800))

    // 1. Horizontal Scroll Check
    const scrollMetrics = await page.evaluate((targetWidth) => {
      const docScrollWidth = document.documentElement.scrollWidth
      const bodyScrollWidth = document.body.scrollWidth
      const windowWidth = window.innerWidth
      const hasHorizontalScroll = docScrollWidth > windowWidth || bodyScrollWidth > windowWidth

      const overflowing = []
      document.querySelectorAll('*').forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.right > windowWidth + 0.5 || rect.left < -0.5) {
          overflowing.push({
            tag: el.tagName,
            id: el.id,
            className: el.className?.toString?.().slice(0, 50),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          })
        }
      })

      return {
        targetWidth,
        windowWidth,
        docScrollWidth,
        bodyScrollWidth,
        hasHorizontalScroll,
        overflowingElements: overflowing.slice(0, 5),
      }
    }, vp.width)

    console.log(
      `Horizontal Scroll: ${scrollMetrics.hasHorizontalScroll ? 'FAILED ❌' : 'PASSED ✅'} (doc: ${scrollMetrics.docScrollWidth}px, window: ${scrollMetrics.windowWidth}px)`
    )
    if (scrollMetrics.hasHorizontalScroll) {
      overallResults.summary.allPassed = false
      overallResults.summary.horizontalScrollFailures++
      console.log('Overflowing elements:', scrollMetrics.overflowingElements)
    }

    // 2. Tap Targets Check (>= 44px x 44px)
    const tapTargetMetrics = await page.evaluate(() => {
      const interactiveSelectors = 'button, a, input, select, textarea, [role="button"], [tabindex="0"]'
      const candidates = Array.from(document.querySelectorAll(interactiveSelectors))
      const results = []
      const smallTargets = []

      candidates.forEach((el) => {
        const style = window.getComputedStyle(el)
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return
        const rect = el.getBoundingClientRect()
        if (rect.width === 0 && rect.height === 0) return

        const text = (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 35)
        const info = {
          tag: el.tagName,
          text,
          id: el.id,
          role: el.getAttribute('role'),
          width: Math.round(rect.width * 10) / 10,
          height: Math.round(rect.height * 10) / 10,
          passed: rect.width >= 44 && rect.height >= 44,
        }

        results.push(info)
        if (!info.passed) {
          smallTargets.push(info)
        }
      })

      return {
        totalEvaluated: results.length,
        smallTargetsCount: smallTargets.length,
        smallTargets,
        allPassed: smallTargets.length === 0,
      }
    })

    console.log(
      `Tap Targets (>=44px): ${tapTargetMetrics.allPassed ? 'PASSED ✅' : 'FAILED ❌'} (${tapTargetMetrics.totalEvaluated - tapTargetMetrics.smallTargetsCount}/${tapTargetMetrics.totalEvaluated} valid)`
    )
    if (!tapTargetMetrics.allPassed) {
      overallResults.summary.allPassed = false
      overallResults.summary.tapTargetFailures++
      console.log('Small targets found:', tapTargetMetrics.smallTargets)
    }

    // 3. Progress Bars ARIA Check
    const progressBarMetrics = await page.evaluate(() => {
      const progressbars = Array.from(document.querySelectorAll('[role="progressbar"]'))
      const details = []
      let missingAttributesCount = 0

      progressbars.forEach((el) => {
        const valuenow = el.getAttribute('aria-valuenow')
        const valuemin = el.getAttribute('aria-valuemin')
        const valuemax = el.getAttribute('aria-valuemax')
        const ariaLabel = el.getAttribute('aria-label')
        const ariaLabelledby = el.getAttribute('aria-labelledby')

        const hasValueNow = valuenow !== null && !isNaN(Number(valuenow))
        const hasMinMax = valuemin === '0' && valuemax === '100'
        const hasLabel = Boolean((ariaLabel && ariaLabel.trim()) || (ariaLabelledby && ariaLabelledby.trim()))

        const isValid = hasValueNow && hasMinMax && hasLabel
        if (!isValid) missingAttributesCount++

        details.push({
          tag: el.tagName,
          id: el.id,
          valuenow,
          valuemin,
          valuemax,
          ariaLabel,
          ariaLabelledby,
          isValid,
        })
      })

      return {
        totalProgressBars: progressbars.length,
        missingAttributesCount,
        allPassed: progressbars.length > 0 && missingAttributesCount === 0,
        details,
      }
    })

    console.log(
      `Progress Bars ARIA: ${progressBarMetrics.allPassed ? 'PASSED ✅' : 'FAILED ❌'} (${progressBarMetrics.totalProgressBars} bars evaluated, ${progressBarMetrics.totalProgressBars - progressBarMetrics.missingAttributesCount} valid)`
    )
    if (!progressBarMetrics.allPassed) {
      overallResults.summary.allPassed = false
      overallResults.summary.progressBarFailures++
      console.log('Invalid progress bars:', progressBarMetrics.details.filter((d) => !d.isValid))
    }

    // 4. Focus Rings Check
    const focusRingMetrics = await page.evaluate(() => {
      const interactiveEls = Array.from(
        document.querySelectorAll('button, a, [role="button"], [tabindex="0"]')
      )
      const issues = []

      interactiveEls.forEach((el) => {
        const style = window.getComputedStyle(el)
        if (style.display === 'none' || style.visibility === 'hidden') return
        const rect = el.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return

        el.focus()
        const activeStyle = window.getComputedStyle(el)
        const outlineStyle = activeStyle.outlineStyle
        const outlineWidth = parseFloat(activeStyle.outlineWidth) || 0
        const boxShadow = activeStyle.boxShadow
        const hasVisibleFocus =
          (outlineStyle !== 'none' && outlineWidth > 0) || (boxShadow !== 'none' && boxShadow.includes('px'))

        if (!hasVisibleFocus) {
          issues.push({
            tag: el.tagName,
            text: (el.innerText || el.getAttribute('aria-label') || '').slice(0, 25),
            outline: activeStyle.outline,
            boxShadow: activeStyle.boxShadow,
          })
        }
      })

      return {
        totalEvaluated: interactiveEls.length,
        issuesCount: issues.length,
        allPassed: issues.length === 0,
        issues,
      }
    })

    console.log(
      `Focus Rings: ${focusRingMetrics.allPassed ? 'PASSED ✅' : 'FAILED ❌'} (${focusRingMetrics.totalEvaluated - focusRingMetrics.issuesCount}/${focusRingMetrics.totalEvaluated} visible)`
    )
    if (!focusRingMetrics.allPassed) {
      overallResults.summary.allPassed = false
      overallResults.summary.focusRingFailures++
      console.log('Focus ring issues:', focusRingMetrics.issues)
    }

    // 5. Text Contrast Check (computed against effective element background)
    const textContrastMetrics = await page.evaluate(() => {
      function getEffectiveBg(el) {
        let curr = el
        while (curr) {
          const style = window.getComputedStyle(curr)
          const bg = style.backgroundColor
          if (
            bg &&
            bg !== 'transparent' &&
            bg !== 'rgba(0, 0, 0, 0)' &&
            !bg.startsWith('rgba(0, 0, 0, 0.')
          ) {
            return bg
          }
          curr = curr.parentElement
        }
        return 'rgb(4, 6, 13)' // default dark background
      }

      const textNodes = []
      document.querySelectorAll('h1, h2, h3, p, span, button, a').forEach((el) => {
        if (el.children.length === 0 && el.textContent?.trim().length > 0) {
          const style = window.getComputedStyle(el)
          if (style.display === 'none' || style.visibility === 'hidden') return

          textNodes.push({
            tag: el.tagName,
            text: el.textContent.trim().slice(0, 35),
            color: style.color,
            effectiveBg: getEffectiveBg(el),
            fontSize: parseFloat(style.fontSize),
            fontWeight: style.fontWeight,
          })
        }
      })
      return textNodes
    })

    const lowContrastItems = []
    for (const item of textContrastMetrics) {
      const rawText = parseRgb(item.color)
      const rawBg = parseRgb(item.effectiveBg)
      const effectiveBgRgb = compositeColor(rawBg)
      const effectiveTextRgb = compositeColor(rawText, effectiveBgRgb)
      const ratio = contrastRatio(effectiveTextRgb, effectiveBgRgb)
      const isLarge = item.fontSize >= 18 || (item.fontSize >= 14 && parseInt(item.fontWeight, 10) >= 700)
      const threshold = isLarge ? 3.0 : 4.5
      if (ratio < threshold) {
        lowContrastItems.push({
          ...item,
          ratio: Math.round(ratio * 100) / 100,
          threshold,
        })
      }
    }

    console.log(
      `Text Contrast (WCAG AA): ${lowContrastItems.length === 0 ? 'PASSED ✅' : 'FAILED ❌'} (${textContrastMetrics.length - lowContrastItems.length}/${textContrastMetrics.length} compliant)`
    )
    if (lowContrastItems.length > 0) {
      overallResults.summary.allPassed = false
      overallResults.summary.contrastFailures += lowContrastItems.length
      console.log('Low contrast items:', lowContrastItems.slice(0, 5))
    }

    // Capture Viewport Screenshot
    const screenshotPath = path.join(ARTIFACT_DIR, vp.filename)
    await page.screenshot({ path: screenshotPath, fullPage: false })
    console.log(`Saved screenshot: ${vp.filename}`)

    overallResults.viewportsTested[vp.name] = {
      horizontalScroll: scrollMetrics,
      tapTargets: tapTargetMetrics,
      progressBars: progressBarMetrics,
      focusRings: focusRingMetrics,
      textContrast: {
        totalEvaluated: textContrastMetrics.length,
        lowContrastCount: lowContrastItems.length,
        allPassed: lowContrastItems.length === 0,
      },
      screenshot: vp.filename,
    }
  }

  // 6. Test specific keyboard focus ring screenshot on desktop
  console.log('\n--- Capturing Keyboard Focus Demonstration Screenshot ---')
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(`${BASE_URL}/student/dashboard`, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 600))
  await page.focus('[role="tablist"] button')
  const focusScreenshotPath = path.join(ARTIFACT_DIR, 'keyboard_focus_ring.png')
  await page.screenshot({ path: focusScreenshotPath })
  console.log('Saved keyboard_focus_ring.png')

  // Write full audit report
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'dashboard_audit_report.json'),
    JSON.stringify(overallResults, null, 2)
  )

  console.log('\n==================================================')
  console.log(`AUDIT COMPLETE: ${overallResults.summary.allPassed ? 'ALL CHECKS PASSED ✅' : 'SOME CHECKS FAILED ❌'}`)
  console.log('==================================================')

  await browser.close()
}

run().catch((err) => {
  console.error('Test execution failed:', err)
  process.exit(1)
})
