import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import SignupForm from "../components/SignupForm";
import { verifyMerkleProof } from "../utils/verification";
const LoginPage = () => {
  // non state
  let did = "";
  let signed_vc = "";

  // state vars
  const [walletExists, setWalletExists] = useState(
    !!localStorage.getItem("encryptedWallet")
  );
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [wallet, setWallet] = useState(null);
  const [signer, setSigner] = useState(null);
  const [currentStep, setCurrentStep] = useState("");
  const [isLoadingDID, setIsLoadingDID] = useState(false);
  const [isWalletLoaded, setIsWalletLoaded] = useState(false);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [hasVC, setHasVC] = useState(false);
  const [isBackendInSetupMode, setIsBackendInSetupMode] = useState(false);
  const [isCheckingBackendStatus, setIsCheckingBackendStatus] = useState(false); // Set to true to enable setup mode

  const [showAuthButtons, setShowAuthButtons] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [previousPage, setPreviousPage] = useState(null);
  const [currentPage, setCurrentPage] = useState("main");
  const navigate = useNavigate();

  const [shapes, setShapes] = useState([]);
  const shapeCount = 100; // Define the number of shapes to generate
  const colorPalette = [
    "#0068ff", // Primary color
    "#0040ff", // Secondary color
    "#AE4AFF", // Accent color
    "#000000", // Base-200 color
    // "#F4F4F4", // Slate-900 color
    // "#F3F3F3", // Slate-950 color
  ];
  // Check if merkle proof and hash exist in local storage
  useEffect(() => {
    const checkLocalStorage = () => {
      const verifiable_credential = localStorage.getItem(
        "verifiable_credential"
      );

      setHasVC(!!verifiable_credential);
    };

    // Check initially
    checkLocalStorage();

    // Set up event listener for storage changes
    window.addEventListener("storage", checkLocalStorage);

    // Create custom listener for in-page storage updates
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function () {
      originalSetItem.apply(this, arguments);
      checkLocalStorage();
    };

    return () => {
      window.removeEventListener("storage", checkLocalStorage);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  useEffect(() => {
    if (isErrorModalOpen) {
      document.getElementById("error-modal").showModal();
    } else {
      document.getElementById("error-modal").close();
    }
  }, [isErrorModalOpen]);

  // Generate shapes with random sizes, positions, and colors
  useEffect(() => {
    const generateShapes = () => {
      let shapesArray = [];
      for (let i = 0; i < shapeCount; i++) {
        const randomSize = Math.random() * 25 + 4; // Random size between 2px and 10px
        const randomX = Math.random() * window.innerWidth;
        const randomY = Math.random() * window.innerHeight;

        // Randomly select a color from the predefined color palette
        const randomColor =
          colorPalette[Math.floor(Math.random() * colorPalette.length)];

        shapesArray.push({
          id: i,
          x: randomX,
          y: randomY,
          size: randomSize,
          color: randomColor,
          // Reduce vx and vy for slower movement
          vx: Math.random() * 0.5 - 0.25, // Slower random horizontal speed
          vy: Math.random() * 0.5 - 0.25, // Slower random vertical speed
        });
      }
      setShapes(shapesArray);
    };

    generateShapes(); // Initialize shapes when component mounts
  }, [shapeCount]); // Regenerate shapes when shapeCount changes

  // Handle shape movement and collision detection
  useEffect(() => {
    const intervalId = setInterval(() => {
      setShapes((prevShapes) => {
        const updatedShapes = prevShapes.map((shape) => {
          // Update position
          const newX = shape.x + shape.vx;
          const newY = shape.y + shape.vy;

          // Bounce off the edges
          if (newX < 0 || newX > window.innerWidth) shape.vx = -shape.vx;
          if (newY < 0 || newY > window.innerHeight) shape.vy = -shape.vy;

          return { ...shape, x: newX, y: newY };
        });

        return updatedShapes;
      });
    }, 5); // Update positions every 15ms

    return () => clearInterval(intervalId); // Clean up on unmount
  }, []); // Empty dependency array ensures this runs once on mount

  const handleButtonClick = () => {
    const encryptedWallet = localStorage.getItem("encryptedWallet");
    const verifiable_credential = localStorage.getItem("verifiable_credential");

    let merkleHash = null;
    let did = null;
    let ZKP = null;

    // Only try to parse if verifiable_credential exists
    if (verifiable_credential) {
      try {
        const parsedVC = JSON.parse(verifiable_credential);
        ZKP = parsedVC.credential?.credentialSubject?.ZKP;
        merkleHash = parsedVC.credential?.credentialSubject?.ZKP?.userHash;
        did = parsedVC.credential?.credentialSubject?.did;
      } catch (error) {
        console.error("Error parsing verifiable credential:", error);
        // Continue with default flow if parsing fails
      }
    }

    if (encryptedWallet) {
      if (verifiable_credential) {
        setShowAuthButtons(true);
      } else {
        // Wallet exists but no VC, go to signup to complete registration
        setShowSignupForm(true);
        setCurrentPage("signup");
      }
    } else {
      if (ZKP && did) {
        // Handle verification
        verifyMerkleProof(
          setIsLoadingTx,
          setCurrentStep,
          setErrorMessage,
          setIsErrorModalOpen,
          navigate
        );
      } else {
        // Regular registration flow
        setShowSignupForm(true);
        setCurrentPage("signup");
      }
    }
  };

  const handleBackButtonClick = () => {
    setCurrentPage("main");
    setShowSignupForm(false);
    setShowAuthButtons(false);
  };

  if (isCheckingBackendStatus) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-400 to-black">
        <div className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 text-center">
          <Loader2 className="animate-spin mx-auto" size={32} />
          <p className="mt-4">Connecting to backend...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 30 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-400 to-bg-primary relative overflow-hidden "
    >
      {/* Animated shapes with different colors */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        {shapes.map((shape) => (
          <motion.div
            key={shape.id}
            style={{
              position: "absolute",
              left: shape.x,
              top: shape.y,
              backgroundColor: shape.color,
              width: shape.size,
              height: shape.size,
              borderRadius: "50%",
            }}
            animate={{
              x: shape.x,
              y: shape.y,
            }}
            transition={{
              type: "spring",
              stiffness: 60,
              damping: 20,
              mass: 0.5,
            }}
          />
        ))}
      </div>
      <div className="z-10">
        {currentPage !== "main" && (
          <button
            onClick={handleBackButtonClick}
            className="absolute top-4 left-4 btn bg-primary/75 hover:bg-primary text-base-100 rounded-2xl"
          >
            Back
          </button>
        )}
        {currentPage === "signup" ? (
          <motion.div
            key="signup"
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 overflow-hidden"
          >
            <SignupForm
              walletExists={walletExists}
              setWalletExists={setWalletExists}
              setWallet={setWallet}
              setSigner={setSigner}
              setIsWalletLoaded={setIsWalletLoaded}
              setErrorMessage={setErrorMessage}
              setIsErrorModalOpen={setIsErrorModalOpen}
              wallet={wallet}
            />
          </motion.div>
        ) : currentPage === "auth1" ? (
          <motion.div
            key="auth1"
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 overflow-hidden"
          >
            <h2 className="text-center text-3xl font-bold text-Black">
              Verify via ZKP
            </h2>
            <p className="text-center mt-4">
              Click below to verify using zero-knowledge proof.
            </p>
            <button
              onClick={() => {
                verifyMerkleProof(
                  setIsLoadingTx,
                  setCurrentStep,
                  setErrorMessage,
                  setIsErrorModalOpen,
                  navigate
                );
              }}
              className={`btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl mt-4`}
              disabled={isLoadingTx}
            >
              {isLoadingTx ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" />
                  Processing...
                </div>
              ) : (
                "Verify Now"
              )}
            </button>
            {currentStep && (
              <div className="mt-4 text-center text-black">
                <p>{currentStep}</p>
              </div>
            )}
            {isLoadingTx && !currentStep && (
              <div className="mt-4 text-center">
                <Loader2 className="animate-spin mx-auto" />
                <p className="mt-2">Verifying...</p>
              </div>
            )}
          </motion.div>
        ) : currentPage === "auth2" ? (
          <motion.div
            key="auth2"
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 overflow-hidden"
          >
            {/* <h2 className="text-center text-3xl font-bold text-Black">
            Verify via VC
          </h2> */}
            {/* Add your VC verification component or logic here */}
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-base-100 p-10 rounded-2xl shadow-xl w-96 overflow-hidden"
          >
            <div className="flex justify-center items-center mb-4">
              <img src={logo} alt="logo" className="w-24" />
            </div>
            <h2 className="text-center text-3xl font-bold  text-Black">
              {walletExists ? "BLACKGATE" : "Welcome to BLACKGATE"}
            </h2>
            <div className=" text-center">
              <div>
                <p className="text-black mb-4">
                  {walletExists
                    ? hasVC
                      ? "Please choose a verification method to continue."
                      : "Wallet detected, but registration is incomplete. Please complete your registration."
                    : "To get started, please create a wallet."}
                </p>
                {hasVC ? (
                  <div className="flex flex-col ">
                    <button
                      onClick={() => {
                        setPreviousPage("main");
                        setCurrentPage("auth1");
                      }}
                      className={`btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl mt-4`}
                    >
                      Verify via ZKP
                    </button>
                    {/* <button
                    onClick={() => {
                      setPreviousPage("main");
                      setCurrentPage("auth2");
                    }}
                    className={`btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl mt-1`}
                  >
                    Verify via VC
                  </button> */}
                  </div>
                ) : (
                  <button
                    onClick={handleButtonClick}
                    className={`btn w-full bg-primary/75 hover:bg-primary text-base-100 rounded-2xl mt-4`}
                    disabled={isLoadingTx}
                  >
                    {isLoadingTx ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : localStorage.getItem("encryptedWallet") &&
                      !localStorage.getItem("verifiable_credential") ? (
                      "Complete Registration"
                    ) : localStorage.getItem("encryptedWallet") ? (
                      "Login"
                    ) : (
                      "Register"
                    )}
                  </button>
                )}
              </div>
            </div>
            {currentStep && (
              <div className="mt-4 text-center text-white">
                <p>{currentStep}</p>
              </div>
            )}
            {isLoadingDID && (
              <div className="mt-4 text-center text-white">
                <Loader2 className="animate-spin" />
              </div>
            )}
          </motion.div>
        )}

        <dialog id="error-modal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Error</h3>
            <p className="py-4">{errorMessage}</p>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => setIsErrorModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      </div>
    </motion.div>
  );
};

export default LoginPage;
