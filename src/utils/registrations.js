import { issueCredential, resolveDID } from "@spruceid/didkit-wasm";
import { Buffer } from "buffer";
import { ethers, SigningKey } from "ethers";
import { contractInstance } from "./contractInteractions";
import { logUserInfo } from "./secUtils";

export const getDIDandVC = async (wallet, role) => {
  if (!wallet) {
    console.error("Wallet is not loaded.");
    return;
  }
  const did = "did:ethr:" + wallet.address;
  console.log("DID:", did);
  const didDoc = await resolveDID(String(did), "{}");
  console.log("DID Document:", didDoc);
  const credential = JSON.stringify({
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiableCredential"],
    issuer: did,
    credentialSubject: { id: "did:example:123" },
    issuanceDate: new Date().toISOString(),
  });

  console.log("Credential:", credential);
  const proof_options = JSON.stringify({
    proofPurpose: "assertionMethod",
    verificationMethod: `${did}#controller`,
  });

  console.log("Proof Options:", proof_options);

  let newUncompPubKey = SigningKey.computePublicKey(wallet.privateKey, false);
  // console.log("New Uncompressed Public Key:", newUncompPubKey);
  if (newUncompPubKey instanceof Uint8Array) {
    newUncompPubKey = hexlify(newUncompPubKey);
  }

  // Remove the '0x04' prefix
  const rawPubKey = newUncompPubKey.startsWith("0x04")
    ? newUncompPubKey.slice(4)
    : newUncompPubKey;
  const newRawPubKey = "0x" + rawPubKey;
  // console.log("Public Key with 0x prefix:", newRawPubKey);

  const xPubKey = Buffer.from(newRawPubKey.slice(2, 66), "hex")
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const yPubKey = Buffer.from(newRawPubKey.slice(66), "hex")
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  // console.log("X Public Key:", xPubKey);
  // console.log("Y Public Key:", yPubKey);
  const jwk = JSON.stringify({
    kty: "EC",
    crv: "secp256k1",
    d: Buffer.from(wallet.privateKey.slice(2), "hex")
      .toString("base64")
      .replace(/=+$/, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_"),
    x: xPubKey,
    y: yPubKey,
    // y: Buffer.from(wallet.publicKey.slice(32), "hex")
    // .toString("base64")
    // .replace(/=+$/, "")
    // .replace(/\+/g, "-")
    // .replace(/\//g, "_"),
  });
  // console.log("Wallet Private Key:", wallet.privateKey);
  // const Uint8ArrayKey = new Uint8Array(Buffer.from(wallet.privateKey.slice(2), "hex"));
  // const jwk = await exportJWK(Uint8ArrayKey)

  console.log("JWK:", jwk);
  const signed_vc = await issueCredential(
    credential,
    proof_options,
    jwk
    // "{}",
    // "{}",
    // String(wallet.privateKey)
    // "{}"
  );
  console.log("Signed VC:", signed_vc);

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
      // console.log("then data:", data);
      return data.request_status;
    })
    .catch((error) => {
      console.error(error);
      return null;
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
