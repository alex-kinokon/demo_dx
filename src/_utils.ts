export function assertEqual<T>(left: T, right: T) {
  if (left !== right) {
    console.error(`Assertion failed: ${left} !== ${right}`)
  }
}
