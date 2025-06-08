import React from "react";

const Modal = ({
  id,
  titleText,
  contentText,
  onSubmit,
  onClose,
  actionButtonText,
  actionButtonClass,
  icon,
  modalData,
  size = "md",
  customContent,
  actionButton = true
}) => {
  return (
    <dialog id={id} className="modal backdrop-brightness-75" open>
      <div className={`modal-box ${size === "lg" ? "max-w-3xl" : ""}`}>
        <div className="flex gap-2 items-center mb-2">
          {icon}
          <h3 className="font-bold text-lg">{titleText}</h3>
        </div>

        {/* Render either custom content or default text content */}
        {customContent ? (
          <div className="py-4">{customContent}</div>
        ) : (
          <p className="py-4">{contentText}</p>
        )}

        <div className="modal-action">
          <button
            className="btn bg-base-100 hover:bg-base-100 text-[#333333] p-2 rounded-2xl px-4"
            onClick={() => {
              onClose();
              document.getElementById(id).close();
            }}
          >
            Cancel
          </button>
          {actionButton && <button
            className={`btn ${actionButtonClass || "bg-primary/75 hover:bg-primary text-base-100"}`}
            onClick={() => {
              onSubmit(modalData);
              document.getElementById(id).close();
            }}
          >
            {actionButtonText}
          </button>}
        </div>
      </div>
    </dialog>
  );
};

export default Modal;