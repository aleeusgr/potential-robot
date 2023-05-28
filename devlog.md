May 28th, Monday

Building cancelAda stalled; I get an error about slot out of range. 
I should try with simpler networkParameters, just initial configuration.
I need to build a test for networkParameters

May 21st, Sunday

Huh, coding adventure. Thanks to lley154 I have lockAda;

0: Emulator, Wallets, validator
1: Alice locks 10 Ada for Bob to claim after some time;
	1: Alice Cancels
	2: Bob Claims
		1: Alice fails to cancel
	3: Charlie fails to claim.
	4: Bob sends Vesting ID to Charlie
2: Change logic:
Alice locks 10 Ada to exchange for a token. Anyone can claim until a Date, but they have to show that the transaction they are submitting has a token attached to it;


Here, I need bob to make difference between Cancel and Claim;


May 19th, Friday

Added tests/helios-vesting.test.ts
However reviewing the code I think: how much redundancy is there already?
Actually, not much. Doc test is ok, just vesting is poorly named; It tests only a small part of the contract functionality; ok, it makes sense to try and factor out a lockAda function that will take enough arguments to submit a successful tx;

May 17th, Wednesday

Before I understand, I need to understand what I need to understand
- [ ] a lightweight outline of testable expectations.
- [ ] organization and structure for the testing code.
- [ ] look at testing example in a [production app](https://github.com/Zhengqbbb/cz-git)

My code should be easy to understand.
I use my code as a Lego, having a set of building blocks that work together. 

let me write a test for compiling the validator.

May 16th, Tuesday

I have new goal(s); do I? Review README;

May 13th, Saturday

I have to discard three days of work, start anew. 
My goal is a loan contract. To build it, I need a testing environemnt to play with.
I have two examples of code that works sending and redeeming tokens from a validator address: vesting in Helios and matching keyhash in lucid.
matching keyhash is simpler, I should start there. Maybe next step would be to rebuild owner-only from Helios in lucid?

May 9th, Tuesday

Feel better, last couple of days were hard;
Merge helios emulator?

May 5, Friday
No wind. Eat, code, sleep, repeat. No life;


May 4, Thursday
Still apathy, but I am pressing forward;
two parts: the contract, and the transactions that serve it, are inseparable; at least for now.
For vesting contract, I have the script, but I need to find transactions; or translate them from the example. 
`vesting/pages/index.tsx` imports components in its top,
- [ ] index.tsx: how are components used?
- [ ] loan: 

I am pretty exhausted; apathy and sleepiness on Wednesday;
Now my goal is to buid without a manual. So I will start with building with a manual and see where it gets me.

May 2, Tuesday

https://github.com/aleeusgr/potential-robot/issues/70

May 1, Monday

I am unstuck big time; now I have a nicer repo;
9 tests are passing, out of which I know 5;

Now I take a break.

29 Apr, Sat

I am stuck with both refactoring and using Helios nft minter contract to mint an nft in Lucid emulator.
- [ ] look at tutorial Lucid smart contract interaction.

25 April

- [ ] refactor test
- [ ] add nft to borrwer wallet

13 April

rethink

2 April
Monday reflection lands in this file.
How do I bring Certification and DevX together?
SDLC? What is SDLC? 
It's the process more then the result. 
"Avoid Success at all costs"

21 March:
Thanks to Randall:
indicating the source-language-agnostic, compiled-and-encoded representation of untyped-plutus-core that is the basis for executing contracts on-chain.

It was done by shell scripting in plutus starter, but now I think Ben suggested I should try 
- [ ] `plutus-simple-model` 
- [ ] `plutip`

20 March
And now I feel like I am not moving anywhere, or rather that I misunderstood a lot.

I could run psm locally and use `mdbook serve` to get docs
So now I have a front-end component, which is not suited for testing.
I need to find out its identity, the core that makes it tick, which I think is a cborhex file.

This is the file that would be subject to testing. Does it make sense? a dApp is being tested, a category(?) of plutus scripts and their relations. 

Tasty, QuickCheck and its analogs.

- [ ] Helios -> cborHex
- [ ] How do we test onchain code?
- [ ] Good tests vs Bad tests - what's the difference?

16 March

The goals starts to be more clear. 
I need to run unit tests on desirables. 

- [ ] psm
- [ ] helios

then an integration test:

- [ ] psm + helios.

This will allow me to generate and test new logic.
Once I have the logic that I need, I need to search for bugs. 
No-code first: use text and graphical descriptions to have a contract model easily accessible.
How do I go on from the model to actual test code?

Enhancements: 
- [ ] running CI in the cloud would work around my poor hardware. Tradeoffs?


