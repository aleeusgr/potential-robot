## version: Adderall 

is used to architect a decentralzied application using eUTXO model and Helios, a domain specific language for writing smart contracts on Cardano blockchain.

## Why?
Cardano is famous for its tough onboarding: most developers with under 3 years of experience find it extremely difficult to develop a product. First challenge is the eUTXO model, which is transaction-based - a more secure but less intuitive that [the alternatives]([url](https://jcliff.medium.com/intro-to-blockchain-utxo-vs-account-based-89b9a01cd4f5)). The second challenge is the necessity to deal with Haskell.nix - a notoriously complex build system. 
The is an alternative to [plutus-starter](https://github.com/input-output-hk/plutus-starter) to use alongside tutorials. 
The project is target a wide audience (namely - JS developers) and its goal is to make democratize Cardano development.

## Quick Start
1. `npm install`
2. `npm test`

![image](https://github.com/aleeusgr/potential-robot/assets/36756030/fc378aff-6a9a-45c7-82ad-6b2050eda582)


## Usage
Simple dApp consists of a smart contract with the set of transactions that could be applied to it. Current example is vesting, which is discussed in the documentation below. Following the book in the links and tutorials on Test-Driven Development a programmer should be able to express buisness logic as functional requirements for the product and write tests to verify the requirements are satisfied.
For example for the vesting contract the functional requirements are like so:
- sponsor can deposit value
- claimant can claim the value after the deadline designated by the sponsor.
- claimant fails to claim the value before the deadline.
- sponsor can cancel the contract before the deadline
- sponsor fails to claim the value after the deadline.

FOr the first excercise the user may seek to implement NFT escrow - a contract that validates withdrawal depending not on time of the transation but if the transaction has a specific NFT. Take a look at the [code example](https://github.com/aleeusgr/sniffle).


## Refs:
[Vitest](https://vitest.dev/)

[Helios](https://github.com/Hyperion-BT/helios)

[Helios vesting example](https://github.com/lley154/helios-examples/tree/main/vesting)

[Cardano Smart contract with Helios](https://github.com/lley154/helios-examples/blob/main/docs/Cardano%20Smart%20Contracts%20with%20Helios.pdf)

[Plutus: Writing reliable smart contracts](https://leanpub.com/plutus-smart-contracts) 

Big Thanks to Helios team, James Dunseith Gimbalabs, Ben Hart MLabs, Romain Soulat IOG and Matthias Sieber EMURGO.
The project is inspired by Nine Inch Nails, SBF trial and the show Inside Job.
