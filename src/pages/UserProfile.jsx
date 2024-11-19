import React, { useState, useEffect } from "react";
import { Edit, KeyRound, Search, SquareUserRound } from "lucide-react";
import Sidebar from "../components/Sidebar";

const UserProfile = () => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    passwordSet: false,
    twoFactorAuth: false,
  });

  const fetchUserProfile = async () => {
    try {
      // Assume the email is already available after login
      const email = "abdullah.abubaker@blackgate.com"; // replace with the actual logged-in user's email
      const emailHash = await hashEmail(email); // You might need to hash it on the frontend too
      const response = await fetch(
        `http://127.0.0.1:8000/get_user_by_hash/${emailHash}`
      );

      if (response.ok) {
        const data = await response.json();
        setProfile({
          firstName: "Abdullah", // Replace this with actual response data if available
          lastName: "Abubaker",
          email: email, // from your email
          phone: "+92-300-456-8910", // Add from your middleware data
          passwordSet: data.passwordSet,
          twoFactorAuth: data.twoFactorAuth,
        });
      } else {
        console.error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Example function to hash email (similar to backend hashing)
  const hashEmail = async (email) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(email);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  return (
    <Sidebar role={"user"}>
      <div className="col-span-12">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#333333]">Profile</h1>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-500" />
            </span>
            <input
              type="text"
              placeholder="Search"
              className="input input-bordered w-60 pl-10 rounded-2xl bg-[#ffffff] text-gray-500 border-none shadow-sm"
            />
          </div>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 relative flex flex-col justify-center">
            <div className="absolute top-4 right-4">
              <button
                className="btn bg-purple-700 hover:bg-purple-800 text-white p-2 rounded-2xl px-4"
                onClick={() => console.log("Edit Personal Info Clicked")}
              >
                <Edit size={16} />
                Edit
              </button>
            </div>
            <div className="flex gap-2">
              <SquareUserRound size={32} className="text-purple-700" />
              <h2 className="text-xl font-bold text-[#333333]">
                Personal Information
              </h2>
            </div>
            <div className="mt-6 grid grid-cols-3 ">
              <div className="space-y-2">
                <p>
                  <strong>First name:</strong>
                </p>
                <p>
                  <strong>Last name:</strong>
                </p>
                <p>
                  <strong>Email:</strong>
                </p>
                <p>
                  <strong>Phone No.:</strong>
                </p>
              </div>
              <div className="space-y-2">
                <p>{profile.firstName}</p>
                <p>{profile.lastName}</p>
                <p>{profile.email}</p>
                <p>{profile.phone}</p>
              </div>
            </div>
          </div>

          {/* Authentication Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 relative flex flex-col max-h-max">
            <div className="absolute top-4 right-4">
              <button
                className="btn bg-purple-700 hover:bg-purple-800 text-white p-2 rounded-2xl px-4"
                onClick={() => console.log("Edit Authentication Info Clicked")}
              >
                <Edit size={16} />
                Edit
              </button>
            </div>
            <div className="flex gap-2">
              <KeyRound size={32} className="text-purple-700" />
              <h2 className="text-xl font-bold text-[#333333]">
                Authentication
              </h2>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <p>
                  <strong>Password:</strong>
                </p>
                <p>
                  <strong>2-Factor Auth:</strong>
                </p>
              </div>
              <div className="space-y-2">
                <p>{profile.passwordSet ? "Set" : "Not Set"}</p>
                <p>{profile.twoFactorAuth ? "Set" : "Not Set"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default UserProfile;
