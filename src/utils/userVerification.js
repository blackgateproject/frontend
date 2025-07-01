/**
 * Shared user verification utilities
 * This file contains the EXACT verification logic from TestParallel.jsx
 * to ensure no code duplication between frontend and testing scripts.
 */

import { verifyMerkleProof } from "./verification";

/**
 * EXACT verification logic from TestParallel.jsx handleVerifySubmit function
 * This function replicates the exact verification logic to ensure consistency
 *
 * @param {Array} users - Array of users to verify from
 * @param {number} verifyUsers - Number of users to verify
 * @param {Object} veramoOperations - Veramo operations for VP creation
 * @param {Object} agent - Veramo agent instance
 * @param {Object} stateSetters - Optional React state setters (for frontend use)
 * @returns {Promise<Object>} Verification results with timing metrics
 */
export async function performUserVerification(
  users,
  verifyUsers,
  veramoOperations,
  agent,
  stateSetters = {}
) {
  console.log(`Verifying ${verifyUsers} users`);

  const {
    setSuccessfulVerifications = () => {},
    setFailedVerifications = () => {},
    setUsers = () => {},
    setIsLoadingTx = () => {},
    setCurrentStep = () => {},
    setErrorMessage = () => {},
    setIsErrorModalOpen = () => {},
  } = stateSetters;

  // Initialize counters
  let successfulVerifications = 0;
  let failedVerifications = 0;
  let totalTime = 0;
  let fastestTime = Infinity;
  let longestTime = 0;
  let currentStep = "";
  let errorMessage = "";

  // Reset state counters
  setSuccessfulVerifications(0);
  setFailedVerifications(0);

  const usersToVerify = Math.min(verifyUsers, users.length);
  const selectedUsers = [];

  // Select random users for verification
  for (let i = 0; i < usersToVerify; i++) {
    const randomIndex = Math.floor(Math.random() * users.length);
    selectedUsers.push(users[randomIndex]);
  }

  // Store verification results for each user
  const verificationResults = [];
  const updatedUsers = [...users];

  // Process each user verification sequentially (as in original)
  for (let i = 0; i < selectedUsers.length; i++) {
    const startTime = performance.now();
    const user = selectedUsers[i];
    console.log(`Verifying user ${i + 1}:`, user);

    // Get VC, SMT proofs, and generate VP for this user
    const vc = user.verifiable_credential;
    const smtProofs = user.smt_proofs;
    const wallet = user.wallet;

    let vp = null;
    let verificationResult = {
      userIndex: i,
      did: user.did,
      success: false,
      step: "",
      error: null,
      timeTaken: 0,
    };

    try {
      // Generate VP if needed (EXACT logic from TestParallel.jsx)
      if (user.verifiable_presentation) {
        vp = user.verifiable_presentation;
      } else if (vc && wallet) {
        vp = await veramoOperations.performCreatePresentation(vc, wallet);
      }
    } catch (err) {
      console.error("Failed to generate VP for user:", err);

      // Update user verification status (EXACT logic from TestParallel.jsx)
      const userIndex = updatedUsers.findIndex((u) => u.did === user.did);
      if (userIndex !== -1) {
        updatedUsers[userIndex] = {
          ...updatedUsers[userIndex],
          verification: {
            status: "failed",
            step: "VP Generation",
            error: err.message,
          },
        };
      }

      verificationResult.error = err.message;
      verificationResult.step = "VP Generation";
      failedVerifications++;
      setFailedVerifications(failedVerifications);

      const endTime = performance.now();
      const timeTaken = endTime - startTime;
      verificationResult.timeTaken = timeTaken;
      verificationResults.push(verificationResult);

      totalTime += timeTaken;
      if (timeTaken < fastestTime) fastestTime = timeTaken;
      if (timeTaken > longestTime) longestTime = timeTaken;

      continue;
    }

    try {
      // EXACT verification logic from TestParallel.jsx
      await verifyMerkleProof(
        setIsLoadingTx,
        (step) => {
          currentStep = step;
          setCurrentStep(step);
        },
        (error) => {
          errorMessage = error;
          setErrorMessage(error);
        },
        setIsErrorModalOpen,
        () => {}, // navigate, you can replace with your navigation logic
        wallet,
        agent,
        smtProofs,
        vc,
        false
      );

      // Update user verification status - SUCCESS (EXACT logic from TestParallel.jsx)
      const userIndex = updatedUsers.findIndex((u) => u.did === user.did);
      if (userIndex !== -1) {
        updatedUsers[userIndex] = {
          ...updatedUsers[userIndex],
          verification: {
            status: "success",
            step: currentStep,
            error: null,
          },
        };
      }

      verificationResult.success = true;
      verificationResult.step = currentStep;
      successfulVerifications++;
      setSuccessfulVerifications(successfulVerifications);
    } catch (error) {
      // Update user verification status - FAILURE (EXACT logic from TestParallel.jsx)
      const userIndex = updatedUsers.findIndex((u) => u.did === user.did);
      if (userIndex !== -1) {
        updatedUsers[userIndex] = {
          ...updatedUsers[userIndex],
          verification: {
            status: "failed",
            step: currentStep,
            error: errorMessage || error.message,
          },
        };
      }

      verificationResult.error = errorMessage || error.message;
      verificationResult.step = currentStep;
      failedVerifications++;
      setFailedVerifications(failedVerifications);
    }

    const endTime = performance.now();
    const timeTaken = endTime - startTime;
    verificationResult.timeTaken = timeTaken;
    verificationResults.push(verificationResult);

    totalTime += timeTaken;
    if (timeTaken < fastestTime) fastestTime = timeTaken;
    if (timeTaken > longestTime) longestTime = timeTaken;
  }

  // Update users state with verification results
  setUsers(updatedUsers);

  // EXACT logging logic from TestParallel.jsx
  console.log(
    "All users:",
    updatedUsers.map((u) => ({
      did: u.did,
      smt_proofs: u.smt_proofs,
      alias: u.verifiable_credential?.credential?.credentialSubject?.alias,
      verification: u.verification,
    }))
  );

  // Return verification results with timing metrics
  return {
    success: true,
    verificationResults,
    totalTime,
    fastestTime: fastestTime === Infinity ? 0 : fastestTime,
    longestTime,
    averageTime: totalTime / selectedUsers.length,
    successfulVerifications,
    failedVerifications,
    totalVerified: selectedUsers.length,
    successRate:
      selectedUsers.length > 0
        ? successfulVerifications / selectedUsers.length
        : 0,
    updatedUsers,
  };
}

/**
 * Simplified verification function for testing environments without React state
 * This maintains the same logic but returns results instead of updating state
 *
 * @param {Array} users - Array of users to verify from
 * @param {number} verifyUsers - Number of users to verify
 * @param {Object} veramoOperations - Veramo operations for VP creation
 * @param {Object} agent - Veramo agent instance
 * @returns {Promise<Object>} Verification results with timing metrics
 */
export async function performUserVerificationSimple(
  users,
  verifyUsers,
  veramoOperations,
  agent
) {
  // Use the full verification function but with empty state setters
  return await performUserVerification(
    users,
    verifyUsers,
    veramoOperations,
    agent,
    {} // Empty state setters for non-React environments
  );
}
