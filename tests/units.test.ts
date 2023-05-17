import { assert, expect, test, expectTypeOf } from 'vitest'
import { promises as fs } from 'fs';

test('fs', async () => {

	const script = await fs.readFile('./src/owner-only.hl', 'utf8'); 

	expectTypeOf(script).toEqualTypeOf('string')
	expect(script.length).toBe(174)
})
