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

  // Array of step functions
  const stepFunctions = [
    performStep1,
    performStep2,
    performStep3,
    performStep4,
    performStep5
  ];

  useEffect(() => {
    const processCurrentStep = async () => {
      if (currentStep <= totalSteps) {
        setLoading(true);
        // Execute the current step function
        await stepFunctions[currentStep - 1]();
        setLoading(false);
        
        // Move to next step if not at the end
        if (currentStep < totalSteps) {
          setCurrentStep(currentStep + 1);
        }
      }
    };

    processCurrentStep();
  }, [currentStep]);

  const getStepStatus = (step) => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "active";
    return "pending";
  };

  // Calculate position and style for each card based on its position relative to current step
  const getCardStyle = (stepNumber) => {
    const diff = stepNumber - currentStep;
    
    // Base transform values
    let translateY = 0;
    let scale = 1;
    let opacity = 1;
    let zIndex = 50 - Math.abs(diff) * 10;
    
    // Apply different transform based on position relative to current step
    if (diff < 0) {
      // Steps that come before current (above)
      translateY = diff * 20; // Move up
      scale = 1 + (diff * 0.05);
      opacity = 1 - (Math.abs(diff) * 0.2);
    } else if (diff > 0) {
      // Steps that come after current (below)
      translateY = diff * 20; // Move down
      scale = 1 - (diff * 0.05);
      opacity = 1 - (Math.abs(diff) * 0.2);
    }
    
    return {
      transform: `translateY(${translateY}px) scale(${scale})`,
      opacity,
      zIndex
    };
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto  h-60 bg-white">
      <div className="relative w-full h-fit perspective-1000">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const status = getStepStatus(stepNumber);
          const style = getCardStyle(stepNumber);
          
          return (
            <div 
              key={stepNumber} 
              className="absolute w-full transition-all duration-500 ease-in-out"
              style={{
                ...style,
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) ${style.transform}`
              }}
            >
              <div 
                className={`
                  p-4 rounded-lg border-2 flex items-center justify-between
                  ${status === "completed" 
                    ? "bg-gray-100 border-gray-300 text-gray-600" 
                    : status === "active"
                      ? "bg-black border-gray-400 text-white" 
                      : "bg-gray-100 border-gray-200 text-gray-500"}
                `}
              >
                <div className="flex items-center">
                  <span className={`${status === "active" ? "font-bold" : ""}`}>
                    Step {stepNumber}
                  </span>
                  
                  {currentStep === stepNumber && loading && (
                    <div className="ml-2 w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                
                {status === "completed" && (
                  <CheckIcon className="w-5 h-5 text-gray-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VerticalProgressIndicator;