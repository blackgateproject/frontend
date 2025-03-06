import { issueCredential, resolveDID } from "@spruceid/didkit-wasm";
import { Buffer } from "buffer";
import { SigningKey } from "ethers";

export const getDIDandVC = async (
  wallet,
  did,
  selectedClaims,
  // setSignedVC,
  setIsLoadingDID,
  setCurrentStep
) => {
  if (!wallet) {
    console.error("Wallet is not loaded.");
    return;
  }
  console.log("DID:", did);
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
  // setSignedVC(signed_vc);

  //   // Send DID, DIDDoc, and VC to Connector
  //   const response = await fetch("http://127.0.0.1:8000/connector/verify", {
  //     method: "POST",
  //     headers: {
  //       "content-type": "application/json",
  //     },
  //     body: JSON.stringify({ did, didDoc, signed_vc }),
  //   });

  //   try {
  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log("Challenge received:", data.challenge);
  //       return data.challenge;
  //     } else {
  //       console.error("Failed to verify with connector");
  //       return null;
  //     }
  //   } finally {
  //     setIsLoadingDID(false);
  //   }
  return signed_vc;
};

export const signChallenge = async (wallet, challenge, navigate) => {
  if (!wallet || !challenge) {
    console.error("Wallet or challenge is not available.");
    return;
  }

  const signature = await wallet.signMessage(challenge);
  console.log("Signed Challenge:", signature);

  // Send signed challenge back to Connector
  const response = await fetch("http://127.0.0.1:8000/connector/finalize", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ signature }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log("Registration finalized:", data);
    navigate("/dashboard");
  } else {
    console.error("Failed to finalize registration");
  }
};
