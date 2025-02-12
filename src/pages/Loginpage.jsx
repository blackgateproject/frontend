import { issueCredential, resolveDID } from "@spruceid/didkit-wasm";
import { Buffer } from "buffer";
import { ethers, SigningKey } from "ethers";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enabled2fa, setEnabled2fa] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: fetching 2fa state, 3: 2fa/password
  const [sliding, setSliding] = useState(false);
  const [uuid, setUuid] = useState("");
  const navigate = useNavigate();
  const [walletExists, setWalletExists] = useState(
    !!localStorage.getItem("encryptedWallet")
  );
  const [walletPassword, setWalletPassword] = useState("");
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [account, setAccount] = useState("");
  const [signedVC, setSignedVC] = useState(null);

  const fetchUserUUIDAnd2FA = async (email) => {
    try {
      // const accessToken = sessionStorage.getItem("access_token") || "";

      const response = await fetch(
        `http://127.0.0.1:8000/auth/v1/get-uuid-and-2fa`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            // Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUuid(data.uuid);
        setEnabled2fa(data.enabled2fa);

        if (data.role === "adminOnboard") {
          navigate(`/admin/onboarding`);
        } else if (data.role === "userOnboard") {
          navigate(`/user/onboarding`);
        }
      }
    } catch (error) {
      console.error("Error fetching user UUID and 2FA state:", error);
    }
  };

  const handle2FAState = async (uuid, state) => {
    try {
      // const accessToken = sessionStorage.getItem("access_token") || "";

      const response = await fetch(
        `http://127.0.0.1:8000/auth/v1/set-2fa-state`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            // Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ uuid, state }),
        }
      );

      if (!response.ok) {
        console.error("Failed to set 2FA state");
      }
    } catch (error) {
      console.error("Error setting 2FA state:", error);
    }
  };

  useEffect(() => {
    if (enabled2fa && step === 3) {
      // AWAIS:: DISABLED MFA QUERY FOR NOW
      // handle2FAState(uuid, true);
    }
  }, [enabled2fa, step]);

  const query2FASession = async () => {
    try {
      // const accessToken = sessionStorage.getItem("access_token") || "";

      const response = await fetch(
        `http://127.0.0.1:8000/auth/v1/2fa-frontend-check`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            // Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ uuid }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.isLoginAccepted) {
          sessionStorage.setItem("access_token", data.access_token);
          sessionStorage.setItem("refresh_token", data.refresh_token);
          sessionStorage.setItem("uuid", uuid);

          // if (data.role === "adminOnboard") {
          //   navigate(`/admin/onboarding`);
          // } else if (data.role === "userOnboard") {
          //   navigate(`/user/onboarding`);
          // } else {
          //   navigate(`/${data.role}/dashboard`);
          // }
        }
      }
    } catch (error) {
      console.error("Error querying 2FA session:", error);
    }
  };

  // AWAIS:: DISABLED MFA QUERY FOR NOW
  // useEffect(() => {
  //   if (enabled2fa && step === 3) {
  //     const interval = setInterval(query2FASession, 5000);
  //     return () => clearInterval(interval);
  //   }
  // }, [enabled2fa, step]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    console.log("Fetching 2fa state for email: ", email);
    setSliding(true);
    setStep(2);
    await fetchUserUUIDAnd2FA(email);
    setSliding(false);
    setStep(3);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const URL = "http://127.0.0.1:8000/auth/v1/verify";

    const user = {
      email: email,
      password: password,
      // accVal: sessionStorage.getItem("accVal"),
      // accProof: sessionStorage.getItem("accProof"),
      // accPrime: sessionStorage.getItem("accPrime"),
      did: sessionStorage.getItem("did"),
      signedVC: signedVC,
    };

    console.log("USER: ", JSON.stringify(user));

    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);

      if (data["authenticated"] === true) {
        console.log(
          "Authenticated! Navigating to: ",
          `/${data.role}/dashboard`
        );
        navigate(`/${data.role}/dashboard`);

        if (data["error"]) {
          console.log("Response: ", data["error"]);
        }

        sessionStorage.setItem("access_token", data.access_token);
        sessionStorage.setItem("refresh_token", data.refresh_token);
        sessionStorage.setItem("uuid", data.uuid);
        console.log("Set Access Token: ", data.access_token);
        console.log("Set Refresh Token: ", data.refresh_token);
        console.log("Set UUID: ", data.uuid);
      } else {
        console.log("Response: ", data["error"]);
      }
    } else {
      const errorData = await response.json();
      alert("Failed to authenticate user\n" + errorData.error);
      console.log(
        "Unable to authenticate user\n" +
          response.statusText +
          "\nServer Error: " +
          errorData.error
      );
    }
  };

  // const accumulatorProof = async () => {
  //   const URL = "http://localhost:8000/auth/v1/verify-accumulator";
  //   const response = await fetch(URL, {
  //     method: "POST",
  //     headers: {
  //       "content-type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       accVal: sessionStorage.getItem("accVal"),
  //       accProof: sessionStorage.getItem("accProof"),
  //       accPrime: sessionStorage.getItem("accPrime"),
  //     }),
  //   });

  //   if (response.ok) {
  //     const data = await response.json();
  //     console.log(data);

  //     //Set accesstoken and uuid to session storage
  //     sessionStorage.setItem("access_token", data.access_token);
  //     sessionStorage.setItem("uuid", data.uuid);
  //     console.log("Set Access Token: ", data.access_token);
  //     console.log("Set UUID: ", data.uuid);

  //     navigate(`/${data.role}/dashboard`);

  //     if (data["authenticated"] === true) {
  //       console.log("Authenticated!");
  //     } else {
  //       console.log("Response: ", data["error"]);
  //     }
  //   } else {
  //     const errorData = await response.json();
  //     alert("Failed to authenticate user\n" + errorData.error);
  //     console.log(
  //       "Unable to authenticate user\n" +
  //         response.statusText +
  //         "\nServer Error: " +
  //         errorData.error
  //     );
  //   }
  // };

  const getDIDandVC = async (did) => {
    if (!wallet) {
      console.error("Wallet is not loaded.");
      return;
    }
    const didDoc = await resolveDID(String(did), "{}");
    console.log("DID Document:", didDoc);
    const credential = JSON.stringify({
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: did,
      credentialSubject: { id: "did:example:123" },
      issuanceDate: new Date().toISOString(),
    });

    console.log("Credential:", credential);
    const proof_options = JSON.stringify({
      proofPurpose: "assertionMethod",
      verificationMethod: `${did}#controller`,
    });

    console.log("Proof Options:", proof_options);

    let newUncompPubKey = SigningKey.computePublicKey(wallet.privateKey, false);
    // console.log("New Uncompressed Public Key:", newUncompPubKey);
    if (newUncompPubKey instanceof Uint8Array) {
      newUncompPubKey = hexlify(newUncompPubKey);
    }

    // Remove the '0x04' prefix
    const rawPubKey = newUncompPubKey.startsWith("0x04")
      ? newUncompPubKey.slice(4)
      : newUncompPubKey;
    const newRawPubKey = "0x" + rawPubKey;
    // console.log("Public Key with 0x prefix:", newRawPubKey);

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
    // console.log("X Public Key:", xPubKey);
    // console.log("Y Public Key:", yPubKey);
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
      // y: Buffer.from(wallet.publicKey.slice(32), "hex")
      // .toString("base64")
      // .replace(/=+$/, "")
      // .replace(/\+/g, "-")
      // .replace(/\//g, "_"),
    });
    // console.log("Wallet Private Key:", wallet.privateKey);
    // const Uint8ArrayKey = new Uint8Array(Buffer.from(wallet.privateKey.slice(2), "hex"));
    // const jwk = await exportJWK(Uint8ArrayKey)

    console.log("JWK:", jwk);
    const signed_vc = await issueCredential(
      credential,
      // "{}",
      proof_options,
      // "{}",
      // String(wallet.privateKey)
      jwk
      // "{}"
    );
    console.log("Signed VC:", signed_vc);
    setSignedVC(signed_vc);
  };

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
        setWallet(loadedWallet); // Ensure wallet is set before calling getDIDandVC
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

  const handleOpenPasswordModal = () => {
    setIsPasswordModalOpen(true);
    setIsLoadingWallet(false);
    setTimeout(() => {
      document.getElementById("wallet-password-input").focus();
    }, 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadWallet();
  };

  const handleSupabaseLogin = async (email, password) => {
    const URL = "http://127.0.0.1:8000/auth/v1/verify";
    const user = {
      email,
      password,
      // accVal: sessionStorage.getItem("accVal"),
      // accProof: sessionStorage.getItem("accProof"),
      // accPrime: sessionStorage.getItem("accPrime"),
    };

    console.log("USER: ", JSON.stringify(user));

    const startTime = performance.now(); // Start timing

    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(user),
    });

    const endTime = performance.now(); // End timing
    const timeTaken = endTime - startTime; // Calculate time taken

    if (response.ok) {
      const data = await response.json();
      console.log(data);

      if (data["authenticated"] === true) {
        console.log("Authenticated! Navigating to: ", `/admin/dashboard`);
        navigate(`/admin/dashboard`);

        if (data["error"]) {
          console.log("Response: ", data["error"]);
        }

        sessionStorage.setItem("access_token", data.access_token);
        sessionStorage.setItem("refresh_token", data.refresh_token);
        sessionStorage.setItem("uuid", data.uuid);
        console.log("Set Access Token: ", data.access_token);
        console.log("Set Refresh Token: ", data.refresh_token);
        console.log("Set UUID: ", data.uuid);

        alert(`Login successful! Time taken: ${timeTaken.toFixed(2)} ms`);
      } else {
        console.log("Response: ", data["error"]);
      }
    } else {
      const errorData = await response.json();
      alert("Failed to authenticate user\n" + errorData.error);
      console.log(
        "Unable to authenticate user\n" +
          response.statusText +
          "\nServer Error: " +
          errorData.error
      );
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600">
      <div className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 overflow-hidden">
        {(step === 2 || step === 3) && (
          <button
            onClick={() => window.location.reload()}
            className="btn btn-sm btn-outline mb-4"
          >
            Back
          </button>
        )}
        <img src={logo} alt="logo" className="w-24 mx-auto mb-4" />
        <h2 className="text-center text-3xl font-bold mb-6 text-primary">
          BLACKGATE
        </h2>

        <div
          className={`transition-transform duration-300 ${
            sliding ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          {step === 1 ? (
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-4">
                <input
                  type="email"
                  className="input input-bordered w-full rounded-2xl"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl">
                Next
              </button>
            </form>
          ) : step === 2 ? (
            <div className="text-center">
              <p className="mb-4">Fetching 2FA state...</p>
            </div>
          ) : (
            <div
              className={`transition-transform duration-300 ${
                sliding ? "translate-x-full" : "translate-x-0"
              }`}
            >
              {enabled2fa ? (
                <>
                  <div className="text-center">
                    <p className="mb-4">
                      Please open the BlackGate mobile app on your phone in
                      order to proceed with 2FA verification.
                    </p>
                    <p className="text-sm text-gray-600">
                      Check your phone for the authentication code
                    </p>
                  </div>
                  
                   
                  
                </>
              ) : (
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <input
                      type="password"
                      className="input input-bordered w-full rounded-2xl"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl">
                    Sign In
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {step === 1 && !enabled2fa && (
          <div className="mt-4 text-center">
            <button
              onClick={async () => {
                setEmail("a@admin.com");
                await handleEmailSubmit();
                setPassword("123456");
                handleLogin();
              }}
              className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl"
            >
              Login as Admin
            </button>
            <button
              onClick={async () => {
                setEmail("a@user.com");
                await handleEmailSubmit();
                setPassword("123456");
                await handleLogin();
              }}
              className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl"
            >
              Login as User
            </button>
          </div>
        )}
        <button
          onClick={handleOpenPasswordModal}
          className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl mt-4"
          disabled={!walletExists || signedVC}
        >
          Unlock and Connect Wallet
        </button>
        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-purple-600">
            Forgot Password?
          </a>
        </div>
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
    </div>
  );
};

export default LoginPage;
