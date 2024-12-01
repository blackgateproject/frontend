const Modal = ({
  id,
  icon,
  titleText,
  contentText,
  onSubmit,
  actionButtonText,
  modalData,
}) => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(modalData || {});

  useEffect(() => {
    setUserData(modalData); // Update modal data when modalData changes
  }, [modalData]);

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit(userData); // Pass the updated user data to the parent
    setLoading(false);
  };

  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <div className="flex gap-2">
          {icon || null}
          <h3 className="font-bold text-lg">{titleText}</h3>
        </div>
        <p className="py-4">{contentText}</p>

        {/* Edit Form */}
        <div className="space-y-2">
          <input
            type="text"
            value={userData.firstName}
            onChange={(e) =>
              setUserData({ ...userData, firstName: e.target.value })
            }
            placeholder="First Name"
            className="input input-bordered w-full"
          />
          <input
            type="text"
            value={userData.lastName}
            onChange={(e) =>
              setUserData({ ...userData, lastName: e.target.value })
            }
            placeholder="Last Name"
            className="input input-bordered w-full"
          />
          {/* Add other fields as needed */}
        </div>

        <div className="modal-action">
          <button
            className="btn"
            onClick={() => document.getElementById(id).close()}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : actionButtonText || "Confirm"}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default Modal;
