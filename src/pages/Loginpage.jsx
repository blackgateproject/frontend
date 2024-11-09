import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const LoginPage = ({ requiredRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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
      if (data["authenticated"] == true) {
        console.log(
          "Authenticated! Navigating to: ",
          `/${data.role}/dashboard`
        );
        navigate(`/${data.role}/dashboard`);
      } else {
        alert("Invalid email or password");
        console.log("Response: ", response);
      }
    } else {
      // alert("Failed to authenticate user\n" + response.json);
      console.log("Unable to authenticate user\n" + response.statusText);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-tr from-white to-gray-500">
      <div className="bg-gradient-to-bl from-white to-gray-750 p-10 rounded-2xl shadow-xl w-96">
        <img src={logo} alt="logo" className="w-24 mx-auto mb-4 grayscale" />
        <h2 className="text-center text-3xl font-bold mb-6 text-black">
          BLACKGATE
        </h2>
        <form onSubmit={handleLogin}>
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

          <button className="btn w-full bg-gray-800 hover:bg-gray-400 text-white rounded-2xl">
            Sign In
          </button>
        </form>
        <a href="/create-account">
          <button className="btn w-full bg-gray-800 hover:bg-gray-400 text-white rounded-2xl">
            Create an Account
          </button>
        </a>
        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-black">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
