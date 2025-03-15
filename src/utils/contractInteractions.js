import { ethers } from "ethers";
import { Provider, Wallet } from "zksync-web3";

{ /*
  Make sure ContractABI points to the contract ABI, 
  for dev, it is created+stored in the blockchain repo after contract compiles+deploys
  for prod, it will be stored in the /contracts folder
  */}
import ContractABI from "../../../blockchain/deployments-zk/zkSyncSepoliaTestnet/contracts/Merkle.sol/Merkle.json";


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
export const contractInstance = async () => {
  const provider = await providerInstance("ethers");
  const contractAddress = ContractABI.entries[0].address;
  const contractABI = ContractABI.abi;
  console.log("Contract Address:", contractAddress);
  // console.log("Contract ABI:", contractABI);
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  return contract;
};

export const fetchBalance = async (wallet, setBalance) => {
  if (wallet) {
    const provider = await providerInstance("ethers");
    const balance = await provider.getBalance(wallet.address);
    setBalance(parseFloat(ethers.formatEther(balance)).toFixed(4));
  }
};

export const createNewWallet = async (
  walletPassword,
  setWalletExists,
  setWallet,
  // setAccount
) => {
  console.log("Creating new wallet with password:", walletPassword);
  const newWallet = ethers.Wallet.createRandom();
  const encryptedWallet = await newWallet.encrypt(walletPassword);
  localStorage.setItem("encryptedWallet", encryptedWallet);
  setWalletExists(true);
  setWallet(newWallet);
  // setAccount(newWallet.address);
  console.log("New wallet created:", newWallet);
};

export const loadWallet = async (
  encryptedWallet,
  walletPassword,
  setWallet,
  // setAccount,
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
      // setAccount(loadedWallet.address);
      console.log("Wallet loaded:", loadedWallet);
      setIsWalletLoaded(true);

      const provider = await providerInstance("zksync");
      const zkSyncWallet = new Wallet(loadedWallet.privateKey, provider);
      const signer = zkSyncWallet.connect(provider);
      console.log("Signer:", signer);
      setSigner(signer);

      return { wallet: loadedWallet, signer };
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
