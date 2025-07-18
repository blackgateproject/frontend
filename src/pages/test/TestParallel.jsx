import FileSaver from "file-saver";
import { useEffect, useRef, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useVeramoOperations } from "../../hooks/useVeramoOperations";
import {
  createNewWallet,
  encryptAndStoreWallet,
} from "../../utils/contractInteractions";
import { pollForRequestStatus, submitDID } from "../../utils/registrations";
import { performUserVerification } from "../../utils/userVerification";

const roles = ["device", "admin", "user"]; // Example roles, adjust as needed

const TestParallel = () => {
  const [users, setUsers] = useState([]);
  const [generateUsers, setGenerateUsers] = useState(1);
  const [verifyUsers, setVerifyUsers] = useState(1);
  const [proofType, setProofType] = useState("smt");
  const [successfulVerifications, setSuccessfulVerifications] = useState(0);
  const [failedVerifications, setFailedVerifications] = useState(0);

  // State variables for tracking times
  const [totalRegisterTime, setTotalRegisterTime] = useState(0);
  const [totalVerifyTime, setTotalVerifyTime] = useState(0);
  const [fastestRegisterTime, setFastestRegisterTime] = useState(Infinity);
  const [longestRegisterTime, setLongestRegisterTime] = useState(0);
  const [fastestVerifyTime, setFastestVerifyTime] = useState(Infinity);
  const [longestVerifyTime, setLongestVerifyTime] = useState(0);

  const [intervalCount, setIntervalCount] = useState(1);
  const [isIntervalRunning, setIsIntervalRunning] = useState(false);
  const intervalRef = useRef(null);

  const [loadedVC, setLoadedVC] = useState(null);
  const [loadedWallet, setLoadedWallet] = useState(null); // NEW
  const [generatedVP, setGeneratedVP] = useState(null);
  const [vpVerificationResult, setVpVerificationResult] = useState(null);
  const [waitingForVC, setWaitingForVC] = useState(false);

  const { performCreatePresentation, verifyPresentationWithConnector, agent } =
    useVeramoOperations();

  // Add these dummy state setters for verifyMerkleProof
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  useEffect(() => {
    console.log("All users:", users);
  }, [users]);

  useEffect(() => {
    if (waitingForVC && users.length > 0) {
      setLoadedVC(users[users.length - 1].verifiable_credential);
      setLoadedWallet(users[users.length - 1].wallet || null); // <-- Add this line
      setWaitingForVC(false);
    }
  }, [users, waitingForVC]);

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    console.warn(`Generating ${generateUsers} users`);

    let totalTime = 0;
    let fastestTime = Infinity;
    let longestTime = 0;

    // Dummy state setters for createNewWallet (since this is a test page)
    const setWalletExists = () => {};
    const setWallet = () => {};
    const setWalletTimings = () => {};

    // Create an array of promises for parallel execution
    const promises = Array.from({ length: generateUsers }, (_, i) =>
      (async () => {
        const startTime = performance.now();
        console.error("Registering user", i + 1);

        const { wallet: newWallet, walletCreateTime } = await createNewWallet(
          "password",
          setWalletExists,
          setWallet,
          setWalletTimings
        );
        const did = `did:ethr:blackgate:${newWallet.publicKey}`;

        const roles = ["user", "admin", "device"];
        const formData = {
          did: did,
          selected_role: roles[Math.floor(Math.random() * roles.length)],
          alias: String(i + 1),
          firmware_version: `${Math.floor(Math.random() * 10)}.${Math.floor(
            Math.random() * 10
          )}.${Math.floor(Math.random() * 10)}`,
          proof_type: proofType,
          testMode: true,
          walletCreateTime: walletCreateTime,
          device_id: `${i + 1}`,
        };

        // Encrypt and store wallet after DID submission
        const walletEncryptTime = await encryptAndStoreWallet(
          newWallet,
          did,
          setWalletExists,
          setWalletTimings
        );
        formData.walletEncryptTime = walletEncryptTime;
        // const walletEncryptTime = 0; // For testing, set to 0
        const submitResult = await submitDID(formData);
        if (!submitResult) {
          console.error("Failed to submit DID and VC");
          return null;
        }

        try {
          const data = await pollForRequestStatus(
            did,
            submitResult.proof_type || proofType
          );
          if (!data) {
            console.error("No data received from pollForRequestStatus");
            return null;
          }
          if (data.error) {
            console.error("Error in pollForRequestStatus:", data.error);
            throw new Error(data.error);
          }
          if (!data.verifiable_credential) {
            console.error("No verifiable credential received");
            throw new Error("No verifiable credential received");
          }

          const user = {
            verifiable_credential: data.verifiable_credential,
            request_status: data.request_status,
            message: data.message,
            wallet: newWallet,
            smt_proofs: data.smt_proofs || null,
            did,
            times: {
              vc_issuance_time: data.times.vc_issuance_time,
              smt_onchain_add_time: data.times.smt_onchain_add_time,
            },
          };

          const endTime = performance.now();
          const timeTaken = endTime - startTime;
          return { user, timeTaken };
        } catch (error) {
          console.error("Error fetching data:", error);

          const user = {
            verifiable_credential: null,
            request_status: null,
            message: error.message,
            wallet: newWallet,
            did,
          };

          const endTime = performance.now();
          const timeTaken = endTime - startTime;
          return { user, timeTaken };
        }
      })()
    );

    // Wait for all promises to resolve
    const results = await Promise.all(promises);

    // Update users and timing stats
    let usersToAdd = [];
    results.forEach((result) => {
      if (result) {
        usersToAdd.push(result.user);
        totalTime += result.timeTaken;
        if (result.timeTaken < fastestTime) fastestTime = result.timeTaken;
        if (result.timeTaken > longestTime) longestTime = result.timeTaken;
      }
    });

    setUsers((prevUsers) => [...prevUsers, ...usersToAdd]);
    setTotalRegisterTime(totalTime);
    setFastestRegisterTime(fastestTime);
    setLongestRegisterTime(longestTime);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();

    // Use the shared verification logic from userVerification.js
    const veramoOperations = { performCreatePresentation };
    const stateSetters = {
      setSuccessfulVerifications,
      setFailedVerifications,
      setUsers,
      setIsLoadingTx,
      setCurrentStep,
      setErrorMessage,
      setIsErrorModalOpen,
    };

    try {
      const result = await performUserVerification(
        users,
        verifyUsers,
        veramoOperations,
        agent,
        stateSetters
      );

      // Update timing states with results from shared verification logic
      setTotalVerifyTime(result.totalTime);
      setFastestVerifyTime(result.fastestTime);
      setLongestVerifyTime(result.longestTime);
    } catch (error) {
      console.error("Verification failed:", error);
      setErrorMessage(error.message);
      setIsErrorModalOpen(true);
    }
  };

  const handleStartInterval = () => {
    if (isIntervalRunning) {
      clearInterval(intervalRef.current);
      setIsIntervalRunning(false);
      console.log("Interval stopped.");
    } else {
      let runs = 0;
      console.log(`Interval started to run ${intervalCount} times.`);
      intervalRef.current = setInterval(() => {
        if (runs >= intervalCount) {
          clearInterval(intervalRef.current);
          setIsIntervalRunning(false);
          console.log("Interval completed.");
          return;
        }
        handleVerifySubmit(new Event("submit"));
        runs++;
      }, 1000);
      setIsIntervalRunning(true);
    }
  };

  const handleSaveUsers = () => {
    const blob = new Blob([JSON.stringify(users, null, 2)], {
      type: "application/json",
    });
    FileSaver.saveAs(blob, "users.json");
  };

  const handleLoadUsers = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const loadedUsers = JSON.parse(event.target.result);
      setUsers(loadedUsers);
    };
    reader.readAsText(file);
  };

  const handleLoadVC = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        // If file contains both VC and wallet, expect { vc, wallet }
        if (data.vc && data.wallet) {
          setLoadedVC(data.vc);
          setLoadedWallet(data.wallet);
        } else {
          setLoadedVC(data);
          setLoadedWallet(null);
        }
        alert("VC loaded successfully!");
      } catch (err) {
        alert("Failed to parse VC file.");
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateVP = async () => {
    if (!loadedVC) {
      alert("No VC loaded!");
      return;
    }
    try {
      // Pass both VC and wallet
      const vp = await performCreatePresentation(loadedVC, loadedWallet);
      setGeneratedVP(vp);
      // alert("VP generated! See console for details.");
      console.log("Generated VP:", vp);
    } catch (err) {
      alert("Failed to generate VP.");
      console.error(err);
    }
  };

  const handleVerifyVP = async () => {
    if (!generatedVP) {
      alert("No VP generated!");
      return;
    }
    setVpVerificationResult(null);
    try {
      const result = await verifyPresentationWithConnector(generatedVP);
      setVpVerificationResult(result);
      console.log("VP Verification Result:", result);
    } catch (err) {
      setVpVerificationResult({ error: err.message });
      console.error("VP Verification Error:", err);
    }
  };

  const handleRegisterAndLoadVC = async () => {
    setGenerateUsers(1);
    setWaitingForVC(true);
    await handleGenerateSubmit({ preventDefault: () => {} });
    // After user is generated, also store wallet if available
    if (users.length > 0 && users[users.length - 1].wallet) {
      setLoadedWallet(users[users.length - 1].wallet);
    }
  };

  const avgRegisterTime = totalRegisterTime / generateUsers;
  const avgVerifyTime = totalVerifyTime / verifyUsers;

  return (
    <Sidebar role={"test"}>
      <div className="col-span-12 p-6 space-y-8 bg-gray-50 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-[#333333] mb-6">
          Test Page (Parallel)
        </h1>

        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Generate Users
          </h2>
          <form onSubmit={handleGenerateSubmit} className="space-y-4">
            <div className="flex flex-col">
              <label
                htmlFor="generateUsers"
                className="mb-2 font-medium text-gray-700"
              >
                Number of Users:
              </label>
              <input
                type="number"
                id="generateUsers"
                name="generateUsers"
                min="1"
                value={generateUsers}
                onChange={(e) => setGenerateUsers(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="proofType"
                className="mb-2 font-medium text-gray-700"
              >
                ZKP proof type:
              </label>
              <select
                id="proofType"
                name="proofType"
                value={proofType}
                onChange={(e) => setProofType(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {/* <option value="merkle">merkle</option> */}
                <option value="smt">sparse merkle tree</option>
                {/* <option value="accumulator">accumulator</option> */}
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Generate Users
            </button>
          </form>
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-blue-700 font-medium">
              Total Register Time:{" "}
              <span className="font-bold">
                {(totalRegisterTime / 1000).toFixed(2)} s
              </span>
            </p>
            <p className="text-blue-700 font-medium">
              Average Register Time:{" "}
              <span className="font-bold">
                {(avgRegisterTime / 1000).toFixed(2)} s
              </span>
            </p>
            <p className="text-blue-700 font-medium">
              Fastest Register Time:{" "}
              <span className="font-bold">
                {(fastestRegisterTime / 1000).toFixed(2)} s
              </span>
            </p>
            <p className="text-blue-700 font-medium">
              Longest Register Time:{" "}
              <span className="font-bold">
                {(longestRegisterTime / 1000).toFixed(2)} s
              </span>
            </p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Verify Users
          </h2>
          <div className="mb-4 p-3 bg-green-50 rounded-md">
            <p className="text-green-700 font-medium">
              Registered Users:{" "}
              <span className="font-bold">{users.length}</span>
            </p>
          </div>
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div className="flex flex-col">
              <label
                htmlFor="verifyUsers"
                className="mb-2 font-medium text-gray-700"
              >
                Number of Users:
              </label>
              <input
                type="number"
                id="verifyUsers"
                name="verifyUsers"
                min="1"
                value={verifyUsers}
                onChange={(e) => setVerifyUsers(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Verify Users
            </button>
          </form>
          <div className="mt-4">
            <label
              htmlFor="intervalCount"
              className="block mb-2 font-medium text-gray-700"
            >
              Interval Count (times to run):
            </label>
            <input
              type="number"
              id="intervalCount"
              name="intervalCount"
              min="1"
              value={intervalCount}
              onChange={(e) => setIntervalCount(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              onClick={handleStartInterval}
              className={`mt-4 px-4 py-2 ${
                isIntervalRunning
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white rounded-md transition-colors focus:outline-none focus:ring-2 ${
                isIntervalRunning ? "focus:ring-red-500" : "focus:ring-blue-500"
              } focus:ring-offset-2`}
            >
              {isIntervalRunning ? "Stop Interval" : "Start Interval"}
            </button>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-blue-700 font-medium">
              Successful Verifications:{" "}
              <span className="font-bold">{successfulVerifications}</span>
            </p>
            <p className="text-red-700 font-medium">
              Failed Verifications:{" "}
              <span className="font-bold">{failedVerifications}</span>
            </p>
            <p className="text-blue-700 font-medium">
              Total Verify Time:{" "}
              <span className="font-bold">
                {(totalVerifyTime / 1000).toFixed(2)} s
              </span>
            </p>
            <p className="text-blue-700 font-medium">
              Average Verify Time:{" "}
              <span className="font-bold">
                {(avgVerifyTime / 1000).toFixed(2)} s
              </span>
            </p>
            <p className="text-blue-700 font-medium">
              Fastest Verify Time:{" "}
              <span className="font-bold">
                {(fastestVerifyTime / 1000).toFixed(2)} s
              </span>
            </p>
            <p className="text-blue-700 font-medium">
              Longest Verify Time:{" "}
              <span className="font-bold">
                {(longestVerifyTime / 1000).toFixed(2)} s
              </span>
            </p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Save/Load Users
          </h2>
          <button
            onClick={handleSaveUsers}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            Save Users
          </button>
          <input
            type="file"
            accept=".json"
            onChange={handleLoadUsers}
            className="mt-4"
          />
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            VC/VP Utilities
          </h2>
          <div className="flex flex-col gap-4">
            <button
              onClick={handleRegisterAndLoadVC}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Register User and Load VC
            </button>
            {loadedVC && (
              <div className="flex flex-col sm:flex-row gap-4 mb-2">
                {/* credentialSubject Preview */}
                <div className="bg-gray-100 rounded p-2 text-xs flex-1 h-40 overflow-y-auto">
                  <div className="font-bold mb-1">
                    credentialSubject Preview:
                  </div>
                  <pre>
                    {JSON.stringify(
                      loadedVC.credential?.credentialSubject ||
                        loadedVC.credentialSubject,
                      null,
                      2
                    )
                      .split("\n")
                      .slice(0, 6)
                      .join("\n")}
                    {Object.keys(
                      loadedVC.credential?.credentialSubject ||
                        loadedVC.credentialSubject
                    ).length > 6 && "\n..."}
                  </pre>
                </div>
                {/* Wallet Preview */}
                {loadedWallet && (
                  <div className="bg-gray-100 rounded p-2 text-xs flex-1 h-40 overflow-y-auto">
                    <div className="font-bold mb-1">Wallet Preview:</div>
                    <pre>
                      {JSON.stringify(loadedWallet, null, 2)
                        .split("\n")
                        .slice(0, 8)
                        .join("\n")}
                      {Object.keys(loadedWallet).length > 8 && "\n..."}
                    </pre>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={handleGenerateVP}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={!loadedVC}
            >
              Generate VP from Loaded VC
            </button>
            <button
              onClick={handleVerifyVP}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              disabled={!generatedVP}
            >
              Verify Generated VP
            </button>
            {/* VP Preview */}
            {generatedVP && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto h-40 overflow-y-auto">
                <div className="font-bold mb-1">
                  Verifiable Presentation Preview:
                </div>
                <pre>{JSON.stringify(generatedVP, null, 2)}</pre>
              </div>
            )}
            {/* VP Verification Result */}
            {vpVerificationResult && (
              <div className="mt-2 p-2 bg-green-100 rounded text-xs overflow-x-auto h-40 overflow-y-auto">
                <div className="font-bold mb-1">VP Verification Result:</div>
                <pre>{JSON.stringify(vpVerificationResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default TestParallel;
