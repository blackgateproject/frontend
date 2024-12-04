import React from "react";

const Modal = ({
  id,
  titleText,
  contentText,
  onSubmit,
  onClose,
  actionButtonText,
  icon,
  modalData,
}) => {
  return (
    <dialog id={id} className="modal" open>
      <div className="modal-box">
        <div className="flex gap-2 items-center mb-2">
          {icon}
          <h3 className="font-bold text-lg">{titleText}</h3>
        </div>
        <p className="py-4">{contentText}</p>
        <div className="modal-action">
          <button
            className="btn"
            onClick={() => {
              onClose();
              document.getElementById(id).close();
            }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onSubmit(modalData);
              document.getElementById(id).close();
            }}
          >
            {actionButtonText}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default Modal;
