import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { connectorURL } from "../../utils/readEnv";

const AddUser = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    autoConfirmEmail: false,
    role: "user", // Default role is user
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    // if (!form.firstName) errors.firstName = "First name is required";
    // if (!form.lastName) errors.lastName = "Last name is required";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Valid email is required";
    // if (!form.phoneNumber || !/^\+?[\d\s-]+$/.test(form.phoneNumber))
    //   errors.phoneNumber = "Valid phone number is required";
    if (!form.password || form.password.length < 8)
      errors.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const accessToken = sessionStorage.getItem("access_token") || "";
      const response = await fetch(`${connectorURL}/admin/v1/addUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(form),
      });
      if (response.status === 401) {
        console.log("Redirecting to:", "/");
        window.location.href = "/";
        return;
      }
      if (response.ok) {
        navigate("/admin/users");
      } else {
        const errorData = await response.json();
        setErrors({ form: errorData.error });
      }
    } catch (error) {
      console.error("Error adding user:", error);
      setErrors({ form: "An error occurred while adding the user" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sidebar role={"admin"}>
      {/* Main Content */}
      <div className="col-span-12">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#333333]">Add User</h1>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* <div> */}
          {/* <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="input input-bordered w-full"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="input input-bordered w-full"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName}</p>
            )}
          </div> */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input input-bordered w-full"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
              className="input input-bordered w-full"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
            )}
          </div> */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input input-bordered w-full"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              className="input input-bordered w-full"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoConfirmEmail"
              className="mr-2"
              checked={form.autoConfirmEmail}
              onChange={(e) =>
                setForm({ ...form, autoConfirmEmail: e.target.checked })
              }
            />
            <label htmlFor="autoConfirmEmail" className="text-gray-700">
              Autoconfirm user email
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="select select-bordered w-full"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="userOnboard">userOnboard</option>
              <option value="adminOnboard">adminOnboard</option>
            </select>
          </div>
          {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}
          <div>
            <button
              type="submit"
              className={`btn bg-primary/75 hover:bg-primary text-base-100 w-full ${
                isLoading && "loading"
              }`}
              disabled={isLoading}
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </Sidebar>
  );
};

export default AddUser;
