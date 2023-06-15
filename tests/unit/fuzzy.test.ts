import { describe, expect, it, expectTypeOf, beforeEach, vi } from 'vitest'
import { promises as fs } from 'fs';
import {
	Assets,
	FuzzyTest,
	MintingPolicyHash,
	NetworkEmulator,
	Program
} from "@hyperionbt/helios";


import {lockAda} from './src/lockAda.ts';

describe("create a network with two wallets of which one has an nft", async () => {

	// https://vitest.dev/guide/test-context.html
	beforeEach(async (context) => {

	})

	it.fails ("checks for Fuzzy", async ({network, alice, bob, mph}) => {
		// https://www.hyperion-bt.org/helios-book/api/reference/fuzzytest.html?highlight=fuzzy#fuzzytest
		const fuzzy = new FuzzyTest(0,100,false)
		expect(await fuzzy.int(0)).toBe();


	})

})
