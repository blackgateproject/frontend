import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VeramoProvider } from "@veramo-community/veramo-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import {localAgent} from "./veramo/create-agent"

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <VeramoProvider agents={[localAgent]}>
        <App />
      </VeramoProvider>
    </QueryClientProvider>
  </StrictMode>
);
