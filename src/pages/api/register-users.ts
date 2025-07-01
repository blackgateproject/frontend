/**
 * API endpoint for handling user registration via subprocess
 * This endpoint bridges the frontend and the Node.js registration script
 */

import { spawn } from "child_process";
import path from "path";

// Define types for the API
interface ApiRequest {
  method: string;
  body: any;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (data: any) => void;
}

interface RegistrationConfig {
  proofType?: string;
  selected_role?: string;
  alias?: string;
  firmware_version?: string;
  testMode?: boolean;
  device_id?: string;
  roles?: string[];
}

interface RegistrationRequest {
  count?: number;
  config?: RegistrationConfig;
  configs?: RegistrationConfig[];
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { count = 1, config = {}, configs }: RegistrationRequest = req.body;

    // Validate input
    if (configs && !Array.isArray(configs)) {
      return res.status(400).json({ error: "configs must be an array" });
    }

    if (!configs && typeof count !== "number") {
      return res.status(400).json({ error: "count must be a number" });
    }

    // Prepare the script path
    const scriptPath = path.join(
      process.cwd(),
      "src",
      "scripts",
      "register-user.js"
    );

    // Prepare parameters
    const parameters = configs ? { configs } : { count, config };
    const jsonParams = JSON.stringify(parameters);

    console.log(`Starting registration with parameters:`, parameters);

    // Execute the registration script
    const result = await executeRegistrationScript(scriptPath, jsonParams);

    res.status(200).json(result);
  } catch (error) {
    console.error("Registration API error:", error);
    res.status(500).json({
      error: "Registration failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Execute the registration script as a subprocess
 */
function executeRegistrationScript(
  scriptPath: string,
  jsonParams: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    // Use ts-node if available, otherwise use node
    const nodeCommand = process.env.NODE_COMMAND || "node";

    const child = spawn(nodeCommand, [scriptPath, jsonParams], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: path.dirname(scriptPath),
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        try {
          // Extract JSON results from stdout
          const outputLines = stdout.trim().split("\n");

          // Find the JSON results (after the "--- REGISTRATION RESULTS ---" line)
          let jsonStart = -1;
          for (let i = 0; i < outputLines.length; i++) {
            if (outputLines[i].includes("--- REGISTRATION RESULTS ---")) {
              jsonStart = i + 1;
              break;
            }
          }

          if (jsonStart >= 0) {
            const jsonOutput = outputLines.slice(jsonStart).join("\n");
            const results = JSON.parse(jsonOutput);
            resolve(results);
          } else {
            console.log("Full stdout:", stdout);
            reject(new Error("No JSON results found in script output"));
          }
        } catch (error) {
          console.error("Failed to parse script output:", error);
          console.log("Raw stdout:", stdout);
          reject(new Error(`Failed to parse registration results: ${error}`));
        }
      } else {
        console.error("Registration script failed:", stderr || stdout);
        reject(
          new Error(
            `Registration script exited with code ${code}: ${stderr || stdout}`
          )
        );
      }
    });

    child.on("error", (error) => {
      console.error("Failed to start registration script:", error);
      reject(
        new Error(`Failed to execute registration script: ${error.message}`)
      );
    });

    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("Registration script timed out after 5 minutes"));
    }, 5 * 60 * 1000); // 5 minutes

    child.on("close", () => {
      clearTimeout(timeout);
    });
  });
}
