export const toBeOrNotToBe = (received: string) => {
  return {
    message: () => 'String should be: "To be, or not to be"',
    pass: received === 'To be, or not to be',
  }
}
