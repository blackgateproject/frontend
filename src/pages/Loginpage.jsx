import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import SignupForm from "../components/SignupForm"; // Import SignupForm component
import { fetchBalance } from "../utils/contractInteractions";

const LoginPage = () => {
  // non state
  let did = "";
  let signed_vc = "";

  // state vars
  const [walletExists, setWalletExists] = useState(
    !!localStorage.getItem("encryptedWallet")
  );
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); //stateful
  const [errorMessage, setErrorMessage] = useState(""); //stateful
  const [wallet, setWallet] = useState(null); //stateful
  const [signer, setSigner] = useState(null); //stateful
  const [balance, setBalance] = useState("---"); //stateful
  const [currentStep, setCurrentStep] = useState(""); //stateful
  const [isLoadingDID, setIsLoadingDID] = useState(false); //where is this used
  const [isWalletLoaded, setIsWalletLoaded] = useState(false); //stateful
  const [isLoadingTx, setIsLoadingTx] = useState(false); //stateful
  // Set this to true, set to false when done with testing
  const [showSignupForm, setShowSignupForm] = useState(true); // stateful
  const navigate = useNavigate();

  useEffect(() => {
    fetchBalance(wallet, setBalance);
  }, [wallet]);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-400 to-black">
      {showSignupForm ? (
        <SignupForm
          walletExists={walletExists}
          setWalletExists={setWalletExists}
          setWallet={setWallet}
          setSigner={setSigner}
          setIsWalletLoaded={setIsWalletLoaded}
          setErrorMessage={setErrorMessage}
          setIsErrorModalOpen={setIsErrorModalOpen}
        /> // Render SignupForm component
      ) : (
        <div className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 overflow-hidden">
          <div className="flex justify-center items-center mb-4">
            <img src={logo} alt="logo" className="w-24" />
          </div>
          <h2 className="text-center text-3xl font-bold  text-primary">
            {walletExists ? "BLACKGATE" : "Welcome to BLACKGATE"}
            <p className="text-sm text-black">Balance: {balance} ETH</p>
          </h2>

          <div className=" text-center">
            <button
              onClick={() => setShowSignupForm(true)}
              className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl mt-4"
              disabled={isLoadingTx}
            >
              Register
            </button>
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
      <dialog id="error-modal" className="modal" open={isErrorModalOpen}>
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
