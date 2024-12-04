import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const LoginPage = ({ role }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enabled2fa, setEnabled2fa] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: 2fa/password
  const [sliding, setSliding] = useState(false);
  const navigate = useNavigate();

  const handleNextStep = async (e) => {
    e.preventDefault();
    setSliding(true);
    await fetchUser();

    setTimeout(() => {
      setStep(2);
      setSliding(false);
    }, 300);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const URL = "http://127.0.0.1:8000/auth/v1/verify";

    const user = {
      email: email,
      password: password,
    };

    // if (email) {
    //   const domain = email.split("@")[1];
    //   if (domain !== "admin.com" && domain !== "user.com") {
    //     alert(
    //       "Invalid email domain, please use either @admin.com or @user.com"
    //     );
    //     return;
    //   }
    // }

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
          // alert("Server Error: " + data["error"]);
          console.log("Response: ", data["error"]);
        }

        sessionStorage.setItem("access_token", data.access_token);
        sessionStorage.setItem("refresh_token", data.refresh_token);
        sessionStorage.setItem("uuid", data.uuid);
        console.log("Set Access Token: ", data.access_token);
        console.log("Set Refresh Token: ", data.refresh_token);
        console.log("Set UUID: ", data.uuid);
      } else {
        // alert("Server Error: " + data["error"]);
        // console.log("Response: ", data["error"]);
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

  const fetchUser = async () => {
    console.log(email);
    const user = {
      email: "johndoe@mail.com",
      enabled2fa: false,
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
          <button
            onClick={async () => {
              setEmail("a@admin.com");
              handleNextStep();
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
              setPassword("123456");
              await handleLogin();
            }}
            className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl"
          >
            Login as User
          </button>
        </div>
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
