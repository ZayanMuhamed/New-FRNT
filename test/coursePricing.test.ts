import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  isCourseFree,
  getCoursePrice,
  formatRupees,
  getCoursePricingDetails,
  FREE_COURSE_IDS,
} from '../src/utils/coursePricing'
import { courseCatalog } from '../src/data/courseCatalog'

describe('Course Pricing & Free Course Handling', () => {
  test('correctly identifies designated free courses', () => {
    for (const freeId of FREE_COURSE_IDS) {
      assert.equal(isCourseFree(freeId), true, `Course ${freeId} should be free`)
      assert.equal(getCoursePrice(freeId), 0, `Free course ${freeId} should have price 0`)
      assert.equal(formatRupees(getCoursePrice(freeId)), 'Free')
    }
  })

  test('correctly prices paid courses by level', () => {
    // Pick an advanced paid course (e.g. crs_ds_402)
    const dsPrice = getCoursePrice('crs_ds_402')
    assert.equal(dsPrice, 3499, 'Advanced courses should be priced at ₹3,499')
    assert.match(formatRupees(dsPrice), /3,499/)

    // Pick an intermediate course
    const osCourse = courseCatalog.find((c) => c.level === 'Intermediate' && !isCourseFree(c.id))
    assert.ok(osCourse)
    assert.equal(getCoursePrice(osCourse.id), 2499)
    assert.match(formatRupees(2499), /2,499/)

    // Pick a beginner paid course
    const begCourse = courseCatalog.find((c) => c.level === 'Beginner' && !isCourseFree(c.id))
    assert.ok(begCourse)
    assert.equal(getCoursePrice(begCourse.id), 1499)
    assert.match(formatRupees(1499), /1,499/)
  })

  test('getCoursePricingDetails returns formatted subtotal, tax and total', () => {
    const course = courseCatalog.find((c) => c.id === 'crs_ai_450')
    assert.ok(course)
    const details = getCoursePricingDetails(course)

    assert.equal(details.isFree, false)
    assert.equal(details.total, 3499)
    assert.match(details.formattedTotal, /3,499/)
    assert.match(details.formattedTax, /Included/)
  })

  test('handles null/undefined gracefully', () => {
    const details = getCoursePricingDetails(null)
    assert.equal(details.isFree, true)
    assert.equal(details.price, 0)
    assert.equal(details.total, 0)
  })
})
