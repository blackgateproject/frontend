import React from 'react';
import { Search, TicketCheckIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Tickets = () => {
  // Dummy data for tickets (Replace this with backend data)
  const tickets = [
    {
      id: 1,
      heading: 'Ticket Information',
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." ,
      openedBy: 'Abdullah Abubaker',
    },
    {
      id: 2,
      heading: 'Ticket Information',
      content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
      openedBy: 'Abdullah Abubaker',
    },
    // Add more tickets here
  ];

  const handleComplete = (ticketId) => {
    // Replace this with backend functionality to mark the ticket as completed
    console.log('Ticket completed:', ticketId);
  };

  return (
   <Sidebar role={"admin"}>

       {/* Main Content */}
       <div className="col-span-12">
         {/* Header Row */}
         <div className="flex justify-between items-center mb-6">
           <h1 className="text-3xl font-bold text-[#333333]">Tickets</h1>
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
    
         {/* Tickets Section */}
         {tickets.map((ticket) => (
           <div key={ticket.id} className="bg-white rounded-2xl shadow-md p-6 mb-4">
             <div>
               <div className="flex items-center">
                <TicketCheckIcon className="text-purple-700 mr-3" size={24} />
                <h2 className="text-xl font-bold text-[#333333]">{ticket.heading}</h2>
               </div>
               <p className="text-gray-600 mt-2 mb-4">"{ticket.content}"</p>
             </div>
    
             {/* Name and Complete Button Row */}
             <div className="flex justify-between items-center mt-4">
               <p className="text-gray-500 text-sm">Opened by {ticket.openedBy}</p>
               <button
                 className="btn bg-purple-700 hover:bg-purple-800 text-white p-3 rounded-2xl px-4"
                 onClick={() => handleComplete(ticket.id)}
               >
                 Complete
               </button>
             </div>
           </div>
         ))}
       </div>

   </Sidebar>
  );
};

export default Tickets;
