import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/background-circles.gif";
import logo from "../assets/logo.png";
import SignupForm from "../components/SignupForm";
import { useVeramoOperations } from "../hooks/useVeramoOperations";
import { verifyMerkleProof } from "../utils/verification";

const LoginPage = () => {
  // non state
  let did = "";
  let signed_vc = "";

  // state vars
  const [walletExists, setWalletExists] = useState(
    !!localStorage.getItem("encryptedWallet")
  );
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [wallet, setWallet] = useState(null);
  const [signer, setSigner] = useState(null);
  const [currentStep, setCurrentStep] = useState("");
  const [isLoadingDID, setIsLoadingDID] = useState(false);
  const [isWalletLoaded, setIsWalletLoaded] = useState(false);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [hasVC, setHasVC] = useState(false);
  const [isCheckingBackendStatus, setIsCheckingBackendStatus] = useState(false); // Set to true to enable setup mode
  const [showAuthButtons, setShowAuthButtons] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [previousPage, setPreviousPage] = useState(null);
  const [currentPage, setCurrentPage] = useState("main");
  const [showWalletPasswordModal, setShowWalletPasswordModal] = useState(false);
  const [walletPassword, setWalletPassword] = useState("");
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [walletUnlockError, setWalletUnlockError] = useState("");
  const [rememberWalletPassword, setRememberWalletPassword] = useState(
    !!localStorage.getItem("rememberedWalletPassword")
  );

  const { agent } = useVeramoOperations();
  const navigate = useNavigate();

  // Prefill Password if remembered when modal opens
  useEffect(() => {
    if (showWalletPasswordModal) {
      const remembered = localStorage.getItem("rememberedWalletPassword");
      if (remembered) setWalletPassword(remembered);
      else setWalletPassword("");
    }
  }, [showWalletPasswordModal]);

  // Check if merkle proof and hash exist in local storage
  useEffect(() => {
    const checkLocalStorage = () => {
      const verifiable_credential = localStorage.getItem(
        "verifiable_credential"
      );

      setHasVC(!!verifiable_credential);
    };

    // Check initially
    checkLocalStorage();

    // Set up event listener for storage changes
    window.addEventListener("storage", checkLocalStorage);

    // Create custom listener for in-page storage updates
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function () {
      originalSetItem.apply(this, arguments);
      checkLocalStorage();
    };

    return () => {
      window.removeEventListener("storage", checkLocalStorage);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  useEffect(() => {
    if (isErrorModalOpen) {
      document.getElementById("error-modal").showModal();
    } else {
      document.getElementById("error-modal").close();
    }
  }, [isErrorModalOpen]);

  const handleButtonClick = () => {
    const encryptedWallet = localStorage.getItem("encryptedWallet");
    const verifiable_credential = localStorage.getItem("verifiable_credential");

    let merkleHash = null;
    let did = null;
    let ZKP = null;

    // Only try to parse if verifiable_credential exists
    if (verifiable_credential) {
      try {
        const parsedVC = JSON.parse(verifiable_credential);
        ZKP = parsedVC.credential?.credentialSubject?.ZKP;
        merkleHash = parsedVC.credential?.credentialSubject?.ZKP?.userHash;
        did = parsedVC.credential?.credentialSubject?.did;
      } catch (error) {
        console.error("Error parsing verifiable credential:", error);
        // Continue with default flow if parsing fails
      }
    }

    if (encryptedWallet) {
      if (verifiable_credential) {
        setShowAuthButtons(true);
      } else {
        // Wallet exists but no VC, go to signup to complete registration
        setShowSignupForm(true);
        setCurrentPage("signup");
      }
    } else {
      if (ZKP && did) {
        // Handle verification
        verifyMerkleProof(
          setIsLoadingTx,
          setCurrentStep,
          setErrorMessage,
          setIsErrorModalOpen,
          navigate
        );
      } else {
        // Regular registration flow
        setShowSignupForm(true);
        setCurrentPage("signup");
      }
    }
  };

  const handleBackButtonClick = () => {
    setCurrentPage("main");
    setShowSignupForm(false);
    setShowAuthButtons(false);
  };

  // Function to unlock wallet before verification
  const handleUnlockAndVerify = async (e) => {
    e.preventDefault();
    setIsLoadingWallet(true);
    setWalletUnlockError("");
    try {
      const { loadWallet } = await import("../utils/contractInteractions");
      const encryptedWallet = localStorage.getItem("encryptedWallet");
      if (!walletPassword) {
        setWalletUnlockError("Password is required");
        setIsLoadingWallet(false);
        return;
      }
      // Store or remove password based on checkbox
      if (rememberWalletPassword) {
        localStorage.setItem("rememberedWalletPassword", walletPassword);
      } else {
        localStorage.removeItem("rememberedWalletPassword");
      }
      const { wallet: unlockedWallet } = await loadWallet(
        encryptedWallet,
        walletPassword,
        setWallet,
        () => {},
        setIsLoadingWallet,
        () => {},
        setSigner
      );
      setWallet(unlockedWallet);
      setShowWalletPasswordModal(false);
      setWalletPassword("");
      // Now call verifyMerkleProof with unlocked wallet
      console.warn("Wallet unlocked successfully:", unlockedWallet);

      // verifyMerkleProof expects smt_proofs and verifiable_credential to be in localStorage
      const smtProofs = localStorage.getItem("smt_proofs");
      const verifiableCredential = localStorage.getItem(
        "verifiable_credential"
      );
      if (!smtProofs || !verifiableCredential) {
        setErrorMessage(
          "SMT proofs or verifiable credential not found in local storage."
        );
        setIsErrorModalOpen(true);
      }
      verifyMerkleProof(
        setIsLoadingTx,
        setCurrentStep,
        setErrorMessage,
        setIsErrorModalOpen,
        navigate,
        unlockedWallet,
        agent,
        smtProofs,
        verifiableCredential,
        false
      );
    } catch (error) {
      setWalletUnlockError(
        "Failed to unlock wallet. Please check your password."
      );
    }
    setIsLoadingWallet(false);
  };

  if (isCheckingBackendStatus) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-400 to-black">
        <div className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 text-center">
          <Loader2 className="animate-spin mx-auto" size={32} />
          <p className="mt-4">Connecting to backend...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="z-10">
        {currentPage !== "main" && (
          <button
            onClick={handleBackButtonClick}
            className="absolute top-4 left-4 btn bg-primary/75 hover:bg-primary text-base-100 rounded-2xl"
          >
            Back
          </button>
        )}
        {currentPage === "signup" ? (
          <motion.div
            key="signup"
            // initial={{ opacity: 0, scale: 0.95, y: 40 }}
            // animate={{ opacity: 1, scale: 1, y: 0 }}
            // exit={{ opacity: 0, scale: 0.95, y: 40 }}
            // transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-base-100 p-10 rounded-2xl shadow-xl max-h-[75vh] overflow-auto scrollbar-hide w-[30rem]"
          >
            <SignupForm
              walletExists={walletExists}
              setWalletExists={setWalletExists}
              setWallet={setWallet}
              setSigner={setSigner}
              setIsWalletLoaded={setIsWalletLoaded}
              setErrorMessage={setErrorMessage}
              setIsErrorModalOpen={setIsErrorModalOpen}
              wallet={wallet}
            />
          </motion.div>
        ) : currentPage === "auth1" ? (
          <motion.div
            key="auth1"
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-base-100 p-10 rounded-2xl shadow-xl w-96"
          >
            <h2 className="text-center text-3xl font-bold text-Black">
              Verify via ZKP
            </h2>
            <p className="text-center mt-4">
              Click below to verify using zero-knowledge proof.
            </p>
            <button
              onClick={() => setShowWalletPasswordModal(true)}
              className={`btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl mt-4`}
              disabled={isLoadingTx}
            >
              {isLoadingTx ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" />
                  Processing...
                </div>
              ) : (
                "Verify Now"
              )}
            </button>
            {currentStep && (
              <div className="mt-4 text-center text-black">
                <p>{currentStep}</p>
              </div>
            )}
            {isLoadingTx && !currentStep && (
              <div className="mt-4 text-center">
                <Loader2 className="animate-spin mx-auto" />
                <p className="mt-2">Verifying...</p>
              </div>
            )}

            {/* Wallet Unlock Modal */}
            {showWalletPasswordModal && (
              <dialog open className="modal">
                <form
                  onSubmit={handleUnlockAndVerify}
                  className="modal-box space-y-4"
                >
                  <h3 className="text-lg font-bold text-center mb-4">
                    Enter Wallet Password
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
                        walletUnlockError ? "input-error" : ""
                      }`}
                      placeholder="Enter wallet password"
                    />
                    {walletUnlockError && (
                      <p className="mt-1 text-sm text-red-500">
                        {walletUnlockError}
                      </p>
                    )}
                    <label className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={rememberWalletPassword}
                        onChange={(e) =>
                          setRememberWalletPassword(e.target.checked)
                        }
                        className="mr-2"
                      />
                      Remember password
                    </label>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowWalletPasswordModal(false)}
                      className="btn flex-1 bg-base-100 hover:bg-base-100 text-[#333333] p-2 rounded-2xl px-4"
                      disabled={isLoadingWallet}
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
                      ) : (
                        "Unlock & Verify"
                      )}
                    </button>
                  </div>
                </form>
              </dialog>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-base-100 p-10 rounded-2xl shadow-xl w-96"
          >
            <div className="flex justify-center items-center mb-4">
              <img src={logo} alt="logo" className="w-24" />
            </div>
            <h2 className="text-center text-3xl font-bold  text-Black">
              {walletExists ? "BLACKGATE" : "Welcome to BLACKGATE"}
            </h2>
            <div className=" text-center">
              <div>
                <p className="text-black mb-4">
                  {walletExists
                    ? hasVC
                      ? "Valid VC detected! Please proceed with the authentication."
                      : "Wallet detected, but registration is incomplete. Please complete your registration."
                    : "To get started, please create a wallet."}
                </p>
                {hasVC ? (
                  <div className="flex flex-col ">
                    <button
                      onClick={() => {
                        setPreviousPage("main");
                        setCurrentPage("auth1");
                      }}
                      className={`btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl mt-4`}
                    >
                      Verify via ZKP
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleButtonClick}
                    className={`btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl mt-4`}
                    disabled={isLoadingTx}
                  >
                    {isLoadingTx ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : localStorage.getItem("encryptedWallet") &&
                      !localStorage.getItem("verifiable_credential") ? (
                      "Complete Registration"
                    ) : localStorage.getItem("encryptedWallet") ? (
                      "Login"
                    ) : (
                      "Register"
                    )}
                  </button>
                )}
              </div>
            </div>
            {currentStep && (
              <div className="mt-4 text-center text-white">
                <p>{currentStep}</p>
              </div>
            )}
            {isLoadingDID && (
              <div className="mt-4 text-center text-white">
                <Loader2 className="animate-spin" />
              </div>
            )}
          </motion.div>
        )}

        <dialog id="error-modal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Error</h3>
            <p className="py-4">{errorMessage}</p>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => setIsErrorModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      </div>
    </motion.div>
  );
};

export default LoginPage;
