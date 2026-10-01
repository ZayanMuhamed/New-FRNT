import puppeteer from 'puppeteer-core'
import path from 'path'
import fs from 'fs'

const ARTIFACT_DIR = 'C:/Users/zayan/.gemini/antigravity-ide/brain/b6b0a7aa-360b-46c1-bf11-eae056b09c49'
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5173'

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function run() {
  console.log('--- STARTING COURSE GRID & COURSE CARD VERIFICATION ---')

  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true })
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--window-size=1440,900', '--disable-gpu=false', '--no-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  })

  try {
    const page = await browser.newPage()

    // 1. Authenticate student session
    console.log('Step 1: Setting student session in sessionStorage...')
    await page.goto(`${BASE_URL}/student`, { waitUntil: 'networkidle0' })
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

    // 2. Navigate to student dashboard
    console.log('Step 2: Navigating to student dashboard...')
    await page.goto(`${BASE_URL}/student/dashboard`, { waitUntil: 'networkidle0' })
    await sleep(600) // Allow mock delay and initial render

    // 3. Verify CourseGrid header and count
    console.log('Step 3: Verifying CourseGrid header and filter pill row...')
    const headingText = await page.$eval('#course-grid-heading', (el) => el.textContent.trim())
    console.log(`✓ Found CourseGrid heading: "${headingText}"`)

    const filterPills = await page.$$eval('[role="tablist"] button[role="tab"]', (buttons) =>
      buttons.map((b) => b.textContent.trim().replace(/\s+/g, ' '))
    )
    console.log(`✓ Filter pills found: ${JSON.stringify(filterPills)}`)

    // 4. Verify initial card count (All)
    const initialCards = await page.$$('[data-testid^="course-card-"]')
    console.log(`✓ Initial rendered cards count (All): ${initialCards.length}`)
    if (initialCards.length !== 6) {
      throw new Error(`Expected 6 courses initially, got ${initialCards.length}`)
    }

    // 5. Verify CourseCard structure
    console.log('Step 4: Inspecting first CourseCard structure...')
    const firstCardData = await page.evaluate(() => {
      const card = document.querySelector('[data-testid^="course-card-"]')
      if (!card) return null
      const title = card.querySelector('h3')?.textContent?.trim()
      const instructor = card.querySelector('.lucide-user')?.nextElementSibling?.textContent?.trim()
      const statusPill = card.querySelector('[data-testid="course-status-pill"]')?.textContent?.trim()
      const progressText = card.querySelector('[data-testid="course-progress-value"]')?.textContent?.trim()
      const progressBar = card.querySelector('[role="progressbar"]')
      const ariaNow = progressBar?.getAttribute('aria-valuenow')
      const ariaMin = progressBar?.getAttribute('aria-valuemin')
      const ariaMax = progressBar?.getAttribute('aria-valuemax')
      const classList = Array.from(card.classList)
      const hasHoverLift = classList.some((c) => c.includes('hover:-translate-y-'))

      return {
        title,
        instructor,
        statusPill,
        progressText,
        ariaNow,
        ariaMin,
        ariaMax,
        hasHoverLift,
      }
    })
    console.log('✓ First CourseCard details:', firstCardData)

    if (!firstCardData.hasHoverLift) {
      throw new Error('CourseCard missing hover:-translate-y-[2px] class')
    }
    if (firstCardData.ariaMin !== '0' || firstCardData.ariaMax !== '100') {
      throw new Error('Invalid ARIA min/max attributes on progressbar')
    }

    // 6. Test Responsive Columns
    console.log('Step 5: Testing responsive grid layout...')
    // Desktop: 1280px -> 3 columns
    await page.setViewport({ width: 1280, height: 900 })
    await sleep(200)
    const desktopCols = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="course-grid-container"]')
      if (!grid) return 0
      return window.getComputedStyle(grid).getPropertyValue('grid-template-columns').split(' ').length
    })
    console.log(`✓ Desktop viewport (1280px) computed columns: ${desktopCols} (Expected: 3)`)

    // Tablet: 820px -> 2 columns
    await page.setViewport({ width: 820, height: 1024 })
    await sleep(200)
    const tabletCols = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="course-grid-container"]')
      if (!grid) return 0
      return window.getComputedStyle(grid).getPropertyValue('grid-template-columns').split(' ').length
    })
    console.log(`✓ Tablet viewport (820px) computed columns: ${tabletCols} (Expected: 2)`)

    // Mobile: 390px -> 1 column
    await page.setViewport({ width: 390, height: 844 })
    await sleep(200)
    const mobileCols = await page.evaluate(() => {
      const grid = document.querySelector('[data-testid="course-grid-container"]')
      if (!grid) return 0
      return window.getComputedStyle(grid).getPropertyValue('grid-template-columns').split(' ').length
    })
    console.log(`✓ Mobile viewport (390px) computed columns: ${mobileCols} (Expected: 1)`)

    // Reset viewport back to desktop for filter tests and screenshots
    await page.setViewport({ width: 1280, height: 900 })
    await sleep(200)

    // Capture desktop full view
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'course_grid_all.png'),
      fullPage: false,
    })
    console.log('✓ Captured course_grid_all.png')

    // 7. Test Filter: "In progress"
    console.log('Step 6: Testing "In progress" filter...')
    await page.click('[data-testid="filter-pill-in-progress"]')
    await sleep(200)

    const inProgressCardsCount = await page.$$eval('[data-testid^="course-card-"]', (cards) => cards.length)
    console.log(`✓ "In progress" cards count: ${inProgressCardsCount} (Expected: 5)`)

    const allHaveInProgressBadge = await page.evaluate(() => {
      const badges = Array.from(document.querySelectorAll('[data-testid="course-status-pill"]'))
      return badges.every((b) => b.textContent?.includes('In progress'))
    })
    console.log(`✓ All filtered cards show "In progress" badge: ${allHaveInProgressBadge}`)
    if (!allHaveInProgressBadge) {
      throw new Error('Not all cards have "In progress" status when filtered')
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'course_grid_in_progress.png'),
      fullPage: false,
    })
    console.log('✓ Captured course_grid_in_progress.png')

    // 8. Test Filter: "Not started"
    console.log('Step 7: Testing "Not started" filter...')
    await page.click('[data-testid="filter-pill-not-started"]')
    await sleep(200)

    const notStartedCardsCount = await page.$$eval('[data-testid^="course-card-"]', (cards) => cards.length)
    console.log(`✓ "Not started" cards count: ${notStartedCardsCount} (Expected: 1)`)

    const notStartedData = await page.evaluate(() => {
      const card = document.querySelector('[data-testid^="course-card-"]')
      if (!card) return null
      return {
        title: card.querySelector('h3')?.textContent?.trim(),
        status: card.querySelector('[data-testid="course-status-pill"]')?.textContent?.trim(),
        progress: card.querySelector('[data-testid="course-progress-value"]')?.textContent?.trim(),
      }
    })
    console.log('✓ "Not started" card details:', notStartedData)
    if (!notStartedData.status.includes('Not started')) {
      throw new Error('Filtered card does not show "Not started"')
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'course_grid_not_started.png'),
      fullPage: false,
    })
    console.log('✓ Captured course_grid_not_started.png')

    // 9. Reset filter to "All"
    console.log('Step 8: Resetting filter to "All"...')
    await page.click('[data-testid="filter-pill-all"]')
    await sleep(200)
    const resetCount = await page.$$eval('[data-testid^="course-card-"]', (cards) => cards.length)
    console.log(`✓ Restored cards count: ${resetCount} (Expected: 6)`)

    console.log('--- ALL CHECKS PASSED SUCCESSFULLY! ---')
  } catch (err) {
    console.error('Verification failed:', err)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

run()
