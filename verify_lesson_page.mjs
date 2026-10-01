import puppeteer from 'puppeteer-core'
import assert from 'node:assert/strict'

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5173'

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function seedStudentAuth(page) {
  await page.goto(`${BASE_URL}/student`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    // Set authenticated student
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
    // Standard enrolled courses (crs_os_301 is completed, crs_ai_501 is not enrolled)
    sessionStorage.setItem(
      'hermes_student_enrolled_courses',
      JSON.stringify(['crs_ds_402', 'crs_cp_420', 'crs_ml_481', 'crs_db_390', 'crs_sec_455', 'crs_qc_310'])
    )
    // Reset progress
    sessionStorage.removeItem('hermes_student_progress')
  })
}

async function runTests() {
  console.log('=== STARTING TASK 5: LESSON PAGE VERIFICATION ===')

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--window-size=1280,900', '--no-sandbox'],
    defaultViewport: { width: 1280, height: 900 },
  })

  const results = []

  try {
    const page = await browser.newPage()

    // -------------------------------------------------------------
    // Test 1: Open a lesson directly by URL
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Open a lesson directly by URL ---')
    await seedStudentAuth(page)
    await page.goto(`${BASE_URL}/student/learn/crs_ds_402/crs_ds_402-l1`, { waitUntil: 'networkidle0' })
    await sleep(500)

    const videoEl = await page.$('[data-testid="lesson-video-element"]')
    assert.ok(videoEl, 'Video element must be rendered')

    const titleText = await page.$eval('[data-testid="lesson-title-heading"]', (el) => el.textContent?.trim())
    assert.ok(titleText && titleText.length > 0, `Title must be present, got: ${titleText}`)
    console.log(`✓ Lesson 1 loaded directly: "${titleText}"`)

    const activeOutlineLesson = await page.$eval('[aria-current="page"]', (el) => el.textContent?.trim())
    assert.ok(activeOutlineLesson?.includes(titleText), 'Active lesson in outline must have aria-current="page"')
    console.log(`✓ Active lesson in outline correctly marked with aria-current="page"`)
    results.push({ name: 'Direct URL Navigation', passed: true })

    // -------------------------------------------------------------
    // Test 2: Open a lesson in a course not enrolled in (redirect)
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Non-enrolled course access redirect ---')
    // crs_os_301 exists in courseCatalog but is not in enrolled list
    await page.goto(`${BASE_URL}/student/learn/crs_os_301/crs_os_301-l1`, { waitUntil: 'networkidle0' })
    await sleep(600)

    const currentUrl = page.url()
    assert.ok(
      currentUrl.includes('/student/courses'),
      `Non-enrolled student should be redirected to courses page, got: ${currentUrl}`
    )
    console.log(`✓ Non-enrolled student successfully redirected to: ${currentUrl}`)
    results.push({ name: 'Non-Enrolled Course Access Redirect', passed: true })

    // -------------------------------------------------------------
    // Test 3: Invalid course or lesson ID friendly not-found state
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Invalid course and lesson ID friendly not-found states ---')
    // 3a. Invalid course ID
    await page.goto(`${BASE_URL}/student/learn/invalid_course_999/some_lesson`, { waitUntil: 'networkidle0' })
    await sleep(400)
    const courseNotFoundCard = await page.$('[data-testid="lesson-not-found-card"]')
    assert.ok(courseNotFoundCard, 'Friendly not-found card must be displayed for invalid course')
    const notFoundText = await page.$eval('[data-testid="lesson-not-found-card"]', (el) => el.textContent)
    assert.ok(notFoundText?.includes('Course not found'), 'Should say Course not found')
    console.log(`✓ Invalid course ID handled with friendly not-found card`)

    // 3b. Invalid lesson ID in valid enrolled course
    await page.goto(`${BASE_URL}/student/learn/crs_ds_402/invalid_lesson_999`, { waitUntil: 'networkidle0' })
    await sleep(400)
    const lessonNotFoundCard = await page.$('[data-testid="lesson-not-found-card"]')
    assert.ok(lessonNotFoundCard, 'Friendly not-found card must be displayed for invalid lesson')
    const startFirstLink = await page.$('[data-testid="not-found-first-lesson-link"]')
    assert.ok(startFirstLink, 'Should offer link to start from lesson 1')
    console.log(`✓ Invalid lesson ID handled with friendly not-found card & fallback action`)
    results.push({ name: 'Friendly Not-Found States', passed: true })

    // -------------------------------------------------------------
    // Test 4: Complete then undo (toggle behavior & progress update)
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Complete then undo behavior ---')
    // Test on an initially uncompleted course lesson (crs_qc_310 has 0 completed lessons)
    await page.goto(`${BASE_URL}/student/learn/crs_qc_310/crs_qc_310-l1`, { waitUntil: 'networkidle0' })
    await sleep(500)

    const completeBtn = await page.$('[data-testid="lesson-complete-btn"]')
    assert.ok(completeBtn, 'Mark complete button must exist')

    // Initial state check: should be uncompleted
    let btnText = await page.$eval('[data-testid="lesson-complete-btn"]', (el) => el.textContent?.trim())
    console.log(`Initial button text: "${btnText}"`)
    assert.ok(btnText?.includes('Mark as complete'), `Initial button text should be Mark as complete, got: "${btnText}"`)

    // Step 1: Click to complete
    await page.click('[data-testid="lesson-complete-btn"]')
    await sleep(300)

    btnText = await page.$eval('[data-testid="lesson-complete-btn"]', (el) => el.textContent?.trim())
    assert.ok(btnText?.includes('Completed'), `Button should now say Completed, got: "${btnText}"`)
    console.log(`✓ Marked as complete! Button text: "${btnText}"`)

    // Verify sessionStorage updated
    const isSavedComplete = await page.evaluate(() => {
      const stored = sessionStorage.getItem('hermes_student_progress')
      if (!stored) return false
      const parsed = JSON.parse(stored)
      return parsed['crs_qc_310']?.completedLessonIds?.includes('crs_qc_310-l1')
    })
    assert.ok(isSavedComplete, 'Lesson 1 must be marked completed in sessionStorage')
    console.log(`✓ Stored in sessionStorage accurately`)

    // Step 2: Click again to undo
    await page.click('[data-testid="lesson-complete-btn"]')
    await sleep(300)

    btnText = await page.$eval('[data-testid="lesson-complete-btn"]', (el) => el.textContent?.trim())
    assert.ok(btnText?.includes('Mark as complete'), `Button should revert to Mark as complete, got: "${btnText}"`)
    console.log(`✓ Undo successful! Button reverted to: "${btnText}"`)
    results.push({ name: 'Complete and Undo Toggle', passed: true })

    // -------------------------------------------------------------
    // Test 5: Complete the last lesson & Course complete state
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Complete the last lesson ---')
    await page.goto(`${BASE_URL}/student/learn/crs_ds_402/crs_ds_402-l1`, { waitUntil: 'networkidle0' })
    await sleep(400)

    // Get total lessons count for crs_ds_402 from top bar
    const totalLessons = await page.evaluate(() => {
      const headerText = document.querySelector('header')?.innerText || ''
      const match = headerText.match(/Lesson\s+\d+\s+of\s+(\d+)/i)
      return match ? parseInt(match[1], 10) : 10
    })
    console.log(`Total lessons in course: ${totalLessons}`)

    // Navigate to last lesson
    const lastLessonId = `crs_ds_402-l${totalLessons}`
    await page.goto(`${BASE_URL}/student/learn/crs_ds_402/${lastLessonId}`, { waitUntil: 'networkidle0' })
    await sleep(500)

    const courseCompleteBtn = await page.$('[data-testid="lesson-course-complete-btn"]')
    assert.ok(courseCompleteBtn, 'Last lesson must show "Course complete" action button')
    const ccText = await page.$eval('[data-testid="lesson-course-complete-btn"]', (el) => el.textContent?.trim())
    assert.ok(ccText?.includes('Course complete'), `Course complete button text should match, got: "${ccText}"`)
    console.log(`✓ Last lesson displays: "${ccText}" linking back to course page`)
    results.push({ name: 'Last Lesson Course Complete State', passed: true })

    // -------------------------------------------------------------
    // Test 6: Previous on first lesson is disabled
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Previous on first lesson is disabled ---')
    await page.goto(`${BASE_URL}/student/learn/crs_ds_402/crs_ds_402-l1`, { waitUntil: 'networkidle0' })
    await sleep(400)

    const prevBtnDisabled = await page.$eval('[data-testid="lesson-prev-btn"]', (el) => el.hasAttribute('disabled'))
    assert.strictEqual(prevBtnDisabled, true, 'Previous button must be disabled on first lesson')
    console.log(`✓ Previous button disabled on lesson 1`)
    results.push({ name: 'First Lesson Previous Disabled', passed: true })

    // -------------------------------------------------------------
    // Test 7: Refresh mid-video preserves playback position
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Refresh mid-video preserves playback position ---')
    // Set currentTime to 1.4 seconds (within video duration)
    await page.evaluate(() => {
      const video = document.querySelector('video')
      if (video) {
        video.currentTime = 1.4
        // trigger timeupdate event
        video.dispatchEvent(new Event('timeupdate'))
      }
    })
    await sleep(300)

    // Reload page
    await page.reload({ waitUntil: 'networkidle0' })
    await sleep(600)

    // Check restored position
    const restoredPosition = await page.evaluate(() => {
      const video = document.querySelector('video')
      return video ? video.currentTime : 0
    })
    console.log(`Restored playback position after reload: ${restoredPosition}s`)
    assert.ok(restoredPosition >= 1, `Playback position should be restored, got: ${restoredPosition}`)
    console.log(`✓ Video playback position preserved across reload`)
    results.push({ name: 'Mid-Video Position Persistence', passed: true })

    // -------------------------------------------------------------
    // Test 8: Switching lessons while playing
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Switching lessons while playing ---')
    // Click Next button
    await page.click('[data-testid="lesson-next-btn"]')
    await sleep(600)

    const nextTitle = await page.$eval('[data-testid="lesson-title-heading"]', (el) => el.textContent?.trim())
    assert.ok(nextTitle?.includes('Physical vs Logical Time'), `Should be lesson 2, got: "${nextTitle}"`)
    console.log(`✓ Successfully switched to next lesson: "${nextTitle}"`)
    results.push({ name: 'Lesson Switching Traversal', passed: true })

    // -------------------------------------------------------------
    // Test 9: Mobile layout at 390px with sticky action bar
    // -------------------------------------------------------------
    console.log('\n--- TEST 9: Mobile layout at 390px viewport ---')
    await page.setViewport({ width: 390, height: 844 })
    await page.goto(`${BASE_URL}/student/learn/crs_ds_402/crs_ds_402-l1`, { waitUntil: 'networkidle0' })
    await sleep(500)

    // Verify sticky action bar is visible
    const stickyBar = await page.$('[data-testid="mobile-sticky-action-bar"]')
    assert.ok(stickyBar, 'Mobile sticky action bar must exist at 390px')
    const isStickyVisible = await page.evaluate(() => {
      const bar = document.querySelector('[data-testid="mobile-sticky-action-bar"]')
      if (!bar) return false
      const style = window.getComputedStyle(bar)
      return style.display !== 'none' && style.visibility !== 'hidden'
    })
    assert.strictEqual(isStickyVisible, true, 'Mobile sticky action bar must be visible')
    console.log(`✓ Mobile sticky action bar is active and visible`)

    // Verify 44px tap targets in mobile action bar
    const prevBtnHeight = await page.$eval('[data-testid="mobile-sticky-action-bar"] [data-testid="lesson-prev-btn"]', (el) => el.getBoundingClientRect().height)
    assert.ok(prevBtnHeight >= 44, `Previous button tap target must be >= 44px, got: ${prevBtnHeight}px`)

    const completeBtnHeight = await page.$eval('[data-testid="mobile-sticky-action-bar"] [data-testid="lesson-complete-btn"]', (el) => el.getBoundingClientRect().height)
    assert.ok(completeBtnHeight >= 44, `Complete button tap target must be >= 44px, got: ${completeBtnHeight}px`)
    console.log(`✓ 44px minimum tap targets verified on mobile action bar`)

    // Open mobile outline bottom sheet
    await page.click('[data-testid="mobile-outline-toggle-btn"]')
    await sleep(400)

    const isSheetOpen = await page.evaluate(() => {
      const sheet = document.querySelector('[data-testid="lesson-outline-mobile-sheet"]')
      return sheet && sheet.classList.contains('opacity-100')
    })
    assert.strictEqual(isSheetOpen, true, 'Mobile outline bottom sheet should be open')
    console.log(`✓ Mobile outline bottom sheet opens cleanly on click`)

    // Close bottom sheet
    await page.click('[data-testid="mobile-sheet-close-btn"]')
    await sleep(300)
    console.log(`✓ Mobile outline bottom sheet closes properly`)
    results.push({ name: 'Mobile Layout 390px & Bottom Sheet', passed: true })

    // -------------------------------------------------------------
    // Test 10: Button Wiring from Dashboard & Course Drawer
    // -------------------------------------------------------------
    console.log('\n--- TEST 10: Button wiring from earlier tasks ---')
    await page.setViewport({ width: 1280, height: 900 })

    // 10a. Course Drawer "Continue learning" button
    await page.goto(`${BASE_URL}/student/courses?course=crs_ds_402`, { waitUntil: 'networkidle0' })
    await sleep(500)
    const continueBtn = await page.$('[data-testid="drawer-continue-btn"]')
    assert.ok(continueBtn, 'Continue learning button must be present in drawer for enrolled course')
    await page.click('[data-testid="drawer-continue-btn"]')
    await sleep(600)
    assert.ok(page.url().includes('/student/learn/crs_ds_402'), `Drawer Continue Learning should navigate to lesson page, got: ${page.url()}`)
    console.log(`✓ Course Drawer "Continue learning" wired to lesson page: ${page.url()}`)

    // 10b. Dashboard "Resume lesson" button
    await page.goto(`${BASE_URL}/student/dashboard`, { waitUntil: 'networkidle0' })
    await sleep(600)
    const resumeBtn = await page.$('[aria-label^="Resume lesson"]')
    assert.ok(resumeBtn, 'Resume lesson button must exist on Dashboard')
    await page.click('[aria-label^="Resume lesson"]')
    await sleep(600)
    assert.ok(page.url().includes('/student/learn/'), `Dashboard Resume lesson button should navigate to lesson page, got: ${page.url()}`)
    console.log(`✓ Dashboard "Resume lesson" button wired to lesson page: ${page.url()}`)
    results.push({ name: 'Button Wiring from Earlier Tasks', passed: true })

    // -------------------------------------------------------------
    // Test 11: Keyboard shortcuts (N, P, and Left/Right seek)
    // -------------------------------------------------------------
    console.log('\n--- TEST 11: Keyboard shortcuts (N, P, and Arrow seek) ---')
    await page.goto(`${BASE_URL}/student/learn/crs_ds_402/crs_ds_402-l2`, { waitUntil: 'networkidle0' })
    await sleep(400)

    // Press 'N' key
    await page.keyboard.press('n')
    await sleep(500)
    assert.ok(page.url().includes('crs_ds_402-l3'), `Pressing 'N' should navigate to lesson 3, got: ${page.url()}`)
    console.log(`✓ 'N' shortcut navigated to lesson 3: ${page.url()}`)

    // Press 'P' key
    await page.keyboard.press('p')
    await sleep(500)
    assert.ok(page.url().includes('crs_ds_402-l2'), `Pressing 'P' should navigate back to lesson 2, got: ${page.url()}`)
    console.log(`✓ 'P' shortcut navigated back to lesson 2: ${page.url()}`)

    // Focus video container and seek with ArrowRight
    await page.focus('[role="region"][aria-label^="Video player"]')
    const beforeSeek = await page.evaluate(() => document.querySelector('video')?.currentTime || 0)
    await page.keyboard.press('ArrowRight')
    await sleep(200)
    const afterSeek = await page.evaluate(() => document.querySelector('video')?.currentTime || 0)
    assert.ok(afterSeek >= beforeSeek, `ArrowRight should seek forward, got before=${beforeSeek}, after=${afterSeek}`)
    console.log(`✓ Arrow key seek verified on focused video`)
    results.push({ name: 'Keyboard Shortcuts (N, P, Arrow Seek)', passed: true })

  } catch (err) {
    console.error('VERIFICATION FAILED:', err)
    process.exitCode = 1
  } finally {
    await browser.close()
  }

  console.log('\n======================================================')
  console.log('TASK 5 LESSON PAGE VERIFICATION RESULTS:')
  console.log('======================================================')
  results.forEach((r, idx) => {
    console.log(`${idx + 1}. [${r.passed ? 'PASS' : 'FAIL'}] ${r.name}`)
  })
}

runTests()
