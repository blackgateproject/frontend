import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
// NOTE:: Client from connector needs to pass the access_token(JWT) to the user who will then verify the JWT either directly
//        from supabase or call a function in connector to verify the JWT
//
//        Honestly if the user has a JWT it might be faster to bypass the connector and directly verify the JWT with supabase
//        but then we risk not logging the user's activity in the connector. However this might not be important? Or maybe it
//        is
const LoginPage = ({ role }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enabled2fa, setEnabled2fa] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: 2fa/password
  const [sliding, setSliding] = useState(false);
  const navigate = useNavigate();

  const handleNextStep = async (e) => {
    // Animation after button is clicked for 2fa
    e.preventDefault();
    setSliding(true);
    await fetchUser();

    // Small delay for animation
    setTimeout(() => {
      setStep(2);
      setSliding(false);
    }, 300);
  };

  const handleLogin = async (e) => {
    // Prevent Default Form Submission
    e.preventDefault();

    // ConnectorServer URL
    const URL = "http://127.0.0.1:8000/functions/v1/verifyUser";

    // User Object
    const user = {
      email: email,
      password: password,
    };

    // Validate that the domain is of only @admin.com or @user.com
    if (email) {
      const domain = email.split("@")[1];
      if (domain !== "admin.com" && domain !== "user.com") {
        alert(
          "Invalid email domain, please use either @admin.com or @user.com"
        );
        return;
      }
    }

    // Log User Object
    console.log("USER: ", JSON.stringify(user));

    const response = await fetch(URL, {
      method: "POST",
      // mode: "no-cors",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(user),
    });

    // Log response
    // console.log("Response: ", response);

    // Check if response is OK
    if (response.ok) {
      // Log response data
      const data = await response.json();
      console.log(data);

      // Check if user is authenticated and navigate to dashboard
      if (data["authenticated"] === true) {
        console.log(
          "Authenticated! Navigating to: ",
          `/${data.role}/dashboard`
        );
        navigate(`/${data.role}/dashboard`);
      } else {
        alert("Server Error: " + data["error"]);
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
  // Def func from his bhabhi
  const fetchUser = async () => {
    // Dummy API call
    console.log(email);
    const user = {
      email: "johndoe@mail.com",
      enabled2fa: false, // Toggle this to test different flows
    };
    setEnabled2fa(user.enabled2fa);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600">
      <div className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 overflow-hidden">
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
            <form onSubmit={handleNextStep}>
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

        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-purple-600">
            Forgot Password?
          </a>
        </div>
        <div className="mt-4 text-center">
          {/* Create a button to login as admin with email a@admin.com and password: a */}
          <button
            onClick={() => {
              setEmail("a@admin.com");
              setPassword("a");
            }}
            className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl"
          >
            Login as Admin
          </button>
          {/* Create a button to login as user with email a@user.com and password: a */}
          <button
            onClick={() => {
              setEmail("a@user.com");
              setPassword("a");
            }}
            className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl"
          >
            Login as User
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
