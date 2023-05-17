import { describe, expect, it, expectTypeOf, vi } from 'vitest'
import { promises as fs } from 'fs';
import {
  Address,
  Program, 
} from "@hyperionbt/helios";

describe("provide a uplc, an instance of a plutus script",async () => {


	let optimize = false;

	const script = await fs.readFile('./src/owner-only.hl', 'utf8'); 
	const program = Program.new(script); 
	const compiledProgram = program.compile(optimize); 
	const validatorHash = compiledProgram.validatorHash;
	// https://www.hyperion-bt.org/helios-book/lang/builtins/address.html#address
	const validatorAddress = Address.fromValidatorHash(validatorHash); 

	it ("checks methods", async () => {
	// https://www.hyperion-bt.org/helios-book/api/reference/program.html	
	  expect(program.name).toBe('owner_only')
	})
	it ("checks Properties", async () => {
	//https://www.hyperion-bt.org/helios-book/api/reference/validatorhash.html
	  expect(validatorHash.hex.length).toBe(56);
	})
	it ("documents validatorAddress", async () => {
// https://github.com/lley154/helios-examples/blob/704cf0a92cfe252b63ffb9fd36c92ffafc1d91f6/vesting/pages/index.tsx#LL370C43-L370C43
	  expectTypeOf(validatorAddress.toBech32).toMatchTypeOf("string")
	})
})
