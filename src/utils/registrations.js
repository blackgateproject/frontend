import { ethers } from "ethers";
import { contractInstance, providerInstance } from "./contractInteractions";
import { logUserInfo } from "./secUtils";
import { getDIDandVC } from "./verification";

export const checkRegistration = async (contract, address) => {
  // Check if the address exists in DIDOwnerChanged event logs
  console.log("About to query filter");
  console.log("Contract:", contract);
  const provider = await providerInstance();
  //   const blockNum = await provider.getBlockNumber();
  //   console.log("Block Number:", blockNum);
  const logs = await contract.queryFilter("DIDOwnerChanged");

  console.log("Logs (checking if user exists):", logs);

  let found = false;

  for (let log of logs) {
    if (
      log.topics[0] ===
      ethers.solidityPackedKeccak256(
        ["string"],
        ["DIDOwnerChanged(address,address)"]
      )
    ) {
      const decodedData = ethers.defaultAbiCoder.decode(
        ["address", "address"],
        log.data
      );
      console.log("Decoded Data:", decodedData);
      if (decodedData[0].toLowerCase() === address.toLowerCase()) {
        console.log("Address found in logs.");
        found = true;
        break;
      }
    }
  }
  console.log("Address found:", found);
  const owner = await contract.identityOwner(address);
  let isSelfOwned = false;
  let isRegistered = false;

  // Check if the identity is self-owned
  if (owner.toLowerCase() === String(address).toLowerCase()) {
    console.log("Address is self-owned.");
    isSelfOwned = true;
  }

  return { isSelfOwned, isRegistered };
};

export const handleProceedToNextStep = async (
  wallet,
  selectedClaims,
  setSignedVC,
  setIsLoadingDID,
  setCurrentStep,
  signer
) => {
  console.log("Fetching Network Info");
  await logUserInfo();
  const did = "did:ethr:" + wallet.address;
  console.log("DID:", did);
  const contract = await contractInstance();
  const result = await checkRegistration(contract, wallet.address);
  console.log("Registration Result:", result);
  if (!result.isSelfOwned) {
    console.log("Address is registered, Verifying...");
    // Proceed with verification
    // Send ZKP that's stored in memory
    // ...
  } else {
    console.log("Address is not registered");
    // Proceed with registration
    await getDIDandVC(
      wallet,
      did,
      selectedClaims,
      setSignedVC,
      setIsLoadingDID,
      setCurrentStep
    );
    // Send credentials to Connector
    // ...
    console.log(
      "WARN:: This next func will fail as it does not exist on the contract"
    );
    // const tx = await contract
    //   .connect(signer)
    //   .changeOwner(wallet.address, wallet.address);
    // const txResponse = await tx.getTransaction();
    // const txReceipt = await txResponse.wait();
    // console.log("Transaction Receipt:", txReceipt);
    // console.log("Transaction Logs:", txReceipt.logs);
    // console.log("Transaction Hash:", txReceipt.transactionHash);
    // console.log("Transaction Status:", txReceipt.status);
    // console.log("Transaction Confirmations:", txReceipt.confirmations);
    // console.log("Transaction Events:", txReceipt.events);

    console.log("Address now registered on-chain");
    // Send Transaction ID and DID for verification
    // ...
  }
};
