# potential-robot

Thank's to Randall Harmon, Helios community, Gimbalabs and James D., Romain Soulat IOG. 

This is a toolbox for test-driven development on Cardano, using Helios.
Start cloning the repo and experimenting with the ledger emulator.
Gather product requirements and user stories, create Issues, formulate testable expectations and make tests pass.
Contribute

## Documentation:
[Vitest](https://vitest.dev/)
[Helios](https://github.com/Hyperion-BT/helios)
[Helios vesting example](https://github.com/lley154/helios-examples/tree/main/vesting)

## Usage
1. `npm install`
2. `npm test`
3. onchain code is in `./src/vesting.hl`
4. `./tests/unit` document Helios API
5. tests in `./tests/*.test.ts` use pre-defined environment to run a transaction as a test and as an importable module. 
6. importable transaction modules are in `src`

