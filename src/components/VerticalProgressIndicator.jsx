import React, { useState, useEffect } from 'react';
import { CheckIcon } from 'lucide-react';

// Simulated async functions for each step
const performStep1 = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Step 1 completed");
      resolve();
    }, 1500);
  });
};

const performStep2 = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Step 2 completed");
      resolve();
    }, 2000);
  });
};

const performStep3 = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Step 3 completed");
      resolve();
    }, 2500);
  });
};

const performStep4 = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Step 4 completed");
      resolve();
    }, 1800);
  });
};

const performStep5 = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Step 5 completed");
      resolve();
    }, 2200);
  });
};

const VerticalProgressIndicator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 5;

  const stepFunctions = [performStep1, performStep2, performStep3, performStep4, performStep5];

  useEffect(() => {
    const processCurrentStep = async () => {
      if (currentStep <= totalSteps) {
        setLoading(true);
        await stepFunctions[currentStep - 1]();
        setLoading(false);

        if (currentStep < totalSteps) {
          setCurrentStep(currentStep + 1);
        }
      }
    };

    processCurrentStep();
  }, [currentStep]);

  // Step text styling based on position
  const getStepStyle = (stepNumber) => {
    const diff = stepNumber - currentStep;
    
    // Hide steps that are more than 2 positions away from the current step
    if (Math.abs(diff) > 2) {
      return { display: "none" };
    }

    let translateY = diff * 27;
    let scale = 1; // Default scale
    let fontSize = ".6rem"; // Default size
    let opacity = stepNumber === currentStep ? 1 : 0.6;
    let zIndex = 50 - Math.abs(diff) * 10;

    // Increase size only for the step right before and after the current step
    if (Math.abs(diff) === 1) {
      scale = 1.1; // Slightly increase size for previous and next step
      fontSize = ".8rem";
    }
    
    // Make the current step the biggest
    if (stepNumber === currentStep) {
      scale = 1.2;
      fontSize = "1rem";
    }

    return {
      opacity,
      fontSize,
      fontWeight: stepNumber === currentStep ? "bold" : "normal",
      zIndex,
      textAlign: "center",
      position: "absolute",
      left: "47%",
      top: "50%",
      transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`
    };
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto h-40 bg-white">
      <div className="relative w-full h-fit text-center text-lg mt-5">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const style = getStepStyle(stepNumber);

          return (
            <div key={stepNumber} style={style} className="flex items-center justify-center gap-3">
              {stepNumber < currentStep ? (
                // If the step is completed, show green checkmark with fading effect
                <CheckIcon className="inline w-4 h-4 text-green-500" style={{ opacity: style.opacity }} />
              ) : currentStep === stepNumber && loading ? (
                // If the step is currently active and loading, show spinner
                <span className="w-4 h-4 border-2 border-t-transparent border-gray-900 rounded-full inline-block animate-spin"></span>
              ) : (
                // <CheckIcon className="inline w-5 h-5 text-green-500" />
                <span className="w-4 h-4"></span>
              )}

              {/* Step text */}
              <span className='my-10'>Step {stepNumber} Verify</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VerticalProgressIndicator;
