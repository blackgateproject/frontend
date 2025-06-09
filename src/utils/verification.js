import { connectorURL } from "../utils/readEnv";
import { createPresentationFromCredential } from "./veramo";
export const verifyMerkleProof = async (
  setIsLoadingTx,
  setCurrentStep,
  setErrorMessage,
  setIsErrorModalOpen,
  navigate,
  wallet,
  agent
) => {
  setIsLoadingTx(true);
  try {
    const verifiable_credential = localStorage.getItem("verifiable_credential");
    console.log("VC exists in localStorage:", !!verifiable_credential);
    if (!verifiable_credential) {
      throw new Error(
        "[VC Verify ERR]: verifiable_credential not found in localStorage"
      );
    }

    // Parse the credential before passing
    const parsedCredential = JSON.parse(verifiable_credential);

    // Run checks on the wallet
    if (!wallet) {
      throw new Error("[VC Verify ERR]: Wallet is not connected");
    } else if (wallet) {
      console.log("Wallet is connected:", wallet.address);
      console.log("Wallet Key", wallet.privateKey);
    }

    // Generate a VP from the given VC
    const verifiable_presentation = await createPresentationFromCredential(
      parsedCredential,
      agent,
      wallet
    );
    console.log("Verifiable Presentation created:", verifiable_presentation);
    if (!verifiable_presentation) {
      throw new Error(
        "[VC Verify ERR]: Failed to create Verifiable Presentation"
      );
    }

    console.log("sending data:", verifiable_presentation);
    const response = await fetch(`${connectorURL}/auth/v1/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verifiable_presentation),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Got response", data);

      // Debug the results structure
      console.log("Results structure:", data.results);
      console.log("Access token exists:", !!data.access_token);
      console.log("Refresh token exists:", !!data.refresh_token);

      // Store tokens regardless of validation results
      if (data.access_token) {
        sessionStorage.setItem("access_token", data.access_token);
        console.log("Access token stored in session");
      }

      if (data.refresh_token) {
        sessionStorage.setItem("refresh_token", data.refresh_token);
        console.log("Refresh token stored in session");
      }

      // Check the results object if both valid-Offchain and valid-Onchain are true then verification is successful
      if (
        data.results &&
        ((data.results.valid_Offchain && data.results.valid_Onchain) ||
          (data.results.validOffchain && data.results.validOnchain))
      ) {
        try {
          const verifiable_credential = localStorage.getItem(
            "verifiable_credential"
          );
          if (!verifiable_credential) {
            throw new Error(
              "[VC Verify ERR]: verifiable_credential not found in localStorage"
            );
          }

          const parsedCredential = JSON.parse(verifiable_credential);
          if (
            !parsedCredential.credential ||
            !parsedCredential.credential.credentialSubject ||
            !parsedCredential.credential.credentialSubject.selected_role
          ) {
            throw new Error("[VC Verify ERR]: Invalid credential structure");
          }

          const role =
            parsedCredential.credential.credentialSubject.selected_role;
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
  const response = await fetch(`${connectorURL}/connector/finalize`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ signature }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log("Registration finalized:", data);
    navigate("/dashboard");
  } else {
    console.error("Failed to finalize registration");
  }
};
