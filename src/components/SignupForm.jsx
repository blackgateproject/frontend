import { Copy, KeySquare, Loader2 } from "lucide-react";
import { useState } from "react";
import logo from "../assets/logo.png";
import { useVeramoOperations } from "../hooks/useVeramoOperations";
import {
  createNewWallet,
  encryptAndStoreWallet,
  loadWallet,
} from "../utils/contractInteractions";
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
  const [selected_role, setselected_role] = useState("user");
  const [formData, setFormData] = useState({
    did: "",
    selected_role: "",
    alias: "",
    firmware_version: "",
    device_id: "", // <-- Add this line
    proof_type: "merkle",
    // publicKey: "",
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
  const { performSubmitDID } = useVeramoOperations();
  const [showProgress, setShowProgress] = useState(false); // State to show progress indicator
  const [currentStep, setCurrentStep] = useState(0); // Add currentStep state
  const [walletTimings, setWalletTimings] = useState({
    createTime: 0,
    encryptTime: 0,
  });
  const steps = [
    "Generate DID📝",
    // "Resolve DID ✅",
    // "Issue VC📝",
    // "Validate VC ✅",
    "Submit Data📤",
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
        const {
          wallet: walletObj,
          signer: signerObj,
          walletCreateTime,
          walletEncryptTime,
        } = await loadWallet(
          localStorage.getItem("encryptedWallet"),
          walletPassword,
          setWallet, // Now properly defined
          setIsWalletLoaded,
          setIsLoadingWallet,
          () => { },
          setSigner // Now properly defined
        );

        // Also update local state
        setWalletLocal(walletObj);
        setSignerLocal(signerObj);

        // Get wallet address and use it to create DID
        setFormData({
          ...formData,
          did: `did:ethr:${walletObj.publicKey}`,
          walletTimes: { walletCreateTime, walletEncryptTime },
        });

        setShowWalletPasswordModal(false);
      } catch (error) {
        console.error(error.message);
        setErrorMessage(error.message); // Now properly defined
        setIsErrorModalOpen(true);
      }
    } else {
      // Create a new wallet

      // Check if password is provided
      if (!walletPassword) {
        setErrors({ walletPassword: "Password is required" });
        setIsGeneratingKeys(false);
        setIsLoadingWallet(false);
        return;
      }

      // Check if confirm password is provided
      if (walletPassword !== confirmWalletPassword) {
        setErrors({ confirmWalletPassword: "Passwords do not match" });
        setIsGeneratingKeys(false);
        setIsLoadingWallet(false);
        return;
      }

      try {
        // Create wallet and get timings
        const {
          wallet: newWallet,
          walletCreateTime,
          walletEncryptTime,
        } = await createNewWallet(
          walletPassword,
          setWalletExists,
          setWallet,
          setWalletTimings
        );
        // Set the DID and public key using the returned wallet object
        setFormData({
          ...formData,
          did: `did:ethr:blackgate:${newWallet.publicKey}`,
          walletTimes: { walletCreateTime, walletEncryptTime },
        });

        // // Ensure wallet is encrypted & stored after sending to server
        // await encryptAndStoreWallet(
        //   newWallet,
        //   walletPassword,
        //   setWalletExists,
        //   setWalletTimings
        // );

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

    if (selected_role === "device") {
      if (!formData.device_id) {
        newErrors.device_id = "Device ID is required";
      }
      if (!formData.firmware_version) {
        newErrors.firmware_version = "Firmware version is required";
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

  setShowProgress(true);
  setIsLoading(true);

  try {
    // Check if wallet is initialized
    if (!wallet) {
      throw new Error(
        "Wallet not initialized. Please generate or unlock keys first."
      );
    }

    const updatedFormData = {
      ...formData,
      selected_role: selected_role,
      proof_type: formData.proof_type,
    };

    // Step 1: Submit DID + VC
    setCurrentStep(1);
    await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 second delay
    await performSubmitDID(updatedFormData);

    // Step 2: Encrypt and store wallet
    setCurrentStep(2);
    await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 second delay
    await encryptAndStoreWallet(
      wallet,
      walletPassword,
      setWalletExists,
      setWalletTimings
    );

    console.log("Form submitted:", updatedFormData);

    // Step 3: Start polling
    setCurrentStep(3);
    await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 second delay
    console.log("Starting polling for request status...");

    // Polling logic with proper async handling
    await pollForApproval(updatedFormData);

  } catch (error) {
    console.error("Error submitting form:", error);
    setErrorMessage(error.message || "Failed to register with connector");
    setIsErrorModalOpen(true);
    setIsLoading(false);
    setShowProgress(false);
  }
};

// Separate polling function for better organization
const pollForApproval = async (formData) => {
  const maxAttempts = 30;
  let attempts = 0;

  const checkRequestStatus = async () => {
    if (attempts >= maxAttempts) {
      throw new Error("Request timed out. Please try again later.");
    }

    attempts++;
    console.log(`Polling attempt ${attempts}/${maxAttempts}`);

    try {
      const status = await pollForRequestStatus(
        formData.did,
        formData.proof_type
      );
      console.log("Polling result:", status);

      if (status && status.request_status) {
        console.warn("Request Status:", status.request_status);

        switch (status.request_status) {
          case "approved":
            console.log("Request approved!");
            
            localStorage.setItem(
              "verifiable_credential",
              JSON.stringify(status.verifiable_credential)
            );

            setShowProgress(false);
            setIsSuccess(true);
            setIsLoading(false);
            
            if (onClose) {
              setTimeout(onClose, 2000);
            }
            return; // Exit the polling loop

          case "rejected":
            console.log("Request rejected");
            setShowProgress(false);
            setIsRejected(true);
            setIsLoading(false);
            return; // Exit the polling loop

          case "pending":
            console.log("Request still pending, continuing to poll...");
            // Wait 5 seconds before next poll
            await new Promise(resolve => setTimeout(resolve, 5000));
            return checkRequestStatus(); // Recursive call

          default:
            throw new Error(`Unexpected status: ${status.request_status}`);
        }
      } else {
        console.log("Invalid status response format:", status);
        // Wait 5 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 5000));
        return checkRequestStatus(); // Recursive call
      }
    } catch (error) {
      console.error("Error polling for status:", error);
      // Wait 5 seconds before retry
      await new Promise(resolve => setTimeout(resolve, 5000));
      return checkRequestStatus(); // Recursive call
    }
  };

  // Start polling
  await checkRequestStatus();
};

  return (
    <div className="bg-base-100 rounded-2xl w-full max-w-md mx-auto max-h-[85vh]  ">
      <div className="flex justify-center items-center mb-4">
        <img
          src={logo}
          alt="logo"
          className="w-20 transition-all duration-300 hover:scale-105"
        />
      </div>

      <h2 className="text-center text-2xl font-bold text-Black mb-6">
        Create BlackGate Account!
      </h2>

      {showProgress ? (
        <VerticalProgressIndicator currentStep={currentStep} steps={steps} />
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
                      className={`input input-bordered w-full ${errors.walletPassword ? "input-error" : ""
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
                        className={`input input-bordered w-full ${errors.confirmWalletPassword ? "input-error" : ""
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
                      className="btn flex-1 bg-base-100 hover:bg-base-100 text-[#333333] p-2 rounded-2xl px-4"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn flex-1 bg-primary/75 hover:bg-primary text-base-100 p-2 rounded-2xl px-4"
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
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-grow">
                        <select
                          className="select select-bordered bg-base-100 text-gray-500 shadow-sm"
                          value={selected_role}
                          onChange={(e) => setselected_role(e.target.value)}
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
                        ZKP Proof type
                      </label>
                      <select
                        className="select select-bordered bg-base-100 text-gray-500 shadow-sm"
                        value={formData.proof_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            proof_type: e.target.value,
                          })
                        }
                      >
                        <option value="merkle">Merkle</option>
                        <option value="smt">Sparse Merkle Tree</option>
                        <option value="accumulator">Accumulator</option>
                      </select>
                    </div>
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
                        className={`input input-bordered w-full ${errors.alias ? "input-error" : ""
                          }`}
                      />
                      {errors.alias && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.alias}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        DID
                      </label>
                      <div className="flex items-stretch gap-2">
                        <input
                          type="text"
                          name="did"
                          value={formData.did}
                          placeholder="did:ethr:0x..."
                          className={`input input-bordered w-full ${errors.did ? "input-error" : ""
                            } bg-gray-100`}
                          readOnly={true}
                        />
                        {formData.did && (
                          <button
                            type="button"
                            className="btn px-3"
                            onClick={() => copyToClipboard(formData.did)}
                            title="Copy to clipboard"
                          >
                            <Copy className="h-4 w-4" />
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

                  {selected_role === "device" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Device ID
                        </label>
                        <input
                          type="text"
                          name="device_id"
                          value={formData.device_id}
                          onChange={handleChange}
                          placeholder="Enter device ID"
                          className={`input input-bordered w-full ${errors.device_id ? "input-error" : ""
                            }`}
                        />
                        {errors.device_id && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.device_id}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Firmware Version
                        </label>
                        <input
                          type="text"
                          name="firmware_version"
                          value={formData.firmware_version}
                          onChange={handleChange}
                          placeholder="v1.0.0"
                          className={`input input-bordered w-full ${errors.firmware_version ? "input-error" : ""
                            }`}
                        />
                        {errors.firmware_version && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.firmware_version}
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
