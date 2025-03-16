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
  const [showSignupForm, setShowSignupForm] = useState(true);
  const [hasVerificationData, setHasVerificationData] = useState(false);
  
  const [showAuthButtons, setShowAuthButtons] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const navigate = useNavigate();

  // Check if merkle proof and hash exist in local storage
  useEffect(() => {
    const merkleProof = localStorage.getItem("merkleProof");
    const merkleHash = localStorage.getItem("merkleHash");
    setHasVerificationData(!!merkleProof && !!merkleHash);
  }, []);


  useEffect(()=> {
    if(isErrorModalOpen) {
      document.getElementById("error-modal").showModal()
    } else {
      document.getElementById("error-modal").close()
    }
  }, [isErrorModalOpen])


  const handleButtonClick = () => {
   if(localStorage.getItem("encryptedWallet")) {
     setShowAuthButtons(true)
   } else {
    //old logic here
    if (hasVerificationData) {
      // Handle verification
      verifyMerkleProof(setIsLoadingTx, setCurrentStep, setErrorMessage, setIsErrorModalOpen);
    } else {
      // Regular registration flow
      setShowSignupForm(true);
    }
   }
  };

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
          wallet={wallet} // Pass wallet to SignupForm
        />
      ) : (
        <div className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 overflow-hidden">
          <div className="flex justify-center items-center mb-4">
            <img src={logo} alt="logo" className="w-24" />
          </div>
          <h2 className="text-center text-3xl font-bold  text-primary">
            {walletExists ? "BLACKGATE" : "Welcome to BLACKGATE"}
          </h2>

          <div className=" text-center">
           {showAuthButtons ? 
           <div className="flex flex-col ">
            {/** show two buttons namely auth1 and auth2 */}
            <button
              onClick={() => navigate("/auth1")}
              className={`btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl mt-4`}
            >
              Auth 1
            </button>
            <button
              onClick={() => navigate("/auth2")}
              className={`btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl mt-1`}
            >
              Auth 2
            </button>
          </div>
            :
            <button
              onClick={handleButtonClick}
              className={`btn w-full ${
                hasVerificationData
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-primary/75 hover:bg-primary"
              } text-base-100 rounded-2xl mt-4`}
              disabled={isLoadingTx}
            >
              {isLoadingTx ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" />
                  Processing...
                </div>
              ) : hasVerificationData ? (
                "Verify"
              ) : (
                localStorage.getItem("encryptedWallet") ? "Login" : "Register"
              )}
            </button>}
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
    


      <dialog id="error-modal" className="modal" >
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
