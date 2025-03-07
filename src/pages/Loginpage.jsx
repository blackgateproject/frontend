import { ethers } from "ethers";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { createNewWallet, loadWallet } from "../utils/contractInteractions";
import { handleProceedToNextStep } from "../utils/registrations";
import { getDIDandVC, signChallenge } from "../utils/verification";
import SignupForm from "../components/SignupForm";

const LoginPage = () => {
  const [walletExists, setWalletExists] = useState(
    !!localStorage.getItem("encryptedWallet")
  );
  const [walletPassword, setWalletPassword] = useState("");
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [wallet, setWallet] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("---");
  const [signedVC, setSignedVC] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [isClaimsModalOpen, setIsClaimsModalOpen] = useState(false);
  const [selectedClaims, setSelectedClaims] = useState([]);
  const [currentStep, setCurrentStep] = useState("");
  const [isLoadingDID, setIsLoadingDID] = useState(false);
  const [isWalletLoaded, setIsWalletLoaded] = useState(false);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet) {
        const provider = new ethers.JsonRpcProvider(
          "https://sepolia.era.zksync.dev"
        );
        const balance = await provider.getBalance(wallet.address);
        setBalance(parseFloat(ethers.formatEther(balance)).toFixed(4));
      }
    };
    fetchBalance();
  }, [wallet]);

  const handleOpenPasswordModal = () => {
    setIsPasswordModalOpen(true);
    setIsLoadingWallet(false);
    setTimeout(() => {
      document.getElementById("wallet-password-input").focus();
    }, 100);
  };

  const handleOpenSetupModal = () => {
    setIsSetupModalOpen(true);
    setIsLoadingWallet(false);
    setTimeout(() => {
      document.getElementById("wallet-setup-password-input").focus();
    }, 100);
  };

  const handleOpenSignupModal = () => {
    setIsSignupModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walletPassword) {
      alert("Please enter a wallet password.");
      return;
    }
    if (walletExists) {
      try {
        const { wallet, signer } = await loadWallet(
          localStorage.getItem("encryptedWallet"),
          walletPassword,
          setWallet,
          setAccount,
          setIsWalletLoaded,
          setIsLoadingWallet,
          setIsPasswordModalOpen,
          setSigner
        );
        setWallet(wallet);
        setSigner(signer);
      } catch (error) {
        console.error(error.message);
        setErrorMessage(error.message);
        setIsErrorModalOpen(true);
      }
    } else {
      await createNewWallet(
        walletPassword,
        setWalletExists,
        setWallet,
        setAccount
      );
    }
    console.log("[handleSubmit()] Exited");
  };

  const handleSetupSubmit = (e) => {
    e.preventDefault();
    console.log("Setting up wallet with password:", walletPassword);
    if (!walletPassword) {
      alert("Please enter a wallet password.");
      return;
    }
    setIsSetupModalOpen(false);
    createNewWallet(walletPassword, setWalletExists, setWallet, setAccount);
  };

  const handleClaimsSubmit = (e) => {
    e.preventDefault();
    setIsClaimsModalOpen(false);
    setCurrentStep("Generating DID...");
    const did = "did:ethr:" + wallet.address;
    console.log("DID:", did);
    getDIDandVC(
      wallet,
      did,
      selectedClaims,
      setSignedVC,
      setIsLoadingDID,
      setCurrentStep
    );
    signChallenge(wallet, challenge, navigate);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-400 to-black">
      <div className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 overflow-hidden">
        <div className="flex justify-center items-center mb-4">
          <img src={logo} alt="logo" className="w-24 transition-transform hover:scale-105 duration-300" />
        </div>
        <h2 className="text-center text-3xl font-bold text-primary">
          {walletExists ? "BLACKGATE" : "Welcome to BLACKGATE"}
          <p className="text-sm text-black">Balance: {balance} ETH</p>
        </h2>

        <div className="text-center">
          <button
            onClick={
              walletExists
                ? isWalletLoaded
                  ? async () => {
                      setIsLoadingTx(true);
                      try {
                        await handleProceedToNextStep(
                          wallet,
                          selectedClaims,
                          setSignedVC,
                          setIsLoadingDID,
                          setCurrentStep,
                          signer
                        );
                      } catch (error) {
                        console.error(error.message);
                        setErrorMessage(error.message);
                        setIsErrorModalOpen(true);
                      } finally {
                        setIsLoadingTx(false);
                      }
                    }
                  : handleOpenPasswordModal
                : handleOpenSetupModal
            }
            className={`btn w-full ${
              walletExists
                ? "bg-primary/75 hover:bg-primary"
                : "bg-green-500 hover:bg-green-600"
            } text-base-100 rounded-2xl mt-4 transition-all duration-300 hover:shadow-lg`}
            disabled={isLoadingTx}
          >
            {walletExists
              ? isWalletLoaded
                ? isLoadingTx
                  ? "Processing..."
                  : "Proceed to Next Step"
                : "Unlock and Connect Wallet"
              : "Create New Wallet"}
          </button>
          
          {/* Signup Link */}
          <div className="mt-4 text-center">
            <button 
              onClick={handleOpenSignupModal}
              className="text-primary hover:text-primary-focus hover:underline transition-colors duration-200"
            >
              Create Account
            </button>
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
      
      {/* Password Modal */}
      <dialog id="password-modal" className="modal backdrop-brightness-75" open={isPasswordModalOpen}>
        <div className="modal-box">
          <form onSubmit={handleSubmit}>
            <h3 className="font-bold text-lg">Enter Wallet Password</h3>
            <input
              id="wallet-password-input"
              type="password"
              value={walletPassword}
              onChange={(e) => setWalletPassword(e.target.value)}
              className="input input-bordered w-full mt-4"
              placeholder="Enter your wallet password"
            />
            <div className="modal-action">
              <button
                type="button"
                className="btn bg-base-100 hover:bg-base-100 text-[#333333] p-2 rounded-2xl px-4"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setWalletPassword("");
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn bg-primary/75 hover:bg-primary text-base-100 p-2 rounded-2xl px-4 flex items-center gap-2"
                disabled={isLoadingWallet}
              >
                {isLoadingWallet ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="modal-backdrop" onClick={() => setIsPasswordModalOpen(false)}></div>
      </dialog>
      
      {/* Setup Modal */}
      <dialog id="setup-modal" className="modal backdrop-brightness-75" open={isSetupModalOpen}>
        <div className="modal-box">
          <form onSubmit={handleSetupSubmit}>
            <h3 className="font-bold text-lg">Set Wallet Password</h3>
            <input
              id="wallet-setup-password-input"
              type="password"
              value={walletPassword}
              onChange={(e) => setWalletPassword(e.target.value)}
              className="input input-bordered w-full mt-4"
              placeholder="Set a password for your new wallet"
            />
            <div className="modal-action">
              <button
                type="button"
                className="btn bg-base-100 hover:bg-base-100 text-[#333333] p-2 rounded-2xl px-4"
                onClick={() => {
                  setIsSetupModalOpen(false);
                  setWalletPassword("");
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn bg-primary/75 hover:bg-primary text-base-100 p-2 rounded-2xl px-4">
                Set Password
              </button>
            </div>
          </form>
        </div>
        <div className="modal-backdrop" onClick={() => setIsSetupModalOpen(false)}></div>
      </dialog>
      
      {/* Claims Modal */}
      <dialog id="claims-modal" className="modal backdrop-brightness-75" open={isClaimsModalOpen}>
        <div className="modal-box">
          <form onSubmit={handleClaimsSubmit}>
            <h3 className="font-bold text-lg">Select Claims</h3>
            <div className="mt-4">
              <label className="block">
                <input
                  type="checkbox"
                  value="claim1"
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedClaims((prev) =>
                      prev.includes(value)
                        ? prev.filter((claim) => claim !== value)
                        : [...prev, value]
                    );
                  }}
                />
                Claim 1
              </label>
              <label className="block">
                <input
                  type="checkbox"
                  value="claim2"
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedClaims((prev) =>
                      prev.includes(value)
                        ? prev.filter((claim) => claim !== value)
                        : [...prev, value]
                    );
                  }}
                />
                Claim 2
              </label>
              <label className="block">
                <input
                  type="checkbox"
                  value="claim3"
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedClaims((prev) =>
                      prev.includes(value)
                        ? prev.filter((claim) => claim !== value)
                        : [...prev, value]
                    );
                  }}
                />
                Claim 3
              </label>
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn bg-base-100 hover:bg-base-100 text-[#333333] p-2 rounded-2xl px-4"
                onClick={() => setIsClaimsModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn bg-primary/75 hover:bg-primary text-base-100 p-2 rounded-2xl px-4">
                Submit
              </button>
            </div>
          </form>
        </div>
        <div className="modal-backdrop" onClick={() => setIsClaimsModalOpen(false)}></div>
      </dialog>
      
      {/* Error Modal */}
      <dialog id="error-modal" className="modal backdrop-brightness-75" open={isErrorModalOpen}>
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
        <div className="modal-backdrop" onClick={() => setIsErrorModalOpen(false)}></div>
      </dialog>
      
      {/* Signup Modal */}
      <dialog id="signup-modal" className="modal modal-bottom sm:modal-middle backdrop-brightness-75" open={isSignupModalOpen}>
        <div className="modal-box max-w-2xl p-0 bg-transparent shadow-none max-h-[90vh] overflow-y-auto">
          <SignupForm onClose={() => setIsSignupModalOpen(false)} />
        </div>
        <button className="modal-backdrop" onClick={() => setIsSignupModalOpen(false)}></button>
      </dialog>
    </div>
  );
};

export default LoginPage;