import test, { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  getCourseLessons,
  findLesson,
  getNextLesson,
  getPreviousLesson,
  getFirstUnfinishedLesson,
  slugify,
} from '../src/utils/lessonHelper'

describe('Lesson Helper & Progression Utilities', () => {
  it('extracts flattened structured lessons from catalog syllabus', () => {
    const lessons = getCourseLessons('crs_ds_402')
    assert.ok(lessons.length > 0, 'Course should have lessons')
    const first = lessons[0]
    assert.strictEqual(first.courseId, 'crs_ds_402')
    assert.strictEqual(first.order, 1)
    assert.ok(first.title.length > 0)
    assert.ok(first.duration.includes('mins'))
    assert.ok(first.resources.length > 0)
  })

  it('resolves lessons by ID, alias, slug, and index', () => {
    const lessons = getCourseLessons('crs_ds_402')
    const l1 = lessons[0]

    // 1. By ID
    const foundById = findLesson('crs_ds_402', l1.id)
    assert.strictEqual(foundById?.id, l1.id)

    // 2. By slug
    const slug = slugify(l1.title)
    const foundBySlug = findLesson('crs_ds_402', slug)
    assert.strictEqual(foundBySlug?.id, l1.id)

    // 3. By numeric index string
    const foundByIndex = findLesson('crs_ds_402', '1')
    assert.strictEqual(foundByIndex?.id, l1.id)

    // 4. By alias from mockRecentLessons
    const foundByAlias = findLesson('crs_ds_402', 'lsn_01')
    assert.ok(foundByAlias !== null)
    assert.strictEqual(foundByAlias?.title, 'Raft Consensus Algorithm & Leader Election')

    // 5. Invalid lesson returns null
    const notFound = findLesson('crs_ds_402', 'nonexistent_lesson_xyz')
    assert.strictEqual(notFound, null)
  })

  it('traverses Next and Previous across module boundaries seamlessly', () => {
    const lessons = getCourseLessons('crs_ds_402')
    assert.ok(lessons.length >= 5)

    // First lesson has no previous
    const prevFirst = getPreviousLesson('crs_ds_402', lessons[0].id)
    assert.strictEqual(prevFirst, null)

    // First lesson next is second lesson
    const nextFirst = getNextLesson('crs_ds_402', lessons[0].id)
    assert.strictEqual(nextFirst?.id, lessons[1].id)

    // Last lesson has no next
    const lastLesson = lessons[lessons.length - 1]
    const nextLast = getNextLesson('crs_ds_402', lastLesson.id)
    assert.strictEqual(nextLast, null)

    // Traverse between modules
    // Find index where moduleNumber changes
    let boundaryIndex = -1
    for (let i = 0; i < lessons.length - 1; i++) {
      if (lessons[i].moduleNumber !== lessons[i + 1].moduleNumber) {
        boundaryIndex = i
        break
      }
    }
    assert.ok(boundaryIndex >= 0, 'Must have at least two modules')

    const lessonBeforeBoundary = lessons[boundaryIndex]
    const lessonAfterBoundary = lessons[boundaryIndex + 1]

    const crossedNext = getNextLesson('crs_ds_402', lessonBeforeBoundary.id)
    assert.strictEqual(crossedNext?.id, lessonAfterBoundary.id)

    const crossedPrev = getPreviousLesson('crs_ds_402', lessonAfterBoundary.id)
    assert.strictEqual(crossedPrev?.id, lessonBeforeBoundary.id)
  })

  it('identifies the first unfinished lesson accurately', () => {
    const lessons = getCourseLessons('crs_ds_402')
    const completedSet = new Set([lessons[0].id, lessons[1].id])

    const nextUnfinished = getFirstUnfinishedLesson('crs_ds_402', completedSet)
    assert.strictEqual(nextUnfinished?.id, lessons[2].id)

    // When none are completed, returns lesson 0
    const firstWhenEmpty = getFirstUnfinishedLesson('crs_ds_402', new Set())
    assert.strictEqual(firstWhenEmpty?.id, lessons[0].id)
  })
})
