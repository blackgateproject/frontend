import { Loader2, KeySquare } from "lucide-react";
import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { ethers } from "ethers";

const SignupForm = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("user");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    did: "",
    publicKey: "",
    deviceId: "",
    firmwareVersion: "",
  });
  const [autoconfirmEmail, setAutoconfirmEmail] = useState(false);
  const [errors, setErrors] = useState({});
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Generate random DID and public key
  const generateKeys = async () => {
    setIsGeneratingKeys(true);
    try {
      // Create a new random wallet
      const wallet = ethers.Wallet.createRandom();

      // Simulate a delay to show the loading animation
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Set the DID and public key after the delay
      setFormData({
        ...formData,
        did: `did:ethr:${wallet.address}`,
        publicKey: wallet.publicKey,
      });

      setIsGeneratingKeys(false);
    } catch (error) {
      console.error("Error generating keys:", error);
      setIsGeneratingKeys(false);
    }
  };
  
  // Validate the form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.did) {
      newErrors.did = "DID is required";
    }

    if (!formData.publicKey) {
      newErrors.publicKey = "Public key is required";
    }

    if (selectedRole === "device") {
      if (!formData.deviceId) {
        newErrors.deviceId = "Device ID is required";
      }

      if (!formData.firmwareVersion) {
        newErrors.firmwareVersion = "Firmware version is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Form submitted:", {
        ...formData,
        role: selectedRole,
        autoconfirmEmail,
      });

      setIsSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-base-100 p-8 rounded-2xl shadow-xl w-full max-w-md mx-auto max-h-[85vh] overflow-y-auto">
      <div className="flex justify-center items-center mb-4">
        <img
          src={logo}
          alt="logo"
          className="w-20 transition-all duration-300 hover:scale-105"
        />
      </div>

      <h2 className="text-center text-2xl font-bold text-primary mb-6">
        Create BLACKGATE Account
      </h2>

      {isSuccess ? (
        <div className="text-center py-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Account Created Successfully
          </h3>
          <p className="text-gray-600">You can now login to your account</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="flex gap-2">
              <div className="flex-grow">
                <select
                  className="select select-bordered bg-base-100 text-gray-500 shadow-sm"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="device">Device</option>
                </select>
              </div>
              <button
                type="button"
                className="btn btn-primary flex items-center gap-2"
                onClick={generateKeys}
                disabled={isGeneratingKeys}
              >
                {isGeneratingKeys ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeySquare className="h-4 w-4" />
                )}
                Generate Keys
              </button>
            </div>
          </div>

          {/* DID and Public Key */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DID
              </label>
              <input
                type="text"
                name="did"
                value={formData.did}
                onChange={handleChange}
                placeholder="did:ethr:0x..."
                className={`input input-bordered w-full ${
                  errors.did ? "input-error" : ""
                }`}
                readOnly={isGeneratingKeys}
              />
              {errors.did && (
                <p className="mt-1 text-sm text-red-500">{errors.did}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Public Key
              </label>
              <input
                type="text"
                name="publicKey"
                value={formData.publicKey}
                onChange={handleChange}
                placeholder="0x..."
                className={`input input-bordered w-full ${
                  errors.publicKey ? "input-error" : ""
                }`}
                readOnly={isGeneratingKeys}
              />
              {errors.publicKey && (
                <p className="mt-1 text-sm text-red-500">{errors.publicKey}</p>
              )}
            </div>
          </div>

          {/* Device-specific fields */}
          {selectedRole === "device" && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device ID
                </label>
                <input
                  type="text"
                  name="deviceId"
                  value={formData.deviceId}
                  onChange={handleChange}
                  placeholder="Device-123456"
                  className={`input input-bordered w-full ${
                    errors.deviceId ? "input-error" : ""
                  }`}
                />
                {errors.deviceId && (
                  <p className="mt-1 text-sm text-red-500">{errors.deviceId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firmware Version
                </label>
                <input
                  type="text"
                  name="firmwareVersion"
                  value={formData.firmwareVersion}
                  onChange={handleChange}
                  placeholder="v1.0.0"
                  className={`input input-bordered w-full ${
                    errors.firmwareVersion ? "input-error" : ""
                  }`}
                />
                {errors.firmwareVersion && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.firmwareVersion}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* User credentials */}
          <div className="pt-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={`input input-bordered w-full ${
                  errors.email ? "input-error" : ""
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`input input-bordered w-full ${
                  errors.password ? "input-error" : ""
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`input input-bordered w-full ${
                  errors.confirmPassword ? "input-error" : ""
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="autoconfirm"
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary"
                checked={autoconfirmEmail}
                onChange={(e) => setAutoconfirmEmail(e.target.checked)}
              />
              <label
                htmlFor="autoconfirm"
                className="ml-2 text-sm text-gray-600"
              >
                Autoconfirm user email
              </label>
            </div>
          </div>

          <div className="pt-2 pb-4">
            <button
              type="submit"
              className="btn btn-primary w-full rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" />
                  Creating Account...
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SignupForm;
