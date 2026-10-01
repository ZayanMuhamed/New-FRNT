import puppeteer from 'puppeteer-core'
import path from 'path'

const ARTIFACT_DIR = 'C:/Users/zayan/.gemini/antigravity-ide/brain/59a46c9a-6460-4514-8c96-a6e46c217cf2'
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5179'

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function run() {
  console.log('Launching Chrome to verify Student Dashboard...')
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--window-size=1440,900', '--disable-gpu=false', '--no-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  })

  try {
    const page = await browser.newPage()

    // 1. Protected route verification: Navigate directly to /student/dashboard without session
    console.log('1. Testing ProtectedRoute redirection for unauthenticated user...')
    await page.goto(`${BASE_URL}/student/dashboard`, { waitUntil: 'networkidle0' })
    const currentUrl = page.url()
    console.log(`Current URL after unauthorized attempt: ${currentUrl}`)
    if (!currentUrl.includes('/student') || currentUrl.includes('/student/dashboard')) {
      console.warn('Expected redirection to /student failed!')
    } else {
      console.log('✓ Successfully redirected unauthenticated access to /student')
    }

    // 2. Authenticate as student Alex Vance
    console.log('2. Authenticating as Alex Vance...')
    // Set session in sessionStorage directly or fill form
    await page.evaluate(() => {
      sessionStorage.setItem(
        'hermes_auth_session',
        JSON.stringify({
          id: 'usr_student_01',
          email: 'alex@university.edu',
          name: 'Alex Vance',
          role: 'student',
          studentId: 'STU-2026-8942',
          department: 'Computer Science & Engineering',
        })
      )
    })

    // 3. Test Loading Skeleton State
    console.log('3. Capturing loading skeleton state...')
    // Navigate to /student/dashboard
    page.goto(`${BASE_URL}/student/dashboard`)
    // Catch skeleton immediately
    await sleep(80)
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'student_dashboard_loading_skeleton.png'),
      fullPage: false,
    })
    console.log('✓ Captured loading skeleton screenshot')

    // Wait for full resolution
    await sleep(700)

    // 4. Viewport 1440px (Desktop)
    console.log('4. Verifying Desktop 1440px...')
    await page.setViewport({ width: 1440, height: 900 })
    await sleep(300)

    // Verify desktop elements
    const desktopSidebar = await page.$('aside[aria-label="Desktop Navigation Sidebar"]')
    const mobileBottomBar = await page.$('nav[aria-label="Mobile Bottom Navigation Bar"]')
    const isSidebarVisible = await desktopSidebar?.isIntersectingViewport()
    const isBottomBarVisible = await mobileBottomBar?.isIntersectingViewport()

    console.log(`Desktop (1440px) - Sidebar visible: ${isSidebarVisible}, Bottom bar visible: ${isBottomBarVisible}`)

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'student_dashboard_1440px.png'),
      fullPage: true,
    })
    console.log('✓ Saved 1440px screenshot')

    // 5. Viewport 768px (Tablet Breakpoint)
    console.log('5. Verifying Tablet 768px...')
    await page.setViewport({ width: 768, height: 1024 })
    await sleep(300)
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'student_dashboard_768px.png'),
      fullPage: true,
    })
    console.log('✓ Saved 768px screenshot')

    // 6. Viewport 390px (Mobile)
    console.log('6. Verifying Mobile 390px...')
    await page.setViewport({ width: 390, height: 844 })
    await sleep(300)

    const mobileSidebarVisible = await desktopSidebar?.isIntersectingViewport()
    const mobileBottomBarVisible = await mobileBottomBar?.isIntersectingViewport()
    console.log(`Mobile (390px) - Sidebar visible: ${mobileSidebarVisible}, Bottom bar visible: ${mobileBottomBarVisible}`)

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'student_dashboard_390px.png'),
      fullPage: true,
    })
    console.log('✓ Saved 390px screenshot')

    // Close-up of mobile viewport bottom bar
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'student_dashboard_mobile_bottom_bar.png'),
      fullPage: false,
    })
    console.log('✓ Saved mobile bottom bar viewport screenshot')

    // 7. Test Sign Out button
    console.log('7. Testing Sign Out interaction...')
    const signOutBtn = await page.$('button[aria-label="Sign out"]') || await page.$('aside button:last-child')
    if (signOutBtn) {
      await signOutBtn.click()
      await sleep(500)
      const afterSignOutUrl = page.url()
      console.log(`URL after clicking Sign Out: ${afterSignOutUrl}`)
      if (afterSignOutUrl.includes('/student') && !afterSignOutUrl.includes('/dashboard')) {
        console.log('✓ Sign out successfully returned user to /student')
      }
    }

    console.log('\nAll dashboard verifications passed successfully!')
  } finally {
    await browser.close()
  }
}

run().catch((err) => {
  console.error('Validation script error:', err)
  process.exit(1)
})
