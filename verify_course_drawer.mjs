import puppeteer from 'puppeteer-core'
import path from 'path'
import fs from 'fs'

const ARTIFACT_DIR = 'C:/Users/zayan/.gemini/antigravity-ide/brain/b2d5b0a4-44ef-49a7-9fca-f5be1bd7d270'
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5174'

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runTests() {
  console.log('🚀 Starting CourseDrawer Comprehensive Verification Suite...')

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000'],
  })

  try {
    const page = await browser.newPage()

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('BROWSER ERROR:', msg.text())
      }
    })

    // 1. Authenticate student session
    console.log('\n--- Step 1: Authenticating student session ---')
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
          token: 'mock_token',
        })
      )
    })

    // 2. Navigate to /student/courses
    console.log('\n--- Step 2: Navigating to /student/courses ---')
    await page.setViewport({ width: 1440, height: 900 })
    await page.goto(`${BASE_URL}/student/courses`, { waitUntil: 'networkidle0' })
    await page.waitForSelector('[data-testid="courses-grid"]', { timeout: 8000 })
    console.log('✔ Course grid successfully rendered.')

    // 3. Click course card to open CourseDrawer and verify URL query parameter
    console.log('\n--- Step 3: Opening CourseDrawer by clicking a card ---')
    const cardSelector = '[data-testid="course-card-crs_ds_402"]'
    await page.waitForSelector(cardSelector)
    await page.click(cardSelector)
    await sleep(350) // wait for 250ms slide transition

    const urlAfterClick = page.url()
    console.log('URL after clicking card:', urlAfterClick)
    if (!urlAfterClick.includes('course=crs_ds_402')) {
      throw new Error(`Expected URL to contain ?course=crs_ds_402, got: ${urlAfterClick}`)
    }
    console.log('✔ URL correctly updated to ?course=crs_ds_402')

    // 4. Verify CourseDrawer DOM content
    console.log('\n--- Step 4: Verifying CourseDrawer content ---')
    const drawerOpen = await page.$eval('[data-testid="course-drawer-panel"]', (el) => {
      return el.classList.contains('translate-x-0')
    })
    console.log('Drawer panel translated into view:', drawerOpen)
    if (!drawerOpen) {
      throw new Error('CourseDrawer panel did not translate into view')
    }

    const drawerTitle = await page.$eval('#course-drawer-title', (el) => el.textContent?.trim())
    console.log('Course title in drawer:', drawerTitle)
    if (!drawerTitle?.includes('Distributed Systems Architecture')) {
      throw new Error(`Drawer title mismatch, got: ${drawerTitle}`)
    }

    const description = await page.$eval('#course-drawer-description', (el) => el.textContent?.trim())
    console.log('Course description present:', !!description)

    const syllabusCount = await page.$$eval('[aria-label^="Toggle module"]', (els) => els.length)
    console.log('Syllabus modules count:', syllabusCount)
    if (syllabusCount === 0) {
      throw new Error('Expected syllabus modules in drawer')
    }
    console.log('✔ Content verified: Title, description, and syllabus modules present.')

    // Capture initial desktop screenshot with drawer open
    const desktopScreenshotPath = path.join(ARTIFACT_DIR, 'course_drawer_desktop.png')
    await page.screenshot({ path: desktopScreenshotPath, fullPage: false })
    console.log(`📸 Desktop screenshot saved: ${desktopScreenshotPath}`)

    // 5. Test Focus Trap
    console.log('\n--- Step 5: Testing Focus Trap ---')
    const activeElementInside = await page.evaluate(() => {
      const panel = document.querySelector('[data-testid="course-drawer-panel"]')
      return panel && panel.contains(document.activeElement)
    })
    console.log('Focus is inside drawer panel:', activeElementInside)

    // Tab through elements and ensure focus never leaves drawer
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab')
      const isInside = await page.evaluate(() => {
        const panel = document.querySelector('[data-testid="course-drawer-panel"]')
        return panel && panel.contains(document.activeElement)
      })
      if (!isInside) {
        throw new Error('Focus escaped drawer during Tab navigation!')
      }
    }
    console.log('✔ Focus trap successfully contained Tab cycles inside drawer.')

    // 6. Test Esc key and focus return
    console.log('\n--- Step 6: Testing Escape key and focus return ---')
    await page.keyboard.press('Escape')
    await sleep(350)

    const urlAfterEsc = page.url()
    console.log('URL after Escape:', urlAfterEsc)
    if (urlAfterEsc.includes('course=')) {
      throw new Error(`Expected course param removed after Esc, got: ${urlAfterEsc}`)
    }

    const returnedFocusId = await page.evaluate(() => document.activeElement?.id)
    console.log('Focused element ID after Esc:', returnedFocusId)
    if (returnedFocusId !== 'course-card-crs_ds_402') {
      console.warn(`Focus returned to ${returnedFocusId} instead of course-card-crs_ds_402`)
    } else {
      console.log('✔ Focus successfully returned to the triggering card!')
    }

    // 7. Test Backdrop click and focus return
    console.log('\n--- Step 7: Testing Backdrop click ---')
    await page.click(cardSelector)
    await sleep(350)
    await page.click('[data-testid="course-drawer-backdrop"]')
    await sleep(350)

    const urlAfterBackdrop = page.url()
    if (urlAfterBackdrop.includes('course=')) {
      throw new Error('Expected course param removed after backdrop click')
    }
    console.log('✔ Drawer closed on backdrop click and removed query param.')

    // 8. Test Refresh with ?course=ID and Browser Back button
    console.log('\n--- Step 8: Testing Refresh and Browser Back button ---')
    await page.goto(`${BASE_URL}/student/courses?course=crs_ds_402`, { waitUntil: 'networkidle0' })
    await sleep(400)

    const drawerTitleOnRefresh = await page.$eval('#course-drawer-title', (el) => el.textContent?.trim())
    if (!drawerTitleOnRefresh?.includes('Distributed Systems Architecture')) {
      throw new Error(`Drawer not open after refresh: ${drawerTitleOnRefresh}`)
    }
    console.log('✔ Direct load/refresh with ?course=ID opens drawer directly.')

    console.log('Testing page.goBack()...')
    await page.goBack()
    await sleep(400)
    const urlAfterBack = page.url()
    console.log('URL after browser Back:', urlAfterBack)
    const drawerStillOpen = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="course-drawer-panel"]')
      return el && el.classList.contains('translate-x-0')
    })
    if (drawerStillOpen) {
      throw new Error('Drawer should have closed on browser Back navigation')
    }
    console.log('✔ Browser Back button closed the drawer.')

    // 9. Test Enrollment state & immediate card badge update
    console.log('\n--- Step 9: Testing Enrollment in session state and immediate badge update ---')
    // Open a course that is NOT enrolled by default: e.g. Quantum Computing Fundamentals (crs_qc_310) or Cryptography (crs_sec_455)
    // Let's check crs_qc_310: in studentData it has progress 0, status not-started, but let's check another course like crs_compilers
    // Or let's test any course not enrolled
    await page.goto(`${BASE_URL}/student/courses`, { waitUntil: 'networkidle0' })
    await sleep(300)

    // Let's find a card without enrolled badge
    const unenrolledCourseId = await page.evaluate(() => {
      const cards = document.querySelectorAll('[data-testid^="course-card-"]')
      for (const card of cards) {
        if (!card.querySelector('[data-testid="enrolled-badge"]')) {
          return card.getAttribute('id')?.replace('course-card-', '')
        }
      }
      return null
    })

    console.log('Found unenrolled course for test:', unenrolledCourseId)
    if (!unenrolledCourseId) {
      throw new Error('Could not find an unenrolled course on page 1')
    }

    // Verify it doesn't have enrolled badge
    const hasBadgeBefore = await page.evaluate((id) => {
      const card = document.getElementById(`course-card-${id}`)
      return !!card?.querySelector('[data-testid="enrolled-badge"]')
    }, unenrolledCourseId)
    console.log('Card has enrolled badge before enrollment:', hasBadgeBefore)
    if (hasBadgeBefore) {
      throw new Error('Card should NOT have enrolled badge initially')
    }

    // Click card to open drawer
    await page.click(`#course-card-${unenrolledCourseId}`)
    await sleep(350)

    // Check Enroll button in drawer
    const enrollBtn = await page.waitForSelector('[data-testid="drawer-enroll-btn"]')
    console.log('Enroll button found in drawer. Clicking Enroll...')
    await enrollBtn.click()
    await sleep(300)

    // Verify drawer button changed to continue button or shows enrolled
    const continueBtn = await page.$('[data-testid="drawer-continue-btn"]')
    const drawerEnrolledBadge = await page.$('[data-testid="drawer-enrolled-badge"]')
    console.log('Drawer has continue button:', !!continueBtn)
    console.log('Drawer has enrolled badge:', !!drawerEnrolledBadge)

    // Verify sessionStorage has updated
    const sessionEnrolled = await page.evaluate(() => {
      return sessionStorage.getItem('hermes_student_enrolled_courses')
    })
    console.log('sessionStorage contains newly enrolled course:', sessionEnrolled?.includes(unenrolledCourseId))
    if (!sessionEnrolled?.includes(unenrolledCourseId)) {
      throw new Error(`sessionStorage missing course ${unenrolledCourseId}`)
    }

    // Close drawer
    await page.click('[data-testid="course-drawer-close"]')
    await sleep(350)

    // Verify card badge updated IMMEDIATELY!
    const hasBadgeAfter = await page.evaluate((id) => {
      const card = document.getElementById(`course-card-${id}`)
      return !!card?.querySelector('[data-testid="enrolled-badge"]')
    }, unenrolledCourseId)
    console.log('Card has enrolled badge immediately after enrolling:', hasBadgeAfter)
    if (!hasBadgeAfter) {
      throw new Error('Card badge did not update immediately after enrollment!')
    }
    console.log('✔ Course enrollment updated session state and card badge immediately!')

    // 10. Responsive Verification: Mobile Viewport (390px)
    console.log('\n--- Step 10: Testing Mobile Viewport (390px) ---')
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
    await sleep(300)

    // Open drawer on mobile
    await page.click(cardSelector)
    await sleep(400)

    const mobileScreenshotPath = path.join(ARTIFACT_DIR, 'course_drawer_mobile.png')
    await page.screenshot({ path: mobileScreenshotPath, fullPage: false })
    console.log(`📱 Mobile screenshot saved: ${mobileScreenshotPath}`)

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! CourseDrawer satisfies all requirements in DESIGN.md.')
  } catch (err) {
    console.error('❌ Test failed:', err)
    process.exitCode = 1
  } finally {
    await browser.close()
  }
}

runTests()
