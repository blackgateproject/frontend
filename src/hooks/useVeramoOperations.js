import { useVeramo } from "@veramo-community/veramo-react";
import { useCallback } from "react";
import {
  generateDID,
  issueVC,
  pollForRequestStatus,
  resolveDID,
  submitDIDVC,
  validateVC,
} from "../utils/registrations";

export function useVeramoOperations() {
  const { agent } = useVeramo();

  const performGenerateDID = useCallback(
    async (wallet) => {
      if (!agent) {
        throw new Error("Veramo agent not initialized");
      }
      return generateDID(wallet, agent);
    },
    [agent]
  );

  const performResolveDID = useCallback(
    async (did) => {
      if (!agent) {
        throw new Error("Veramo agent not initialized");
      }
      return resolveDID(agent, did);
    },
    [agent]
  );

  const performIssueVC = useCallback(
    async (didDoc, role) => {
      if (!agent) {
        throw new Error("Veramo agent not initialized");
      }
      return issueVC(didDoc, agent, role);
    },
    [agent]
  );

  const performValidateVC = useCallback(
    async (signed_vc) => {
      if (!agent) {
        throw new Error("Veramo agent not initialized");
      }
      return validateVC(agent, signed_vc);
    },
    [agent]
  );

  const performSubmitDIDVC = useCallback(
    async (wallet, did, signed_vc, selectedRole) => {
      return submitDIDVC(wallet, did, signed_vc, selectedRole);
    },
    []
  );

  const performPollForRequestStatus = useCallback(async (walletAddress) => {
    return pollForRequestStatus(walletAddress);
  }, []);

  return {
    performGenerateDID,
    performResolveDID,
    performIssueVC,
    performValidateVC,
    performSubmitDIDVC,
    performPollForRequestStatus,
    agent,
  };
}
