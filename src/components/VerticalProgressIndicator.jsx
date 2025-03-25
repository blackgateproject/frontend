import { CheckIcon } from "lucide-react";
import React from "react";

const VerticalProgressIndicator = ({ currentStep, steps }) => {
  const totalSteps = steps.length;

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
      transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
    };
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto h-40 bg-white">
      <div className="relative w-full h-fit text-center text-lg mt-5">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const style = getStepStyle(stepNumber);

          return (
            <div
              key={stepNumber}
              style={style}
              className="flex items-center justify-center gap-3"
            >
              {stepNumber < currentStep ? (
                // If the step is completed, show green checkmark with fading effect
                <CheckIcon
                  className="inline w-4 h-4 text-green-500"
                  style={{ opacity: style.opacity }}
                />
              ) : currentStep === stepNumber ? (
                // If the step is currently active, show spinner
                <span className="w-4 h-4 border-2 border-t-transparent border-gray-900 rounded-full inline-block animate-spin"></span>
              ) : (
                <span className="w-4 h-4"></span>
              )}

              {/* Step text */}
              <span className="my-10">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VerticalProgressIndicator;
