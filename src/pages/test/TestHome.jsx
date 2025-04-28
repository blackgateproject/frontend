import { ethers } from "ethers";
import FileSaver from "file-saver";
import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { connectorURL } from "../../utils/readEnv";
import { submitDID } from "../../utils/registrations";
const TestDashboard = () => {
  const [users, setUsers] = useState([]);
  const [generateUsers, setGenerateUsers] = useState(1);
  const [verifyUsers, setVerifyUsers] = useState(1);
  const [proofType, setProofType] = useState("merkle"); // <-- Add this line
  const [successfulVerifications, setSuccessfulVerifications] = useState(0);
  const [failedVerifications, setFailedVerifications] = useState(0);

  // State variables for tracking times
  const [totalRegisterTime, setTotalRegisterTime] = useState(0);
  const [totalVerifyTime, setTotalVerifyTime] = useState(0);
  const [fastestRegisterTime, setFastestRegisterTime] = useState(Infinity);
  const [longestRegisterTime, setLongestRegisterTime] = useState(0);
  const [fastestVerifyTime, setFastestVerifyTime] = useState(Infinity);
  const [longestVerifyTime, setLongestVerifyTime] = useState(0);

  const [intervalCount, setIntervalCount] = useState(1); // Number of times to run
  const [isIntervalRunning, setIsIntervalRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    console.log("All users:", users);
  }, [users]);

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    console.warn(`Generating ${generateUsers} users`);

    let totalTime = 0;
    let fastestTime = Infinity;
    let longestTime = 0;

    for (let i = 0; i < generateUsers; i++) {
      const startTime = performance.now();
      console.error("Registering user", i + 1);

      const newWallet = ethers.Wallet.createRandom();
      const did = `did:ethr:${newWallet.publicKey}`;

      const roles = ["user", "admin", "device"];
      const formData = {
        did: did,
        selected_role: roles[Math.floor(Math.random() * roles.length)],
        alias: i + 1,
        firmware_version: `${Math.floor(Math.random() * 10)}.${Math.floor(
          Math.random() * 10
        )}.${Math.floor(Math.random() * 10)}`,
        testMode: true,
        proof_type: proofType, // <-- Add this line
      };

      const submitResult = await submitDID(formData);
      if (!submitResult) {
        console.error("Failed to submit DID and VC");
        continue;
      }

      try {
        const response = await fetch(`${connectorURL}/auth/v1/pollTest/${did}`);

        if (!response.ok) {
          throw new Error("Failed to fetch request status");
        }

        const data = await response.json();
        if (!data) {
          throw new Error("Received null data");
        }

        console.log("fetch data:", data);

        const user = {
          verifiable_credential: data.verifiable_credential,
          request_status: data.request_status,
          message: data.message,
        };

        setUsers((prevUsers) => [...prevUsers, user]);
        console.log("Added new user:", user);
      } catch (error) {
        console.error("Error fetching data:", error);
        const user = {
          verifiable_credential: data.verifiable_credential,
          request_status: data.request_status,
          message: data.message,
        };

        setUsers((prevUsers) => [...prevUsers, user]);
      }

      const endTime = performance.now();
      const timeTaken = endTime - startTime;
      totalTime += timeTaken;
      if (timeTaken < fastestTime) fastestTime = timeTaken;
      if (timeTaken > longestTime) longestTime = timeTaken;
    }

    setTotalRegisterTime(totalTime);
    setFastestRegisterTime(fastestTime);
    setLongestRegisterTime(longestTime);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    console.log(`Verifying ${verifyUsers} users`);

    setSuccessfulVerifications(0);
    setFailedVerifications(0);

    let totalTime = 0;
    let fastestTime = Infinity;
    let longestTime = 0;

    const usersToVerify = Math.min(verifyUsers, users.length);
    const selectedUsers = [];

    for (let i = 0; i < usersToVerify; i++) {
      const randomIndex = Math.floor(Math.random() * users.length);
      selectedUsers.push(users[randomIndex]);
    }

    for (let i = 0; i < selectedUsers.length; i++) {
      const startTime = performance.now();
      const user = selectedUsers[i];
      console.log(`Verifying user ${i + 1}:`);
      const merkleHash =
        user.verifiable_credential.credential.credentialSubject.ZKP.userHash;
      const did = user.verifiable_credential.credential.credentialSubject.did;

      console.log("Merkle Hash:", merkleHash);
      console.log("DID:", did);
      try {
        const response = await fetch(`${connectorURL}/auth/v1/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user.verifiable_credential),
        });

        if (!response.ok) {
          throw new Error(
            `Verification failed with status: ${response.status}\n${response.statusText}` +
              `\nResponse: ${await response.text()}`
          );
        }

        const sessionData = await response.json();
        console.log("Verification response:", sessionData);

        setUsers((prevUsers) =>
          prevUsers.map((u) => {
            if (u.did === user.did) {
              return {
                ...u,
                session: {
                  message: sessionData.message,
                  results: sessionData.results,
                  access_token: sessionData.access_token,
                  refresh_token: sessionData.refresh_token,
                  duration: sessionData.duration,
                },
              };
            }
            return u;
          })
        );

        setSuccessfulVerifications((prevCount) => prevCount + 1);
      } catch (error) {
        console.error(
          `Error verifying user ${user.verifiable_credential.credential.credentialSubject.alias} (DID: ${did}):`,
          error
        );

        setUsers((prevUsers) =>
          prevUsers.map((u) => {
            if (u.did === user.did) {
              return {
                ...u,
                session: {
                  message: "Verification failed",
                  error: error.message,
                },
              };
            }
            return u;
          })
        );

        setFailedVerifications((prevCount) => prevCount + 1);
      }

      const endTime = performance.now();
      const timeTaken = endTime - startTime;
      totalTime += timeTaken;
      if (timeTaken < fastestTime) fastestTime = timeTaken;
      if (timeTaken > longestTime) longestTime = timeTaken;
    }

    setTotalVerifyTime(totalTime);
    setFastestVerifyTime(fastestTime);
    setLongestVerifyTime(longestTime);

    console.log("Verification complete. Updated users:", users);
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
      }, 1000); // Runs every second
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

  const avgRegisterTime = totalRegisterTime / generateUsers;
  const avgVerifyTime = totalVerifyTime / verifyUsers;

  return (
    <Sidebar role={"test"}>
      <div className="col-span-12 p-6 space-y-8 bg-gray-50 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-[#333333] mb-6">Test Page</h1>

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
                max="1000"
                value={generateUsers}
                onChange={(e) => setGenerateUsers(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            {/* ZKP Proof Type Selection */}
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
                <option value="merkle">merkle</option>
                <option value="smt">sparse merkle tree</option>
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
                max="1000"
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
      </div>
    </Sidebar>
  );
};

export default TestDashboard;
