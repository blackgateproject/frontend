import { issueCredential, resolveDID } from "@spruceid/didkit-wasm";
import { Buffer } from "buffer";
import { ethers, SigningKey } from "ethers";
import { contractInstance } from "./contractInteractions";
import { logUserInfo } from "./secUtils";
import { useVeramo } from "@veramo-community/veramo-react"
import {useQuery} from "@tanstack/react-query"


export const getDIDandVC = async (wallet, role) => {
  // Check for wallet
  if (!wallet) {
    console.error("Wallet is not loaded.");
    return;
  }

  // Instantiate Veramo agent
  // const { agent } = useVeramo<IDIDManager>();
  const { agent } = useVeramo();


  // Generate a DID String
  // const identifier = await agent.
  // Issue DID based on wallet private key

  // Issue a Credential

  // Public key parsing from wallet, use compressed key

  // Slice public key into X & Y components

  // Sign the credential

  return {
    did,
    signed_vc,
  };
};

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

export const sendToConnector = async (wallet, selectedRole) => {
  console.log("Registeration Processs BEGIN!");
  console.log("Fetching Network Info");

  // Fetch Network based Identifiers
  const networkInfo = await logUserInfo();

  // Check if DID is registered onchain already
  const contract = await contractInstance();
  const result = await checkRegistration(contract, wallet.address);
  console.log("Registration Result:", result);
  if (!result.isSelfOwned) {
    // Already onchain, just prompt for verification
    console.log("Address is registered, Verifying...");
    console.warn("NOTE:: No verification function has been implemented yet!");
    // Proceed with verification
    // Send ZKP that's stored in memory
  } else {
    // Not onchain, proceed with registration
    console.log("Address is not registered");
    // Proceed with registration
    const { did, signed_vc } = await getDIDandVC(wallet, selectedRole);

    const data = {
      wallet_address: wallet.address,
      didStr: did,
      verifiableCredential: signed_vc,
      usernetwork_info: networkInfo,
      requested_role: selectedRole,
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
      const errorLog = await response.json();
      // console.log("Server Error:", errorLog.error);
      console.error("Server Error:", errorLog.error);
      alert(`Server Error: ${errorLog.error}`);
    } else {
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

export const pollForRequestStatus = async (walletAddress) => {
  console.log("Polling for request status...");

  return fetch(`http://localhost:8000/auth/v1/poll/${walletAddress}`)
    .then((response) => {
      if (response.ok) {
        // console.log("Data (response.json): ", response);
        return response.json();
      } else {
        throw new Error("Failed to fetch request status");
      }
    })
    .then((data) => {
      console.log("then data:", data);
      const { request_status, merkle_proof, merkle_hash } = data;
      return { request_status, merkle_proof, merkle_hash };
    })
    .catch((error) => {
      console.error(error);
      return { request_status: null, merkle_proof: null, merkle_hash: null };
    });
};

export const sendToBlockchain = async (wallet, signer) => {
  console.log("Blockchain Registeration Processs BEGIN!");

  // Contract instance - get contract with signer attached
  const contract = await contractInstance();
  // Check if DID is registered onchain already (MOVE this to connector)
  // const result = await checkRegistration(contract, wallet.address);
  // console.log("Registration Result:", result);
  // if (!result.isSelfOwned) {
  //   // Already onchain, just prompt for verification
  //   console.log("Address is registered, Verifying...");
  //   console.log("NOTE:: No verification function has been implemented yet!");
  //   // Proceed with verification
  //   // Send ZKP that's stored in memory
  // } else {
  //   // Not onchain, proceed with registration
  //   console.log("Address is not registered");
  //   // Proceed with registration

  // Make sure signer is connected to a provider that can send transactions

  if (!signer.provider) {
    throw new Error("Signer must be connected to a provider");
  }

  // commit transaction with a properly connected signer
  const connectedContract = contract.connect(signer);
  const tx = await connectedContract.changeOwner(
    wallet.address,
    wallet.address
  );
  // Parse tx
  const txResponse = await tx.getTransaction();
  const txReceipt = await txResponse.wait();
  console.log("Transaction Receipt:", txReceipt);
  console.log("Transaction Logs:", txReceipt.logs);
  console.log("Transaction Hash:", txReceipt.transactionHash);
  console.log("Transaction Status:", txReceipt.status);
  console.log("Transaction Confirmations:", txReceipt.confirmations);
  console.log("Transaction Events:", txReceipt.events);

  console.log("Registeration Processs End!");

  return {
    txHash: txReceipt.transactionHash,
  };
};
