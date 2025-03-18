import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const SetupPage = () => {
  const [adminDID, setAdminDID] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (!adminDID.trim()) {
      setErrorMessage("Please enter an Admin DID");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/api/setup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminDID }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to complete setup");
      }

      // Setup successful, redirect to login page
      navigate("/");
      window.location.reload(); // Force reload to re-check backend status
    } catch (error) {
      console.error("Setup error:", error);
      setErrorMessage(error.message || "Error during setup. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-400 to-black">
      <div className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 overflow-hidden">
        <div className="flex justify-center items-center mb-4">
          <img src={logo} alt="logo" className="w-24" />
        </div>
        <h2 className="text-center text-3xl font-bold text-primary mb-6">
          Initial Setup Required
        </h2>

        <div className="text-center mb-6">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 text-left">
            <p>
              The system is in setup mode. No DIDs are currently stored in the
              backend. An admin DID is required for initial setup.
            </p>
          </div>

          <p className="text-black mb-4">
            Please enter an admin DID to continue with the setup:
          </p>
        </div>

        <form onSubmit={handleSetupSubmit}>
          <div className="form-control mb-4">
            <input
              type="text"
              placeholder="Admin DID"
              className="input input-bordered w-full"
              value={adminDID}
              onChange={(e) => setAdminDID(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {errorMessage && (
            <div className="text-error text-sm mb-4">{errorMessage}</div>
          )}

          <button
            type="submit"
            className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" />
                Setting up...
              </div>
            ) : (
              "Complete Setup"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupPage;
