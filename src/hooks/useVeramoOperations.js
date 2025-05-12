import { useVeramo } from "@veramo-community/veramo-react";
import { useCallback } from "react";
import { submitDID } from "../utils/registrations";
import { createPresentationFromCredential } from "../utils/veramo";
export function useVeramoOperations() {
  const { agent } = useVeramo();

  const performSubmitDID = useCallback(async (formData) => {
    return submitDID(formData);
  }, []);

  const performCreatePresentation = useCallback(async (vc, wallet) => {
    return createPresentationFromCredential(vc, agent, wallet);
  }, []);
  return {
    performSubmitDID,
    performCreatePresentation,
    agent,
  };
}
