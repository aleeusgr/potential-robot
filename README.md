# potential-robot

An option smart contract;
lockAda (owner Pkh, nft, deadline);
claimAda (nft): not after deadline? 

I'll suggest starting a lightweight outline of testable expectations.

Formatting test files using that kind of outline provides good organization and structure for the testing code.

outline in test DSL:

- [ ] 
```javascript
describe("vesting contract"), () => {
  describe("contract initiation", () => {
    it("holds assets for vesting", async() => {
    })
    it("lets the initiator take their own funds back, until the contract is claimed", async () => {})
  })
  describe("contract claim", async() => {
     it("allows the recipient to mint a claim token they can hold in their wallet" async() => {
})
     it("doesn't let the initiator withdraw funds once claimed", async() => {
})
  })

  describe("gradual maturation", () => {
    ...
  })

  describe("reclaiming funds after long period of inactivity" () => {
    ...
  })
})
```

- [ ]
```javascript
describe("vesting contract", () => {
  let vestingProgram, initiatorWallet, recipientWallet;
  beforeEach(() => { 
    vestingProgram = new helios.Program( ... ); 
     ...
  })
  it ("tests things while reusing provided `vestingProgram`", async () => {
    ...
  })
})
```
- [ ] 
```javascript
it("works with datumHash and datum at spend time")
it("works with inlineDatum and no special datum at spend time")
```



`npm install`
`npm test`

references:
https://github.com/koralabs/handles-personalization/tree/master/simple_example_wth_tests
https://github.com/lley154/helios-examples/tree/main/vitest
