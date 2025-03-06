import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  createNewWallet,
  fetchBalance,
  loadWallet,
} from "./utils/contractInteractions";
import { handleProceedToNextStep } from "./utils/registrations";
import { getDIDandVC, signChallenge } from "./utils/verification";

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
  const navigate = useNavigate();

  useEffect(() => {
    fetchBalance(wallet, setBalance);
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
          <img src={logo} alt="logo" className="w-24" />
        </div>
        <h2 className="text-center text-3xl font-bold  text-primary">
          {walletExists ? "BLACKGATE" : "Welcome to BLACKGATE"}
          <p className="text-sm text-black">Balance: {balance} ETH</p>
        </h2>

        <div className=" text-center">
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
            } text-base-100 rounded-2xl mt-4`}
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
      <dialog id="password-modal" className="modal" open={isPasswordModalOpen}>
        <form className="modal-box" onSubmit={handleSubmit}>
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
              className="btn"
              onClick={() => {
                setIsPasswordModalOpen(false);
                setWalletPassword("");
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
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
      </dialog>
      <dialog id="setup-modal" className="modal" open={isSetupModalOpen}>
        <form className="modal-box" onSubmit={handleSetupSubmit}>
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
              className="btn"
              onClick={() => {
                setIsSetupModalOpen(false);
                setWalletPassword("");
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Set Password
            </button>
          </div>
        </form>
      </dialog>
      <dialog id="claims-modal" className="modal" open={isClaimsModalOpen}>
        <form className="modal-box" onSubmit={handleClaimsSubmit}>
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
              className="btn"
              onClick={() => setIsClaimsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </dialog>
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
