import assert from 'node:assert'
import { courseCatalog, COURSE_CATEGORIES, COURSE_LEVELS } from './src/data/courseCatalog.ts'
import { filterCourses, sortCourses, paginateCourses } from './src/utils/courseFilterUtils.ts'
import { mockEnrolledCourses } from './src/data/studentData.ts'

console.log('--- Running Course Filtering & Catalog Tests ---')

// 1. Total Catalog Count
assert.strictEqual(courseCatalog.length, 30, 'Course catalog must contain exactly 30 courses')
console.log('✓ Catalog has 30 courses')

// 2. Categories
assert.strictEqual(COURSE_CATEGORIES.length, 6, 'There must be 6 categories')
COURSE_CATEGORIES.forEach((cat) => {
  const matches = courseCatalog.filter((c) => c.category === cat)
  assert.ok(matches.length >= 4, `Category ${cat} should have >= 4 courses`)
})
console.log('✓ All 6 categories populated')

// 3. Levels
assert.strictEqual(COURSE_LEVELS.length, 3, 'There must be 3 levels')
COURSE_LEVELS.forEach((lvl) => {
  const matches = courseCatalog.filter((c) => c.level === lvl)
  assert.ok(matches.length >= 6, `Level ${lvl} should have >= 6 courses`)
})
console.log('✓ All 3 levels populated')

// 4. Enrolled courses
const enrolledIds = new Set(mockEnrolledCourses.map((c) => c.id))
assert.strictEqual(enrolledIds.size, 6, 'Must have 6 enrolled courses')
enrolledIds.forEach((id) => {
  const found = courseCatalog.find((c) => c.id === id)
  assert.ok(found, `Enrolled course ID ${id} must exist in catalog`)
})
console.log('✓ All 6 enrolled courses present in catalog')

// 5. Filter tests
// Title search
const searchRes = filterCourses(courseCatalog, { search: 'Distributed Systems' })
assert.strictEqual(searchRes.length, 1)
assert.strictEqual(searchRes[0].id, 'crs_ds_402')

// Instructor search
const instRes = filterCourses(courseCatalog, { search: 'Elena Vance' })
assert.strictEqual(instRes.length, 1)

// Category search
const catSearchRes = filterCourses(courseCatalog, { search: 'Cybersecurity' })
assert.strictEqual(catSearchRes.length, 5)

// Combined category + level
const combinedRes = filterCourses(courseCatalog, {
  categories: ['Artificial Intelligence'],
  level: 'Advanced',
})
assert.ok(combinedRes.length >= 1)
combinedRes.forEach((c) => {
  assert.strictEqual(c.category, 'Artificial Intelligence')
  assert.strictEqual(c.level, 'Advanced')
})
console.log('✓ Filter AND logic verified')

// Pagination test
const paged1 = paginateCourses(courseCatalog, 1, 9)
assert.strictEqual(paged1.courses.length, 9)
assert.strictEqual(paged1.totalPages, 4)
assert.strictEqual(paged1.currentPage, 1)

const paged4 = paginateCourses(courseCatalog, 4, 9)
assert.strictEqual(paged4.courses.length, 3)
assert.strictEqual(paged4.currentPage, 4)
console.log('✓ Pagination (9 per page, 4 pages) verified')

console.log('--- ALL UNIT TESTS COMPLETED SUCCESSFULLY ---')
