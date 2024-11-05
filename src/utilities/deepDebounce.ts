export function debounce<F extends (...args: any[]) => any>(
  fn: F,
  delay: number
): (...args: Parameters<F>) => void {
  let timerId: any = null
  return (...args: Parameters<F>): void => {
    if (timerId) {
      clearTimeout(timerId)
    }
    timerId = setTimeout(() => {
      fn(...args)
      timerId = null
    }, delay)
  }
}
