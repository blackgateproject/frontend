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
  return response;
};

// Poll for request status
export const pollForRequestStatus = async (did_str, proof_type) => {
  console.log(`Polling for ${proof_type} request status...`);

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
        const { message, verifiable_credential, request_status } = data;
        return {
          message,
          verifiable_credential,
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
        verifiable_credential: null,
        tx_hash: null,
      };
    });
};
