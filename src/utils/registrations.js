import { SigningKey } from "ethers";
import { connectorURL } from "../utils/readEnv";
import { logUserInfo } from "./secUtils";
import {
  createLDCredentialWithEthrIssuer,
  importEthrDID,
  verifyDIDDoc,
} from "./veramo";

// Generate DID
export const generateDID = async (wallet, agent) => {
  if (!wallet) {
    console.error("Wallet is not loaded.");
    return;
  }

  if (!agent) {
    console.error("Veramo agent is not provided");
    throw new Error("Veramo agent is required");
  }

  let newUncompPubKey = SigningKey.computePublicKey(wallet.privateKey, true);
  if (newUncompPubKey instanceof Uint8Array) {
    newUncompPubKey = hexlify(newUncompPubKey);
  }

  const didDoc = await importEthrDID(
    agent,
    wallet.privateKey.slice(2),
    newUncompPubKey
  );

  console.log("Issuer:", didDoc);
  return didDoc;
};

// Resolve DID
export const resolveDID = async (agent, did) => {
  console.warn("Verifying DID Document...");
  const resolvedDid = await verifyDIDDoc(agent, did);
  if (resolvedDid) {
    console.log("DID Document is valid.");
  } else {
    console.error("DID Document is invalid.\n", resolvedDid);
  }
  return resolvedDid;
};

// Issue VC
export const issueVC = async (didDoc, agent, formData) => {
  console.warn("Issuing Credential...");
  console.log("formData:", formData);
  const signed_vc = await createLDCredentialWithEthrIssuer(
    didDoc,
    agent,
    formData
  );
  return signed_vc;
};

// Validate VC
export const validateVC = async (agent, signed_vc) => {
  console.warn("Verifying Credential...");
  const verified_vc = await agent.verifyCredential({
    credential: signed_vc,
  });
  if (!verified_vc || verified_vc.verified === false) {
    console.error("Credential is invalid.\n", verified_vc);
  } else {
    console.log("Credential is valid.", verified_vc);
  }
  return verified_vc;
};

// Submit DID + VC
export const submitDIDVC = async (wallet, did, signed_vc, formData) => {
  console.log("Registeration Processs BEGIN!");
  console.log("Fetching Network Info");

  const networkInfo = await logUserInfo();

  //If the user is in test mode, we need randomized networkInfo
  const testMode = signed_vc.credentialSubject?.testMode || false;
  if (testMode) {
    networkInfo.location_lat = Math.random() * 180 - 90; // Random latitude
    networkInfo.location_long = Math.random() * 360 - 180; // Random longitude
    // Random Global IPv4 Address X.X.X.X
    networkInfo.ip_address =
      Math.floor(Math.random() * 256).toString() +
      "." +
      Math.floor(Math.random() * 256).toString() +
      "." +
      Math.floor(Math.random() * 256).toString() +
      "." +
      Math.floor(Math.random() * 256).toString();
    networkInfo.user_agent = "This is a test user agent";
  }
  // Randomly select from a list of languages
  const languages = ["en-US", "es-ES", "fr-FR", "de-DE", "zh-CN"];
  networkInfo.user_language =
    languages[Math.floor(Math.random() * languages.length)];

  const data = {
    alias: formData.alias,
    wallet_address: wallet.address,
    didStr: did,
    verifiableCredential: signed_vc,
    usernetwork_info: networkInfo,
    requested_role: formData.selectedRole,
  };
  console.log("Data:", data);

  const response = await fetch(`${connectorURL}/auth/v1/register`, {
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
  } else if (response.status === 500) {
    const errorLog = await response.json();
    console.error("Server Error:", errorLog.error);
    alert(`Server Error: ${errorLog.error}`);
  } else {
    console.error("Failed to finalize registration");
  }
  console.log("Registeration Processs End!");
  return response.ok;
};

// Poll for request status
export const pollForRequestStatus = async (walletAddress) => {
  console.log("Polling for request status...");

  return fetch(`${connectorURL}/auth/v1/poll/${walletAddress}`)
    .then((response) => {
      if (response.ok) {
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
          // merkle_proof,
          merkle_root,
          tx_hash,
          request_status,
        } = data;
        return {
          message,
          merkle_hash,
          // merkle_proof,
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
        // merkle_proof: null,
        merkle_hash: null,
        merkle_root: null,
        tx_hash: null,
      };
    });
};
