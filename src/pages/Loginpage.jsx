import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import SignupForm from "../components/SignupForm";
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
  const [hasVerificationData, setHasVerificationData] = useState(false);
  const [hasVC, setHasVC] = useState(false);
  const [isBackendInSetupMode, setIsBackendInSetupMode] = useState(false);
  const [isCheckingBackendStatus, setIsCheckingBackendStatus] = useState(false); // Set to true to enable setup mode

  const [showAuthButtons, setShowAuthButtons] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [previousPage, setPreviousPage] = useState(null);
  const [currentPage, setCurrentPage] = useState("main");
  const navigate = useNavigate();

  // Check if merkle proof and hash exist in local storage
  useEffect(() => {
    const checkLocalStorage = () => {
      // const merkleProof = localStorage.getItem("merkleProof");
      const merkleHash = localStorage.getItem("merkleHash");
      // const merkleRoot = localStorage.getItem("merkleRoot");
      const did = localStorage.getItem("did");
      const verifiableCredential = localStorage.getItem("verifiableCredential");

      //Debug line
      // console.log("LocalStorage data:", {
      //   merkleProof: !!merkleProof,
      //   merkleHash: !!merkleHash,
      //   did: !!did,
      //   // merkleRoot: !!merkleRoot,
      //   verifiableCredential: !!verifiableCredential,
      // });

      setHasVerificationData(!!merkleHash && !!did);
      // setHasVerificationData(!!merkleProof && !!merkleHash && !!did);
      // setHasVerificationData(!!merkleProof && !!merkleHash && !!merkleRoot);
      setHasVC(!!verifiableCredential);
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
    const verifiableCredential = localStorage.getItem("verifiableCredential");
    // const merkleProof = localStorage.getItem("merkleProof")
    const merkleHash = localStorage.getItem("merkleHash");
    const did = localStorage.getItem("did");
    // const merkleRoot = localStorage.getItem("merkleRoot");

    if (encryptedWallet) {
      if (verifiableCredential) {
        setShowAuthButtons(true);
      } else {
        // Wallet exists but no VC, go to signup to complete registration
        setShowSignupForm(true);
        setCurrentPage("signup");
      }
    } else {
      if (merkleHash && did) {
        // if (merkleProof && merkleHash && did) {
        // if (merkleProof && merkleHash && merkleRoot) {
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
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-400 to-black">
      {currentPage !== "main" && (
        <button
          onClick={handleBackButtonClick}
          className="absolute top-4 left-4 btn bg-primary/75 hover:bg-primary text-base-100 rounded-2xl"
        >
          Back
        </button>
      )}
      {currentPage === "signup" ? (
        <SignupForm
          walletExists={walletExists}
          setWalletExists={setWalletExists}
          setWallet={setWallet}
          setSigner={setSigner}
          setIsWalletLoaded={setIsWalletLoaded}
          setErrorMessage={setErrorMessage}
          setIsErrorModalOpen={setIsErrorModalOpen}
          wallet={wallet} // Pass wallet to SignupForm
        />
      ) : currentPage === "auth1" ? (
        <div className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 overflow-hidden">
          <h2 className="text-center text-3xl font-bold text-primary">
            Verify via ZKP
          </h2>
          <p className="text-center mt-4">
            Click below to verify using zero-knowledge proof.
          </p>
          <button
            onClick={() => {
              verifyMerkleProof(
                setIsLoadingTx,
                setCurrentStep,
                setErrorMessage,
                setIsErrorModalOpen,
                navigate
              );
            }}
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
        </div>
      ) : currentPage === "auth2" ? (
        <div className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 overflow-hidden">
          {/* <h2 className="text-center text-3xl font-bold text-primary">
            Verify via VC
          </h2> */}
          {/* Add your VC verification component or logic here */}
        </div>
      ) : (
        <div className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 overflow-hidden">
          <div className="flex justify-center items-center mb-4">
            <img src={logo} alt="logo" className="w-24" />
          </div>
          <h2 className="text-center text-3xl font-bold  text-primary">
            {walletExists ? "BLACKGATE" : "Welcome to BLACKGATE"}
          </h2>

          <div className=" text-center">
            <div>
              <p className="text-black mb-4">
                {walletExists
                  ? hasVC
                    ? "Please choose a verification method to continue."
                    : "Wallet detected, but registration is incomplete. Please complete your registration."
                  : "To get started, please create a wallet."}
              </p>
              {hasVerificationData && hasVC ? (
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
                  {/* <button
                    onClick={() => {
                      setPreviousPage("main");
                      setCurrentPage("auth2");
                    }}
                    className={`btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl mt-1`}
                  >
                    Verify via VC
                  </button> */}
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
                    !localStorage.getItem("verifiableCredential") ? (
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
        </div>
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
  );
};

export default LoginPage;
