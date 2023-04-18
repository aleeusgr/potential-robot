import * as helios from "@hyperionbt/helios"
import { describe, it, beforeAll, expect } from 'vitest'
import fs from "fs";

let program;
let testContract;

describe('emulator test', () => {

    beforeAll(() => {

        const testSetup = {
            contract: './test/simple.hl',
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
    

})
