import { assert, describe, expect, it, beforeEach } from 'vitest'

// context
describe('suite name', (context) => {
	context.foo = 'bar';
	describe('suite name', (context) => {

		beforeEach((context) => {
		context.foo = 'bar';
		})
		it('foo', ({foo}) => {
			expect(foo).toBe('bar')
		})


	})
	it('bar', ({foo}) => {
		expect(1 + 1).eq(2)
		expect(foo).toBe()
	})
})

