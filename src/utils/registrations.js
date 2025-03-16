import { SigningKey } from "ethers";
import { logUserInfo } from "./secUtils";
import {
  createLDCredentialWithEthrIssuer,
  importEthrDID,
  verifyDIDDoc,
} from "./veramo";
// Modified to accept agent as a parameter instead of calling useVeramo() inside
export const getDIDandVC = async (wallet, role, agent) => {
  // Check for wallet
  if (!wallet) {
    console.error("Wallet is not loaded.");
    return;
  }

  // Use the agent that was passed in instead of calling useVeramo() here
  if (!agent) {
    console.error("Veramo agent is not provided");
    throw new Error("Veramo agent is required");
  }

  let newUncompPubKey = SigningKey.computePublicKey(wallet.privateKey, true);
  if (newUncompPubKey instanceof Uint8Array) {
    newUncompPubKey = hexlify(newUncompPubKey);
  }
  // console.log("New Uncompressed Public Key:", newUncompPubKey);
  const didDoc = await importEthrDID(
    agent,
    wallet.privateKey.slice(2),
    newUncompPubKey
  );

  console.log("Issuer:", didDoc);
  const did = didDoc.did;

  console.warn("Got DID & DID Document\n\nVerifying DID Document...");
  // Verify DID Document via Resolution
  const resolvedDid = await verifyDIDDoc(agent, did);
  if (resolvedDid) {
    console.log("DID Document is valid.");
  } else {
    console.error("DID Document is invalid.\n", resolvedDid);
  }

  // Issue Credential, figure out a way to pass return the VC with Supabase's JWT
  console.warn("Issuing Credential...");
  const signed_vc = await createLDCredentialWithEthrIssuer(didDoc, agent, role);

  // Verify Credential
  console.warn("Verifying Credential...");
  const verified_vc = await agent.verifyCredential({
    credential: signed_vc,
  });
  if (!verified_vc || verified_vc.verified === false) {
    console.error("Credential is invalid.\n", verified_vc);
  } else {
    console.log("Credential is valid.", verified_vc);
  }

  return {
    did,
    signed_vc,
  };
};

// Modified to accept agent as a parameter
export const sendToConnector = async (wallet, selectedRole, agent) => {
  console.log("Registeration Processs BEGIN!");
  console.log("Fetching Network Info");

  // Fetch Network based Identifiers
  const networkInfo = await logUserInfo();

  // Pass the agent to getDIDandVC
  const { did, signed_vc } = await getDIDandVC(wallet, selectedRole, agent);
  console.log("DID:", did);
  console.log("Signed VC:", signed_vc);

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
  console.log("Registeration Processs End!");
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
      if (data) {
        console.log("then data:", data);
        const {
          message,
          merkle_hash,
          merkle_proof,
          merkle_root,
          tx_hash,
          request_status,
        } = data;
        return {
          message,
          merkle_hash,
          merkle_proof,
          merkle_root,
          tx_hash,
          request_status,
        };
      } else {
        throw new Error("Received null data");
      }
    })
    .catch((error) => {
      console.error(error);
      return {
        message: "Error occurred while polling",
        request_status: null,
        merkle_proof: null,
        merkle_hash: null,
        merkle_root: null,
        tx_hash: null,
      };
    });
};
