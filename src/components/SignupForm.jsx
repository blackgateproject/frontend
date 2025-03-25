import { ethers } from "ethers";
import { KeySquare, Loader2 } from "lucide-react";
import React, { useState } from "react";
import logo from "../assets/logo.png";
import { useVeramoOperations } from "../hooks/useVeramoOperations";
import { createNewWallet, loadWallet } from "../utils/contractInteractions";
import { pollForRequestStatus } from "../utils/registrations";
import VerticalProgressIndicator from "./VerticalProgressIndicator"; // Import the progress indicator

const SignupForm = ({
  onClose,
  walletExists,
  setWalletExists,
  setWallet,
  setSigner,
  setIsWalletLoaded,
  setErrorMessage,
  setIsErrorModalOpen,
  wallet,
  isSetupPage = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("user");
  const [formData, setFormData] = useState({
    did: "",
    alias: "",
    // publicKey: "",
    selectedRole: "",
    firmwareVersion: "",
  });
  const [errors, setErrors] = useState({});
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [walletPassword, setWalletPassword] = useState("");
  const [confirmWalletPassword, setConfirmWalletPassword] = useState("");
  const [showWalletPasswordModal, setShowWalletPasswordModal] = useState(false);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [walletLocal, setWalletLocal] = useState(null);
  const [signer, setSignerLocal] = useState(null);
  const [isRejected, setIsRejected] = useState(false);
  const {
    performSendToConnector,
    performGenerateDID,
    performResolveDID,
    performIssueVC,
    performValidateVC,
    performSubmitDIDVC,
  } = useVeramoOperations();
  const [showProgress, setShowProgress] = useState(false); // State to show progress indicator
  const [currentStep, setCurrentStep] = useState(0); // Add currentStep state
  const steps = [
    "Generate DID📝",
    "Resolve DID ✅",
    "Issue VC📝",
    "Validate VC ✅",
    "Submit DID + VC📤",
    "Pending Approval 🕒",
  ]; // Define steps

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    // console.log(`Handling Change for ${name}: value is ${value}`)
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Generate random DID and public key
  const generateKeys = async () => {
    setShowWalletPasswordModal(true);
  };

  const handleWalletPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsGeneratingKeys(true);
    setIsLoadingWallet(true);

    if (walletExists) {
      // Try to load existing wallet
      if (!walletPassword) {
        setErrors({ walletPassword: "Password is required" });
        setIsGeneratingKeys(false);
        setIsLoadingWallet(false);
        return;
      }

      try {
        const { wallet: walletObj, signer: signerObj } = await loadWallet(
          localStorage.getItem("encryptedWallet"),
          walletPassword,
          setWallet, // Now properly defined
          setIsWalletLoaded,
          setIsLoadingWallet,
          () => {},
          setSigner // Now properly defined
        );

        // Also update local state
        setWalletLocal(walletObj);
        setSignerLocal(signerObj);

        // Get wallet address and use it to create DID
        // const address = walletObj.address;
        setFormData({
          ...formData,
          did: `did:ethr:${walletObj.publicKey}`,
          // publicKey: walletObj.publicKey || `0x${address.substring(2)}`,
        });

        setShowWalletPasswordModal(false);
      } catch (error) {
        console.error(error.message);
        setErrorMessage(error.message); // Now properly defined
        setIsErrorModalOpen(true);
      }
    } else {
      // Create a new wallet
      if (!walletPassword) {
        setErrors({ walletPassword: "Password is required" });
        setIsGeneratingKeys(false);
        setIsLoadingWallet(false);
        return;
      }

      if (walletPassword !== confirmWalletPassword) {
        setErrors({ confirmWalletPassword: "Passwords do not match" });
        setIsGeneratingKeys(false);
        setIsLoadingWallet(false);
        return;
      }

      try {
        // Create a new random wallet
        const randomWallet = ethers.Wallet.createRandom();

        // Set the DID and public key
        setFormData({
          ...formData,
          did: `did:ethr:${randomWallet.publicKey}`,
          // publicKey: randomWallet.publicKey,
        });

        // Create encrypted wallet
        await createNewWallet(walletPassword, setWalletExists, setWallet);

        setShowWalletPasswordModal(false);
      } catch (error) {
        console.error("Error creating wallet:", error);
        setErrorMessage(error.message || "Failed to create wallet");
        setIsErrorModalOpen(true);
      }
    }

    setIsGeneratingKeys(false);
    setIsLoadingWallet(false);
  };

  // Add this function for copying text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        console.log("Text copied to clipboard");
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  // Validate the form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.did) {
      newErrors.did = "Wallet needs to be unlocked/generated";
    }


    if (!formData.alias) {
      console.warn("Alias is empty");
      newErrors.alias = "Alias cannot be empty";
    }

    if (selectedRole === "device") {
      // if (!formData.deviceId) {
      //   newErrors.deviceId = "Device ID is required";
      // }

      if (!formData.firmwareVersion) {
        newErrors.firmwareVersion = "Firmware version is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Submitted");
    if (!validateForm()) {
      console.log("Validation Failed");
      return;
    }

    setShowProgress(true); // Show progress indicator when registration starts

    setIsLoading(true);

    try {
      // Check if wallet is initialized
      if (!wallet) {
        throw new Error(
          "Wallet not initialized. Please generate or unlock keys first."
        );
      }

      const updatedFormData = {
        // test: "extra-role-got added",
        selectedRole: selectedRole,
        alias: formData.alias,
        firmwareVersion: formData.firmwareVersion,
      };

      console.warn("Form Data:", updatedFormData);
      
      // Generate DID
      setCurrentStep(1);
      const didDoc = await performGenerateDID(wallet);
      const did = didDoc.did;

      // Resolve DID
      setCurrentStep(2);
      await performResolveDID(didDoc.did);

      // Issue VC
      setCurrentStep(3);
      const signed_vc = await performIssueVC(didDoc, updatedFormData);

      // Validate VC
      setCurrentStep(4);
      await performValidateVC(signed_vc);

      // Submit DID + VC
      setCurrentStep(5);
      await performSubmitDIDVC(wallet, didDoc.did, signed_vc, updatedFormData);

      console.log("Form submitted:", {
        ...formData,
        role: selectedRole,
        firmwareVersion: formData.firmwareVersion,
      });

      // Set up polling for request status
      console.log("Starting polling for request status...");

      // Maximum polling attempts (30 attempts * 5 seconds = 150 seconds total)
      const maxAttempts = 30;
      let attempts = 0;

      const checkRequestStatus = async () => {
        if (attempts >= maxAttempts) {
          setErrorMessage("Request timed out. Please try again later.");
          setIsErrorModalOpen(true);
          setIsLoading(false);
          return;
        }

        attempts++;
        console.log(`Polling attempt ${attempts}/${maxAttempts}`);

        try {
          // Await the result of pollForRequestStatus
          const status = await pollForRequestStatus(wallet.address);
          console.log("Polling result:", status);

          if (status && status.request_status) {
            console.warn("Request Status:", status.request_status);

            switch (status.request_status) {
              case "approved":
                console.log("Request approved!");

                // Store merkle proof and hash in local storage
                localStorage.setItem("merkleHash", status.merkle_hash);
                // localStorage.setItem(
                //   "merkleProof",
                //   JSON.stringify(status.merkle_proof)
                // );
                // localStorage.setItem("merkleRoot", status.merkle_root);
                localStorage.setItem("did", did);
                localStorage.setItem(
                  "verifiableCredential",
                  JSON.stringify(signed_vc)
                );

                setShowProgress(false); // Hide progress indicator
                setIsSuccess(true);
                setIsLoading(false);
                if (onClose) {
                  setTimeout(onClose, 2000);
                }
                break;

              case "rejected":
                console.log("Request rejected");
                setShowProgress(false); // Hide progress indicator
                setIsRejected(true);
                setIsLoading(false);
                break;

              case "pending":
                console.log("Request still pending, continuing to poll...");
                setTimeout(checkRequestStatus, 5000);
                break;

              default:
                console.log(`Unknown status: ${status}`);
                setErrorMessage(`Unexpected status: ${status}`);
                setIsErrorModalOpen(true);
                setIsLoading(false);
            }
          } else {
            console.log("Invalid status response format:", status);
            setTimeout(checkRequestStatus, 5000);
          }
        } catch (error) {
          console.error("Error polling for status:", error);
          setTimeout(checkRequestStatus, 5000);
        }
      };

      // Start the polling process
      setCurrentStep(6);
      checkRequestStatus();
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage(error.message || "Failed to register with connector");
      setIsErrorModalOpen(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-base-100 p-8 rounded-2xl shadow-xl w-full max-w-md mx-auto max-h-[85vh] overflow-y-auto">
      <div className="flex justify-center items-center mb-4">
        <img
          src={logo}
          alt="logo"
          className="w-20 transition-all duration-300 hover:scale-105"
        />
      </div>

      <h2 className="text-center text-2xl font-bold text-primary mb-6">
        Create BLACKGATE Account
      </h2>

      {showProgress ? (
        <VerticalProgressIndicator currentStep={currentStep} steps={steps} /> // Show progress indicator with steps
      ) : (
        <>
          {isSuccess ? (
            <div className="text-center py-8 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Account Created Successfully
              </h3>
              <p className="text-gray-600">You can now login to your account</p>
            </div>
          ) : isRejected ? (
            <div className="text-center py-8 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Registration Request Rejected
              </h3>
              <p className="text-gray-600">
                Your account registration was not approved.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-outline mt-4"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {showWalletPasswordModal ? (
                <form
                  onSubmit={handleWalletPasswordSubmit}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold text-center mb-4">
                    {walletExists
                      ? "Enter Wallet Password"
                      : "Create Wallet Password"}
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wallet Password
                    </label>
                    <input
                      type="password"
                      value={walletPassword}
                      onChange={(e) => setWalletPassword(e.target.value)}
                      className={`input input-bordered w-full ${
                        errors.walletPassword ? "input-error" : ""
                      }`}
                      placeholder="Enter wallet password"
                    />
                    {errors.walletPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.walletPassword}
                      </p>
                    )}
                  </div>

                  {!walletExists && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Wallet Password
                      </label>
                      <input
                        type="password"
                        value={confirmWalletPassword}
                        onChange={(e) =>
                          setConfirmWalletPassword(e.target.value)
                        }
                        className={`input input-bordered w-full ${
                          errors.confirmWalletPassword ? "input-error" : ""
                        }`}
                        placeholder="Confirm wallet password"
                      />
                      {errors.confirmWalletPassword && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.confirmWalletPassword}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowWalletPasswordModal(false)}
                      className="btn flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary flex-1"
                      disabled={isLoadingWallet}
                    >
                      {isLoadingWallet ? (
                        <Loader2 className="animate-spin" />
                      ) : walletExists ? (
                        "Unlock Wallet"
                      ) : (
                        "Create Wallet"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Role Selection */}
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-grow">
                        <select
                          className="select select-bordered bg-base-100 text-gray-500 shadow-sm"
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                        >
                          {!isSetupPage && <option value="user">User</option>}
                          <option value="admin">Admin</option>
                          {!isSetupPage && (
                            <option value="device">Device</option>
                          )}
                        </select>
                      </div>
                      <button
                        type="button"
                        className="btn bg-primary/75 hover:bg-primary text-base-100 flex items-center gap-2 p-2 rounded-2xl px-4"
                        onClick={generateKeys}
                        disabled={isGeneratingKeys}
                      >
                        {isGeneratingKeys ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <KeySquare className="h-4 w-4" />
                        )}
                        {walletExists ? "Unlock Keys" : "Generate Wallet"}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alias
                      </label>
                      <input
                        type="text"
                        name="alias"
                        value={formData.alias}
                        onChange={handleChange}
                        placeholder="Enter a temp name"
                        className={`input input-bordered w-full ${
                          errors.alias ? "input-error" : ""
                        }`}
                      />
                      {errors.alias && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.alias}
                        </p>
                      )}
                    </div>

                    {/* DID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        DID
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          name="did"
                          value={formData.did}
                          placeholder="did:ethr:0x..."
                          className={`input input-bordered w-full ${
                            errors.did ? "input-error" : ""
                          } bg-gray-100`}
                          readOnly={true}
                        />
                        {formData.did && (
                          <button
                            type="button"
                            className="btn btn-square btn-sm ml-2"
                            onClick={() => copyToClipboard(formData.did)}
                            title="Copy to clipboard"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      {errors.did && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.did}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Device-specific fields */}
                  {selectedRole === "device" && (
                    <div className="space-y-4 animate-fadeIn">
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Device ID
                        </label>
                        <input
                          type="text"
                          name="deviceId"
                          value={formData.deviceId}
                          onChange={handleChange}
                          placeholder="Device-123456"
                          className={`input input-bordered w-full ${
                            errors.deviceId ? "input-error" : ""
                          }`}
                        />
                        {errors.deviceId && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.deviceId}
                          </p>
                        )}
                      </div> */}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Firmware Version
                        </label>
                        <input
                          type="text"
                          name="firmwareVersion"
                          value={formData.firmwareVersion}
                          onChange={handleChange}
                          placeholder="v1.0.0"
                          className={`input input-bordered w-full ${
                            errors.firmwareVersion ? "input-error" : ""
                          }`}
                        />
                        {errors.firmwareVersion && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.firmwareVersion}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 pb-4">
                    <button
                      type="submit"
                      className="btn bg-primary/75 hover:bg-primary text-base-100 w-full p-2 rounded-2xl px-4"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="animate-spin mr-2" />
                          Creating Account...
                        </div>
                      ) : (
                        "Sign Up"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SignupForm;
