import { createAgent, IDIDManager, IKeyManager, IResolver } from "@veramo/core";
import {
  ICredentialIssuerLD
} from "@veramo/credential-ld";
import { CredentialPlugin, ICredentialIssuer } from "@veramo/credential-w3c";
import { DIDManager, MemoryDIDStore } from "@veramo/did-manager";
import { EthrDIDProvider } from "@veramo/did-provider-ethr";
import { DIDResolverPlugin } from "@veramo/did-resolver";
import {
  KeyManager,
  MemoryKeyStore,
  MemoryPrivateKeyStore,
} from "@veramo/key-manager";
import { KeyManagementSystem } from "@veramo/kms-local";
import { Resolver } from "did-resolver";
import { getResolver as ethrDidResolver } from "ethr-did-resolver";

import ContractABI from "../../../blockchain/deployments-zk/zkSyncSepoliaTestnet/contracts/EthereumDIDRegistry.sol/EthereumDIDRegistry.json" with { type: "json" };
import { JsonRpcProvider } from "ethers";


{/*
  Make sure to copy both the contract ABI and the address to contract
  */}

interface ImportMetaEnv {
  readonly VITE_INFURA_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
// export const MY_CUSTOM_CONTEXT_URI = "https://example.com/custom/context";

// const extraContexts: Record<string, ContextDoc> = {};
// extraContexts[MY_CUSTOM_CONTEXT_URI] = {
//   "@context": {
//     nothing: "https://example.com/custom/context",
//   },
// };
const INFURA_PROJECT_ID = import.meta.env.VITE_INFURA_PROJECT_ID || null;
console.log("Loaded INFURA_PROJECT_ID:", INFURA_PROJECT_ID);

export const localAgent = createAgent<
  IResolver &
    ICredentialIssuer &
    IDIDManager &
    IKeyManager &
    ICredentialIssuerLD
>({
  plugins: [
    new KeyManager({
      store: new MemoryKeyStore(),
      kms: {
        local: new KeyManagementSystem(new MemoryPrivateKeyStore()), // for this sample, keys are stored in memory
      },
    }),
    new DIDManager({
      store: new MemoryDIDStore(),
      defaultProvider: "blackgate",
      providers: {
        // "did:ethr:sepolia": new EthrDIDProvider({
        //   defaultKms: "local",
        //   network: "sepolia",
        //   rpcUrl: "https://sepolia.infura.io/v3/" + INFURA_PROJECT_ID,
        //   gas: 100000,
        //   ttl: 60 * 60 * 24 * 30 * 12 + 1,
        // }),
        "did:ethr:blackgate": new EthrDIDProvider({
          defaultKms: "local",
          networks: [
            {
              name: "blackgate",
              // rpcUrl: `https://zksync-sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
              // chainId: 300,
              provider: new JsonRpcProvider(
                `https://zksync-sepolia.infura.io/v3/${INFURA_PROJECT_ID}`, 300),
              registry: ContractABI.entries[0].address,
            }
              
          ]
        }),
      },
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({
          // infuraProjectId: INFURA_PROJECT_ID,
          // provider: 
          provider: new JsonRpcProvider("https://zksync-sepolia.infura.io/v3/" + INFURA_PROJECT_ID) as any,
          registry: ContractABI.entries[0].address,
          chainId: 300,
          name: "blackgate",
        }) // Add other resolvers if needed
      }),
    }),
    new CredentialPlugin(),
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
