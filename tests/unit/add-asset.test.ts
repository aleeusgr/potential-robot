import { describe, expect, it, expectTypeOf, beforeEach, vi } from 'vitest'
import { promises as fs } from 'fs';
import {
	Assets,
	MintingPolicyHash,
	NetworkEmulator,
	Program
} from "@hyperionbt/helios";


import {lockAda} from './src/lockAda.ts';

describe("create a network with two wallets of which one has an nft", async () => {

	// https://vitest.dev/guide/test-context.html
	beforeEach(async (context) => { 

		const minAda = BigInt(2000000);  // minimum lovelace needed to send an NFT
		const network = new NetworkEmulator();

		const alice = network.createWallet(BigInt(20000000));
		network.createUtxo(alice, BigInt(5000000));
		const bob = network.createWallet(BigInt(10000000));

		const mph = '16aa5486dab6527c4697387736ae449411c03dcd20a3950453e6779c';

		const testAsset = new Assets();
			testAsset.addComponent(
			MintingPolicyHash.fromHex( mph ),
			Array.from(new TextEncoder().encode('Test Asset Name')), BigInt(1)
		);

		// Add additional Token to the wallet
		network.createUtxo(bob, minAda, testAsset);

		network.tick(BigInt(10));

		context.alice = alice;
		context.bob = bob;
		context.network = network;
		context.mph = mph;

	})

	it ("docs the tx ingridients", async ({network, alice, bob, mph}) => {
		// https://www.hyperion-bt.org/helios-book/api/reference/address.html?highlight=Address#address
		expect(alice.address.toHex().length).toBe(58)
		expect((await alice.utxos)[0].value.dump().lovelace).toBe('20000000');
		expect(Object.keys((await bob.utxos)[1].value.dump().assets)[0]).toBe(mph);
	})

})
