import { Search } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const AddUser = () => {
  // const servKey = import.meta.env.VITE_SUPASERV_KEY;      // Load the key from the .env file, NOTE:: Key has to begin with VITE_ for some reason
  // console.log(servKey);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const navigate = useNavigate();

  // const handleCreateUser = () => {
  //   const newUser = {
  //     fName: firstName,
  //     lName: lastName,
  //     email: email,
  //     phone: phoneNumber,
  //   };

  //   console.log("User data to be sent to backend:", newUser);

  //   fetch("http://127.0.0.1:8000/register_did", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(newUser),
  //   })
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error(`Failed to register DID: ${response.statusText}`);
  //       }
  //       return response.json();
  //     })
  //     .then((data) => {
  //       console.log("DID registered:", data);
  //       navigate("/admin/users");
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //       alert(`Failed to register DID: ${error.message}`);
  //     });
  // };

  const supaFunction = "addUser";
  // const supaFunction = "test";
  const URL = "http://127.0.0.1:54321/functions/v1/" + supaFunction;
  const Key =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
  const Token = "Bearer " + Key;

  const testEdgeFunction = async () => {
    const newUser = {
      fName: firstName,
      lName: lastName,
      email: email,
      phone: phoneNumber,
    };
    if (
      firstName === "" ||
      lastName === "" ||
      email === "" ||
      phoneNumber === ""
    ) {
      alert("Please fill all fields");
      return;
    } else {
      console.log("User data to be sent to backend:", JSON.stringify(newUser));

      fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: Token,
        },
        body: JSON.stringify(newUser),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Edge Function Error: ${response.statusText}`
            );
          }
          return response.json();
        })
        .then((data) => {
          console.log("Edge Function returns:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
          alert(`Failed to run Edge Function, check if supabase server is connected, function name is correct or token is changed.\nError: ${error.message}`);
        });
    }
  };

  return (
    <Sidebar role={"admin"}>
      {/* Main Content */}
      <div className="col-span-12">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#333333]">Add User</h1>
          <div className="relative">
            {/* Search Icon inside the input field */}
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

        {/* Form Section */}
        <div className="bg-[#F8F5F9] rounded-2xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="input input-bordered w-full rounded-2xl bg-[#ffffff] text-gray-700 p-4"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              className="input input-bordered w-full rounded-2xl bg-[#ffffff] text-gray-700 p-4"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full rounded-2xl bg-[#ffffff] text-gray-700 p-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="input input-bordered w-full rounded-2xl bg-[#ffffff] text-gray-700 p-4"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>

        {/* Button Section */}
        <div className="flex justify-end space-x-4">
          <button
            className="btn bg-white text-gray-600 hover:bg-gray-100 p-3 rounded-lg"
            onClick={() => navigate("/admin/users")}
          >
            Cancel
          </button>
          {/* <button
            className="btn bg-purple-700 hover:bg-purple-800 text-white p-3 rounded-lg"
            onClick={handleCreateUser}
          >
            Create User
          </button> */}
          <button
            className="btn bg-purple-700 hover:bg-purple-800 text-white p-3 rounded-lg"
            onClick={testEdgeFunction}
          >
            Test Edge Function
          </button>
        </div>
      </div>
    </Sidebar>
  );
};

export default AddUser;
