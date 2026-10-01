import puppeteer from 'puppeteer-core'

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5173'
const ARTIFACT_DIR = 'C:/Users/zayan/.gemini/antigravity-ide/brain/a70f8f5e-1000-485c-a9ac-3df78213c8cb'

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--window-size=1280,900', '--disable-gpu=false', '--no-sandbox'],
    defaultViewport: { width: 1280, height: 900 },
  })

  try {
    const page = await browser.newPage()

    // Seed session
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

    // 1. Checkout Screen
    await page.goto(`${BASE_URL}/student/checkout/crs_ai_340`, { waitUntil: 'networkidle0' })
    await sleep(400)
    await page.screenshot({ path: `${ARTIFACT_DIR}/checkout_screen.png` })
    console.log('Saved checkout_screen.png')

    // 2. Processing Screen
    await page.evaluate(() => {
      sessionStorage.setItem('hermes_checkout_pending_crs_ai_340', 'true')
    })
    await page.goto(`${BASE_URL}/student/checkout/crs_ai_340/processing`, { waitUntil: 'networkidle0' })
    await sleep(300)
    await page.screenshot({ path: `${ARTIFACT_DIR}/processing_screen.png` })
    console.log('Saved processing_screen.png')

    // 3. Failure Screen
    await page.evaluate(() => {
      sessionStorage.setItem('hermes_checkout_pending_crs_ai_340', 'true')
    })
    await page.goto(`${BASE_URL}/student/checkout/crs_ai_340/processing?fail=1`, { waitUntil: 'networkidle0' })
    await page.waitForSelector('#failure-heading', { timeout: 4000 })
    await sleep(200)
    await page.screenshot({ path: `${ARTIFACT_DIR}/failure_screen.png` })
    console.log('Saved failure_screen.png')

    // 4. Success Screen
    await page.evaluate(() => {
      sessionStorage.setItem('hermes_checkout_pending_crs_ai_340', 'true')
    })
    await page.goto(`${BASE_URL}/student/checkout/crs_ai_340/processing`, { waitUntil: 'networkidle0' })
    await page.waitForFunction(() => window.location.pathname.includes('/success'), { timeout: 5000 })
    await sleep(300)
    await page.screenshot({ path: `${ARTIFACT_DIR}/success_screen.png` })
    console.log('Saved success_screen.png')

    // 5. Mobile Checkout (390px)
    await page.setViewport({ width: 390, height: 844 })
    await page.goto(`${BASE_URL}/student/checkout/crs_sec_380`, { waitUntil: 'networkidle0' })
    await sleep(400)
    await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_checkout.png` })
    console.log('Saved mobile_checkout.png')
  } finally {
    await browser.close()
  }
}

run().catch(console.error)
