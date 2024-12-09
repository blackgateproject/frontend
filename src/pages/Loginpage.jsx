import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const LoginPage = ({ role }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enabled2fa, setEnabled2fa] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: fetching 2fa state, 3: 2fa/password
  const [sliding, setSliding] = useState(false);
  const navigate = useNavigate();

  const fetchUserUUIDAnd2FA = async (email) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/auth/v1/get-uuid`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        const uuid = data.uuid;

        const twoFAResponse = await fetch(`http://127.0.0.1:8000/auth/v1/get-2fa-state`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ uuid }),
        });

        if (twoFAResponse.ok) {
          const twoFAData = await twoFAResponse.json();
          setEnabled2fa(twoFAData.enabled2fa);
        }
      }
    } catch (error) {
      console.error("Error fetching user UUID and 2FA state:", error);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    console.log('Fetching 2fa state for email: ', email);
    setSliding(true);
    setStep(2);
    await fetchUserUUIDAnd2FA(email);
    setSliding(false);
    setStep(3);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const URL = "http://127.0.0.1:8000/auth/v1/verify";

    const user = {
      email: email,
      password: password,
    };

    console.log("USER: ", JSON.stringify(user));

    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);

      if (data["authenticated"] === true) {
        console.log(
          "Authenticated! Navigating to: ",
          `/${data.role}/dashboard`
        );
        navigate(`/${data.role}/dashboard`);

        if (data["error"]) {
          console.log("Response: ", data["error"]);
        }

        sessionStorage.setItem("access_token", data.access_token);
        sessionStorage.setItem("refresh_token", data.refresh_token);
        sessionStorage.setItem("uuid", data.uuid);
        console.log("Set Access Token: ", data.access_token);
        console.log("Set Refresh Token: ", data.refresh_token);
        console.log("Set UUID: ", data.uuid);
      } else {
        console.log("Response: ", data["error"]);
      }
    } else {
      const errorData = await response.json();
      alert("Failed to authenticate user\n" + errorData.error);
      console.log(
        "Unable to authenticate user\n" +
          response.statusText +
          "\nServer Error: " +
          errorData.error
      );
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600">
      <div className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 overflow-hidden">
        {(step === 2 || step === 3) && (
          <button
            onClick={() => window.location.reload()}
            className="btn btn-sm btn-outline mb-4"
          >
            Back
          </button>
        )}
        <img src={logo} alt="logo" className="w-24 mx-auto mb-4" />
        <h2 className="text-center text-3xl font-bold mb-6 text-primary">
          BLACKGATE
        </h2>

        <div
          className={`transition-transform duration-300 ${
            sliding ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          {step === 1 ? (
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-4">
                <input
                  type="email"
                  className="input input-bordered w-full rounded-2xl"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl">
                Next
              </button>
            </form>
          ) : step === 2 ? (
            <div className="text-center">
              <p className="mb-4">Fetching 2FA state...</p>
            </div>
          ) : (
            <div
              className={`transition-transform duration-300 ${
                sliding ? "translate-x-full" : "translate-x-0"
              }`}
            >
              {enabled2fa ? (
                <div className="text-center">
                  <p className="mb-4">
                    Please open the BlackGate mobile app on your phone in order
                    to proceed with 2FA verification.
                  </p>
                  <p className="text-sm text-gray-600">
                    Check your phone for the authentication code
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <input
                      type="password"
                      className="input input-bordered w-full rounded-2xl"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl">
                    Sign In
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {step === 1 && !enabled2fa && (
          <div className="mt-4 text-center">
            <button
              onClick={async () => {
                setEmail("a@admin.com");
                await handleEmailSubmit();
                setPassword("123456");
                handleLogin();
              }}
              className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl"
            >
              Login as Admin
            </button>
            <button
              onClick={async () => {
                setEmail("a@user.com");
                await handleEmailSubmit();
                setPassword("123456");
                await handleLogin();
              }}
              className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl"
            >
              Login as User
            </button>
          </div>
        )}
        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-purple-600">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
