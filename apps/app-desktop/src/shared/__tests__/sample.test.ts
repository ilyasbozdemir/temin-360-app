import { describe, it, expect } from 'vitest'

/**
 * Sample mathematical addition function for testing.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function add(a: number, b: number): number {
  return a + b
}

describe('Sample Unit Test Suite', () => {
  it('should correctly add two numbers', () => {
    expect(add(2, 3)).toBe(5)
  })

  it('should handle negative numbers', () => {
    expect(add(-1, 1)).toBe(0)
  })
})
