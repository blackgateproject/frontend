import React, { useState, useEffect } from 'react';
import { CheckCheckIcon, ClockIcon, Search, TicketCheckIcon, TicketIcon } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';

const Tickets = () => {
  // State variables
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'completed'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [modalTicketId, setModalTicketId] = useState(null);

  // Generate dummy tickets
  useEffect(() => {
    const dummyTickets = [];
    for (let i = 1; i <= 20; i++) {
      dummyTickets.push({
        id: i,
        heading: `Ticket #${i}`,
        content: `This is the content for ticket number ${i}.`,
        openedBy: `User ${i}`,
        date: new Date(Date.now() - i * 10000000),
        pending: i % 2 === 0,
      });
    }
    setTickets(dummyTickets);
  }, []);

  // Handle ticket completion
  const handleComplete = async (ticketId) => {
    document.getElementById('confirm-modal').close();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, pending: false } : ticket
      )
    );
    setLoading(false);
  };

  // Open modal
  const openModal = (ticketId) => {
    setModalTicketId(ticketId);
    document.getElementById('confirm-modal').showModal();
  };

  // Filter and sort tickets
  const filteredTickets = tickets
    .filter((ticket) => {
      const matchesSearch =
        ticket.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.heading.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'pending' && ticket.pending) ||
        (filterStatus === 'completed' && !ticket.pending);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.date - b.date;
      } else {
        return b.date - a.date;
      }
    });

  // Pagination logic
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  const paginate = (pageNumber) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentPage(pageNumber);
      setLoading(false);
    }, 2000);
  };

  return (
    <Sidebar role="admin">
      {/* Modal for confirmation */}
      <Modal
        id="confirm-modal"
        icon={<TicketIcon className="size-8" />}
        titleText="Confirm Completion"
        contentText="Are you sure you want to mark this ticket as completed?"
        actionButtonText="Confirm"
        onSubmit={() => handleComplete(modalTicketId)}
      />

      {/* Main Content */}
      <div className="">
        {/* Header Row */}
        <div className="flex flex-wrap flex-col lg:flex-row justify-between lg:items-center mb-6">
          <h1 className="text-3xl font-bold text-[#333333] mb-3">Tickets</h1>
          <div className="flex  lg:items-center lg:flex-row flex-col space-y-2 lg:space-y-0 lg:space-x-4">
            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select select-bordered rounded-2xl"
            >
              <option value="all">All Tickets</option>
              <option value="pending">Pending Tickets</option>
              <option value="completed">Completed Tickets</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="select select-bordered rounded-2xl"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>

            {/* Search */}
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-500" />
              </span>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full md:w-60 pl-10 rounded-2xl bg-white text-gray-500 border-none shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Tickets Section */}
        {loading ? (
          <div className="text-center flex flex-col gap-3 items-center justify-center py-10 min-h-screen">
            <Loader />
            <span className="mt-3"> Loading...</span>
           
            </div>
        ) : currentTickets.length > 0 ? (
          currentTickets.map((ticket) => (
            <div key={ticket.id} className="bg-base-100 rounded-2xl shadow-md p-6 mb-4">
              {/* Main content */}
              <div>
                {/* Ticket heading and icon */}
                <div className="flex items-center">
                  <TicketCheckIcon className="text-primary mr-3" size={24} />
                  <h2 className="text-xl font-bold text-[#333333]">{ticket.heading}</h2>
                </div>

                {/* Ticket ID and Status badges */}
                <div className="flex gap-2 my-3">
                  <div className="badge badge-secondary">ID-{ticket.id}</div>
                  <div
                    className={`badge ${
                      ticket.pending ? 'badge-primary' : 'badge-success'
                    } text-base-100 flex gap-2`}
                  >
                    {ticket.pending ? (
                      <ClockIcon className="size-3" />
                    ) : (
                      <CheckCheckIcon className="size-3" />
                    )}
                    {ticket.pending ? 'Pending' : 'Completed'}
                  </div>
                </div>

                {/* Ticket Content */}
                <p className="text-gray-600 mt-2 mb-4">"{ticket.content}"</p>
              </div>

              {/* Name, Date, and Complete Button Row */}
              <div className="flex justify-between items-center mt-4">
                <p className="text-gray-500 text-sm">
                  Opened by {ticket.openedBy} on{' '}
                  {ticket.date.toLocaleDateString()} {ticket.date.toLocaleTimeString()}
                </p>
                {ticket.pending && (
                  <button
                    className="btn bg-primary/75 hover:bg-primary text-base-100 p-3 rounded-2xl px-4"
                    onClick={() => openModal(ticket.id)}
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 mt-10">
            No tickets found, please try a different keyword or filter.
          </div>
        )}

        {/* Pagination */}
        {(!loading && totalPages > 1) && (
          <div className="flex justify-center mt-6">
            <div className="btn-group">
              {[...Array(totalPages).keys()].map((number) => (
                <button
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  className={`btn ${currentPage === number + 1 ? 'btn-active' : ''}`}
                >
                  {number + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
};

export default Tickets;