import { courseCatalog } from '../data/courseCatalog'
import { CatalogCourse } from '../types/course'

// Designate explicit free courses for testing and catalog variety
export const FREE_COURSE_IDS = new Set<string>([
  'crs_math_220', // Discrete Mathematical Structures
  'crs_fnd_110',  // Algorithmic Complexity & Computability Theory
  'crs_sec_201',  // Security Foundations & Defensive Architecture
])

// Base price map according to course difficulty level
const LEVEL_PRICE_MAP: Record<string, number> = {
  Beginner: 1499,
  Intermediate: 2499,
  Advanced: 3499,
}

/**
 * Check if a course is free of charge
 */
export function isCourseFree(courseId: string): boolean {
  if (FREE_COURSE_IDS.has(courseId)) {
    return true
  }
  const course = courseCatalog.find((c) => c.id === courseId)
  if (!course) return false
  return FREE_COURSE_IDS.has(course.id)
}

/**
 * Get the price of a course in Indian Rupees (INR)
 */
export function getCoursePrice(courseId: string): number {
  if (isCourseFree(courseId)) {
    return 0
  }

  const course = courseCatalog.find((c) => c.id === courseId)
  if (!course) {
    return 2499 // sensible default
  }

  return LEVEL_PRICE_MAP[course.level] || 2499
}

/**
 * Format an integer or float amount into standard Indian Rupee notation (e.g., ₹2,499)
 */
export function formatRupees(amount: number): string {
  if (amount === 0) {
    return 'Free'
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export interface CoursePricingDetails {
  price: number
  formattedPrice: string
  isFree: boolean
  originalPrice: number
  formattedOriginalPrice: string
  tax: number
  formattedTax: string
  total: number
  formattedTotal: string
}

/**
 * Calculate comprehensive breakdown including subtotal, tax and total
 */
export function getCoursePricingDetails(course: CatalogCourse | null | undefined): CoursePricingDetails {
  if (!course) {
    return {
      price: 0,
      formattedPrice: '₹0',
      isFree: true,
      originalPrice: 0,
      formattedOriginalPrice: '₹0',
      tax: 0,
      formattedTax: '₹0',
      total: 0,
      formattedTotal: '₹0',
    }
  }

  const isFree = isCourseFree(course.id)
  const price = isFree ? 0 : getCoursePrice(course.id)
  // Show a mock discount anchor (original price ~25% higher)
  const originalPrice = isFree ? 0 : Math.round((price * 1.25) / 100) * 100
  const tax = 0 // Included in price
  const total = price

  return {
    price,
    formattedPrice: formatRupees(price),
    isFree,
    originalPrice,
    formattedOriginalPrice: formatRupees(originalPrice),
    tax,
    formattedTax: '₹0 (Included)',
    total,
    formattedTotal: formatRupees(total),
  }
}
