import * as helios from "@hyperionbt/helios"
import { describe, it, beforeAll, expect } from 'vitest'
import fs from "fs";
// import {Color} from '../colors.js'

let program;
let testContract;

describe('Raffle Vault works appropriately', () => {

    beforeAll(() => {

        const testSetup = {
            contract: './test/simple.hl',
            // fixtures: [
            //     './tests/vault_fixtures.hl'
            // ],
            helpers: [
            ],
            // replacements: [
            //     []
            // ]
        }

        const contractSources: string[] = []

        contractSources.push(
            fs.readFileSync(testSetup.contract).toString()
        )

        // testSetup.fixtures.forEach(fixture => contractSources.push(fs.readFileSync(fixture).toString()))

        // const source = contractSources
        //     .join("\n")
        //     .replace('context.get_current_validator_hash()', 'ValidatorHash::new(#01234567890123456789012345678901234567890123456789000001)')

        program = Program.new(source);
        testContract = program.compile();
    })

// evalParam(p) and runWithPrint(p[]). Look for unit "()" response
    
    it(`should ...`, async () => {

        const args = paramNames.map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                console.log('res', JSON.stringify(res))
                expect(res[0].toString()).toBe("()");
            })
    })
  // async function testSuccess(testName, paramNames) {
  //   const args = paramNames.map((p) => program.evalParam(p));
  //   testContract.runWithPrint(args).then((res) => {
  //       const assertion = res[0].toString() == "()";
  //       if (assertion) {
  //         console.log(`${Color.FgGreen}Test ${testName} was successful!${Color.Reset}`);
  //       } else {
  //           logFail(testName, res, args);
  //       }
  //     })
  //     .catch((err) => {
  //       logFail(testName, err, args, true);
  //     });
  // }

// async function testFailure(testName, paramNames) {
//     const args = paramNames.map((p) => program.evalParam(p));
//     testContract.runWithPrint(args).then((res) => {
//         const assertion = res[0].toString() != "()";
//         if (assertion) {
//           console.log(`${Color.FgGreen}Test ${testName} was successful!${Color.Reset}`);
//         } 
//         else {
//             logFail(testName, res, args);
//         }
//       })
//       .catch((err) => {
//         logFail(testName, err, args, true);
//       })
// }

// async function logFail(testName, obj, args, isError=false) {
//     console.log(`${Color.FgRed}Test ${testName} failed!${Color.Reset}`);
//     console.log(`${Color.FgRed}--------------${Color.Reset}`)
//     if (isError) console.log("  *ERROR*");
//     console.log(`   ${Color.FgRed}ARGS: ${Color.Reset}`, args.map((v) => v.toString()));
//     console.log(`   ${Color.FgRed}${obj}${Color.Reset}`);
//     console.log(`${Color.FgRed}--------------${Color.Reset}`)
// }

//await testSuccess("test1Success", ["empty_datum", "test1_true_redeemer", "default_ctx"]);
// await testFailure("test1Failure", ["empty_datum", "test1_false_redeemer", "default_ctx"]);
//await testSuccess("test2Success", ["empty_datum", "test2_true_redeemer", "default_ctx"]);
// await testFailure("test2Failure", ["empty_datum", "test2_false_redeemer", "default_ctx"]);
//

})
