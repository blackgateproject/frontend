import { Search, TicketCheckIcon, TicketIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Sidebar from "../../components/Sidebar";

const requests = () => {
  // State variables
  const [requests, setrequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'pending', 'completed'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc', 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [modalRequestId, setModalRequestId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false); // State to control Modal visibility

  useEffect(() => {
    fetchrequests();
  }, []);

  const fetchrequests = async () => {
    setLoading(true);
    try {
      const accessToken = sessionStorage.getItem("access_token") || "";

      const response = await fetch("http://127.0.0.1:8000/admin/v1/requests", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 401) {
        console.log("Redirecting to:", "/");
        window.location.href = "/";
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch requests");
      const data = await response.json();
      setrequests(
        data.map((request) => ({
          id: request.id,
          walletAddr: request.wallet_addr,
          userNetworkInfo: request.usernetwork_info,
          date: new Date(request.created_at),
          isApproved: request.isApproved,
          isRegistered: request.isRegistered,
        }))
      );
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    const accessToken = sessionStorage.getItem("access_token") || "";

    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/admin/v1/requests/${requestId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.status === 401) {
        console.log("Redirecting to:", "/");
        window.location.href = "/";
        return;
      }
      if (!response.ok) throw new Error("Failed to approve request");
      await fetchrequests();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to approve request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    const accessToken = sessionStorage.getItem("access_token") || "";

    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/admin/v1/requests/${requestId}/reject`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.status === 401) {
        console.log("Redirecting to:", "/");
        window.location.href = "/";
        return;
      }
      if (!response.ok) throw new Error("Failed to reject request");
      await fetchrequests();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to reject request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort requests
  const filteredrequests = requests
    .filter((request) => {
      const matchesSearch = request.walletAddr
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.date - b.date;
      } else {
        return b.date - a.date;
      }
    });

  // Pagination logic
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentrequests = filteredrequests.slice(
    indexOfFirstRequest,
    indexOfLastRequest
  );
  const totalPages = Math.ceil(filteredrequests.length / requestsPerPage);

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
      {modalOpen && (
        <Modal
          id="confirm-modal"
          icon={<TicketIcon className="size-8" />}
          titleText="Confirm Completion"
          contentText="Are you sure you want to mark this request as completed?"
          actionButtonText="Confirm"
          onSubmit={() => handleComplete(modalRequestId)}
          onClose={() => setModalOpen(false)} // Ensure modal closes on cancel
        />
      )}

      {/* Main Content */}
      <div className="">
        {/* Header Row */}
        <div className="flex flex-wrap flex-col lg:flex-row justify-between lg:items-center mb-6">
          <h1 className="text-3xl font-bold text-[#333333] mb-3">Requests</h1>
          <div className="flex  lg:items-center lg:flex-row flex-col space-y-2 lg:space-y-0 lg:space-x-4">
            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select select-bordered rounded-2xl"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending Requests</option>
              <option value="completed">Completed Requests</option>
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
                className="input input-bordered w-full md:w-60 pl-10 rounded-2xl bg-base-100 text-gray-500 border-none shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Requests Section */}
        {loading ? (
          <div className="text-center flex flex-col gap-3 items-center justify-center py-10 min-h-screen">
            <Loader />
            <span className="mt-3"> Loading...</span>
          </div>
        ) : currentrequests.length > 0 ? (
          currentrequests.map((request) => (
            <div
              key={request.id}
              className="bg-base-100 rounded-2xl shadow-md p-6 mb-4"
            >
              {/* Main content */}
              <div>
                {/* Request heading and icon */}
                <div className="flex items-center">
                  <TicketCheckIcon className="text-primary mr-3" size={24} />
                  <h2 className="text-xl font-bold text-[#333333]">
                    Request ID: {request.id}
                  </h2>
                </div>

                {/* Request ID and Status badges */}
                <div className="flex gap-2 my-3">
                  <div className="badge badge-secondary">ID-{request.id}</div>
                </div>

                {/* Request Content */}
                <p className="text-gray-600 mt-2 mb-4">
                  Wallet Address: {request.walletAddr}
                </p>
                <p className="text-gray-600 mt-2 mb-4">
                  IP Address: {request.userNetworkInfo.ip_address}
                </p>
                <p className="text-gray-600 mt-2 mb-4">
                  User Agent: {request.userNetworkInfo.user_agent}
                </p>
                <p className="text-gray-600 mt-2 mb-4">
                  User Language: {request.userNetworkInfo.user_language}
                </p>
                <p className="text-gray-600 mt-2 mb-4">
                  Location: {request.userNetworkInfo.location_lat},{" "}
                  {request.userNetworkInfo.location_long}
                </p>
              </div>

              {/* Name, Date, and Action Buttons Row */}
              <div className="flex justify-between items-center mt-4">
                <p className="text-gray-500 text-sm">
                  Created on {request.date.toLocaleDateString()}{" "}
                  {request.date.toLocaleTimeString()}
                </p>
                <div className="flex gap-2">
                  <button
                    className="btn bg-primary/75 hover:bg-primary text-base-100 p-3 rounded-2xl px-4"
                    onClick={() => handleApprove(request.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn bg-red-500 hover:bg-red-700 text-base-100 p-3 rounded-2xl px-4"
                    onClick={() => handleReject(request.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 mt-10">
            No requests found, please try a different keyword or filter.
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="btn-group">
              {[...Array(totalPages).keys()].map((number) => (
                <button
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  className={`btn ${
                    currentPage === number + 1 ? "btn-active" : ""
                  }`}
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

export default requests;
