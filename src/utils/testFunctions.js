// import { ethers } from "ethers";
// export const registerUser = async (
//   iterationNum,
//   performSendToConnector,
//   performGenerateDID,
//   performResolveDID,
//   performIssueVC,
//   performValidateVC,
//   performSubmitDIDVC
// ) => {
//   // Generate random wallet, dont care about pw
//   const newWallet = ethers.Wallet.createRandom();

//   // Generate DID
//   const didDoc = await performGenerateDID(newWallet);
//   if (!didDoc) {
//     console.error("Failed to generate DID");
//     return;
//   }

//   // Resolve DID
//   const resolvedDid = await performResolveDID(didDoc);
//   if (!resolvedDid) {
//     console.error("Failed to resolve DID");
//     return;
//   }

//   // Issue VC
//   const roles = ["user", "admin", "device"];
//   const formData = {
//     selected_role: roles[Math.floor(Math.random() * roles.length)], // Randomly select one role
//     alias: iterationNum,
//     firmware_version: `${Math.floor(Math.random() * 10)}.${Math.floor(
//       Math.random() * 10
//     )}.${Math.floor(Math.random() * 10)}`, // Random version in format X.X.X
//     testMode: true,
//   };
//   const signed_vc = await performIssueVC(didDoc, formData);
//   if (!signed_vc) {
//     console.error("Failed to issue VC");
//     return;
//   }

//   // Validate VC
//   const validationResult = await performValidateVC(signed_vc);
//   if (!validationResult) {
//     console.error("Failed to validate VC");
//     return;
//   }
//   // Submit DID and VC
//   const did = didDoc.did;
//   const submitResult = await performSubmitDIDVC(wallet, did, signed_vc, formData);
//   if (!submitResult) {
//     console.error("Failed to submit DID and VC");
//     return;
//   }
// };
