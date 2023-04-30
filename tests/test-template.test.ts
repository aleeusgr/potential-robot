import { describe, expect, it, vi } from 'vitest'
import { promises as fs } from 'fs';
import {

} from "@hyperionbt/helios";

import {

} from "lucid-cardano"; // NPM

describe('Verbose test', () => {

    const main = async () => {

	try {
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
	console.log(logMsgs)
	expect(mainStatus).toBe(true);

    })

})

