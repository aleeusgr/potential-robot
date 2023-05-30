import { describe, expect, it, expectTypeOf, beforeEach, vi } from 'vitest'
import { promises as fs } from 'fs';
import {
  Address,
  NetworkEmulator,
  NetworkParams,
  Program, 
} from "@hyperionbt/helios";

describe("run a transaction on newly initialized params", async () => {

	// https://vitest.dev/guide/test-context.html
	beforeEach(async (context) => { 
		// instantiate the Emulator
		// const minAda = BigInt(2000000);  // minimum lovelace needed to send an NFT
		const network = new NetworkEmulator();

		const alice = network.createWallet(BigInt(20000000));
		network.createUtxo(alice, BigInt(5000000));
		network.tick(BigInt(10));

		context.alice = alice;
		context.network = network;

	})

	it ("checks networkParams parsing", async ({network}) => {
	// https://www.hyperion-bt.org/helios-book/api/reference/address.html
		const networkParamsFile = await fs.readFile('./src/preprod.json', 'utf8');
		const networkParamsJSON = JSON.parse(networkParamsFile.toString());
		const networkParams = new NetworkParams(networkParamsJSON);
		expect(networkParamsJSON.latestTip.slot).toBe(21425784);
		expect(networkParamsJSON.latestTip.time).toBe(1677108984000);
		expect(networkParams.slotToTime(BigInt(networkParamsJSON.latestTip.slot))).toBe(BigInt(networkParamsJSON.latestTip.time));
	})

	it ("checks network.initNetworkParams", async ({network}) => {
	// https://www.hyperion-bt.org/helios-book/api/reference/address.html
		const networkParamsFile = await fs.readFile('./src/preprod.json', 'utf8');
		const networkParamsJSON = JSON.parse(networkParamsFile.toString());
		const networkParams = new NetworkParams(networkParamsJSON);
		const newNP = network.initNetworkParams(networkParams)
		expect(newNP.slotToTime(BigInt(0))).toBe(1655683200000n);
	})
})
