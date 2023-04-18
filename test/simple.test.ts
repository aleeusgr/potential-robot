import * as helios from "@hyperionbt/helios"
import { describe, it, beforeAll, expect } from 'vitest'
import fs from "fs";

let program;
let testContract;

describe('simple test', () => {

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
	console.log(JSON.parse(testContract.serialize()).cborHex)
    })

// evalParam(p) and runWithPrint(p[]). Look for unit "()" response
    
    it(`evalParam`, async () => {

        const args = ["empty_datum", "test1_true_redeemer", "default_ctx"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                console.log('res', JSON.stringify(res))
                expect(res[0].toString()).toBe("()");
            })
    })

    it(`produces right cborHex`, async () => {
	// what would be our next test?
	// I need to submit transaction to the emulator and see what it does.
	// check what it should do; and compare.
	
        const args = ["empty_datum", "test1_true_redeemer", "default_ctx"].map((p) => program.evalParam(p))
        return await testContract
            .runWithPrint(args)
            .then((res) => {
                console.log('res', JSON.stringify(res))
                expect(JSON.parse(res).cborHex.toBe("58cf58cd01000032323232323232323232323232323232222533357346660080060040022930b111191992999ab9a3370e0029000091980a18040009809a490b7468697320776f726b73210015333573466e1c0052002123301430070013013491107468697320616c736f20776f726b732100123301213300f3009006300900613300e300b004300b00435573a6ea800400400801401000480040048d5d0980100091aab9e375400200400244600666ebc0080048ccd5cd000a504a244a666ae6940085288a80091ba93730002002ebc1"));
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
