import { createAgent, IDIDManager, IKeyManager, IResolver } from "@veramo/core";
import { ICredentialIssuer } from "@veramo/credential-w3c";
import { DIDManager, MemoryDIDStore } from "@veramo/did-manager";
import { EthrDIDProvider } from "@veramo/did-provider-ethr";
import { getDidKeyResolver } from "@veramo/did-provider-key";
import { DIDResolverPlugin } from "@veramo/did-resolver";
import {
  KeyManager,
  MemoryKeyStore,
  MemoryPrivateKeyStore,
} from "@veramo/key-manager";
import { KeyManagementSystem } from "@veramo/kms-local";
import { Resolver } from "did-resolver";
import { getResolver as ethrDidResolver } from "ethr-did-resolver";

interface ImportMetaEnv {
  readonly VITE_INFURA_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const INFURA_PROJECT_ID = import.meta.env.VITE_INFURA_PROJECT_ID || null;
console.log("Loaded INFURA_PROJECT_ID:", INFURA_PROJECT_ID);

export const localAgent = createAgent<
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

// import { createAgent, IResolver } from "@veramo/core";
// import { DIDResolverPlugin } from "@veramo/did-resolver";
// import { Resolver } from "did-resolver";
// import { getResolver as ethrDidResolver } from "ethr-did-resolver";
// import { getResolver as webDidResolver } from "web-did-resolver";

// // You will need to get a project ID from infura https://www.infura.io
// const INFURA_PROJECT_ID = import.meta.env.VITE_INFURA_PROJECT_ID || null;
// console.log("Loaded INFURA_PROJECT_ID:", INFURA_PROJECT_ID);
// export const localAgent = createAgent<IResolver>({
//   plugins: [
//     new DIDResolverPlugin({
//       resolver: new Resolver({
//         ...ethrDidResolver({
//           infuraProjectId: INFURA_PROJECT_ID,
//         }),
//         ...webDidResolver(),
//       }),
//     }),
//   ],
// });
