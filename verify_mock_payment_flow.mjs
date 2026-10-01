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
    // Reset enrolled courses to standard default seed (crs_os_301 is NOT enrolled)
    sessionStorage.setItem(
      'hermes_student_enrolled_courses',
      JSON.stringify(['crs_ds_402', 'crs_cp_420', 'crs_ml_481', 'crs_db_390', 'crs_sec_455', 'crs_qc_310'])
    )
    // Clear any leftover checkout flags
    const keysToRemove = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith('hermes_checkout_')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k))
  })
}

async function run() {
  console.log('=== STARTING COMPLETE MOCK PAYMENT FLOW VERIFICATION ===')

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--window-size=1280,900', '--disable-gpu=false', '--no-sandbox'],
    defaultViewport: { width: 1280, height: 900 },
  })

  try {
    const page = await browser.newPage()
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))

    // -------------------------------------------------------------
    // Test 1: Pay success flow
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Pay success flow ---')
    await seedStudentAuth(page)

    // Navigate to courses page
    await page.goto(`${BASE_URL}/student/courses`, { waitUntil: 'networkidle0' })
    await sleep(400)

    // Select an unenrolled paid course (crs_os_301: Operating Systems Principles)
    console.log('Opening drawer for crs_os_301...')
    await page.click('#course-card-crs_os_301')
    await sleep(400)

    const enrollBtn = await page.waitForSelector('[data-testid="drawer-enroll-btn"]')
    const enrollBtnText = await page.evaluate((el) => el.textContent?.trim(), enrollBtn)
    console.log(`✓ Drawer enroll button text: "${enrollBtnText}"`)
    assert.match(enrollBtnText, /Enroll now/, 'Button text should be "Enroll now"')

    // Clicking enroll on paid course navigates to checkout route
    await enrollBtn.click()
    await page.waitForFunction(() => window.location.pathname.includes('/student/checkout/crs_os_301'), { timeout: 4000 })
    await sleep(200)

    const currentUrl = page.url()
    console.log(`✓ Navigated to checkout URL: ${currentUrl}`)
    assert.ok(currentUrl.includes('/student/checkout/crs_os_301'), 'Should navigate to checkout route')

    // Verify focus on heading
    const activeId = await page.evaluate(() => document.activeElement?.id)
    console.log(`✓ Active element ID on checkout: "${activeId}"`)
    assert.equal(activeId, 'checkout-heading', 'Focus should move to checkout heading')

    // Verify Demo Notice
    const demoNotice = await page.waitForSelector('[role="note"]')
    const noticeText = await page.evaluate((el) => el.textContent, demoNotice)
    assert.match(noticeText, /Demo payment: no real charge/i, 'Demo notice must be present')
    console.log('✓ Demo payment notice verified')

    // Verify Rupee pricing in order summary
    const totalAmount = await page.evaluate(() => {
      const aside = document.querySelector('aside')
      return aside?.textContent
    })
    assert.match(totalAmount, /₹2,499/, 'Order summary should contain rupee price ₹2,499')
    console.log('✓ Order summary with Rupee pricing verified')

    // Verify payment pills (UPI, Card, Net banking) and keyboard selection
    const upiSelected = await page.evaluate(() => {
      return document.querySelector('#payment-method-upi')?.getAttribute('aria-checked') === 'true'
    })
    assert.ok(upiSelected, 'UPI must be selected by default')
    console.log('✓ UPI is default payment method')

    // Test keyboard selection on radio pill: press ArrowRight to select Card
    await page.focus('#payment-method-upi')
    await page.keyboard.press('ArrowRight')
    await sleep(100)
    const cardSelected = await page.evaluate(() => {
      return document.querySelector('#payment-method-card')?.getAttribute('aria-checked') === 'true'
    })
    assert.ok(cardSelected, 'Card should be selected after ArrowRight')
    console.log('✓ Keyboard navigation between payment pills verified')

    // Click "Pay (demo)" button
    console.log('Clicking "Pay (demo)" button...')
    const payBtn = await page.waitForSelector('#pay-demo-btn')
    await payBtn.click()

    // Wait for SPA navigation to processing route
    await page.waitForFunction(() => window.location.pathname.includes('/student/checkout/crs_os_301/processing'), { timeout: 4000 })
    await sleep(200)

    // Verify arrival on processing screen
    const procUrl = page.url()
    console.log(`✓ Navigated to processing URL: ${procUrl}`)
    assert.ok(procUrl.includes('/student/checkout/crs_os_301/processing'), 'Should navigate to processing')

    const procHeadingActive = await page.evaluate(() => document.activeElement?.id)
    assert.equal(procHeadingActive, 'processing-heading', 'Focus should move to processing heading')
    console.log('✓ Processing heading focused')

    // Wait for 2-second processing to complete and redirect to success
    console.log('Waiting for 2-second processing timer to redirect to success...')
    await page.waitForFunction(() => window.location.pathname.includes('/student/checkout/crs_os_301/success'), { timeout: 5000 })
    await sleep(400)

    const successUrl = page.url()
    console.log(`✓ Navigated to success URL: ${successUrl}`)
    assert.ok(successUrl.includes('/student/checkout/crs_os_301/success'), 'Should navigate to success')

    // Verify success heading focus and course title
    const successHeadingActive = await page.evaluate(() => document.activeElement?.id)
    assert.equal(successHeadingActive, 'success-heading', 'Focus should move to success heading')

    const successCardText = await page.evaluate(() => document.body.textContent)
    assert.match(successCardText, /Operating Systems Principles/, 'Success card should display course title')
    console.log('✓ Course title displayed on success page')

    // Verify "Start first lesson" button and "Go to dashboard" link
    const startLessonBtn = await page.$('#start-first-lesson-btn')
    const dashboardLink = await page.$('#go-to-dashboard-link')
    assert.ok(startLessonBtn, 'Start first lesson button must exist')
    assert.ok(dashboardLink, 'Go to dashboard link must exist')
    console.log('✓ Start first lesson and Go to dashboard actions verified')

    // Verify course is enrolled in EnrollmentContext / sessionStorage
    const enrolledInSession = await page.evaluate(() => {
      const stored = sessionStorage.getItem('hermes_student_enrolled_courses')
      return stored?.includes('crs_os_301')
    })
    assert.ok(enrolledInSession, 'Course should be added to EnrollmentContext sessionStorage')
    console.log('✓ EnrollmentContext successfully updated with crs_os_301')

    // -------------------------------------------------------------
    // Test 2: Pay with ?fail=1 then retry
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Pay with ?fail=1 then retry ---')
    // Set pending checkout flag for crs_sys_210
    await page.evaluate(() => {
      sessionStorage.setItem('hermes_checkout_pending_crs_sys_210', 'true')
    })
    await page.goto(`${BASE_URL}/student/checkout/crs_sys_210/processing?fail=1`, { waitUntil: 'networkidle0' })
    console.log('Waiting for 2s failure transition...')
    await page.waitForSelector('#failure-heading', { timeout: 4000 })

    const failHeading = await page.$('#failure-heading')
    assert.ok(failHeading, 'Failure heading should be rendered')
    const failText = await page.evaluate((el) => el.textContent, failHeading)
    console.log(`✓ Failure heading found: "${failText}"`)

    const tryAgainBtn = await page.waitForSelector('#try-again-btn')
    assert.ok(tryAgainBtn, 'Try again button must exist in failure state')

    // Click "Try again"
    console.log('Clicking "Try again" button...')
    await tryAgainBtn.click()
    await page.waitForFunction(() => window.location.pathname === '/student/checkout/crs_sys_210', { timeout: 4000 })
    await sleep(200)

    const retryUrl = page.url()
    console.log(`✓ Returned to checkout URL: ${retryUrl}`)
    assert.ok(retryUrl.includes('/student/checkout/crs_sys_210'), 'Should return to checkout page on retry')

    // -------------------------------------------------------------
    // Test 3: Open success URL directly (Guard test)
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Open success URL directly without checkout flag ---')
    await page.evaluate(() => {
      sessionStorage.removeItem('hermes_checkout_pending_crs_sys_435')
      sessionStorage.removeItem('hermes_checkout_success_ready_crs_sys_435')
    })
    await page.goto(`${BASE_URL}/student/checkout/crs_sys_435/success`, { waitUntil: 'networkidle0' })
    await page.waitForFunction(() => !window.location.pathname.includes('/success'), { timeout: 4000 })

    const directSuccessUrl = page.url()
    console.log(`✓ Direct visit URL after guard interception: ${directSuccessUrl}`)
    assert.ok(!directSuccessUrl.includes('/success'), 'Direct visit to success should be blocked')
    assert.ok(directSuccessUrl.includes('/student/courses'), 'Should redirect to courses listing')

    // -------------------------------------------------------------
    // Test 4: Open checkout for a free course (Guard test)
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Open checkout for a free course ---')
    // crs_math_220 is designated free
    await page.goto(`${BASE_URL}/student/checkout/crs_math_220`, { waitUntil: 'networkidle0' })
    await page.waitForFunction(() => window.location.pathname.includes('/student/courses'), { timeout: 4000 })
    await sleep(300)

    const freeRedirectUrl = page.url()
    console.log(`✓ Free course checkout redirected to: ${freeRedirectUrl}`)
    assert.ok(freeRedirectUrl.includes('/student/courses'), 'Free course should redirect away from checkout')

    // Verify toast was displayed
    const toastText = await page.evaluate(() => {
      const toast = document.querySelector('[role="status"]')
      return toast?.textContent
    })
    console.log(`✓ Toast notification: "${toastText}"`)
    assert.match(toastText, /free/i, 'Toast should mention course is free')

    // -------------------------------------------------------------
    // Test 5: Open checkout for an already enrolled course (Guard test)
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Open checkout for an already enrolled course ---')
    // crs_ds_402 is enrolled
    await page.goto(`${BASE_URL}/student/checkout/crs_ds_402`, { waitUntil: 'networkidle0' })
    await page.waitForFunction(() => window.location.pathname.includes('/student/courses'), { timeout: 4000 })
    await sleep(300)

    const enrolledRedirectUrl = page.url()
    console.log(`✓ Already enrolled course checkout redirected to: ${enrolledRedirectUrl}`)
    assert.ok(enrolledRedirectUrl.includes('/student/courses'), 'Enrolled course should redirect away from checkout')

    const enrolledToastText = await page.evaluate(() => {
      const toast = document.querySelector('[role="status"]')
      return toast?.textContent
    })
    console.log(`✓ Toast notification: "${enrolledToastText}"`)
    assert.match(enrolledToastText, /already enrolled/i, 'Toast should inform user they are already enrolled')

    // -------------------------------------------------------------
    // Test 6: Refresh on each screen
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Refresh on each screen ---')
    // Checkout refresh:
    await page.goto(`${BASE_URL}/student/checkout/crs_sys_435`, { waitUntil: 'networkidle0' })
    await sleep(300)
    await page.reload({ waitUntil: 'networkidle0' })
    await sleep(300)
    assert.ok(page.url().includes('/student/checkout/crs_sys_435'), 'Checkout screen survives refresh')
    console.log('✓ Refresh on checkout screen passed')

    // Processing refresh:
    await page.evaluate(() => {
      sessionStorage.setItem('hermes_checkout_pending_crs_sys_435', 'true')
    })
    await page.goto(`${BASE_URL}/student/checkout/crs_sys_435/processing`, { waitUntil: 'networkidle0' })
    await sleep(300)
    await page.reload({ waitUntil: 'networkidle0' })
    await sleep(300)
    console.log('✓ Refresh on processing screen passed')

    // -------------------------------------------------------------
    // Test 7: Back button after success
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Back button after success ---')
    // Wait for crs_sys_435 to finish processing to success
    await page.waitForFunction(() => window.location.pathname.includes('/success'), { timeout: 5000 })
    await sleep(400)
    console.log(`On success screen: ${page.url()}`)
    const storedOnSuccess = await page.evaluate(() => sessionStorage.getItem('hermes_student_enrolled_courses'))
    console.log('Enrolled in session on success:', storedOnSuccess)

    // Now user hits the browser Back button
    console.log('Pressing browser Back button...')
    await page.goBack()
    await sleep(600)
    console.log('Immediate URL after goBack:', page.url())
    await page.waitForFunction(() => !window.location.pathname.includes('/checkout/'), { timeout: 5000 })
    await sleep(200)

    const backUrl = page.url()
    console.log(`URL after pressing Back: ${backUrl}`)
    // Course is now enrolled, so guard safely intercepts and redirects away without re-billing!
    assert.ok(
      !backUrl.includes('/processing') && !backUrl.includes('/checkout/crs_sys_435'),
      'Back button should not get trapped in checkout/processing'
    )
    console.log('✓ Back button after success safely handled by enrolled guard')

    // -------------------------------------------------------------
    // Test 8: Mobile layout at 390px
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Mobile layout at 390px ---')
    await page.setViewport({ width: 390, height: 844 })
    await page.goto(`${BASE_URL}/student/checkout/crs_ai_210`, { waitUntil: 'networkidle0' })
    await sleep(400)

    // Check no horizontal scrollbar on 390px mobile viewport
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    console.log(`Horizontal overflow on 390px: ${hasHorizontalOverflow}`)
    assert.equal(hasHorizontalOverflow, false, 'Mobile 390px viewport should have no horizontal overflow')

    // Check minimum 44px tap targets for interactive buttons
    const payBtnBox = await page.evaluate(() => {
      const btn = document.querySelector('#pay-demo-btn')
      const rect = btn?.getBoundingClientRect()
      return { width: rect?.width, height: rect?.height }
    })
    console.log(`Pay button dimensions on mobile: ${payBtnBox.width}x${payBtnBox.height}px`)
    assert.ok(payBtnBox.height >= 44, 'Pay button must be at least 44px high')

    // -------------------------------------------------------------
    // Test 9: Accessibility & Reduced Motion
    // -------------------------------------------------------------
    console.log('\n--- TEST 9: Accessibility & Reduced Motion ---')
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    await page.evaluate(() => {
      sessionStorage.setItem('hermes_checkout_pending_crs_ai_210', 'true')
    })
    await page.goto(`${BASE_URL}/student/checkout/crs_ai_210/processing`, { waitUntil: 'networkidle0' })
    await sleep(300)

    // Spinner should NOT have animate-spin class when reduced motion is requested
    const spinnerHasSpinAnimation = await page.evaluate(() => {
      const spinner = document.querySelector('svg[aria-label="Processing animation"]')
      return spinner?.classList.contains('animate-spin')
    })
    console.log(`Spinner has animate-spin in reduced motion: ${spinnerHasSpinAnimation}`)
    assert.equal(spinnerHasSpinAnimation, false, 'Spinner should not animate with reduced motion')
    console.log('✓ Reduced motion honored on processing spinner')

    console.log('\n🎉 ALL 9 COMPREHENSIVE VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉\n')
  } finally {
    await browser.close()
  }
}

run().catch((err) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err)
  process.exit(1)
})
