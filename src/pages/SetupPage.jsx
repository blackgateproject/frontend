import React, {useState, useEffect} from 'react'
import SignupForm from '../components/SignupForm'
import { useNavigate } from 'react-router-dom';

const SetupPage = () => {
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



  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-400 to-black">
     
        <SignupForm
          walletExists={walletExists}
          setWalletExists={setWalletExists}
          setWallet={setWallet}
          setSigner={setSigner}
          setIsWalletLoaded={setIsWalletLoaded}
          setErrorMessage={setErrorMessage}
          setIsErrorModalOpen={setIsErrorModalOpen}
          wallet={wallet} // Pass wallet to SignupForm
          isSetupPage={true}
        />
      
    


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
}

export default SetupPage
