import puppeteer from 'puppeteer-core'
import path from 'path'
import fs from 'fs'

const ARTIFACT_DIR = 'C:/Users/zayan/.gemini/antigravity-ide/brain/934ca34d-7f39-4ab3-ad17-635b50373a04'
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE_URL = 'http://localhost:5173'

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function run() {
  console.log('=== STARTING COURSE CATALOG & LISTING VERIFICATION ===')

  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true })
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--window-size=1440,900', '--no-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 900 },
  })

  try {
    const page = await browser.newPage()
    page.on('console', (msg) => {
      if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text())
    })

    // Step 1: Seed session for student user
    console.log('[1] Seeding student authentication session...')
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

    // ==========================================
    // DESKTOP VERIFICATION (1440px x 900px)
    // ==========================================
    console.log('\n--- [2] Desktop 1440px Verification ---')
    await page.setViewport({ width: 1440, height: 900 })
    await page.goto(`${BASE_URL}/student/courses`, { waitUntil: 'networkidle0' })
    await sleep(800)

    // Check header
    const title = await page.$eval('h1', (el) => el.textContent)
    console.log(`Page Title: "${title}"`)
    if (!title.includes('Course Catalog')) {
      throw new Error(`Unexpected page title: ${title}`)
    }

    // Check course cards count on page 1 (should be 9)
    const initialCards = await page.$$('[data-testid^="course-card-"]')
    console.log(`Initial visible course cards: ${initialCards.length} (expected 9)`)
    if (initialCards.length !== 9) {
      throw new Error(`Expected 9 cards on page 1, got ${initialCards.length}`)
    }

    // Check enrolled badge exists on enrolled courses
    const enrolledBadges = await page.$$('[data-testid="enrolled-badge"]')
    console.log(`Enrolled badges found on page 1: ${enrolledBadges.length}`)
    if (enrolledBadges.length === 0) {
      throw new Error('Expected at least one enrolled course card badge')
    }

    // Capture initial desktop catalog view
    const desktopScreenshotPath = path.join(ARTIFACT_DIR, 'desktop_1440_catalog.png')
    await page.screenshot({ path: desktopScreenshotPath, fullPage: false })
    console.log(`Saved screenshot: ${desktopScreenshotPath}`)

    // Test Search debouncing: search for "quantum"
    console.log('\n[3] Testing debounced search for "quantum"...')
    const searchInput = await page.$('input[aria-label="Search courses"]')
    await searchInput.type('quantum')
    await sleep(600) // Wait for 300ms debounce + render

    const searchUrl = page.url()
    console.log(`Current URL after search: ${searchUrl}`)
    if (!searchUrl.includes('search=quantum') && !searchUrl.includes('q=quantum')) {
      throw new Error(`URL should include search=quantum or q=quantum, got ${searchUrl}`)
    }

    const filteredCards = await page.$$('[data-testid^="course-card-"]')
    console.log(`Filtered cards for "quantum": ${filteredCards.length} (expected 1)`)

    // Verify Active Filter chip appeared
    const searchChip = await page.$('[data-testid="filter-chip-search"]')
    if (!searchChip) {
      throw new Error('Search filter chip not found')
    }
    console.log('Search filter chip verified!')

    // Test "Clear all"
    console.log('\n[4] Testing "Clear all" button...')
    const clearAllBtn = await page.$('[data-testid="clear-all-filters-btn"]')
    await clearAllBtn.click()
    await sleep(600)

    const resetCards = await page.$$('[data-testid^="course-card-"]')
    console.log(`Cards after Clear all: ${resetCards.length} (expected 9)`)

    // Test Level Filter: click "Beginner"
    console.log('\n[5] Testing Level filter pill "Beginner"...')
    const beginnerBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      return btns.find((b) => b.textContent.trim() === 'Beginner')
    })
    if (beginnerBtn) {
      await beginnerBtn.click()
      await sleep(600)
    }

    const beginnerUrl = page.url()
    console.log(`URL after selecting Beginner: ${beginnerUrl}`)
    const beginnerCards = await page.$$('[data-testid^="course-card-"]')
    console.log(`Visible Beginner courses: ${beginnerCards.length}`)

    const desktopFilteredPath = path.join(ARTIFACT_DIR, 'desktop_1440_filtered.png')
    await page.screenshot({ path: desktopFilteredPath, fullPage: false })
    console.log(`Saved screenshot: ${desktopFilteredPath}`)

    // Reset filters
    const resetBtn = await page.$('[data-testid="clear-all-filters-btn"]')
    if (resetBtn) await resetBtn.click()
    await sleep(600)

    // Test Pagination: click Page 2
    console.log('\n[6] Testing Numbered Pagination (Page 2)...')
    const page2Btn = await page.$('button[aria-label="Page 2"]')
    if (page2Btn) {
      await page2Btn.click()
      await sleep(600)
      const page2Url = page.url()
      console.log(`URL on page 2: ${page2Url}`)
      if (!page2Url.includes('page=2')) {
        throw new Error(`Expected page=2 in URL, got ${page2Url}`)
      }
    }

    // Reset to Page 1
    const page1Btn = await page.$('button[aria-label="Page 1"]')
    if (page1Btn) await page1Btn.click()
    await sleep(600)

    // Test Empty State: search for non-matching keyword
    console.log('\n[7] Testing Empty State...')
    const searchField = await page.$('input[aria-label="Search courses"]')
    await searchField.click({ clickCount: 3 })
    await searchField.type('nonexistentkeywordxyz')
    await sleep(600)

    const emptyState = await page.$('[data-testid="course-catalog-empty-state"]')
    if (!emptyState) {
      throw new Error('Course catalog empty state not displayed for non-existent keyword')
    }
    console.log('Empty state verified!')

    const desktopEmptyPath = path.join(ARTIFACT_DIR, 'desktop_1440_empty_state.png')
    await page.screenshot({ path: desktopEmptyPath, fullPage: false })
    console.log(`Saved screenshot: ${desktopEmptyPath}`)

    // Clear from empty state CTA
    const emptyClearBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      return btns.find((b) => b.textContent.includes('Clear all filters'))
    })
    if (emptyClearBtn) {
      await emptyClearBtn.click()
      await sleep(600)
    }

    // ==========================================
    // TABLET VERIFICATION (768px x 1024px)
    // ==========================================
    console.log('\n--- [8] Tablet 768px Verification ---')
    await page.setViewport({ width: 768, height: 1024 })
    await sleep(600)

    const tabletCards = await page.$$('[data-testid^="course-card-"]')
    console.log(`Tablet visible cards: ${tabletCards.length}`)

    const tabletScreenshotPath = path.join(ARTIFACT_DIR, 'tablet_768_catalog.png')
    await page.screenshot({ path: tabletScreenshotPath, fullPage: false })
    console.log(`Saved screenshot: ${tabletScreenshotPath}`)

    // ==========================================
    // MOBILE VERIFICATION (390px x 844px)
    // ==========================================
    console.log('\n--- [9] Mobile 390px Verification ---')
    await page.setViewport({ width: 390, height: 844 })
    await sleep(600)

    // Verify Mobile Filter button is visible
    const mobileFiltersBtn = await page.$('button[aria-label="Open filter panel"]')
    if (!mobileFiltersBtn) {
      throw new Error('Mobile filter button not found')
    }
    console.log('Mobile "Filters" trigger button is visible')

    // Capture initial mobile catalog
    const mobileCatalogPath = path.join(ARTIFACT_DIR, 'mobile_390_catalog.png')
    await page.screenshot({ path: mobileCatalogPath, fullPage: false })
    console.log(`Saved screenshot: ${mobileCatalogPath}`)

    // Open Mobile Slide-up Sheet
    console.log('Opening mobile slide-up sheet...')
    await mobileFiltersBtn.click()
    await sleep(500)

    const filterDialog = await page.$('div[role="dialog"][aria-label="Filter Courses Sheet"]')
    if (!filterDialog) {
      throw new Error('Mobile slide-up sheet dialog did not open')
    }
    console.log('Mobile slide-up sheet opened successfully!')

    // Capture open slide-up sheet
    const mobileSheetPath = path.join(ARTIFACT_DIR, 'mobile_390_filter_sheet.png')
    await page.screenshot({ path: mobileSheetPath, fullPage: false })
    console.log(`Saved screenshot: ${mobileSheetPath}`)

    // In sheet, toggle category "Artificial Intelligence"
    await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('label'))
      const aiLabel = labels.find((l) => l.textContent.includes('Artificial Intelligence'))
      if (aiLabel) {
        aiLabel.scrollIntoView()
        aiLabel.click()
      }
    })
    await sleep(400)

    // Click Apply button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      const applyBtn = btns.find((b) => b.textContent.includes('Show'))
      if (applyBtn) {
        applyBtn.click()
      }
    })
    await sleep(600)

    const mobileFilteredCards = await page.$$('[data-testid^="course-card-"]')
    console.log(`Mobile cards filtered for AI: ${mobileFilteredCards.length}`)

    const mobileFilteredPath = path.join(ARTIFACT_DIR, 'mobile_390_filtered.png')
    await page.screenshot({ path: mobileFilteredPath, fullPage: false })
    console.log(`Saved screenshot: ${mobileFilteredPath}`)

    // Verify Navigation: Sidebar / Bottom Tab bar has Courses active
    const activeBottomTab = await page.$eval('nav[aria-label="Mobile Bottom Navigation Bar"] button[aria-current="page"]', (el) => el.textContent)
    console.log(`Mobile active bottom tab: "${activeBottomTab.trim()}"`)
    if (!activeBottomTab.includes('Courses')) {
      throw new Error(`Expected active bottom tab to be Courses, got ${activeBottomTab}`)
    }

    console.log('\n=== ALL VERIFICATION CHECKS COMPLETED SUCCESSFULLY! ===')
  } catch (err) {
    console.error('VERIFICATION FAILED:', err)
    process.exitCode = 1
  } finally {
    await browser.close()
  }
}

run()
