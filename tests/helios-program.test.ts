// basic.spec.ts
// organizing tests
// https://vitest.dev/api/#test
// it is alias for test

import { describe, expect, it, vi } from 'vitest'

const person = {
  isActive: true,
  age: 32,
}

describe('state of the ledger', () => {
  it('checks if ', () => {
    expect(person).toBeDefined()
  })

  it('checks validatorAddress', () => {
    expect(person.isActive).toBeTruthy()
  })

  it('is active', () => {
    expect(person.isActive).toBeTruthy()
  })

  it('age limit', () => {
    expect(person.age).toBeLessThanOrEqual(32)
  })
})
