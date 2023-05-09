spending matching_pubKeyHash

    struct Datum {
        owner: PubKeyHash
    }

    struct Redeemer {
        owner: PubKeyHash
    }

    func main(datum : Datum, redeemer: Redeemer) -> Bool {datum.owner == redeemer.owner}
