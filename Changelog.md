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

