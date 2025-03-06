import { ethers } from "ethers";
import { contractInstance, providerInstance } from "./contractInteractions";
import { logUserInfo } from "./secUtils";
import { getDIDandVC } from "./verification";

export const checkRegistration = async (contract, address) => {
  // Check if the address exists in DIDOwnerChanged event logs
  console.log("About to query filter");
  console.log("Contract:", contract);
  // const provider = await providerInstance();
  // const blockNum = await provider.getBlockNumber();
  // console.log("Block Number:", blockNum);
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
  did, 
  signed_vc,
  selectedClaims,
  // setSignedVC,
  setIsLoadingDID,
  setCurrentStep,
  signer
) => {
  console.log("Registeration Processs BEGIN!");
  console.log("Fetching Network Info");

  // Fetch Network based Identifiers
  const networkInfo = await logUserInfo();

  // Setup DID String
  did = "did:ethr:" + wallet.address;
  console.log("DID:", did);

  // Check if DID is registered onchain already
  const contract = await contractInstance();
  const result = await checkRegistration(contract, wallet.address);
  console.log("Registration Result:", result);
  if (!result.isSelfOwned) {
    // Already onchain, just prompt for verification
    console.log("Address is registered, Verifying...");
    console.log("NOTE:: No verification function has been implemented yet!");
    // Proceed with verification
    // Send ZKP that's stored in memory
  } else {
    // Not onchain, proceed with registration
    console.log("Address is not registered");
    // Proceed with registration
    const signed_vc = await getDIDandVC(
      wallet,
      did,
      selectedClaims,
      // setSignedVC,
      setIsLoadingDID,
      setCurrentStep
    );

    const data = {
      wallet_address: wallet.address,
      didStr: did,
      verifiableCredential: signed_vc,
      usernetwork_info: networkInfo,
    };
    console.log("Data:", data);

    // Send didStr, VC and wallet address to connector at localhost:8000/auth/v1/register
    const response = await fetch("http://localhost:8000/auth/v1/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("Attempting to send data to connector");

    if (response.ok) {
      const data = await response.json();
      console.log("Registration finalized:", data);
      // navigate("/dashboard");
    } else if (response.status === 500) {
      console.error("Server Error:", await response.text());
    }
    else {
      console.error("Failed to finalize registration");
    }
    // const contract = await contractInstance();

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

    // console.log("Registeration Processs End!");
    // Send Transaction ID and DID for verification
  }
};
