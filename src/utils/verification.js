import { connectorHost, connectorPort } from "./readEnv";

export const verifyMerkleProof = async (
  setIsLoadingTx,
  setCurrentStep,
  setErrorMessage,
  setIsErrorModalOpen,
  navigate
) => {
  setIsLoadingTx(true);
  try {
    // const merkleProof = localStorage.getItem("merkleProof");
    const merkleHash = localStorage.getItem("merkleHash");
    // const merkleProof = localStorage.getItem("merkleProof");
    const did = localStorage.getItem("did");

    const creds = {
      // merkleProof: JSON.parse(merkleProof),
      merkleHash: merkleHash,
      did: did,
    };
    console.log("sending data:", creds);
    const response = await fetch(
      `http://${connectorHost}:${connectorPort}/auth/v1/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(creds),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("Got response", data);
      // setCurrentStep(data.message);
      // Check the results object if both valid-Offchain and valid-Onchain are true then verification is successful
      if (data.results.valid_Offchain && data.results.valid_Onchain) {
        sessionStorage.setItem("access_token", data.access_token || "");
        sessionStorage.setItem("refresh_token", data.refresh_token || "");

        try {
          const verifiableCredential = localStorage.getItem(
            "verifiableCredential"
          );
          if (!verifiableCredential) {
            throw new Error(
              "[VC Verify ERR]: verifiableCredential not found in localStorage"
            );
          }

          const parsedCredential = JSON.parse(verifiableCredential);
          if (
            !parsedCredential.credentialSubject ||
            !parsedCredential.credentialSubject.selectedRole
          ) {
            throw new Error("[VC Verify ERR]: Invalid credential structure");
          }

          const role = parsedCredential.credentialSubject.selectedRole;
          console.log("Role:", role);

          navigate(`/${role}/dashboard`);

          console.log("Verification successful");
          setCurrentStep("Verification successful");
        } catch (error) {
          console.error("Error:", error.message);
        }
      } else {
        console.log(data.message);
        setCurrentStep(data.message);
        setErrorMessage(data.message);
        setIsErrorModalOpen(true);
        document.getElementById("error-modal").showModal();
      }
    } else {
      throw new Error(data.message || "Verification failed, Server Error");
    }
  } catch (error) {
    console.error("Error during verification:", error);
    setErrorMessage(error.message || "Verification failed");
    setIsErrorModalOpen(true);
    document.getElementById("error-modal").showModal();
  } finally {
    setIsLoadingTx(false);
  }
};

export const signChallenge = async (wallet, challenge, navigate) => {
  if (!wallet || !challenge) {
    console.error("Wallet or challenge is not available.");
    return;
  }

  const signature = await wallet.signMessage(challenge);
  console.log("Signed Challenge:", signature);

  // Send signed challenge back to Connector
  const response = await fetch(
    `http://${connectorHost}:${connectorPort}/connector/finalize`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ signature }),
    }
  );

  if (response.ok) {
    const data = await response.json();
    console.log("Registration finalized:", data);
    navigate("/dashboard");
  } else {
    console.error("Failed to finalize registration");
  }
};
