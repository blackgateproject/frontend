import { useVeramo } from "@veramo-community/veramo-react";
import { useCallback } from "react";
import {
  getDIDandVC,
  pollForRequestStatus,
  sendToConnector,
} from "../utils/registrations";
// import { localAgent } from "../utils/veramo";

export function useVeramoOperations() {
  const { agent } = useVeramo();
  // const { agent } = localAgent;

  const performGetDIDandVC = useCallback(
    async (wallet, role) => {
      if (!agent) {
        throw new Error("Veramo agent not initialized");
      }
      return getDIDandVC(wallet, role, agent);
    },
    [agent]
  );

  const performSendToConnector = useCallback(
    async (wallet, selectedRole) => {
      if (!agent) {
        throw new Error("Veramo agent not initialized");
      }
      return sendToConnector(wallet, selectedRole, agent);
    },
    [agent]
  );

  // Wrapper for other registration functions that don't need the agent
  const performPollForRequestStatus = useCallback(async (walletAddress) => {
    return pollForRequestStatus(walletAddress);
  }, []);

  return {
    performGetDIDandVC,
    performSendToConnector,
    performPollForRequestStatus,
    agent,
  };
}
