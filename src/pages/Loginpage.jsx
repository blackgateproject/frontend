import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enabled2fa, setEnabled2fa] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: fetching 2fa state, 3: 2fa/password
  const [sliding, setSliding] = useState(false);
  const [uuid, setUuid] = useState("");
  const navigate = useNavigate();

  const fetchUserUUIDAnd2FA = async (email) => {
    try {
      // const accessToken = sessionStorage.getItem("access_token") || "";

      const response = await fetch(
        `http://127.0.0.1:8000/auth/v1/get-uuid-and-2fa`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            // Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUuid(data.uuid);
        setEnabled2fa(data.enabled2fa);
      }
    } catch (error) {
      console.error("Error fetching user UUID and 2FA state:", error);
    }
  };

  const handle2FAState = async (uuid, state) => {
    try {
      // const accessToken = sessionStorage.getItem("access_token") || "";

      const response = await fetch(
        `http://127.0.0.1:8000/auth/v1/set-2fa-state`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            // Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ uuid, state }),
        }
      );

      if (!response.ok) {
        console.error("Failed to set 2FA state");
      }
    } catch (error) {
      console.error("Error setting 2FA state:", error);
    }
  };

  useEffect(() => {
    if (enabled2fa && step === 3) {
      // AWAIS:: DISABLED MFA QUERY FOR NOW
      // handle2FAState(uuid, true);
    }
  }, [enabled2fa, step]);

  const query2FASession = async () => {
    try {
      // const accessToken = sessionStorage.getItem("access_token") || "";

      const response = await fetch(
        `http://127.0.0.1:8000/auth/v1/2fa-frontend-check`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            // Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ uuid }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.isLoginAccepted) {
          sessionStorage.setItem("access_token", data.access_token);
          sessionStorage.setItem("refresh_token", data.refresh_token);
          sessionStorage.setItem("uuid", uuid);
          // navigate(`/${data.role}/dashboard`);
          navigate(`/user/dashboard`);
        }
      }
    } catch (error) {
      console.error("Error querying 2FA session:", error);
    }
  };

  // AWAIS:: DISABLED MFA QUERY FOR NOW
  // useEffect(() => {
  //   if (enabled2fa && step === 3) {
  //     const interval = setInterval(query2FASession, 5000);
  //     return () => clearInterval(interval);
  //   }
  // }, [enabled2fa, step]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    console.log("Fetching 2fa state for email: ", email);
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
  
  const accumulatorProof = async () => {
    const URL = "http://localhost:8000/auth/v1/verify-accumulator";
    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ accVal: sessionStorage.getItem("accVal"), accProof: sessionStorage.getItem("accProof"), accPrime: sessionStorage.getItem("accPrime") }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      
      //Set accesstoken and uuid to session storage
      sessionStorage.setItem("access_token", data.access_token);
      sessionStorage.setItem("uuid", data.uuid);
      console.log("Set Access Token: ", data.access_token);
      console.log("Set UUID: ", data.uuid);
      
      navigate(`/${data.role}/dashboard`);

      if (data["authenticated"] === true) {
        console.log("Authenticated!");
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
                <>
                  <div className="text-center">
                    <p className="mb-4">
                      Please open the BlackGate mobile app on your phone in
                      order to proceed with 2FA verification.
                    </p>
                    <p className="text-sm text-gray-600">
                      Check your phone for the authentication code
                    </p>
                  </div>
                  <div className="mt-4 text-center">
                    <h2 className="text-center text-3xl font-bold mb-6 text-primary">
                      ZKP TEST BUTTONS
                    </h2>
                    <button
                      onClick={accumulatorProof}
                      className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl mt-2"
                    >
                      Verify ZKP Proofs (Accumulator)
                    </button>
                    <button
                      onClick={() => {
                        const accVal = sessionStorage.getItem("accVal");
                        const accProof = sessionStorage.getItem("accProof");
                        const accPrime = sessionStorage.getItem("accPrime");
                        alert(
                          `accVal: ${accVal}\naccProof: ${accProof}\naccPrime: ${accPrime}`
                        );
                      }}
                      className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl"
                    >
                      Show Session Storage Variables
                    </button>
                    <button
                      onClick={() => {
                        sessionStorage.setItem(
                          "accVal",
                          "0x26c122a34c80ec8d4c003d4544cd55e14695a5fc693920779e2412d4a856591ca249ec7c56968021567e305024e5a302149b363bdf157e263a27f38721a6e07eec7b042daa4148654025506a2933a3b5d4bd1d4135721dd5ed8cd83243d792767356b1c36b8c08774ea29854fa77971a0a457efb9602d3570ecf1f72ddd0350e67a5349247bd0dfd754d8ad6a71faacdb436bd2b3ce62c3642e3114447386c8a2e06d1e233d011e248e857772412667971a9a6f541d93ecc68b5b8b6cbab71e93ba167eae0ed34eadeec5c77865ecca086148fa52614e5f4b3397c94d00dad534bc25963ac8b0f26e4aff80a51b9ca84abc188fc92b6e0c3fb356905b3c9983af11430319771f5da7e1a2e68ce6df04a7f64015abc74102a5a3c6d8f0282d4974ca236cf89788ba2fbda09e4972c75b7bb97d4d60994e9712cba78faba284d1e63df72c02ed88fc416d6fc8179f5015226029851c91358f0c37ee835f829588a58a0bf3103f5496df53178d32f2881f5a4236422af2776004613a9ea779db463"
                        );
                        sessionStorage.setItem(
                          "accProof",
                          "0x4bde346e27878f54358c35bc7d4e97ef844b872f6fffb88414bb3a888fcd703e40e3fdacb2cec33aa4062e27e021ba3728b74a5024a8c2adccb650634ee238329739c0e9245d16c5e7f1a99b7b426c373469e6bedb786984062c8affba96a1afbe7b281b1c2248d1f00b931f1ef1f1701bb241a9609f055e19f6ec7b181794f3576ee7d717b1b8108ade32fb6e329b27ac52bb747e8ab3c7bb2f4700c287216063cd2db01931a902e8c3c5215cc4592e2dfda369c88970048b02d5f802c1eb5bb6043b1173d5df8bac51b42f65b6bfddcfe4c5b01cc7bf99e240f0b4dbcf1dd314890821ea78809b5a36eeb16fa53a5b881761093c03b0fcef7da220ef350d544164aebdf8ac3059bffe6250c69fc141d16f3cc47e3050970268866a8526f8ba497f2f4cbf839900b7510f21df7c8f5c080dbd64a26e75d9a535ada1ac42d86ee6c1e4797f46a7208eb4fab34f7578f487a76abc9af9e720cdd3ee6ac0e1baa8241a8b85e35b6dddef78488536963989a14dbe3cbf6760a850ff8aa5d33b1dd5"
                        );
                        sessionStorage.setItem(
                          "accPrime",
                          "0x00000000000000000000000000000000d56bac3968b9f3528e2d41daf229b237"
                        );
                        alert("Session storage variables set");
                      }}
                      className="btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl mt-2"
                    >
                      Set Session Storage Variables
                    </button>
                  </div>
                </>
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
