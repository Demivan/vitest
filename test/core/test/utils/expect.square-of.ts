export const toBeSquareOf = (received: number, expect: number) => {
  return {
    message: () => `${received} is not a square of ${expect}`,
    pass: received === expect * expect,
  }
}

declare global {
  namespace Vi {
    interface Assertion {
      toBeSquareOf: ExpectExtend<typeof toBeSquareOf>
    }
  }
}
