import {
  createAgent,
  IDIDManager,
  IKeyManager,
  IResolver,
  TAgent,
} from "@veramo/core";
import {
  ContextDoc,
  CredentialIssuerLD,
  LdDefaultContexts,
  VeramoEd25519Signature2018,
  VeramoEcdsaSecp256k1RecoverySignature2020,
} from "@veramo/credential-ld";
import { CredentialIssuer, ICredentialIssuer } from "@veramo/credential-w3c";
import { DIDManager, MemoryDIDStore } from "@veramo/did-manager";
import { getDidKeyResolver, KeyDIDProvider } from "@veramo/did-provider-key";
import { DIDResolverPlugin } from "@veramo/did-resolver";
import {
  KeyManager,
  MemoryKeyStore,
  MemoryPrivateKeyStore,
} from "@veramo/key-manager";
import { KeyManagementSystem } from "@veramo/kms-local";
import { Resolver } from "did-resolver";
import { EthrDIDProvider } from "@veramo/did-provider-ethr";
import { getResolver as ethrDidResolver } from "ethr-did-resolver";

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || "";

export const agent = createAgent<
  IResolver & ICredentialIssuer & IDIDManager & IKeyManager
>({
  plugins: [
    new KeyManager({
      store: new MemoryKeyStore(),
      kms: {
        local: new KeyManagementSystem(new MemoryPrivateKeyStore()), // for this sample, keys are stored in memory
      },
    }),
    new DIDManager({
      providers: {
        // "did:key": new KeyDIDProvider({ defaultKms: "local" }),
        "did:ethr:sepolia": new EthrDIDProvider({
          defaultKms: "local",
          network: "sepolia",
          rpcUrl: "https://sepolia.infura.io/v3/" + INFURA_PROJECT_ID,
          gas: 100000,
          ttl: 60 * 60 * 24 * 30 * 12 + 1,
        }),
      },
      store: new MemoryDIDStore(),
      defaultProvider: "did:ethr:sepolia",
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
        ...getDidKeyResolver(),
      }),
    }),
    // new CredentialIssuer(),
    // new CredentialIssuerLD({
    //   contextMaps: [LdDefaultContexts, extraContexts],
    //   suites: [
    //     new VeramoEd25519Signature2018(),
    //     new VeramoEcdsaSecp256k1RecoverySignature2020(), //needed for did:ethr
    //   ],
    // }),
  ],
});
