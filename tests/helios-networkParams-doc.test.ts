import { describe, expect, it, expectTypeOf, beforeEach, vi } from 'vitest'
import { promises as fs } from 'fs';
import {
  Address,
  NetworkEmulator,
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
		const bob = network.createWallet(BigInt(10000000));
		network.tick(BigInt(10));

		context.alice = alice;
		context.bob = bob;
		context.network = network;

	})

	it ("checks methods", async ({alice}) => {
	// https://www.hyperion-bt.org/helios-book/api/reference/address.html
	  expect(alice.address.toBech32()).toBe('addr_test1vz2a83z0d5gceyghfrjqpaqu2f98evk8q6swje2c5ddqmaca2vhfl')
	})
	it.skip("checks Properties", async ({validatorHash}) => {
	//https://www.hyperion-bt.org/helios-book/api/reference/validatorhash.html
	  expect(validatorHash.hex.length).toBe(56);
	})
	it.skip("documents API usage", async ({validatorAddress}) => {
// https://github.com/lley154/helios-examples/blob/704cf0a92cfe252b63ffb9fd36c92ffafc1d91f6/vesting/pages/index.tsx#LL370C43-L370C43
	  expectTypeOf(validatorAddress.toBech32).toMatchTypeOf("string")
	})
})
