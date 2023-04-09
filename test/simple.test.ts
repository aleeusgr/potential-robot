import * as helios from "@hyperionbt/helios"
import { describe, it, beforeAll, expect } from 'vitest'
import fs from "fs";

let program;
let testContract;

describe('simple test', () => {

    beforeAll(() => {

        const testSetup = {
            contract: './helios/simple.hl',
            // fixtures: [
            //     './tests/vault_fixtures.hl'
            // ],
             helpers: [
             ]
            // replacements: [
            //     []
            // ]
        }

        const contractSources: string[] = []

        contractSources.push(
            fs.readFileSync(testSetup.contract).toString()
        )

        // testSetup.fixtures.forEach(fixture => contractSources.push(fs.readFileSync(fixture).toString()))

        const source = contractSources
            .join("\n")
            
        program = helios.Program.new(source);
        testContract = program.compile();
    })

// evalParam(p) and runWithPrint(p[]). Look for unit "()" response
    
    it(`test success`, async () => {

        const args = ["empty_datum", "test1_true_redeemer", "default_ctx"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                console.log('res', JSON.stringify(res))
                expect(res[0].toString()).toBe("()");
            })
    })
})
