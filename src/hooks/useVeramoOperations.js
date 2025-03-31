import { useVeramo } from "@veramo-community/veramo-react";
import { useCallback } from "react";
import { submitDID } from "../utils/registrations";

export function useVeramoOperations() {
  const { agent } = useVeramo();

  const performSubmitDID = useCallback(async (formData) => {
    return submitDID(formData);
  }, []);

  return {
    performSubmitDID,
    agent,
  };
}
