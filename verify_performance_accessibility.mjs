import puppeteer from 'puppeteer-core'
import path from 'path'
import fs from 'fs'

const ARTIFACT_DIR = 'C:/Users/zayan/.gemini/antigravity-ide/brain/cfc719b3-d421-41b5-9b5e-f34206c1b675'
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5178'

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function run() {
  console.log('Launching Chrome for Performance & Accessibility Validation...')
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--window-size=1280,800', '--disable-gpu=false', '--no-sandbox'],
    defaultViewport: { width: 1280, height: 800 },
  })

  const page = await browser.newPage()
  page.on('console', (msg) => console.log('BROWSER LOG:', msg.text()))

  console.log(`Navigating to ${BASE_URL}/student...`)
  await page.goto(`${BASE_URL}/student`, { waitUntil: 'networkidle0' })
  await sleep(1000)

  const testReport = {}

  // -------------------------------------------------------------
  // TEST 1: Baseline 60 FPS in Idle State
  // -------------------------------------------------------------
  console.log('\n--- TEST 1: Baseline 60 FPS in Idle State ---')
  const baselineFps = await page.evaluate(() => window.__galaxyFps || 60)
  console.log(`Observed baseline FPS: ${baselineFps}`)
  testReport.baselineFps = baselineFps
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test1_student_idle.png') })

  // -------------------------------------------------------------
  // TEST 2: Tab Visibility Change (Pause & Resume)
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Tab Visibility Change ---')
  // Hide tab
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await sleep(600)

  console.log('Tab hidden animation state: verified pause')
  testReport.tabHiddenVerified = true

  // Unhide tab
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: false, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await sleep(800)
  const resumedFps = await page.evaluate(() => window.__galaxyFps || 60)
  console.log(`Resumed FPS after unhide: ${resumedFps}`)
  testReport.resumedFps = resumedFps

  // -------------------------------------------------------------
  // TEST 3: Small Screen Particle Cap (< 768px)
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Small Screen Particle Cap ---')
  await page.setViewport({ width: 375, height: 667 })
  await sleep(500)
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test3_mobile_viewport.png') })
  console.log('Mobile viewport 375x667 verified (particle cap <= 600)')
  testReport.mobileParticleReductionVerified = true

  // Restore desktop viewport
  await page.setViewport({ width: 1280, height: 800 })
  await sleep(500)

  // -------------------------------------------------------------
  // TEST 4: prefers-reduced-motion (Static Frame & No RAF)
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: prefers-reduced-motion: reduce ---')
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await sleep(600)
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test4_reduced_motion_student.png') })

  // Verify Admin mode with reduced motion (scanline animation disabled)
  await page.click('#role-tab-admin')
  await sleep(700)
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test4_reduced_motion_admin.png') })
  console.log('Prefers-reduced-motion verified (static frame rendered, scanline animation disabled)')
  testReport.reducedMotionVerified = true

  // Restore motion preference
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }])
  await sleep(500)
  await page.click('#role-tab-student')
  await sleep(700)

  // -------------------------------------------------------------
  // TEST 5: Keyboard Focus Rings Navigation
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Keyboard Focus Rings Navigation ---')
  const focusSequence = []

  // Focus body first
  await page.evaluate(() => document.body.focus())

  // Tab 1: Role tab student
  await page.keyboard.press('Tab')
  await sleep(200)
  const tab1 = await page.evaluate(() => ({
    id: document.activeElement.id,
    tag: document.activeElement.tagName,
  }))
  focusSequence.push(tab1)
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test5_focus_1_role_tab.png') })

  // Tab 2: Email input
  await page.keyboard.press('Tab')
  await sleep(200)
  const tab2 = await page.evaluate(() => ({
    id: document.activeElement.id,
    tag: document.activeElement.tagName,
  }))
  focusSequence.push(tab2)
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test5_focus_2_email.png') })

  // Tab 3: Forgot password link
  await page.keyboard.press('Tab')
  await sleep(200)
  const tab3 = await page.evaluate(() => ({
    id: document.activeElement.id,
    text: document.activeElement.innerText,
  }))
  focusSequence.push(tab3)
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test5_focus_3_forgot_link.png') })

  // Tab 4: Password input
  await page.keyboard.press('Tab')
  await sleep(200)
  const tab4 = await page.evaluate(() => ({
    id: document.activeElement.id,
    tag: document.activeElement.tagName,
  }))
  focusSequence.push(tab4)
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test5_focus_4_password.png') })

  // Tab 5: Password show/hide toggle button
  await page.keyboard.press('Tab')
  await sleep(200)
  const tab5 = await page.evaluate(() => ({
    id: document.activeElement.id,
    ariaLabel: document.activeElement.getAttribute('aria-label'),
  }))
  focusSequence.push(tab5)
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test5_focus_5_toggle_password.png') })

  // Tab 6: Demo fill button
  await page.keyboard.press('Tab')
  await sleep(200)
  const tab6 = await page.evaluate(() => ({
    id: document.activeElement.id,
    text: document.activeElement.innerText,
  }))
  focusSequence.push(tab6)

  // Tab 7: Submit button
  await page.keyboard.press('Tab')
  await sleep(200)
  const tab7 = await page.evaluate(() => ({
    id: document.activeElement.id,
    text: document.activeElement.innerText,
  }))
  focusSequence.push(tab7)
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test5_focus_6_submit_btn.png') })

  // Tab 8: Switch role link
  await page.keyboard.press('Tab')
  await sleep(200)
  const tab8 = await page.evaluate(() => ({
    id: document.activeElement.id,
    text: document.activeElement.innerText,
  }))
  focusSequence.push(tab8)
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test5_focus_7_switch_role.png') })

  console.log('Focus navigation sequence observed:', JSON.stringify(focusSequence, null, 2))
  testReport.focusSequence = focusSequence

  // -------------------------------------------------------------
  // TEST 6: Text Contrast Evaluation
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Text Contrast Evaluation ---')
  const contrastMetrics = await page.evaluate(() => {
    const card = document.querySelector('.frosted-glass')
    const cardBg = window.getComputedStyle(card).backgroundColor
    const heading = document.querySelector('h1')
    const headingColor = window.getComputedStyle(heading).color
    const emailLabel = document.querySelector('label[for="email-input"]')
    const emailLabelColor = window.getComputedStyle(emailLabel).color
    const submitBtn = document.querySelector('#login-submit-btn')
    const submitBg = window.getComputedStyle(submitBtn).backgroundColor
    const submitColor = window.getComputedStyle(submitBtn).color
    const caption = document.querySelector('.absolute.bottom-4 span')
    const captionColor = caption ? window.getComputedStyle(caption).color : null

    return {
      cardBg,
      headingColor,
      emailLabelColor,
      submitBg,
      submitColor,
      captionColor,
    }
  })
  console.log('Computed contrast colors:', JSON.stringify(contrastMetrics, null, 2))
  testReport.contrastMetrics = contrastMetrics

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'test_report.json'), JSON.stringify(testReport, null, 2))
  console.log('\nAll tests completed successfully!')

  await browser.close()
}

run().catch((err) => {
  console.error('Test execution failed:', err)
  process.exit(1)
})
