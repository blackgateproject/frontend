import { connectorURL } from "../utils/readEnv";
import { createPresentationFromCredential } from "./veramo";
export const verifyMerkleProof = async (
  setIsLoadingTx,
  setCurrentStep,
  setErrorMessage,
  setIsErrorModalOpen,
  navigate,
  wallet,
  agent,
  hasRetried = false // Add a flag to track retry
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

    // Load the smt_proofs from localStorage
    const smt_proofs = localStorage.getItem("smt_proofs");
    console.log("SMT Proofs exists in localStorage:", !!smt_proofs);
    if (!smt_proofs) {
      throw new Error("[VC Verify ERR]: smt_proofs not found in localStorage");
    }

    // Parse the smt_proofs
    const parsedSmtProofs = JSON.parse(smt_proofs);
    if (!parsedSmtProofs || !parsedSmtProofs.proof || !parsedSmtProofs.key) {
      throw new Error("[VC Verify ERR]: Invalid smt_proofs structure");
    }
    console.log("Parsed SMT Proofs:", parsedSmtProofs);

    // Validate the structure of the parsed credential
    if (
      !parsedCredential.credential ||
      !parsedCredential.credential.credentialSubject
    ) {
      throw new Error("[VC Verify ERR]: Invalid credential structure");
    }

    // Generate a VP from the given VC
    const verifiable_presentation = await createPresentationFromCredential(
      parsedCredential,
      agent,
      wallet,
      parsedSmtProofs
    );
    console.log("Verifiable Presentation created:", verifiable_presentation);
    if (!verifiable_presentation) {
      throw new Error(
        "[VC Verify ERR]: Failed to create Verifiable Presentation"
      );
    }

    // Send the Verifiable Presentation to the Connector for verification
    console.log("sending data:", verifiable_presentation);
    const response = await fetch(`${connectorURL}/auth/v1/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verifiable_presentation),
    });

    // Response handling
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Invalid server response");
    }

    if (response.ok) {
      console.log("Got response", data);

      // Update smt_proofs in localStorage if new proofs are returned
      if (data.smt_proofs) {
        const existingProofs =
          JSON.parse(localStorage.getItem("smt_proofs")) || [];
        const newProofs = data.smt_proofs;

        if (JSON.stringify(existingProofs) !== JSON.stringify(newProofs)) {
          console.warn("SMT proofs do not match. Updating localStorage.");
          localStorage.setItem("smt_proofs", JSON.stringify(newProofs));
        } else {
          console.warn("SMT proofs match, no update needed.");
        }
      }

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
    } else if (response.status === 409) {
      // 409: update proofs and retry
      console.warn("Returned Data:", data);
      console.error("Verification conflict:", data.message);
      setCurrentStep(data.message || "Verification conflict");
      setErrorMessage(data.message || "Verification conflict");
      setIsErrorModalOpen(true);
      document.getElementById("error-modal").showModal();

      if (data.smt_proofs) {
        // Retry only if not already retried
        if (!hasRetried) {
          const result = await verifyMerkleProof(
            setIsLoadingTx,
            setCurrentStep,
            setErrorMessage,
            setIsErrorModalOpen,
            navigate,
            wallet,
            agent,
            true // Set flag to true on retry
          );
          console.log("Update proofs available:", data.smt_proofs);

          // Compare the recieved smt_proofs with the existing ones in localStorage
          const existingProofs =
            JSON.parse(localStorage.getItem("smt_proofs")) || [];
          const newProofs = data.smt_proofs;

          if (JSON.stringify(existingProofs) !== JSON.stringify(newProofs)) {
            console.warn("SMT proofs do not match. Updating localStorage.");
            localStorage.setItem("smt_proofs", JSON.stringify(newProofs));
          } else {
            console.log("SMT proofs match, no update needed.");
          }
          return result;
        } else {
          // Show error modal and message if retry fails
          const errorMsg = "SMT proof is corrupted or invalid after retry.";
          setCurrentStep(errorMsg);
          setErrorMessage(errorMsg);
          setIsErrorModalOpen(true);
          if (document.getElementById("error-modal")) {
            document.getElementById("error-modal").showModal();
          }
          console.error(errorMsg);
          return;
        }
      } else {
        throw new Error("409 received but no smt_proofs provided");
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
