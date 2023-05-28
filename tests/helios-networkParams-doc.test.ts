import { describe, expect, it, expectTypeOf, beforeEach, vi } from 'vitest'
import { promises as fs } from 'fs';
import {
  Address,
  Program, 
} from "@hyperionbt/helios";

describe("a uplc instance is created from source code", async () => {

	// https://vitest.dev/guide/test-context.html
	beforeEach(async (context) => { 
		let optimize = false;

		const script = await fs.readFile('./src/vesting.js', 'utf8'); 
		const program = Program.new(script); 
		const compiledProgram = program.compile(optimize); 
		const validatorHash = compiledProgram.validatorHash;
		// https://www.hyperion-bt.org/helios-book/lang/builtins/address.html#address
		const validatorAddress = Address.fromValidatorHash(validatorHash); 
	 
		context.validatorHash = validatorHash;
		context.validatorAddress = Address.fromValidatorHash(validatorHash); 
		context.programName = program.name;

	})

	it ("checks methods", async ({programName}) => {
	// https://www.hyperion-bt.org/helios-book/api/reference/program.html	
	  expect(programName).toBe('vesting')
	})
	it ("checks Properties", async ({validatorHash}) => {
	//https://www.hyperion-bt.org/helios-book/api/reference/validatorhash.html
	  expect(validatorHash.hex.length).toBe(56);
	})
	it ("documents API usage", async ({validatorAddress}) => {
// https://github.com/lley154/helios-examples/blob/704cf0a92cfe252b63ffb9fd36c92ffafc1d91f6/vesting/pages/index.tsx#LL370C43-L370C43
	  expectTypeOf(validatorAddress.toBech32).toMatchTypeOf("string")
	})
})
