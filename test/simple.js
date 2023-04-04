import * as helios from "@hyperionbt/helios"
import fs from "fs";
// import {Color} from '../colors.js'

const contract = fs.readFileSync("./simple.helios").toString();
// test helpers and fixtures can be loaded from a different files and concatenated
// const helpers = fs.readFileSync("./test_helpers.helios").toString();
// const fixtures = fs.readFileSync("./simple_fixtures.helios").toString();
// const program = helios.Program.new(contract + helpers + fixtures);
const program = helios.Program.new(contract);
const testContract = program.compile();

// evalParam(p) and runWithPrint(p[]). Look for unit "()" response
async function testSuccess(testName, paramNames) {
  const args = paramNames.map((p) => program.evalParam(p));
  testContract.runWithPrint(args).then((res) => {
      const assertion = res[0].toString() == "()";
      if (assertion) {
        console.log(`Ok`);
        console.log(`OK`);
      } else {
          logFail(testName, res, args);
      }
    })
    .catch((err) => {
      logFail(testName, err, args, true);
    });
}

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

await testSuccess("test1Success", ["empty_datum", "test1_true_redeemer", "default_ctx"]);
// await testFailure("test1Failure", ["empty_datum", "test1_false_redeemer", "default_ctx"]);
await testSuccess("test2Success", ["empty_datum", "test2_true_redeemer", "default_ctx"]);
// await testFailure("test2Failure", ["empty_datum", "test2_false_redeemer", "default_ctx"]);
