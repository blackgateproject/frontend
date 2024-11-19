import React, { useState } from 'react';
import { Edit, Key, KeyRound, Search, SquareUserRound } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const AdminProfile = () => {
  // Dummy data for the profile (Replace this with backend data)
  const [profile, setProfile] = useState({
    firstName: 'Abdullah',
    lastName: 'Abubaker',
    email: 'abdullah.abubaker@blackgate.com',
    phone: '+92-300-456-8910',
    passwordSet: true,
    twoFactorAuth: false,
  });

  // Dummy edit handlers (Replace this with actual edit functionality)
  const handleEditPersonalInfo = () => {
    console.log('Edit Personal Info Clicked');
  };

  const handleEditAuthentication = () => {
    console.log('Edit Authentication Info Clicked');
  };

  return (
    <Sidebar role={"admin"}>
        {/* Main Content */}
        <div className="col-span-12">
          {/* Header Row */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#333333]">Profile</h1>
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

          {/* Cards Section */}
          <div className="grid grid-cols-2 gap-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 relative flex flex-col justify-center">
              <div className="absolute top-4 right-4">
                <button
                  className="btn bg-purple-700 hover:bg-purple-800 text-white p-2 rounded-2xl px-4"
                  onClick={handleEditPersonalInfo}
                >
                  <Edit size={16} />
                  Edit
                </button>
              </div>
              <div className="flex gap-2">
                <SquareUserRound size={32} className="text-purple-700" />
                <h2 className="text-xl font-bold text-[#333333]">Personal Information</h2>
              </div>
              <div className="mt-6 grid grid-cols-3 ">
                <div className="space-y-2">
                  <p><strong>First name:</strong></p>
                  <p><strong>Last name:</strong></p>
                  <p><strong>Email:</strong></p>
                  <p><strong>Phone No.:</strong></p>
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
                  onClick={handleEditAuthentication}
                >
                  <Edit size={16} />
                  Edit
                </button>
              </div>
              <div className="flex gap-2">
                <KeyRound size={32} className="text-purple-700" />
                <h2 className="text-xl font-bold text-[#333333]">Authentication</h2>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p><strong>Password:</strong></p>
                  <p><strong>2-Factor Auth:</strong></p>
                </div>
                <div className="space-y-2">
                  <p>{profile.passwordSet ? 'Set' : 'Not Set'}</p>
                  <p>{profile.twoFactorAuth ? 'Set' : 'Not Set'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </Sidebar>
  );
};

export default AdminProfile;
