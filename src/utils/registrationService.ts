/**
 * Registration service utility for calling the subprocess from React
 * This provides a bridge between the React frontend and the Node.js registration script
 */

import { spawn } from "child_process";

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

interface RegistrationResult {
  success: boolean;
  user?: any;
  error?: string;
  timeTaken: number;
  timestamp: string;
}

/**
 * Registration service class for managing user registrations
 */
export class RegistrationService {
  private scriptPath: string;
  private nodeCommand: string;

  constructor(scriptPath?: string, nodeCommand: string = "node") {
    // Default script path relative to the project structure
    this.scriptPath = scriptPath || "./src/scripts/register-user.js";
    this.nodeCommand = nodeCommand;
  }

  /**
   * Register a single user
   */
  async registerSingleUser(
    config: RegistrationConfig = {}
  ): Promise<RegistrationResult> {
    const results = await this.executeRegistration({ count: 1, config });
    return Array.isArray(results) ? results[0] : results;
  }

  /**
   * Register multiple users with the same configuration
   */
  async registerMultipleUsers(
    count: number,
    config: RegistrationConfig = {}
  ): Promise<RegistrationResult[]> {
    const results = await this.executeRegistration({ count, config });
    return Array.isArray(results) ? results : [results];
  }

  /**
   * Register users with different configurations
   */
  async registerUsersWithConfigs(
    configs: RegistrationConfig[]
  ): Promise<RegistrationResult[]> {
    const results = await this.executeRegistration({ configs });
    return Array.isArray(results) ? results : [results];
  }

  /**
   * Execute the registration script
   */
  private async executeRegistration(
    request: RegistrationRequest
  ): Promise<RegistrationResult | RegistrationResult[]> {
    return new Promise((resolve, reject) => {
      const jsonParams = JSON.stringify(request);

      console.log(
        `Executing registration with: ${this.nodeCommand} ${this.scriptPath}`
      );
      console.log(`Parameters:`, request);

      const child = spawn(this.nodeCommand, [this.scriptPath, jsonParams], {
        stdio: ["pipe", "pipe", "pipe"],
        shell: true, // Use shell on Windows
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        const output = data.toString();
        stdout += output;
        console.log("Registration script output:", output);
      });

      child.stderr.on("data", (data) => {
        const error = data.toString();
        stderr += error;
        console.error("Registration script error:", error);
      });

      child.on("close", (code) => {
        console.log(`Registration script exited with code: ${code}`);

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
          const errorMessage =
            stderr || stdout || `Process exited with code ${code}`;
          console.error("Registration failed:", errorMessage);
          reject(new Error(`Registration failed: ${errorMessage}`));
        }
      });

      child.on("error", (error) => {
        console.error("Failed to start registration process:", error);
        reject(new Error(`Failed to start registration: ${error.message}`));
      });

      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error("Registration timed out after 5 minutes"));
      }, 5 * 60 * 1000);

      child.on("close", () => {
        clearTimeout(timeout);
      });
    });
  }
}

// Export a default instance
export const registrationService = new RegistrationService();

// Export types for external use
export type { RegistrationConfig, RegistrationRequest, RegistrationResult };
