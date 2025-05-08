import { ethers } from "ethers";
import { Provider, Wallet } from "zksync-web3";

export const providerInstance = async (providerType) => {
  // Use "ethers" for Ethereum and "zksync" for zkSync
  if (providerType === "zksync") {
    const provider = new Provider("https://sepolia.era.zksync.dev");
    return provider;
  } else if (providerType === "ethers") {
    const provider = new ethers.JsonRpcProvider(
      "https://sepolia.era.zksync.dev"
    );
    return provider;
  }
};

// New helper function for wallet encryption
export const encryptAndStoreWallet = async (
  wallet,
  walletPassword,
  setWalletExists,
  setWalletTimings
) => {
  try {
    const encryptStart = performance.now();
    const encryptedWallet = await wallet.encrypt(walletPassword);
    const walletEncryptTime = performance.now() - encryptStart;
    setWalletTimings((prev) => ({
      ...prev,
      walletEncryptTime,
    }));
    localStorage.setItem("encryptedWallet", encryptedWallet);
    setWalletExists(true);
    console.info("Wallet Encrypt Time (walletEncryptTime):", walletEncryptTime);
    return walletEncryptTime;
  } catch (err) {
    console.error("Error encrypting/storing wallet:", err);
    throw err;
  }
};

export const createNewWallet = async (
  walletPassword,
  setWalletExists,
  setWallet,
  setWalletTimings
) => {
  console.log("Creating new wallet with password:", walletPassword);
  const startTime = performance.now();
  const newWallet = ethers.Wallet.createRandom();
  const walletCreateTime = performance.now() - startTime;

  // // Start encryption in the background
  // (async () => {
  //   try {
  //     const walletEncryptTime = await encryptAndStoreWallet(
  //       newWallet,
  //       walletPassword,
  //       setWalletExists,
  //       setWalletTimings
  //     );
  //     setWalletTimings({ walletCreateTime, walletEncryptTime });
  //   } catch (err) {
  //     // Error already logged in helper
  //   }
  // })();

  setWallet(newWallet);
  console.log("New wallet created:", newWallet);
  console.info("Wallet Create Time (walletCreateTime):", walletCreateTime);
  console.info("walletTimes: ");
  // Return immediately, encryption happens in background
  return { wallet: newWallet, walletCreateTime, walletEncryptTime: null };
};

export const loadWallet = async (
  encryptedWallet,
  walletPassword,
  setWallet,
  setIsWalletLoaded,
  setIsLoadingWallet,
  setIsPasswordModalOpen,
  setSigner
) => {
  if (encryptedWallet) {
    try {
      console.log("Loading wallet with password:", walletPassword);
      setIsLoadingWallet(true);
      const loadedWallet = await ethers.Wallet.fromEncryptedJson(
        encryptedWallet,
        walletPassword
      );
      setWallet(loadedWallet);
      console.log("Wallet loaded:", loadedWallet);
      setIsWalletLoaded(true);

      const provider = await providerInstance("zksync");
      const zkSyncWallet = new Wallet(loadedWallet.privateKey, provider);
      const signer = zkSyncWallet.connect(provider);
      console.log("Signer:", signer);
      setSigner(signer);

      return {
        wallet: loadedWallet,
        signer,
        walletCreateTime: null,
        walletEncryptTime: null,
      };
    } catch (err) {
      console.error("Error in loadWallet:", err);
      alert(`Error in loadWallet: ${err}`);
    } finally {
      setIsLoadingWallet(false);
      setIsPasswordModalOpen(false);
    }
  } else {
    alert("No wallet found. Please create a new wallet.");
  }
};
