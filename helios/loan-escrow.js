spending loan

struct Datum {
    lender: PubKeyHash
    borrower: PubKeyHash
    deadline: Time
}

enum Redeemer {
    LenderWithdraws
    BorrowerWithdraws
}

func main(datum: Datum, redeemer: Redeemer, context: ScriptContext) -> Bool {
    tx: Tx = context.tx;
    now: Time = tx.time_range.start;

    redeemer.switch {
        LenderWithdraws => {
		( // Lender Cancels 
			// Contract address has only one utxo

			// Check that the owner signed the transaction
			tx.is_signed_by(datum.lender).trace("VS6: "))
		|| // Lender Claims
			( 
			// deadline is past
			(now > datum.deadline).trace("VS5: ") && 

			tx.is_signed_by(datum.lender).trace("VS6: "))
			)
        },
        BorrowerWithdraws => {
		( 
			// nft

			// Check that the owner signed the transaction
			tx.is_signed_by(datum.borrower).trace("VS6: "))
		|| // 
			( false
			//
			)
        }
    }
}
