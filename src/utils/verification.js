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
  smt_proofs, // <-- Accept as argument
  verifiable_credential, // <-- Accept as argument
  // verifiablePresentation, // <-- Accept as argument
  hasRetried = false // Add a flag to track retry
) => {
  setIsLoadingTx(true);
  try {
    // For smt_total_verify_time
    const startTime = performance.now();

    // Use the passed verifiable_credential argument
    if (!verifiable_credential) {
      throw new Error("[VC NOT FOUND ERR]: verifiable_credential not provided");
    }
    console.log("VC provided:", !!verifiable_credential);

    // Parse the credential before passing
    const parsedCredential =
      typeof verifiable_credential === "string"
        ? JSON.parse(verifiable_credential)
        : verifiable_credential;

    // Run checks on the wallet
    if (!wallet) {
      throw new Error("[WALLET ERR]: Wallet is not connected");
    } else if (wallet) {
      console.log("Wallet is connected:", wallet.address);
      console.log("Wallet Key", wallet.privateKey);
    }

    // Use the passed smt_proofs argument
    if (!smt_proofs) {
      throw new Error("[SMT NOT FOUND ERR]: smt_proofs not provided");
    }
    console.log("SMT Proofs provided:", !!smt_proofs, "\n", smt_proofs);

    // Parse the smt_proofs
    const parsedSmtProofs =
      typeof smt_proofs === "string" ? JSON.parse(smt_proofs) : smt_proofs;
    if (
      !parsedSmtProofs ||
      parsedSmtProofs.proof === undefined ||
      parsedSmtProofs.key === undefined
    ) {
      throw new Error("[SMT Verify ERR]: Invalid smt_proofs structure");
    }
    console.log("Parsed SMT Proofs:", parsedSmtProofs);

    // Validate the structure of the parsed credential
    if (
      !parsedCredential.credential ||
      !parsedCredential.credential.credentialSubject
    ) {
      throw new Error("[VC Verify ERR]: Invalid credential structure");
    }

    // Use the passed verifiablePresentation argument or generate if not provided
    let vp_gen_time = null;
    const start_time = performance.now();
    const vp = await createPresentationFromCredential(
      parsedCredential,
      agent,
      wallet,
      parsedSmtProofs
    );
    vp_gen_time = performance.now() - start_time;
    console.log(
      "Verifiable Presentation created:",
      vp,
      "in ",
      vp_gen_time,
      "ms"
    );
    if (!vp) {
      throw new Error(
        "[VP Create ERR]: Failed to create Verifiable Presentation"
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
      smt_local_add_time: timesFromLocalStorage.smt_local_add_time || 0,
      smt_onchain_add_time: timesFromLocalStorage.smt_onchain_add_time || null,
      vc_issuance_time: timesFromLocalStorage.vc_issuance_time || null,
      vp_gen_time: vp_gen_time,
    };

    // Now send partial_times alongside the VP (not inside it)
    const payload = {
      verifiablePresentation: vp,
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

    // --- Revoked check ---
    if (
      (data && data.request_status === "revoked") ||
      (data && data.error && data.error.toLowerCase().includes("revoked"))
    ) {
      setCurrentStep(
        data.error ||
          "This DID has been revoked and cannot be verified or used."
      );
      setErrorMessage(
        data.error ||
          "This DID has been revoked and cannot be verified or used."
      );
      setIsErrorModalOpen(true);
      if (document.getElementById("error-modal")) {
        document.getElementById("error-modal").showModal();
      }
      setIsLoadingTx(false);
      return;
    }
    // --- End revoked check ---

    if (response.ok) {
      console.log("Got response", data);

      // Update smt_proofs in localStorage if new proofs are returned
      if (data.smt_proofs) {
        const newProofs = data.smt_proofs;
        // Only update if the passed-in proofs do NOT match the returned ones
        if (JSON.stringify(smt_proofs) !== JSON.stringify(newProofs)) {
          console.warn("SMT proofs do not match. Updating localStorage.");
          localStorage.setItem("smt_proofs", JSON.stringify(newProofs));
        } else {
          console.warn("SMT proofs match, no update needed.");
        }
      }

      // Update the times object in localStorage
      if (data.times) {
        const smt_total_verify_time = performance.now() - startTime;
        const existingTimes = JSON.parse(localStorage.getItem("times")) || {};
        const updatedTimes = {
          ...existingTimes,
          ...data.times,
          smt_total_verify_time,
        };
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
          // Use the passed verifiable_credential argument
          if (!verifiable_credential) {
            throw new Error(
              "[VC Verify ERR]: verifiable_credential not provided"
            );
          }

          const parsedCredential =
            typeof verifiable_credential === "string"
              ? JSON.parse(verifiable_credential)
              : verifiable_credential;
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
          const did = parsedCredential.credential.credentialSubject.did;
          try {
            await updateMetrics(did);
          } catch (error) {
            console.error("Error updating metrics:", error);
          }

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
          // Pass the new smt_proofs to the retry
          const result = await verifyMerkleProof(
            setIsLoadingTx,
            setCurrentStep,
            setErrorMessage,
            setIsErrorModalOpen,
            navigate,
            wallet,
            agent,
            data.smt_proofs, // Pass new proofs
            verifiable_credential, // Pass VC again
            true // Set flag to true on retry
          );
          console.log("Update proofs available:", data.smt_proofs);

          // Compare the received smt_proofs with the returned ones
          const newProofs = data.smt_proofs;
          if (JSON.stringify(smt_proofs) !== JSON.stringify(newProofs)) {
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

export const updateMetrics = async (did_str) => {
  if (!did_str) {
    console.error("DID string is required to update metrics.");
    return;
  }
  // Parse out the required times from the times object in localStorage
  const metrics = JSON.parse(localStorage.getItem("times")) || {};
  console.warn("DID String:", did_str);
  console.log("Metrics from localStorage:", metrics);
  try {
    const response = await fetch(
      `${connectorURL}/auth/v1/update-metrics/${did_str}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send did and times as the body
        body: JSON.stringify(metrics),
      }
    );

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
