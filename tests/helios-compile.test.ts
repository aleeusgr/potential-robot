import { describe, expect, it, vi } from 'vitest'
import { promises as fs } from 'fs';
import {

	Program

} from "@hyperionbt/helios";

import {

} from "lucid-cardano"; // NPM

describe('turns a sting into uplc', () => {

	const main = async () => {
		const src = `
		spending always_succeeds

		func main(_, _, _) -> Bool {
		    true
		}`


		try {
			const program = Program.new(src)

			const myUplcProgram = program.compile();	
			console.log(myUplcProgram.serialize());
		return true
		} catch (err) {
		    console.error("something failed:", err);
		    return false;
		}
		}

	it('adds logging', async () => {

		const logMsgs = new Set();
		const logSpy = vi.spyOn(global.console, 'log')
				 .mockImplementation((msg) => { logMsgs.add(msg); });

		let mainStatus = await main();
		logSpy.mockRestore();
		if (!mainStatus) {
		    console.log("Smart Contract Messages: ", logMsgs);
	}
	expect(mainStatus).toBe(true);

	})

})

