/**
 * Page numbers to show: at most `size` consecutive pages around the current one,
 * e.g. page 7 of 20 → [5, 6, 7, 8, 9]. Arrows lead to the pages outside the window.
 */
export function pageWindow(page: number, totalPages: number, size = 5): number[] {
  if (totalPages <= 0) return []
  const count = Math.min(size, totalPages)
  const current = Math.min(Math.max(1, page), totalPages)
  const start = Math.min(Math.max(1, current - Math.floor(count / 2)), totalPages - count + 1)
  return Array.from({ length: count }, (_, index) => start + index)
}
