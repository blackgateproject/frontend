import {
  CredentialPayload,
  IDIDManager,
  IIdentifier,
  IResolver,
  IVerifyPresentationArgs,
  TAgent,
  TKeyType,
  VerifiableCredential,
  VerifiablePresentation,
} from "@veramo/core";
import { ICredentialIssuer } from "@veramo/credential-w3c";
import { Wallet } from "ethers";
import { v4 as uuidv4 } from "uuid";
// import { MY_CUSTOM_CONTEXT_URI } from "../veramo/create-agent";

/**
 * Create a managed DID using the `defaultProvider` configured in ./setup.ts (did:key)
 * @param agent
 */
export async function createDID(
  agent: TAgent<IDIDManager>
): Promise<IIdentifier> {
  const identifier = await agent.didManagerCreate();
  return identifier;
}

export async function createEthrDID(
  agent: TAgent<IDIDManager>
): Promise<IIdentifier> {
  const identifier = await agent.didManagerCreate({
    provider: "did:ethr",
  });
  return identifier;
}

export async function importEthrDID(
  agent: TAgent<IDIDManager>,
  privateKeyHex: string,
  publicKeyHex: string
): Promise<IIdentifier> {
  //   console.log("Importing DID with address: ", address);
  //   console.log("Importing DID with privateKeyHex: ", privateKeyHex);
  //   console.log("Importing DID with publicKey: ", publicKeyHex);
  console.log(
    "List of Providers to agent: ",
    await agent.didManagerGetProviders()
  );
  const data = {
    did: `did:ethr:blackgate:${publicKeyHex}`,
    alias: uuidv4().slice(0, 6),
    provider: "did:ethr:blackgate",
    keys: [
      {
        kid: publicKeyHex.slice(2),
        publicKeyHex: publicKeyHex.slice(2),
        privateKeyHex: privateKeyHex,
        kms: "local",
        type: "Secp256k1" as TKeyType,
      },
    ],
  };

  console.log("Importing DID with data: \n", data);

  const identifier = await agent.didManagerImport(data);
  return identifier;
}

export async function verifyDIDDoc(
  agent: TAgent<IResolver>,
  did: string
): Promise<any | undefined> {
  const didResolutionResult = await agent.resolveDid({ didUrl: did });
  if (didResolutionResult.didDocument) {
    console.log("DID Document: ", didResolutionResult);
    return didResolutionResult;
  }
  return undefined;
}

/**
 * Issue a JSON-LD Verifiable Credential using the DID managed by the agent
 *
 * The agent was initialized with a `CredentialIssuer` and `CredentialIssuerLD` plugins (See ./setup.ts) which provide
 * the `createVerifiableCredential` functionality. They internally rely on the `DIDResolver`, `KeyManager`, and
 * `DIDManager` plugins that are used to map the issuer of the `CredentialPayload` to a `VerificationMethod` in the
 * issuer `DID Document` and to a signing key managed by the agent.
 *
 * @param issuer
 * @param agent
 */
export async function createLDCredential(
  issuer: IIdentifier,
  agent: TAgent<ICredentialIssuer>
): Promise<VerifiableCredential> {
  const credential: CredentialPayload = {
    // "@context": [MY_CUSTOM_CONTEXT_URI],
    issuer: issuer.did,
    credentialSubject: {
      nothing: "else matters",
    },
  };
  const verifiableCredential = await agent.createVerifiableCredential({
    credential,
    proofFormat: "lds", // use LD Signatures as proof
  });
  return verifiableCredential;
}
export async function createLDCredentialWithEthrIssuer(
  issuer: IIdentifier,
  agent: TAgent<ICredentialIssuer>,
  formData: any
): Promise<VerifiableCredential> {
  const credentialSubject: any = {};

  // Filter out keys with no values and add the rest to credentialSubject
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      credentialSubject[key] = value;
    }
  });

  const credential: CredentialPayload = {
    // "@context": [MY_CUSTOM_CONTEXT_URI],
    issuer: issuer.did,
    credentialSubject,
  };

  const verifiableCredential = await agent.createVerifiableCredential({
    credential,
    proofFormat: "jwt", // use LD Signatures as proof
  });
  return verifiableCredential;
}
/**
 * Verify a credential using the agent.
 *
 * The agent was initialized with the `CredentialIssuer` and `CredentialIssuerLD` plugins (See ./setup.ts) which
 * perform the actual verification. These plugins use the `DIDResolver` plugin to automatically resolve the `DID
 * Document` of the credential issuer during verification to obtain the verification method data specified by the
 * `proof` property of the credential.
 *
 * Note: For the credential issued with a did:ethr, the easiest method is to add  VeramoEcdsaSecp256k1RecoverySignature2020 in your agent setup. Else you won't be able to actually verify the credential.
 * @param credential
 * @param agent
 */
export async function verifyLDCredential(
  credential: VerifiableCredential,
  agent: TAgent<ICredentialIssuer>
): Promise<boolean> {
  const verified = await agent.verifyCredential({ credential });
  return verified;
}

export async function createPresentationFromCredential(
  vc: VerifiableCredential,
  agent: TAgent<ICredentialIssuer & IVerifyPresentationArgs>,
  wallet: Wallet,
  smt_proofs: any[] = []
): Promise<VerifiablePresentation> {
  console.warn("Creating presentation from credential");
  console.log("Credential: ", vc);

  // Unwrap if VC is nested under 'credential'
  const actualVC: any = (vc as any).credential ? (vc as any).credential : vc;

  // ensure credential exists
  if (!actualVC) {
    throw new Error("Credential is required");
  }

  // Safely extract holder and verifier IDs
  const holder =
    typeof actualVC.credentialSubject?.did === "string"
      ? actualVC.credentialSubject.did
      : typeof actualVC.credentialSubject?.id === "string"
      ? actualVC.credentialSubject.id
      : undefined;
  console.log("Holder: ", holder);

  // issuer can be a string or object with id
  let verifier: string | undefined;
  if (typeof actualVC.issuer === "string") {
    verifier = actualVC.issuer;
  } else if (
    typeof actualVC.issuer === "object" &&
    actualVC.issuer !== null &&
    "id" in actualVC.issuer
  ) {
    verifier = (actualVC.issuer as { id: string }).id;
  }
  console.log("Verifier: ", verifier);

  // We'll import the DID into the agent's DID manager
  const privateKey = wallet.privateKey;
  const publicKey = (holder || "").replace("did:ethr:", "");
  console.warn("PrivateKey: ", privateKey);
  console.warn("PublicKey: ", publicKey);

  // Import the DID into the agent's DID manager
  const identifier = await agent.didManagerImport({
    did: holder,
    alias: uuidv4().slice(0, 6),
    provider: "did:ethr:blackgate",
    keys: [
      {
        kid: publicKey,
        publicKeyHex: publicKey,
        privateKeyHex: privateKey,
        kms: "local",
        type: "Secp256k1" as TKeyType,
      },
    ],
  });
  console.log("Identifier: ", identifier);

  const VerifiablePresentation = await agent.createVerifiablePresentation({
    presentation: {
      verifiableCredential: [actualVC],
      holder: holder,
      verifier: verifier ? [verifier] : [],
      // verifier: [],
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(new Date(actualVC.issuanceDate).getTime() / 1000),
      // expirationDate: new Date(Date.now() - 24 * 60 *60 *60 *1000).toISOString(),
      expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      smt_proofs: smt_proofs,
    },
    proofFormat: "jwt",
    // Setup a nonce for challenge; randomly generated each time
    challenge: uuidv4(),
    // domain: "http://127.0.0.1:5000"
    // removeOriginalFields: false,
      
    // save: true,
  });
  return VerifiablePresentation;
}
