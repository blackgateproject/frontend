import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import { Search } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const AdminUsers = () => {
    const navigate = useNavigate();
  // Dummy data for users (Replace this with backend data)
  const users = [
    { firstName: 'Abdullah', lastName: 'Abubaker', online: true },
    { firstName: 'Muhammad', lastName: 'Qasim', online: true },
    { firstName: 'Fahad', lastName: 'Sheikh', online: false },
    { firstName: 'Awais', lastName: 'Shahid', online: true },
    { firstName: 'Taha', lastName: 'Qaisar', online: false },
    { firstName: 'Ubaid', lastName: 'Ullah', online: false },
  ];

  return (
   <Sidebar role={"admin"}>
       {/* Main Content */}
       <div className="col-span-12">
         {/* Header Row */}
         <div className="flex justify-between items-center mb-6">
           <h1 className="text-3xl font-bold text-[#333333]">Users</h1>
           <div className="flex items-center space-x-4">
             <button className="btn bg-primary/75 hover:bg-primary text-base-100 rounded-2xl px-4" onClick={() => navigate('/admin/adduser')}>+ Add User</button>
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
    
         {/* Users Grid */}
         <div className="grid md:grid-cols-2 gap-4">
           {/* Replace this with dynamic data fetched from the backend */}
           {users.map((user, index) => (
             <div key={index} className="bg-base-100 rounded-2xl shadow-md p-6 flex justify-between items-center">
               <div className="flex items-center space-x-2">
                 {/* Online/Offline Indicator */}
                 <h2 className="text-lg font-semibold text-[#333333]">
                   {user.firstName} {user.lastName}
                 </h2>
                 <div className={`w-3 h-3 rounded-full ${user.online ? 'bg-green-300' : 'bg-gray-400'}`}></div>
               </div>
    
               <div className="flex space-x-2">
                 {/* Square icon boxes */}
                 <button className="btn bg-primary/75 hover:bg-primary text-base-100 p-2 w-10 h-10 flex justify-center items-center rounded-xl">
                   <Edit size={16} />
                 </button>
                 <button className="btn bg-[#B80000] hover:bg-red-800 text-base-100 p-2 w-10 h-10 flex justify-center items-center rounded-xl">
                   <Trash2 size={16} />
                 </button>
               </div>
             </div>
           ))}
           {/* Backend data ends here */}
         </div>
       </div>

   </Sidebar>
  );
};

export default AdminUsers;
