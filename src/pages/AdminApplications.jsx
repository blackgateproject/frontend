import React from 'react';
import { Search } from 'lucide-react';
import word from '../assets/word.png';
import pp from '../assets/PP.png';
import Sidebar from '../components/Sidebar';

const Applications = () => {
  // Dummy data for applications (Replace this with backend data)
  const applications = [
    { name: 'Microsoft Word', icon: word },
    { name: 'Microsoft Powerpoint', icon: pp },
    { name: 'Microsoft Word', icon: word },
    { name: 'Microsoft Powerpoint', icon: pp },
    { name: 'Microsoft Powerpoint', icon: pp },
    { name: 'Microsoft Word', icon: word },
    { name: 'Microsoft Powerpoint', icon: pp }
  ];

  return (
   <Sidebar role={"admin"}>
       {/* Main Content */}
       <div className="col-span-12">
         {/* Header Row */}
         <div className="flex justify-between items-center mb-6">
           <h1 className="text-3xl font-bold text-[#333333]">Applications</h1>
           <div className="flex items-center space-x-4">
             <button className="btn bg-purple-700 hover:bg-purple-800 text-white rounded-2xl px-4">+ Add App</button>
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
         </div>
    
         {/* Applications Grid */}
         <div className="grid grid-cols-4 gap-6">
           {/* Replace this with dynamic data fetched from the backend */}
           {applications.map((app, index) => (
             <div key={index} className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center">
               <img src={app.icon} alt={app.name} className="w-12 h-12 mb-4" />
               <p className="text-center text-gray-700 mt-auto">{app.name}</p>
             </div>
           ))}
           {/* Backend data ends here */}
         </div>
       </div>
   </Sidebar>
  );
};

export default Applications;
