import { connectorURL } from "../utils/readEnv";
import { logUserInfo } from "./secUtils";
console.log(`BACKEND URL: ${connectorURL}`);

// Submit DID + FormData
export const submitDID = async (formData) => {
  console.log("Registeration Processs BEGIN!");
  console.log("Fetching Network Info");

  const networkInfo = await logUserInfo();

  const data = {
    formData: formData,
    networkInfo: networkInfo,
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

  let result = {};
  if (response.ok) {
    const data = await response.json();
    console.log("Registration finalized:", data);
    // Return all relevant fields, including smt_proofs if present
    result = {
      ...data,
      smt_proofs: data.smt_proofs || null,
    };
  } else if (response.status === 500) {
    const errorLog = await response.json();
    console.error("Server Error:", errorLog.error);
    alert(`Server Error: ${errorLog.error}`);
    result = { error: errorLog.error };
  } else {
    console.error("Failed to finalize registration");
    result = { error: "Failed to finalize registration" };
  }
  console.log("Registeration Processs End!");
  return result;
};

// Poll for request status
export const pollForRequestStatus = async (did_str, proof_type) => {
  console.log(`Polling for "${proof_type}" request status...`);

  return fetch(`${connectorURL}/auth/v1/poll/${did_str}`)
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
        const { message, verifiable_credential, request_status, smt_proofs } =
          data;
        return {
          message,
          verifiable_credential,
          request_status,
          smt_proofs,
        };
      } else {
        throw new Error("Received null data");
      }
    })
    .catch((error) => {
      console.error(error);
      return {
        message: "Error occurred while polling",
        verifiable_credential: null,
        tx_hash: null,
      };
    });
};

/**
 * Send a Verifiable Presentation (VP) to the connector server for verification.
 * @param {object} vp - The Verifiable Presentation object.
 * @returns {Promise<object>} - The verification result from the server.
 */
export async function verifyPresentation(vp) {
  try {
    const response = await fetch(`${connectorURL}/auth/v1/verify-vp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vp),
    });
    if (!response.ok) {
      throw new Error(`Verification failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    return { error: err.message };
  }
}
