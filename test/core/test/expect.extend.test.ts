import { expect, test } from 'vitest'
import { toBeOrNotToBe } from './utils/expect.to-be'
import { toBeSquareOf } from './utils/expect.square-of'

test('expect.extend works', () => {
  expect.extend({
    toBeOrNotToBe,
  })

  expect('To be, or not to be').toBeOrNotToBe()
  expect(1).not.toBeOrNotToBe()

  // @ts-expect-error Checking for type parameters
  expect(1).not.toBeOrNotToBe(1)
  // @ts-expect-error Checking for wrong parameters
  expect('To be, or not to be').toBeOrNotToBe('Test')
})

test('expect.extend works', () => {
  expect.extend({
    toBeSquareOf,
  })

  expect(1).toBeSquareOf(1)
  expect(4).toBeSquareOf(2)

  // @ts-expect-error Checking for type of parameters
  expect('string').not.toBeSquareOf('Test')
  // @ts-expect-error Checking for missing parameters
  expect(1).not.toBeSquareOf()
})
