import puppeteer from 'puppeteer-core'
import path from 'path'
import fs from 'fs'

const ARTIFACT_DIR = 'C:/Users/zayan/.gemini/antigravity-ide/brain/51b915a0-1a59-4283-aadd-ea04edf1ed51'
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5173'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function run() {
  console.log('--- Starting Verification of Starfield Canvas & Dashboard Animations ---')

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--window-size=1280,800', '--disable-gpu=false', '--no-sandbox'],
    defaultViewport: { width: 1280, height: 800 },
  })

  try {
    const page = await browser.newPage()
    // Explicitly test no-preference first so we test all motion features
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }])

    // Seed student auth session
    await page.goto(`${BASE_URL}/student`, { waitUntil: 'networkidle0' })
    await page.evaluate(() => {
      sessionStorage.setItem(
        'hermes_auth_session',
        JSON.stringify({
          id: 'stu-alex',
          email: 'alex.vance@student.hermes.edu',
          name: 'Alex Vance',
          role: 'student',
          studentId: 'STU-2026-8942',
        })
      )
    })

    // Navigate to student dashboard
    console.log('Navigating to student dashboard at 1280x800 desktop...')
    await page.goto(`${BASE_URL}/student/dashboard`, { waitUntil: 'domcontentloaded' })

    // Wait for the skeleton (400ms delay) to transition to actual dashboard content
    await page.waitForSelector('[aria-label="Greeting Header"]', { timeout: 5000 })
    console.log('Dashboard content loaded!')

    // TEST 1: Staggered Entrance on Initial Load
    console.log('\n--- TEST 1: Staggered Entrance Animation on Page Load ---')
    const staggerDetails = await page.evaluate(() => {
      const staggeredElements = Array.from(document.querySelectorAll('.dashboard-stagger-section'))
      return staggeredElements.map((el) => ({
        tagName: el.tagName,
        ariaLabel: el.getAttribute('aria-label') || el.className.slice(0, 30),
        delay: getComputedStyle(el).getPropertyValue('--stagger-delay'),
      }))
    })

    console.log(`Found ${staggerDetails.length} staggered entrance sections on initial load:`)
    staggerDetails.forEach((s, idx) => console.log(`  Section ${idx}: delay=${s.delay}`))
    if (staggerDetails.length < 5) {
      throw new Error(`Expected at least 5 staggered entrance sections, found ${staggerDetails.length}`)
    }

    // Wait for entrance animation to finish (1200ms)
    await sleep(1500)

    // TEST 2: No Repeat on Re-render
    console.log('\n--- TEST 2: No Repeat on Re-render ---')
    // Click preview switcher button to trigger state re-render
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const emptyBtn = buttons.find((b) => b.textContent?.includes('Empty lessons'))
      if (emptyBtn) {
        emptyBtn.click()
        return true
      }
      return false
    })
    console.log('Triggered state change re-render by clicking "Empty lessons":', clicked)
    await sleep(250)

    const reRenderStaggerCount = await page.evaluate(() => {
      return document.querySelectorAll('.dashboard-stagger-section').length
    })
    console.log(`Staggered animation class count after re-render: ${reRenderStaggerCount} (Expected: 0)`)
    if (reRenderStaggerCount !== 0) {
      throw new Error(`Staggered entrance replayed on re-render! Count: ${reRenderStaggerCount}`)
    }

    // TEST 3: Desktop Particle Count (200 particles)
    console.log('\n--- TEST 3: Desktop Particle Count ---')
    const desktopParticles = await page.evaluate(() => window.__starfieldParticleCount)
    console.log(`Desktop particle count: ${desktopParticles} (Expected: 200)`)
    if (desktopParticles !== 200) {
      throw new Error(`Expected 200 desktop particles, got ${desktopParticles}`)
    }

    // TEST 4: Tab Visibility Pause / Resume
    console.log('\n--- TEST 4: Tab Visibility Pause / Resume ---')
    const initialIsRunning = await page.evaluate(() => window.__starfieldIsRunning)
    console.log(`Starfield running while tab is visible: ${initialIsRunning} (Expected: true)`)

    // Simulate tab hidden
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await sleep(200)
    const hiddenIsRunning = await page.evaluate(() => window.__starfieldIsRunning)
    console.log(`Starfield running while tab is hidden: ${hiddenIsRunning} (Expected: false)`)
    if (hiddenIsRunning !== false) {
      throw new Error('Starfield failed to pause when tab was hidden!')
    }

    // Simulate tab visible again
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await sleep(200)
    const resumedIsRunning = await page.evaluate(() => window.__starfieldIsRunning)
    console.log(`Starfield running after tab restored: ${resumedIsRunning} (Expected: true)`)
    if (resumedIsRunning !== true) {
      throw new Error('Starfield failed to resume when tab became visible!')
    }

    // TEST 5: Mobile Particle Count (80 particles on < 768px)
    console.log('\n--- TEST 5: Mobile Particle Count ---')
    await page.setViewport({ width: 375, height: 667, isMobile: true })
    await sleep(300)
    const mobileParticles = await page.evaluate(() => window.__starfieldParticleCount)
    console.log(`Mobile particle count: ${mobileParticles} (Expected: 80)`)
    if (mobileParticles !== 80) {
      throw new Error(`Expected 80 mobile particles, got ${mobileParticles}`)
    }

    // Reset back to desktop viewport
    await page.setViewport({ width: 1280, height: 800 })
    await sleep(300)

    // TEST 6: IntersectionObserver Progress Bar & Ring Animations
    console.log('\n--- TEST 6: IntersectionObserver Progress Bars & Ring ---')
    // Reset to populated state
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const popBtn = buttons.find((b) => b.textContent?.includes('Populated'))
      if (popBtn) popBtn.click()
    })
    await sleep(1000)

    const progressValues = await page.evaluate(() => {
      const progressBars = Array.from(document.querySelectorAll('[role="progressbar"]'))
      return progressBars.map((pb) => ({
        ariaLabel: pb.getAttribute('aria-label'),
        valuenow: pb.getAttribute('aria-valuenow'),
      }))
    })
    console.log(`Found ${progressValues.length} active progress bars/rings:`)
    progressValues.slice(0, 5).forEach((p) => console.log(`  - ${p.ariaLabel} (valuenow=${p.valuenow})`))
    if (progressValues.length < 3) {
      throw new Error(`Expected at least 3 progress bars/rings, found ${progressValues.length}`)
    }

    // Capture screenshot of desktop dashboard with starfield
    const desktopScreenshotPath = path.join(ARTIFACT_DIR, 'dashboard_desktop_starfield.png')
    await page.screenshot({ path: desktopScreenshotPath, fullPage: false })
    console.log(`Saved screenshot to ${desktopScreenshotPath}`)

    // TEST 7: Prefers-Reduced-Motion
    console.log('\n--- TEST 7: Prefers-Reduced-Motion ---')
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    // Reload page under reduced motion
    await page.goto(`${BASE_URL}/student/dashboard`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[aria-label="Greeting Header"]', { timeout: 5000 })
    await sleep(300)

    const reducedMotionState = await page.evaluate(() => {
      return {
        starfieldRunning: window.__starfieldIsRunning,
      }
    })
    console.log('Reduced motion check:', reducedMotionState)
    if (reducedMotionState.starfieldRunning === true) {
      throw new Error('Starfield animation loop is running under prefers-reduced-motion: reduce!')
    }

    const reducedScreenshotPath = path.join(ARTIFACT_DIR, 'dashboard_reduced_motion.png')
    await page.screenshot({ path: reducedScreenshotPath, fullPage: false })
    console.log(`Saved reduced motion screenshot to ${reducedScreenshotPath}`)

    console.log('\nALL 7 TESTS PASSED SUCCESSFULLY!')
  } finally {
    await browser.close()
  }
}

run().catch((err) => {
  console.error('VERIFICATION FAILED:', err)
  process.exit(1)
})
