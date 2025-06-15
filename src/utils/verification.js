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
    const start_time = performance.now();
    const verifiablePresentation = await createPresentationFromCredential(
      parsedCredential,
      agent,
      wallet,
      parsedSmtProofs
    );
    const vp_gen_time = performance.now() - start_time;
    console.log(
      "Verifiable Presentation created:",
      verifiablePresentation,
      "in ",
      vp_gen_time,
      "ms"
    );
    if (!verifiablePresentation) {
      throw new Error(
        "[VC Verify ERR]: Failed to create Verifiable Presentation"
      );
    }

    // After generating vp_gen_time and before sending the fetch request:
    const timesFromLocalStorage =
      JSON.parse(localStorage.getItem("times")) || {};

    const partial_times = {
      wallet_gen_time:
        parsedCredential.credential.credentialSubject.walletCreateTime || null,
      wallet_enc_time:
        parsedCredential.credential.credentialSubject.walletEncryptTime || null,
      network_info_time:
        parsedCredential.credential.credentialSubject.networkInfo
          ?.user_info_time || null,
      smt_local_add_time: timesFromLocalStorage.smt_local_add_time || null,
      smt_onchain_add_time: timesFromLocalStorage.smt_onchain_add_time || null,
      vc_issuance_time: timesFromLocalStorage.vc_issuance_time || null,
      vp_gen_time: vp_gen_time || null,
    };

    // Now send partial_times alongside the VP (not inside it)
    const payload = {
      verifiablePresentation,
      partial_times,
    };

    // Send the Verifiable Presentation to the Connector for verification
    console.log("sending data:", payload);
    const verify_start_time = performance.now();
    setCurrentStep("Verifying your credentials...");
    const response = await fetch(`${connectorURL}/auth/v1/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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

      // Update the times object in localStorage
      if (data.times) {
        const existingTimes = JSON.parse(localStorage.getItem("times")) || {};
        const updatedTimes = { ...existingTimes, ...data.times };
        localStorage.setItem("times", JSON.stringify(updatedTimes));
        console.log("Updated times in localStorage:", updatedTimes);
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
          const verification_time = performance.now() - verify_start_time;
          console.log("Verification completed in", verification_time, "ms");
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
          console.log("Verification successful");
          const verification_time = performance.now() - verify_start_time;
          console.log("Verification completed in", verification_time, "ms");
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

export const updateMetrics = async (
  verifiable_credential,
  verifiablePresentation,
  smt_proofs
) => {
  /*
  class timesOfTime(BaseModel):
    add_user_time: Optional[float] = None
    wallet_gen_time: Optional[float] = None
    wallet_enc_time: Optional[float] = None
    network_info_time: Optional[float] = None
    zkp_gen_time: Optional[float] = None
    proof_gen_time: Optional[float] = None
    onchain_add_time: Optional[float] = None
    onchain_verify_time: Optional[float] = None
    vc_issue_time: Optional[float] = None
    vc_verify_time: Optional[float] = None
    vp_gen_time: Optional[float] = None
    vp_verify_time: Optional[float] = None

    connectorUrl = auth/v1/update-metrics/${did}

    use the VC, VP, and smt_proofs passed to update the metrics on connector
   */
  if (!verifiable_credential || !verifiablePresentation || !smt_proofs) {
    console.error("Missing required parameters for updating metrics.");
    return;
  }
  // Parse out the required times from the verifiable_credential and verifiablePresentation and SMT_proofs, it will be long object
  const timesOfTime = {
    add_user_time: verifiable_credential.add_user_time || null,
    wallet_gen_time: verifiable_credential.wallet_gen_time || null,
    wallet_enc_time: verifiable_credential.wallet_enc_time || null,
    network_info_time: verifiable_credential.network_info_time || null,
    zkp_gen_time: verifiablePresentation.zkp_gen_time || null,
    proof_gen_time: verifiablePresentation.proof_gen_time || null,
    onchain_add_time: verifiablePresentation.onchain_add_time || null,
    onchain_verify_time: verifiablePresentation.onchain_verify_time || null,
    vc_issue_time: verifiable_credential.vc_issue_time || null,
    vc_verify_time: verifiable_credential.vc_verify_time || null,
    vp_gen_time: verifiablePresentation.vp_gen_time || null,
    vp_verify_time: verifiablePresentation.vp_verify_time || null,
  };

  try {
    const response = await fetch(`${connectorURL}/auth/v1/update-metrics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        verifiable_credential,
        verifiablePresentation,
        smt_proofs,
        timesOfTime,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Metrics updated successfully:", data);
    } else {
      const errorData = await response.json();
      console.error("Failed to update metrics:", errorData.message);
    }
  } catch (error) {
    console.error("Error updating metrics:", error);
  }

  console.log("Metrics update request sent.");
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

// export const updateMetrics = async()-> {
