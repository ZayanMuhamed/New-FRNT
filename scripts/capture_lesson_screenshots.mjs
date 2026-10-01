import puppeteer from 'puppeteer-core'

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5173'
const ARTIFACT_DIR = 'C:/Users/zayan/.gemini/antigravity-ide/brain/b27f57fe-c3c4-4723-8be7-209676e57171'

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox'],
  })

  const page = await browser.newPage()

  // 1. Authenticate student
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
    sessionStorage.setItem(
      'hermes_student_enrolled_courses',
      JSON.stringify(['crs_ds_402', 'crs_cp_420', 'crs_ml_481', 'crs_db_390', 'crs_sec_455', 'crs_qc_310'])
    )
  })

  // 2. Desktop Screenshot
  await page.setViewport({ width: 1280, height: 900 })
  await page.goto(`${BASE_URL}/student/learn/crs_ds_402/crs_ds_402-l1`, { waitUntil: 'networkidle0' })
  await sleep(600)
  await page.screenshot({ path: `${ARTIFACT_DIR}/lesson_desktop_main.png`, fullPage: false })
  console.log('✓ Captured lesson_desktop_main.png')

  // 3. Mobile Viewport Screenshot (390px)
  await page.setViewport({ width: 390, height: 844 })
  await page.reload({ waitUntil: 'networkidle0' })
  await sleep(600)
  await page.screenshot({ path: `${ARTIFACT_DIR}/lesson_mobile_390px.png`, fullPage: false })
  console.log('✓ Captured lesson_mobile_390px.png')

  // 4. Mobile Bottom Sheet Outline Screenshot
  await page.click('[data-testid="mobile-outline-toggle-btn"]')
  await sleep(500)
  await page.screenshot({ path: `${ARTIFACT_DIR}/lesson_mobile_outline.png`, fullPage: false })
  console.log('✓ Captured lesson_mobile_outline.png')

  // 5. Desktop Last Lesson / Course Complete Screenshot
  await page.setViewport({ width: 1280, height: 900 })
  await page.goto(`${BASE_URL}/student/learn/crs_ds_402/crs_ds_402-l10`, { waitUntil: 'networkidle0' })
  await sleep(600)
  await page.screenshot({ path: `${ARTIFACT_DIR}/lesson_course_completed.png`, fullPage: false })
  console.log('✓ Captured lesson_course_completed.png')

  await browser.close()
  console.log('All screenshots captured successfully!')
}

capture()
