import { connectorHost, connectorPort } from "./readEnv";
export const verifyMerkleProof = async (
  setIsLoadingTx,
  setCurrentStep,
  setErrorMessage,
  setIsErrorModalOpen
) => {
  setIsLoadingTx(true);
  try {
    const merkleProof = localStorage.getItem("merkleProof");
    const merkleHash = localStorage.getItem("merkleHash");

    const response = await fetch(
      `http://${connectorHost}:${connectorPort}}/auth/v1/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merkle_proof: JSON.parse(merkleProof),
          merkle_hash: merkleHash,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("Verification successful:", data);
      setCurrentStep("Verification successful!");
      // Handle successful verification (e.g., navigate to dashboard)
      // navigate("/dashboard");
    } else {
      throw new Error(data.message || "Verification failed");
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
