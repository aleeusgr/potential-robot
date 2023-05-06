spending loan

struct Datum {
    lender: PubKeyHash
    borrower: PubKeyHash
    deadline: Time
}

enum Redeemer {
    WithdrawADA
    WithdrawCol
}

func main(datum: Datum, redeemer: Redeemer, context: ScriptContext) -> Bool {
    tx: Tx = context.tx;
    now: Time = tx.time_range.start;

    redeemer.switch {
        WithdrawADA => {
		( // borrower withdraws
			// Collateral
			(now < datum.deadline).trace("VS5: ") && 

			// Check that the owner signed the transaction
			tx.is_signed_by(datum.lender).trace("VS6: "))
		|| // Lender Cancels
			( false
			//
			)
        },
        WithdrawCol => {
		( // borrower  
			// Collateral
			(now < datum.deadline).trace("VS5: ") && 

			// Check that the owner signed the transaction
			tx.is_signed_by(datum.lender).trace("VS6: "))
		|| // Lender Cancels
			( false
			//
			)
        }
    }
}
