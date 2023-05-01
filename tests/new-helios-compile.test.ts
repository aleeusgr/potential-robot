import { describe, expect, it, vi } from 'vitest'
import { promises as fs } from 'fs';
import {


} from "@hyperionbt/helios";

import {

} from "lucid-cardano"; // NPM

describe('Verbose test', () => {

	const main = async () => {
		const src = `
		spending always_succeeds

		func main(_, _, _) -> Bool {
		    true
		}`


		try {
			const program = helios.Program.new(src)

		
		return program
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
	console.log(logMsgs)
	expect(mainStatus).toBe(true);

	})

})

