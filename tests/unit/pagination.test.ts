import { describe, expect, it } from 'vitest'

import { pageWindow } from '@/lib/pagination'

describe('pageWindow', () => {
  it('shows all pages when there are few', () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3])
  })
  it('keeps the current page in the middle', () => {
    expect(pageWindow(7, 20)).toEqual([5, 6, 7, 8, 9])
  })
  it('stays inside the range at the start and the end', () => {
    expect(pageWindow(1, 20)).toEqual([1, 2, 3, 4, 5])
    expect(pageWindow(2, 20)).toEqual([1, 2, 3, 4, 5])
    expect(pageWindow(20, 20)).toEqual([16, 17, 18, 19, 20])
    expect(pageWindow(99, 20)).toEqual([16, 17, 18, 19, 20])
  })
  it('returns nothing without pages', () => {
    expect(pageWindow(1, 0)).toEqual([])
  })
})
