// basic.spec.ts
// organizing tests
// https://vitest.dev/api/#test
// `it` is alias for `test`

import { describe, expect, it, vi } from 'vitest'
import { promises as fs } from 'fs';
import {
  Assets, 
  Address,
  ByteArrayData,
  ConstrData, 
  Datum,
  ListData,
  MintingPolicyHash,
  NetworkEmulator,
  NetworkParams,
  Program, 
  Value, 
  textToBytes,
  TxOutput,
  Tx, 
} from "@hyperionbt/helios";

const person = {
  isActive: true,
  age: 32,
}

let optimize = false;
const minAda = BigInt(2000000);  // minimum lovelace needed to send an NFT
const network = new NetworkEmulator();
const networkParamsFile = await fs.readFile('./src/preprod.json', 'utf8');
const networkParams = new NetworkParams(JSON.parse(networkParamsFile.toString()));
const alice = network.createWallet(BigInt(10000000));
network.tick(BigInt(10));

describe('state of the emulator', () => {
  it('shows that a wallet has been created', () => {
	  // ahh, ok. Properties;
    expect(alice.address).toBeDefined()
  })
})
const script = await fs.readFile('./src/owner-only.hl', 'utf8'); 
const program = Program.new(script); 
//space here, maybe I need to modify program using .parameters?
const compiledProgram = program.compile(optimize); 

const validatorHash = compiledProgram.validatorHash;
const validatorAddress = Address.fromValidatorHash(validatorHash); 

describe('validator properties?', () => {
	// test suite;
	// test;

  it('shows that a validator has been created', () => {
	  // what checks should I can have?
	  // assert type
	  // internal checks
    expect(person.isActive).toBeTruthy()
  })
})
const lock = new Tx()
const ownerPkh = alice.pubKeyHash ;
const datum = new ListData([new ByteArrayData(ownerPkh.bytes),
			]);

const inlineDatum = Datum.inline(datum);        
const hashedDatum = Datum.hashed(datum);        

const lockIn = await network.getUtxos(alice.address)

lock.addInput(lockIn[0]);

const lockTxOutput = new TxOutput(
    validatorAddress,
    new Value(1000000n), // 1 tAda == 1 million lovelace
    inlineDatum
)
lock.addOutput(lockTxOutput)

await lock.finalize(networkParams, alice.address);

const lockTxId = await network.submitTx(lock);
network.tick(BigInt(10));

describe('state of the emulator after the transaction', () => {
  it('a utxo at validator address contains correct Datum:', () => {
    // const uxto = network.getUtxos();
	  // tx.dump.body()
	  //
    expect(alice.address).toBeDefined()
  })
  it('checks validatorAddress', () => {
    expect(person.isActive).toBeTruthy()
  })

  it('is active', () => {
    expect(person.isActive).toBeTruthy()
  })
  it('age limit', () => {
    expect(person.age).toBeLessThanOrEqual(32)
  })
})
