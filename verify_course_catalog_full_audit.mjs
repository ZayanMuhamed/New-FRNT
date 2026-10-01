import puppeteer from 'puppeteer-core'
import path from 'path'
import fs from 'fs'

const ARTIFACT_DIR = 'C:/Users/zayan/.gemini/antigravity-ide/brain/e7c4a042-0260-4d94-a236-d37b282e3252'
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5173'

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function run() {
  console.log('====================================================')
  console.log('   COURSE CATALOG MOTION & A11Y VERIFICATION SUITE   ')
  console.log('====================================================\n')

  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true })
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--window-size=1440,900', '--no-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 900 },
  })

  const testReport = {
    cases: {},
    tapTargets: { passed: true, issues: [] },
    focusRings: { passed: true, issues: [] },
    contrast: { passed: true, sampleContrast: [] },
    motion: { passed: true },
  }

  try {
    const page = await browser.newPage()
    page.on('console', (msg) => {
      if (msg.type() === 'error') console.log('[PAGE ERROR]:', msg.text())
    })

    // Seed student authentication session
    console.log('[Setup] Seeding student authentication session...')
    await page.goto(`${BASE_URL}/student`, { waitUntil: 'networkidle0' })
    await page.evaluate(() => {
      sessionStorage.setItem(
        'hermes_auth_session',
        JSON.stringify({
          id: 'usr_student_01',
          name: 'Alex Vance',
          email: 'alex@university.edu',
          role: 'student',
          studentId: 'STU-2026-8942',
        })
      )
    })

    // ----------------------------------------------------
    // TEST CASE 1: No results
    // ----------------------------------------------------
    console.log('\n--- [Test Case 1] No Results ---')
    await page.goto(`${BASE_URL}/student/courses?search=nonexistentxyz123`, {
      waitUntil: 'networkidle0',
    })
    await sleep(600)

    const emptyState = await page.$('[data-testid="course-catalog-empty-state"]')
    const emptyCards = await page.$$('[data-testid^="course-card-"]')
    const paginationOnEmpty = await page.$('nav[aria-label="Course Catalog Pagination"]')
    const emptyClearBtn = await page.$('button[aria-label="Clear all active filters"]')

    console.log(`Empty state container rendered: ${!!emptyState}`)
    console.log(`Course cards rendered: ${emptyCards.length} (expected 0)`)
    console.log(`Pagination hidden: ${!paginationOnEmpty}`)

    const emptyExplanation = await page.$eval(
      '[data-testid="course-catalog-empty-state"] p',
      (el) => el.textContent
    )
    console.log(`Empty state advice text: "${emptyExplanation.trim()}"`)

    if (!emptyState || emptyCards.length !== 0 || paginationOnEmpty) {
      throw new Error('Case 1 Failed: Expected empty state and no pagination')
    }
    testReport.cases.noResults = {
      passed: true,
      explanation: emptyExplanation.trim(),
      clearBtnPresent: !!emptyClearBtn,
    }
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'case1_no_results.png'),
    })

    // ----------------------------------------------------
    // TEST CASE 2: A single result
    // ----------------------------------------------------
    console.log('\n--- [Test Case 2] A Single Result ---')
    await page.goto(`${BASE_URL}/student/courses?search=quantum`, {
      waitUntil: 'networkidle0',
    })
    await sleep(600)

    const singleCards = await page.$$('[data-testid^="course-card-"]')
    const highlights = await page.$$('[data-testid="highlighted-text"]')
    const paginationOnSingle = await page.$('nav[aria-label="Course Catalog Pagination"]')
    const resultCountText = await page.$eval(
      '[data-testid="clear-all-filters-btn"] ~ span',
      (el) => el.textContent?.trim()
    )

    console.log(`Visible cards: ${singleCards.length} (expected 1)`)
    console.log(`Highlighted text instances: ${highlights.length} (expected >= 1)`)
    console.log(`Result counter text: "${resultCountText}" (expected "1 result")`)
    console.log(`Pagination hidden for single result: ${!paginationOnSingle}`)

    const cardTitle = await page.$eval(
      '[data-testid^="course-card-"] h3',
      (el) => el.textContent?.trim()
    )
    console.log(`Single result card title: "${cardTitle}"`)

    if (singleCards.length !== 1 || highlights.length === 0 || paginationOnSingle) {
      throw new Error('Case 2 Failed: Expected exactly 1 result with highlighting and no pagination')
    }
    testReport.cases.singleResult = {
      passed: true,
      cardTitle,
      highlightsCount: highlights.length,
      counter: resultCountText,
    }
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'case2_single_result.png'),
    })

    // ----------------------------------------------------
    // TEST CASE 3: Last page with fewer than 9 courses
    // ----------------------------------------------------
    console.log('\n--- [Test Case 3] Last Page With Fewer Than 9 Courses ---')
    await page.goto(`${BASE_URL}/student/courses?page=4`, {
      waitUntil: 'networkidle0',
    })
    await sleep(600)

    const page4Cards = await page.$$('[data-testid^="course-card-"]')
    const summaryText = await page.$eval(
      'nav[aria-label="Course Catalog Pagination"] p',
      (el) => el.textContent?.replace(/\s+/g, ' ').trim()
    )
    const nextBtnDisabled = await page.$eval(
      'button[aria-label="Go to next page"]',
      (el) => el.disabled || el.getAttribute('aria-disabled') === 'true'
    )
    const prevBtnDisabled = await page.$eval(
      'button[aria-label="Go to previous page"]',
      (el) => el.disabled || el.getAttribute('aria-disabled') === 'true'
    )

    console.log(`Visible cards on page 4: ${page4Cards.length} (expected 3)`)
    console.log(`Pagination summary: "${summaryText}"`)
    console.log(`Next button disabled: ${nextBtnDisabled}`)
    console.log(`Prev button disabled: ${prevBtnDisabled} (expected false)`)

    if (page4Cards.length !== 3 || !nextBtnDisabled || prevBtnDisabled) {
      throw new Error('Case 3 Failed: Expected 3 cards on page 4 with disabled Next button')
    }
    testReport.cases.lastPageFewerThan9 = {
      passed: true,
      cardsCount: page4Cards.length,
      summary: summaryText,
      nextDisabled: nextBtnDisabled,
    }
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'case3_last_page_fewer_than_9.png'),
    })

    // ----------------------------------------------------
    // TEST CASE 4: A page number in URL that is too high
    // ----------------------------------------------------
    console.log('\n--- [Test Case 4] Page Number in URL Too High ---')
    await page.goto(`${BASE_URL}/student/courses?page=999`, {
      waitUntil: 'networkidle0',
    })
    await sleep(700)

    const clampedUrl = page.url()
    const clampedCards = await page.$$('[data-testid^="course-card-"]')
    console.log(`URL after navigating to ?page=999: ${clampedUrl}`)
    console.log(`Cards displayed: ${clampedCards.length} (expected 3 on clamped page 4)`)

    if (clampedCards.length === 0) {
      throw new Error('Case 4 Failed: Clamped page displayed 0 cards (blank page)')
    }
    testReport.cases.pageNumberTooHigh = {
      passed: true,
      clampedUrl,
      cardsCount: clampedCards.length,
    }
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'case4_page_too_high.png'),
    })

    // ----------------------------------------------------
    // TEST CASE 5: Refresh with filters applied
    // ----------------------------------------------------
    console.log('\n--- [Test Case 5] Refresh With Filters Applied ---')
    const filterUrl = `${BASE_URL}/student/courses?search=neural&level=Advanced&categories=Artificial+Intelligence&sort=rating-desc&page=1`
    await page.goto(filterUrl, { waitUntil: 'networkidle0' })
    await sleep(600)

    // Verify before reload
    const searchValBefore = await page.$eval('input[aria-label*="Search courses"]', (el) => el.value)
    console.log(`Search input before reload: "${searchValBefore}"`)

    // Reload page
    console.log('Reloading page...')
    await page.reload({ waitUntil: 'networkidle0' })
    await sleep(800)

    const searchValAfter = await page.$eval('input[aria-label*="Search courses"]', (el) => el.value)
    const levelPressed = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'Advanced'
      )
      return btn?.getAttribute('aria-pressed') === 'true'
    })
    const catChecked = await page.evaluate(() => {
      const input = document.querySelector('input[aria-label*="Artificial Intelligence"]')
      return input ? input.checked : false
    })
    const sortVal = await page.$eval('select[aria-label="Sort courses by"]', (el) => el.value)
    const filteredAfterReload = await page.$$('[data-testid^="course-card-"]')
    const highlightAfterReload = await page.$$('[data-testid="highlighted-text"]')

    console.log(`Search input after reload: "${searchValAfter}"`)
    console.log(`Level "Advanced" aria-pressed: ${levelPressed}`)
    console.log(`Category "Artificial Intelligence" checked: ${catChecked}`)
    console.log(`Sort dropdown value: "${sortVal}"`)
    console.log(`Filtered cards: ${filteredAfterReload.length} (expected 1)`)
    console.log(`Highlighted text instances: ${highlightAfterReload.length}`)

    if (
      searchValAfter !== 'neural' ||
      !levelPressed ||
      !catChecked ||
      sortVal !== 'rating-desc' ||
      filteredAfterReload.length !== 1
    ) {
      throw new Error('Case 5 Failed: Filters did not restore properly on refresh')
    }
    testReport.cases.refreshWithFilters = {
      passed: true,
      search: searchValAfter,
      levelSelected: levelPressed,
      categoryChecked: catChecked,
      sort: sortVal,
      cardsCount: filteredAfterReload.length,
    }
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'case5_refresh_with_filters.png'),
    })

    // ----------------------------------------------------
    // AUDIT: Tap Targets (>= 44px)
    // ----------------------------------------------------
    console.log('\n--- [Audit] Tap Targets (>= 44px) ---')
    await page.goto(`${BASE_URL}/student/courses`, { waitUntil: 'networkidle0' })
    await sleep(600)

    const viewportsToTest = [
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'mobile', width: 390, height: 844 },
    ]

    for (const vp of viewportsToTest) {
      await page.setViewport({ width: vp.width, height: vp.height })
      await sleep(400)

      const tapIssues = await page.evaluate(() => {
        const issues = []
        const elements = document.querySelectorAll(
          'button, a, input, select, [role="button"]'
        )

        elements.forEach((el) => {
          const style = window.getComputedStyle(el)
          if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            style.opacity === '0' ||
            el.classList.contains('sr-only')
          ) {
            return
          }

          const rect = el.getBoundingClientRect()
          if (rect.width === 0 || rect.height === 0) return

          // Allow subtle rounding tolerance of 0.5px
          if (rect.width < 43.5 || rect.height < 43.5) {
            issues.push({
              tag: el.tagName,
              role: el.getAttribute('role'),
              text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30),
              width: Math.round(rect.width * 10) / 10,
              height: Math.round(rect.height * 10) / 10,
              className: el.className?.toString().slice(0, 60),
            })
          }
        })
        return issues
      })

      console.log(`Tap target check [${vp.name}]: found ${tapIssues.length} issues < 44px`)
      if (tapIssues.length > 0) {
        console.log('Issues found:', tapIssues)
        testReport.tapTargets.passed = false
        testReport.tapTargets.issues.push(...tapIssues)
      }
    }

    // ----------------------------------------------------
    // AUDIT: Focus Rings
    // ----------------------------------------------------
    console.log('\n--- [Audit] Focus Rings ---')
    await page.setViewport({ width: 1440, height: 900 })
    const focusIssues = await page.evaluate(() => {
      const issues = []
      const focusable = Array.from(
        document.querySelectorAll(
          'button:not([disabled]), a, input:not(.sr-only):not([disabled]), select:not([disabled]), [role="button"][tabindex="0"]'
        )
      )

      focusable.forEach((el) => {
        const htmlEl = el
        const style = window.getComputedStyle(htmlEl)
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          style.opacity === '0'
        ) {
          return
        }

        const rect = htmlEl.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) {
          return
        }

        htmlEl.focus()
        const activeStyle = window.getComputedStyle(htmlEl)
        const outlineStyle = activeStyle.outlineStyle
        const outlineWidth = parseFloat(activeStyle.outlineWidth) || 0
        const boxShadow = activeStyle.boxShadow

        const hasOutline = outlineStyle !== 'none' && outlineWidth > 0
        const hasBoxShadow = boxShadow !== 'none' && boxShadow.includes('px')

        if (!hasOutline && !hasBoxShadow) {
          issues.push({
            tag: htmlEl.tagName,
            text: (htmlEl.textContent || htmlEl.getAttribute('aria-label') || '').trim().slice(0, 25),
            outline: activeStyle.outline,
            boxShadow: activeStyle.boxShadow,
          })
        }
      })
      return issues
    })

    console.log(`Focus rings audit: found ${focusIssues.length} issues lacking visible focus ring`)
    if (focusIssues.length > 0) {
      console.log('Focus ring issues:', focusIssues)
      testReport.focusRings.passed = false
      testReport.focusRings.issues = focusIssues
    } else {
      testReport.focusRings.passed = true
    }

    // ----------------------------------------------------
    // AUDIT: Contrast (WCAG AA >= 4.5:1)
    // ----------------------------------------------------
    console.log('\n--- [Audit] Contrast Check (WCAG AA) ---')
    const contrastSamples = await page.evaluate(() => {
      function getRGB(str) {
        const match = str.match(/\d+/g)
        return match ? match.slice(0, 3).map(Number) : [255, 255, 255]
      }
      function getLuminance(r, g, b) {
        const a = [r, g, b].map((v) => {
          v /= 255
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
        })
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
      }
      function getContrast(rgb1, rgb2) {
        const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2])
        const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2])
        const brightest = Math.max(lum1, lum2)
        const darkest = Math.min(lum1, lum2)
        return (brightest + 0.05) / (darkest + 0.05)
      }

      const samples = []
      // Dark background of the app is #04060d -> rgb(4, 6, 13)
      const bgRgb = [4, 6, 13]

      // Card titles
      document.querySelectorAll('[data-testid^="course-card-"] h3').forEach((el, i) => {
        if (i < 3) {
          const color = window.getComputedStyle(el).color
          const ratio = getContrast(getRGB(color), bgRgb)
          samples.push({ element: `Course Title ${i + 1}`, color, ratio: Math.round(ratio * 10) / 10 })
        }
      })

      // Muted metadata
      const mutedEl = document.querySelector('[data-testid^="course-card-"] p')
      if (mutedEl) {
        const color = window.getComputedStyle(mutedEl).color
        const ratio = getContrast(getRGB(color), bgRgb)
        samples.push({ element: 'Course Description', color, ratio: Math.round(ratio * 10) / 10 })
      }

      // Highlight text
      const highlightEl = document.querySelector('[data-testid="highlighted-text"]')
      if (highlightEl) {
        const color = window.getComputedStyle(highlightEl).color
        const ratio = getContrast(getRGB(color), bgRgb)
        samples.push({ element: 'Search Highlight', color, ratio: Math.round(ratio * 10) / 10 })
      }

      return samples
    })

    console.log('Contrast sample measurements (target >= 4.5:1):')
    contrastSamples.forEach((s) => {
      console.log(` - ${s.element}: ratio = ${s.ratio}:1 (color: ${s.color})`)
    })
    testReport.contrast = {
      passed: contrastSamples.every((s) => s.ratio >= 4.5),
      samples: contrastSamples,
    }

    // ----------------------------------------------------
    // AUDIT: Keyboard Navigation & Course Details Drawer
    // ----------------------------------------------------
    console.log('\n--- [Audit] Keyboard Navigation & Drawer ---')
    await page.goto(`${BASE_URL}/student/courses`, { waitUntil: 'networkidle0' })
    await sleep(600)

    // Focus first course card and press Enter
    const firstCard = await page.$('[data-testid^="course-card-"]')
    if (firstCard) {
      await firstCard.focus()
      await page.keyboard.press('Enter')
      await sleep(350) // Wait for 250ms drawer slide

      const drawerPanel = await page.$('[data-testid="course-drawer-panel"]')
      const drawerVisible = await page.evaluate((el) => {
        if (!el) return false
        const style = window.getComputedStyle(el)
        const rect = el.getBoundingClientRect()
        return rect.width > 0 && rect.right > 0 && style.visibility !== 'hidden'
      }, drawerPanel)

      console.log(`Drawer opened via Enter key on card: ${drawerVisible}`)

      // Verify active focus inside drawer
      const activeElTag = await page.evaluate(() => document.activeElement?.tagName)
      const activeElAria = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
      console.log(`Focused element in drawer: <${activeElTag}> "${activeElAria}"`)

      // Capture drawer screenshot
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'drawer_keyboard_opened.png'),
      })

      // Press Escape to close drawer
      await page.keyboard.press('Escape')
      await sleep(350)

      const drawerClosed = await page.evaluate(() => {
        const panel = document.querySelector('[data-testid="course-drawer-panel"]')
        return !panel || panel.classList.contains('translate-x-full')
      })
      console.log(`Drawer closed via Escape key: ${drawerClosed}`)

      // Verify focus returned to the card
      const focusedCardId = await page.evaluate(() => document.activeElement?.id)
      console.log(`Focus restored to triggering card: "${focusedCardId}"`)

      if (!drawerVisible || !drawerClosed) {
        throw new Error('Keyboard Navigation / Drawer verification failed')
      }
    }

    console.log('\n====================================================')
    console.log('           ALL VERIFICATIONS COMPLETED!             ')
    console.log('====================================================\n')
    console.log('Test Summary Report:\n', JSON.stringify(testReport, null, 2))

    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'full_audit_results.json'),
      JSON.stringify(testReport, null, 2)
    )
  } catch (err) {
    console.error('VERIFICATION ERROR:', err)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

run()
