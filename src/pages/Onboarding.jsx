import { issueCredential, resolveDID } from "@spruceid/didkit-wasm";
import { Buffer } from "buffer";
import { ethers, SigningKey } from "ethers";
import React, { useEffect, useState } from "react";
import {
  Check,
  Edit,
  KeyRound,
  Loader2,
  Search,
  SquareUserRound,
  X,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

const Onboarding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingAuth, setEditingAuth] = useState(false);
  const [errors, setErrors] = useState({});
  const [account, setAccount] = useState(null);
  const [didDetails, setDidDetails] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [walletPassword, setWalletPassword] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [walletExists, setWalletExists] = useState(
    !!localStorage.getItem("encryptedWallet")
  );

  const [profile, setProfile] = useState({});

  // Create a new wallet and store it encrypted in localStorage
  const createWallet = async () => {
    try {
      setIsLoadingWallet(true);
      const newWallet = ethers.Wallet.createRandom();
      const encryptedJson = await newWallet.encrypt(walletPassword);

      localStorage.setItem("encryptedWallet", encryptedJson);

      setWallet(newWallet);
      setAccount(newWallet.address);
      setWalletExists(true);
      console.log("Wallet created:", newWallet);
      console.log("Encrypted JSON:", encryptedJson);
    } catch (err) {
      console.error("Error in createWallet:", err);
      alert("Failed to create wallet.");
    } finally {
      setIsLoadingWallet(false);
      setIsPasswordModalOpen(false);
    }
  };

  // Example function that fetches and logs DID Document & issues a sample credential
  const getDIDandVC = async (did) => {
    const didDoc = await resolveDID(String(did), "{}");
    console.log("DID Document:", didDoc);

    const credential = JSON.stringify({
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: did,
      credentialSubject: { id: "did:example:123" },
      issuanceDate: new Date().toISOString(),
    });

    const proof_options = JSON.stringify({
      proofPurpose: "assertionMethod",
      verificationMethod: `${did}#controller`,
    });

    // Construct JWK from wallet
    let newUncompPubKey = SigningKey.computePublicKey(wallet.privateKey, false);
    if (newUncompPubKey instanceof Uint8Array) {
      newUncompPubKey = ethers.utils.hexlify(newUncompPubKey);
    }

    // Remove 0x04 prefix
    const rawPubKey = newUncompPubKey.startsWith("0x04")
      ? newUncompPubKey.slice(4)
      : newUncompPubKey;
    const newRawPubKey = "0x" + rawPubKey;

    // X / Y in base64 URL safe
    const xPubKey = Buffer.from(newRawPubKey.slice(2, 66), "hex")
      .toString("base64")
      .replace(/=+$/, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    const yPubKey = Buffer.from(newRawPubKey.slice(66), "hex")
      .toString("base64")
      .replace(/=+$/, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const jwk = JSON.stringify({
      kty: "EC",
      crv: "secp256k1",
      d: Buffer.from(wallet.privateKey.slice(2), "hex")
        .toString("base64")
        .replace(/=+$/, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_"),
      x: xPubKey,
      y: yPubKey,
    });

    console.log("JWK:", jwk);

    const signed_vc = await issueCredential(credential, proof_options, jwk);
    console.log("Signed VC:", signed_vc);
  };

  // Load the existing wallet from localStorage
  const loadWallet = async () => {
    const encryptedWallet = localStorage.getItem("encryptedWallet");
    if (encryptedWallet) {
      try {
        setIsLoadingWallet(true);
        const loadedWallet = await ethers.Wallet.fromEncryptedJson(
          encryptedWallet,
          walletPassword
        );
        setWallet(loadedWallet);
        setAccount(loadedWallet.address);
        console.log("Wallet loaded:", loadedWallet);

        const did = "did:ethr:" + loadedWallet.address;
        console.log("DID:", did);
        getDIDandVC(did);
      } catch (err) {
        console.error("Error in loadWallet:", err);
        alert("Failed to load wallet.");
      } finally {
        setIsLoadingWallet(false);
        setIsPasswordModalOpen(false);
      }
    } else {
      alert("No wallet found. Please create a new wallet.");
    }
  };

  // Create or load wallet based on existence
  const handleSubmit = (e) => {
    e.preventDefault();
    if (walletExists) {
      loadWallet();
    } else {
      createWallet();
    }
  };

  // Opens the password modal
  const handleOpenPasswordModal = () => {
    setIsPasswordModalOpen(true);
    setIsLoadingWallet(false);
    setTimeout(() => {
      document.getElementById("wallet-password-input").focus();
    }, 100);
  };

  // Example handler for "Next" button
  const handleNext = () => {
    alert("Proceeding to the next step!");
    // For example, navigate to next page or update state
    // e.g. navigate("/onboarding/step-2")
  };

  return (
    <Sidebar role={"admin"}>
      <div className="col-span-12">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#333333]">User Onboarding</h1>
        </div>

        {/* Wallet Card */}
        <div className="bg-base-100 rounded-2xl shadow-md p-6 relative">
          {/* "Create/Load Wallet" Button */}
          <div className="absolute top-4 right-4">
            <button
              className="btn bg-primary/75 hover:bg-primary text-base-100 p-2 rounded-2xl px-4"
              onClick={handleOpenPasswordModal}
            >
              {walletExists ? "Load Wallet" : "Create Wallet"}
            </button>
          </div>

          {/* Title row in the card */}
          <div className="flex gap-2">
            <KeyRound size={32} className="text-primary" />
            <h2 className="text-xl font-bold text-[#333333]">Wallet</h2>
          </div>

          <div className="mt-6">
            <div className="grid grid-cols-3 gap-y-4 items-center">
              <p className="font-semibold">Wallet:</p>
              <div className="col-span-2">
                <p>{account}</p>
              </div>

              {/* Show Private/Public keys if wallet is loaded */}
              {wallet && (
                <>
                  <p className="font-semibold">Private Key:</p>
                  <div className="col-span-2">
                    <p>{wallet.privateKey}</p>
                  </div>

                  <p className="font-semibold">Public Key:</p>
                  <div className="col-span-2">
                    <p>{wallet.publicKey}</p>
                  </div>

                  {/* "Next" button once wallet is loaded */}
                </>
              )}

              {/* If you also have DID details, they'd appear here */}
              {didDetails && (
                <>
                  <p className="font-semibold">DID Document:</p>
                  <div className="col-span-2">
                    <pre>
                      {JSON.stringify(didDetails.didDocument, null, 2)}
                    </pre>
                  </div>
                  <p className="font-semibold">Credential:</p>
                  <div className="col-span-2">
                    <pre>
                      {JSON.stringify(didDetails.credential, null, 2)}
                    </pre>
                  </div>
                  <p className="font-semibold">Proof Options:</p>
                  <div className="col-span-2">
                    <pre>
                      {JSON.stringify(didDetails.proof_options, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>
          
        </div>
          {/* "Next" button below card (only shown if wallet is loaded) */}
          {wallet && (
            <div className="flex justify-end mt-4">
                <button className="btn bg-primary/75 hover:bg-primary text-base-100 p-2 rounded-2xl px-10" 
                onClick={handleNext}>
                Next
                </button>
            </div>
            )}
      </div>

      {/* 
        Password Modal 
        (Basic example — you can style or create an actual modal if desired)
      */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-md max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">
              {walletExists ? "Load Wallet" : "Create Wallet"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-1" htmlFor="wallet-password-input">
                  Enter Wallet Password
                </label>
                <input
                  id="wallet-password-input"
                  type="password"
                  className="input input-bordered w-full"
                  value={walletPassword}
                  onChange={(e) => setWalletPassword(e.target.value)}
                  required
                />
              </div>

              {isLoadingWallet ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin mr-2" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setIsPasswordModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {walletExists ? "Load" : "Create"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </Sidebar>
  );
};

export default Onboarding;
