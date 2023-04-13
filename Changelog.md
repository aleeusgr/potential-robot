13 April

Milestone: PBL 304. web3 product audit: business logic, security and verification, user base and impact.

Seeking to build a demo test, I landed on an Open Source e2e example.
It's business logic is incomplete, however. There should be a way to for the end user to extract some value from the market.
A coke machine where I can get a drink for my hard earned littercoin.

https://github.com/OpenLitterMap is an organisation; I imagine it as a set of microcervices, but the real architecture may be different.

[Business logic](https://opengeospatialdata.springeropen.com/articles/10.1186/s40965-018-0050-y): 

Currently, 1 Littercoin is rewarded for every 100 images sent for successful verification in a row. This is intended to incentivize people to submit data correctly. 

To incentivize early adoption, OpenLitterMap will reward users for being the first to upload from a new location. Simply by uploading to OpenLitterMap, users dynamically populate the list of available locations in the database.

Users receive 100 Littercoin for the being the first to upload from a Country, 50 Littercoin for the creation of a State, and 25 Littercoin for each City (Note, that these terms are used as a generalization for each of the 3 layers which are based on unrecogized OpenStreetMap values during the upload process). 

Although there are no restrictions as to how many locations a user can create, there are only 10 million Littercoin in the current v1.0 model, a number which was chosen arbitrarily. Due to technical smart contract limitations, Littercoin rewards are currently being distributed manually. While it doesn’t cost anything to receive tokens, it costs a fraction of eth to send tokens (~ €0.10-20c). 

To claim allowances, the authenticated user must visit openlittermap.com/settings/littercoin and enter a Cardano public wallet ID or follow the instructions to create one. A more detailed whitepaper on Littercoin will follow this article about the future vision for this “GeoBlockchain” ecosystem and outline the business details about how we might be able to create a monetary incentive to reward people for producing open data on plastic pollution. Such a reward may have the potential to incentivize the rapid crowdsourcing of geospatial information at a global scale never seen before.

QA and security:
story levels: user, developer, auditor.

User: YouTube.
Auditor: Work with Romain;
Testing: Work with Helios, thanks to Randall and Simon.
- [ ] https://github.com/OpenLitterMap/littercoin
- [ ] [minting module](https://github.com/OpenLitterMap/openlittermap-web/blob/staging/littercoin/run/build-lc-mint-tx.mjs)
- [ ] https://opengeospatialdata.springeropen.com/articles/10.1186/s40965-018-0050-y
- [ ] TODO: web app, mobile app, 



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


