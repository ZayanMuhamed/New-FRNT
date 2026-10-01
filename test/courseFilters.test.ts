import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import {
  courseCatalog,
  COURSE_CATEGORIES,
  COURSE_LEVELS,
} from '../src/data/courseCatalog'
import { mockEnrolledCourses } from '../src/data/studentData'
import {
  filterCourses,
  sortCourses,
  paginateCourses,
  filterAndPaginateCourses,
  parseCourseFilterParams,
  serializeCourseFilterParams,
} from '../src/utils/courseFilterUtils'
import { CourseFilterState } from '../src/types/course'

describe('Course Catalog Dataset Verification', () => {
  test('contains exactly 30 mock courses', () => {
    assert.equal(courseCatalog.length, 30)
  })

  test('covers all 6 expected categories with exactly 5 courses each', () => {
    assert.equal(COURSE_CATEGORIES.length, 6)

    const categoryCounts: Record<string, number> = {}
    for (const course of courseCatalog) {
      categoryCounts[course.category] = (categoryCounts[course.category] || 0) + 1
      assert.ok(
        (COURSE_CATEGORIES as readonly string[]).includes(course.category),
        `Unexpected category: ${course.category}`
      )
    }

    for (const cat of COURSE_CATEGORIES) {
      assert.equal(categoryCounts[cat], 5, `Category ${cat} should have 5 courses`)
    }
  })

  test('covers all 3 levels evenly (10 Beginner, 10 Intermediate, 10 Advanced)', () => {
    const levelCounts: Record<string, number> = {
      Beginner: 0,
      Intermediate: 0,
      Advanced: 0,
    }

    for (const course of courseCatalog) {
      assert.ok(
        (COURSE_LEVELS as readonly string[]).includes(course.level),
        `Invalid level: ${course.level}`
      )
      levelCounts[course.level]++
    }

    assert.equal(levelCounts.Beginner, 10)
    assert.equal(levelCounts.Intermediate, 10)
    assert.equal(levelCounts.Advanced, 10)
  })

  test('reuses all enrolled course IDs from studentData.ts', () => {
    const enrolledIds = mockEnrolledCourses.map((c) => c.id)
    assert.equal(enrolledIds.length, 6)

    const catalogIds = new Set(courseCatalog.map((c) => c.id))
    for (const id of enrolledIds) {
      assert.ok(catalogIds.has(id), `Enrolled course id ${id} missing from catalog`)
    }
  })

  test('every course satisfies full schema requirements', () => {
    for (const course of courseCatalog) {
      assert.ok(course.id && course.id.trim().length > 0, 'Course missing id')
      assert.ok(course.title && course.title.trim().length > 0, 'Course missing title')
      assert.ok(course.instructor && course.instructor.trim().length > 0, 'Course missing instructor')
      assert.ok(course.category && course.category.trim().length > 0, 'Course missing category')
      assert.ok(course.duration && course.duration.trim().length > 0, 'Course missing duration')
      assert.ok(course.rating >= 1 && course.rating <= 5, 'Course rating out of range')
      assert.ok(course.lessonCount > 0, 'Course lesson count must be > 0')
      assert.ok(course.description && course.description.trim().length > 20, 'Course description too short')
      assert.ok(Array.isArray(course.learningPoints) && course.learningPoints.length >= 3, 'Course learningPoints must have >= 3 items')
      assert.ok(Array.isArray(course.syllabus) && course.syllabus.length >= 2, 'Course syllabus must have >= 2 modules')

      for (const mod of course.syllabus) {
        assert.ok(mod.id, `Syllabus module in ${course.id} missing id`)
        assert.ok(mod.module > 0, `Syllabus module in ${course.id} missing module number`)
        assert.ok(mod.title, `Syllabus module in ${course.id} missing title`)
        assert.ok(Array.isArray(mod.lessons) && mod.lessons.length > 0, `Syllabus module in ${course.id} missing lessons`)
      }
    }
  })
})

describe('Course Filtering Logic (AND-logic)', () => {
  test('search matches title case-insensitively', () => {
    const results = filterCourses(courseCatalog, { search: 'distributed systems' })
    assert.ok(results.length >= 1)
    assert.ok(results.some((c) => c.id === 'crs_ds_402'))
  })

  test('search matches instructor case-insensitively', () => {
    const results = filterCourses(courseCatalog, { search: 'elena vance' })
    assert.equal(results.length, 1)
    assert.equal(results[0].instructor, 'Dr. Elena Vance')
  })

  test('search matches category case-insensitively', () => {
    const results = filterCourses(courseCatalog, { search: 'cybersecurity' })
    assert.equal(results.length, 5)
    for (const c of results) {
      assert.equal(c.category, 'Cybersecurity')
    }
  })

  test('search with whitespace is properly trimmed', () => {
    const results = filterCourses(courseCatalog, { search: '   quantum   ' })
    assert.ok(results.length >= 1)
    assert.ok(results.some((c) => c.id === 'crs_qc_310'))
  })

  test('search with nonexistent keyword returns empty list', () => {
    const results = filterCourses(courseCatalog, { search: 'nonexistent-query-xyz-123' })
    assert.equal(results.length, 0)
  })

  test('category filter with single category returns only courses from that category', () => {
    const results = filterCourses(courseCatalog, { categories: ['Artificial Intelligence'] })
    assert.equal(results.length, 5)
    for (const c of results) {
      assert.equal(c.category, 'Artificial Intelligence')
    }
  })

  test('category filter with multiple categories returns union of those categories', () => {
    const results = filterCourses(courseCatalog, {
      categories: ['Core Systems', 'Emerging Tech'],
    })
    assert.equal(results.length, 10)
    for (const c of results) {
      assert.ok(c.category === 'Core Systems' || c.category === 'Emerging Tech')
    }
  })

  test('level filter filters specifically by Beginner, Intermediate, or Advanced', () => {
    const beginners = filterCourses(courseCatalog, { level: 'Beginner' })
    assert.equal(beginners.length, 10)
    for (const c of beginners) {
      assert.equal(c.level, 'Beginner')
    }

    const intermediates = filterCourses(courseCatalog, { level: 'Intermediate' })
    assert.equal(intermediates.length, 10)
    for (const c of intermediates) {
      assert.equal(c.level, 'Intermediate')
    }

    const advanceds = filterCourses(courseCatalog, { level: 'Advanced' })
    assert.equal(advanceds.length, 10)
    for (const c of advanceds) {
      assert.equal(c.level, 'Advanced')
    }

    const all = filterCourses(courseCatalog, { level: 'All' })
    assert.equal(all.length, 30)
  })

  test('AND logic combines search, categories, and level simultaneously', () => {
    // Search "learning" in "Artificial Intelligence" category with "Advanced" level
    const results = filterCourses(courseCatalog, {
      search: 'learning',
      categories: ['Artificial Intelligence'],
      level: 'Advanced',
    })

    assert.equal(results.length, 1)
    assert.equal(results[0].id, 'crs_ml_481')
    assert.equal(results[0].title, 'Advanced Machine Learning & Neural Networks')
  })

  test('AND logic returns empty when any filter condition does not match', () => {
    // Search "Elena Vance" (who teaches Core Systems) but filter category to "Artificial Intelligence"
    const results = filterCourses(courseCatalog, {
      search: 'Elena Vance',
      categories: ['Artificial Intelligence'],
    })
    assert.equal(results.length, 0)
  })
})

describe('Course Sorting Logic', () => {
  test('rating-desc sorts from highest to lowest rating', () => {
    const sorted = sortCourses(courseCatalog, 'rating-desc')
    for (let i = 0; i < sorted.length - 1; i++) {
      assert.ok(
        sorted[i].rating >= sorted[i + 1].rating,
        `Rating out of order: ${sorted[i].rating} < ${sorted[i + 1].rating}`
      )
    }
  })

  test('title-asc sorts alphabetically from A to Z', () => {
    const sorted = sortCourses(courseCatalog, 'title-asc')
    for (let i = 0; i < sorted.length - 1; i++) {
      assert.ok(
        sorted[i].title.localeCompare(sorted[i + 1].title) <= 0,
        `Title out of order: "${sorted[i].title}" should come before "${sorted[i + 1].title}"`
      )
    }
  })

  test('lessons-desc sorts by lessonCount descending', () => {
    const sorted = sortCourses(courseCatalog, 'lessons-desc')
    for (let i = 0; i < sorted.length - 1; i++) {
      assert.ok(
        sorted[i].lessonCount >= sorted[i + 1].lessonCount,
        `Lesson count out of order: ${sorted[i].lessonCount} < ${sorted[i + 1].lessonCount}`
      )
    }
  })

  test('popular preserves original catalog ordering', () => {
    const sorted = sortCourses(courseCatalog, 'popular')
    assert.deepEqual(
      sorted.map((c) => c.id),
      courseCatalog.map((c) => c.id)
    )
  })
})

describe('Pagination Logic', () => {
  test('paginates 30 courses into 4 pages of size 9 (9, 9, 9, 3)', () => {
    const p1 = paginateCourses(courseCatalog, 1, 9)
    assert.equal(p1.totalCount, 30)
    assert.equal(p1.totalPages, 4)
    assert.equal(p1.currentPage, 1)
    assert.equal(p1.courses.length, 9)
    assert.equal(p1.courses[0].id, courseCatalog[0].id)
    assert.equal(p1.courses[8].id, courseCatalog[8].id)

    const p2 = paginateCourses(courseCatalog, 2, 9)
    assert.equal(p2.currentPage, 2)
    assert.equal(p2.courses.length, 9)
    assert.equal(p2.courses[0].id, courseCatalog[9].id)
    assert.equal(p2.courses[8].id, courseCatalog[17].id)

    const p3 = paginateCourses(courseCatalog, 3, 9)
    assert.equal(p3.currentPage, 3)
    assert.equal(p3.courses.length, 9)
    assert.equal(p3.courses[0].id, courseCatalog[18].id)

    const p4 = paginateCourses(courseCatalog, 4, 9)
    assert.equal(p4.currentPage, 4)
    assert.equal(p4.courses.length, 3)
    assert.equal(p4.courses[2].id, courseCatalog[29].id)
  })

  test('clamps out-of-range page numbers gracefully', () => {
    const clampedHigh = paginateCourses(courseCatalog, 999, 9)
    assert.equal(clampedHigh.currentPage, 4)
    assert.equal(clampedHigh.courses.length, 3)

    const clampedLow = paginateCourses(courseCatalog, 0, 9)
    assert.equal(clampedLow.currentPage, 1)
    assert.equal(clampedLow.courses.length, 9)
  })

  test('handles empty dataset pagination gracefully', () => {
    const emptyResult = paginateCourses([], 1, 9)
    assert.equal(emptyResult.totalCount, 0)
    assert.equal(emptyResult.totalPages, 1)
    assert.equal(emptyResult.currentPage, 1)
    assert.equal(emptyResult.courses.length, 0)
  })

  test('filterAndPaginateCourses runs the complete pipeline', () => {
    const result = filterAndPaginateCourses(courseCatalog, {
      search: 'architecture',
      page: 1,
      pageSize: 9,
    })

    assert.ok(result.totalCount >= 1)
    assert.ok(result.courses.length <= 9)
    for (const c of result.courses) {
      const match =
        c.title.toLowerCase().includes('architecture') ||
        c.instructor.toLowerCase().includes('architecture') ||
        c.category.toLowerCase().includes('architecture')
      assert.ok(match)
    }
  })
})

describe('URL Parameter Parsing and Serialization', () => {
  test('parses query string into CourseFilterState', () => {
    const params = new URLSearchParams(
      'search=quantum&categories=Emerging+Tech,Core+Systems&level=Beginner&sort=rating-desc&page=2'
    )
    const state = parseCourseFilterParams(params)

    assert.equal(state.search, 'quantum')
    assert.deepEqual(state.categories, ['Emerging Tech', 'Core Systems'])
    assert.equal(state.level, 'Beginner')
    assert.equal(state.sort, 'rating-desc')
    assert.equal(state.page, 2)
  })

  test('parses repeated category parameters into single array', () => {
    const params = new URLSearchParams()
    params.append('category', 'Core Systems')
    params.append('category', 'Cybersecurity')

    const state = parseCourseFilterParams(params)
    assert.deepEqual(state.categories, ['Core Systems', 'Cybersecurity'])
  })

  test('falls back to default filter values when parameters are missing or invalid', () => {
    const params = new URLSearchParams('level=InvalidLevel&sort=invalid-sort&page=-5')
    const state = parseCourseFilterParams(params)

    assert.equal(state.search, '')
    assert.deepEqual(state.categories, [])
    assert.equal(state.level, 'All')
    assert.equal(state.sort, 'popular')
    assert.equal(state.page, 1)
  })

  test('serializes CourseFilterState to clean URLSearchParams without defaults', () => {
    const defaultState: CourseFilterState = {
      search: '',
      categories: [],
      level: 'All',
      sort: 'popular',
      page: 1,
    }
    const defaultParams = serializeCourseFilterParams(defaultState)
    assert.equal(defaultParams.toString(), '')

    const customState: CourseFilterState = {
      search: 'distributed',
      categories: ['Core Systems', 'Data Architecture'],
      level: 'Advanced',
      sort: 'rating-desc',
      page: 3,
    }
    const customParams = serializeCourseFilterParams(customState)
    assert.equal(customParams.get('search'), 'distributed')
    assert.equal(customParams.get('categories'), 'Core Systems,Data Architecture')
    assert.equal(customParams.get('level'), 'Advanced')
    assert.equal(customParams.get('sort'), 'rating-desc')
    assert.equal(customParams.get('page'), '3')
  })

  test('roundtrip serialization and deserialization produces identical state', () => {
    const originalState: CourseFilterState = {
      search: 'systems',
      categories: ['Core Systems'],
      level: 'Advanced',
      sort: 'lessons-desc',
      page: 2,
    }
    const serialized = serializeCourseFilterParams(originalState)
    const deserialized = parseCourseFilterParams(serialized)

    assert.deepEqual(deserialized, originalState)
  })
})
