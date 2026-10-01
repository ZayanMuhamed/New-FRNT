import puppeteer from 'puppeteer-core'
import path from 'path'
import fs from 'fs'

const ARTIFACT_DIR = 'C:/Users/zayan/.gemini/antigravity-ide/brain/28d4da7b-1de6-4c1d-99e3-1e90510978db'
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5173'

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function run() {
  console.log('--- STARTING VERIFICATION FOR CONTINUE LEARNING COMPONENT ---')

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--window-size=1280,900', '--disable-gpu=false', '--no-sandbox'],
    defaultViewport: { width: 1280, height: 900 },
  })

  try {
    const page = await browser.newPage()
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))

    // Step 1: Explicitly set no-preference so we can verify the pointer glow first
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }])

    // Step 2: Seed session storage for authenticated student session
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

    // Step 3: Navigate to student dashboard
    console.log(`Navigating to ${BASE_URL}/student/dashboard...`)
    await page.goto(`${BASE_URL}/student/dashboard`, { waitUntil: 'networkidle0' })
    
    // Wait for ContinueLearning component to be fully mounted
    console.log('Waiting for #continue-learning-heading...')
    const heading = await page.waitForSelector('#continue-learning-heading', { timeout: 10000 })
    const courseTitle = await page.evaluate((el) => el.textContent, heading)
    console.log(`✓ Found course title: "${courseTitle}"`)

    const resumeBtn = await page.waitForSelector('button[aria-label^="Resume lesson"]', { timeout: 5000 })
    const resumeText = await page.evaluate((el) => el.textContent?.trim(), resumeBtn)
    console.log(`✓ Found resume button with text: "${resumeText}"`)

    const progressBar = await page.waitForSelector('div[role="progressbar"]', { timeout: 5000 })
    await sleep(1000) // Allow 900ms progress animation to complete
    const ariaValueNow = await page.evaluate((el) => el.getAttribute('aria-valuenow'), progressBar)
    console.log(`✓ Found progress bar with aria-valuenow: ${ariaValueNow}%`)

    // Step 4: Hover over the card on desktop to verify pointer-following glow
    console.log('\n--- TESTING DESKTOP POINTER-FOLLOWING GLOW ---')
    const card = await page.$('section[aria-labelledby="continue-learning-heading"]')
    const cardBox = await card.boundingBox()
    console.log(`Card bounds: x=${Math.round(cardBox.x)}, y=${Math.round(cardBox.y)}, w=${Math.round(cardBox.width)}, h=${Math.round(cardBox.height)}`)

    // Move pointer to center of card
    const targetX = cardBox.x + cardBox.width / 2
    const targetY = cardBox.y + cardBox.height / 2
    await page.mouse.move(targetX, targetY)
    await sleep(300)

    // Check if glow element exists
    const glowEl = await page.$('[data-testid="continue-learning-glow"]')
    if (!glowEl) {
      throw new Error('Pointer glow element was not rendered on mouse move!')
    }

    const glowStyle = await page.evaluate((el) => el.getAttribute('style'), glowEl)
    console.log(`✓ Glow active with dynamic background style: ${glowStyle}`)

    // Capture desktop screenshot with cursor hover glow
    const desktopScreenshot = path.join(ARTIFACT_DIR, 'continue_learning_desktop.png')
    await page.screenshot({ path: desktopScreenshot })
    console.log(`✓ Saved desktop screenshot: ${desktopScreenshot}`)

    // Step 5: Test prefers-reduced-motion: reduce
    console.log('\n--- TESTING PREFERS-REDUCED-MOTION ---')
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    await sleep(400)

    // Trigger mouse move under reduced motion
    await page.mouse.move(targetX + 20, targetY + 20)
    await sleep(200)

    // Check if glow element is hidden or removed under reduced-motion
    const glowComputed = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="continue-learning-glow"]')
      if (!el) return { exists: false }
      const style = window.getComputedStyle(el)
      return {
        exists: true,
        display: style.display,
        opacity: style.opacity,
        visibility: style.visibility,
      }
    })
    console.log('Glow status under prefers-reduced-motion:', glowComputed)

    const isGlowProperlyHidden =
      !glowComputed.exists ||
      glowComputed.display === 'none' ||
      glowComputed.opacity === '0' ||
      glowComputed.visibility === 'hidden'

    if (!isGlowProperlyHidden) {
      throw new Error('Glow was not properly hidden under prefers-reduced-motion!')
    }
    console.log('✓ Successfully verified: Glow is hidden under prefers-reduced-motion')

    const reducedMotionScreenshot = path.join(ARTIFACT_DIR, 'continue_learning_reduced_motion.png')
    await page.screenshot({ path: reducedMotionScreenshot })
    console.log(`✓ Saved reduced motion screenshot: ${reducedMotionScreenshot}`)

    // Step 6: Test mobile viewport responsiveness
    console.log('\n--- TESTING MOBILE VIEWPORT (375x812) ---')
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }])
    await page.setViewport({ width: 375, height: 812 })
    await sleep(400)

    const mobileScreenshot = path.join(ARTIFACT_DIR, 'continue_learning_mobile.png')
    await page.screenshot({ path: mobileScreenshot })
    console.log(`✓ Saved mobile screenshot: ${mobileScreenshot}`)

    console.log('\n========================================')
    console.log('ALL CONTINUE LEARNING CHECKS PASSED!')
    console.log('========================================')
  } finally {
    await browser.close()
  }
}

run().catch((err) => {
  console.error('Verification failed:', err)
  process.exit(1)
})
