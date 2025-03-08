import {
  Search,
  TicketIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
  MapPin,
  Globe,
  Monitor,
  Info,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Sidebar from "../../components/Sidebar";
import { motion } from "framer-motion";

const Requests = () => {


  // Preprocess the data to generate role-specific arrays
  // const processedData = (() => {
  //   const allData = dummyData.all;
  //   const result = { all: allData };

  //   // Group by role
  //   result.admin = allData.filter((item) => item.role === "admin");
  //   result.user = allData.filter((item) => item.role === "user");
  //   result.device = allData.filter((item) => item.role === "device");

  //   return result;
  // })();

  // // Load dummy data based on selected role and status
  // useEffect(() => {
  //   loadDummyData(selectedRole, selectedStatus);
  //   // Reset to page 1 when filters change
  //   setCurrentPage(1);
  // }, [selectedRole, selectedStatus]);

  // // For demo purposes - uses dummy data instead of API calls
  // const loadDummyData = (role, status) => {
  //   setLoading(true);
  //   // Simulate network delay
  //   setTimeout(() => {
  //     try {
  //       let filteredData = processedData[role] || [];

  //       // Filter by status if not "all"
  //       if (status !== "all") {
  //         filteredData = filteredData.filter((item) => item.status === status);
  //       }

  //       setRequests(
  //         filteredData.map((request) => ({
  //           id: request.id,
  //           walletAddr: request.wallet_addr,
  //           userNetworkInfo: request.usernetwork_info,
  //           date: new Date(request.created_at),
  //           role: request.role,
  //           status: request.status,
  //         }))
  //       );

  //       showNotification(`Loaded ${filteredData.length} requests`, "success");
  //     } catch (error) {
  //       console.error("Error:", error);
  //       showNotification("Failed to load requests", "error");
  //     } finally {
  //       setLoading(false);
  //     }
  //   }, 800); // Simulate loading delay
  // };

  // // For demo purposes - simulates approve action using dummy data
  // const handleApprove = async (requestId) => {
  //   setLoading(true);
  //   // Simulate network delay
  //   setTimeout(() => {
  //     try {
  //       // Update the status of the request to approved
  //       setRequests((prev) =>
  //         prev.map((request) =>
  //           request.id === requestId
  //             ? { ...request, status: "approved" }
  //             : request
  //         )
  //       );
  //       showNotification(
  //         `Request #${requestId} approved successfully`,
  //         "success"
  //       );
  //     } catch (error) {
  //       console.error("Error:", error);
  //       showNotification("Failed to approve request", "error");
  //     } finally {
  //       setLoading(false);
  //       closeModal();
  //     }
  //   }, 1000);
  // };

  // // For demo purposes - simulates reject action using dummy data
  // const handleReject = async (requestId) => {
  //   setLoading(true);
  //   // Simulate network delay
  //   setTimeout(() => {
  //     try {
  //       // Update the status of the request to rejected
  //       setRequests((prev) =>
  //         prev.map((request) =>
  //           request.id === requestId
  //             ? { ...request, status: "rejected" }
  //             : request
  //         )
  //       );
  //       showNotification(
  //         `Request #${requestId} rejected successfully`,
  //         "success"
  //       );
  //     } catch (error) {
  //       console.error("Error:", error);
  //       showNotification("Failed to reject request", "error");
  //     } finally {
  //       setLoading(false);
  //       closeModal();
  //     }
  //   }, 1000);
  // };



  // State variables
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc', 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: "",
    requestId: null,
  });
  const [detailsModal, setDetailsModal] = useState({
    open: false,
    request: null,
  });
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "", // success, error
  });

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
      setRequests(
        data.map((request) => ({
          id: request.id,
          walletAddr: request.wallet_addr,
          userNetworkInfo: request.usernetwork_info,
          date: new Date(request.created_at),
          isApproved: request.isApproved,
          isRegistered: request.isRegistered,
          status: request.request_status,
          role: request.requested_role
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

    // Show notification
    const showNotification = (message, type) => {
      setNotification({
        show: true,
        message,
        type,
      });
  
      // Auto hide after 3 seconds
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 3000);
    };
  
    // Open confirmation modal
    const openModal = (type, requestId) => {
      setConfirmModal({
        open: true,
        type,
        requestId,
      });
    };
  
    // Close modal
    const closeModal = () => {
      setConfirmModal({
        open: false,
        type: "",
        requestId: null,
      });
    };
  
    // Open details modal
    const openDetailsModal = (request) => {
      // Ensure we have the full data including extended fields
      // This is needed because our display objects might not have all the fields
      const fullRequestData = processedData.all.find(
        (item) => item.id === request.id
      );
  
      if (fullRequestData) {
        setDetailsModal({
          open: true,
          request: {
            ...request,
            userNetworkInfo: {
              ...request.userNetworkInfo,
              // Add any missing fields from the original data
              city: fullRequestData.usernetwork_info.city,
              country: fullRequestData.usernetwork_info.country,
              isp: fullRequestData.usernetwork_info.isp,
              timezone: fullRequestData.usernetwork_info.timezone,
              connection_type: fullRequestData.usernetwork_info.connection_type,
            },
          },
        });
      } else {
        // Fallback if we 't find full data
        setDetailsModal({
          open: true,
          request,
        });
      }
    };
  
    // Close details modal
    const closeDetailsModal = () => {
      setDetailsModal({
        open: false,
        request: null,
      });
    };
    // Get badge color based on status
    const getStatusBadgeColor = (status) => {
      switch (status) {
        case "approved":
          return "badge-success";
        case "rejected":
          return "badge-error";
        case "pending":
        default:
          return "badge-warning";
      }
    };

    // Get role badge color
    const getRoleBadgeColor = (role) => {
      switch (role) {
        // case "admin":
        //   return "bg-blue-500";
        // case "user":
        //   return "bg-purple-500";
        // case "device":
        //   return "bg-cyan-500";
        default:
          return "bg-gray-500";
      }
    };

  // Filter and sort requests
  const filteredRequests = requests
    .filter((request) => {
      // Filter by search query
      return request.walletAddr
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      // Sort by date
      if (sortOrder === "asc") {
        return a.date - b.date;
      } else {
        return b.date - a.date;
      }
    });
    
  // Pagination logic
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredRequests.slice(
    indexOfFirstRequest,
    indexOfLastRequest
  );
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Sidebar role={selectedRole === "all" ? "admin" : selectedRole}>
      {/* Notification Toast */}
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === "success"
              ? "bg-green-100 border-l-4 border-green-500 text-green-700"
              : "bg-red-100 border-l-4 border-red-500 text-red-700"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <p>{notification.message}</p>
          </div>
        </motion.div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <Modal
          id="confirm-modal"
          icon={
            confirmModal.type === "approve" ? (
              <CheckCircle className="size-8 text-primary" />
            ) : (
              <XCircle className="size-8 text-red-500" />
            )
          }
          titleText={
            confirmModal.type === "approve"
              ? "Confirm Approval"
              : "Confirm Rejection"
          }
          contentText={
            confirmModal.type === "approve"
              ? "Are you sure you want to approve this request? This action cannot be undone."
              : "Are you sure you want to reject this request? This action cannot be undone."
          }
          actionButtonText="Confirm"
          actionButtonClass={
            confirmModal.type === "approve"
              ? "btn-primary"
              : "bg-red-500 hover:bg-red-700 text-white"
          }
          onSubmit={() =>
            confirmModal.type === "approve"
              ? handleApprove(confirmModal.requestId)
              : handleReject(confirmModal.requestId)
          }
          onClose={closeModal}
        />
      )}

      {/* Details Modal */}
      {detailsModal.open && detailsModal.request && (
        <Modal
          id="details-modal"
          icon={<Info className="size-8 text-primary" />}
          titleText={`Request Details #${detailsModal.request.id}`}
          contentText=""
          actionButtonText="Close"
          actionButtonClass="btn-primary"
          onSubmit={closeDetailsModal}
          onClose={closeDetailsModal}
          size="lg"
          actionButton={false}
          customContent={
            <div className="mt-4 space-y-6">
              {/* Request basic info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">ID</p>
                  <p className="font-mono text-gray-800">
                    {detailsModal.request.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Created
                  </p>
                  <p className="text-gray-800">
                    {detailsModal.request.date.toLocaleDateString()} at{" "}
                    {detailsModal.request.date.toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Role</p>
                  <p className="text-gray-800 capitalize">
                    {detailsModal.request.role}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Status
                  </p>
                  <div
                    className={`badge ${getStatusBadgeColor(
                      detailsModal.request.status
                    )} capitalize`}
                  >
                    {detailsModal.request.status}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <hr className="border-gray-200" />

              {/* Wallet Address */}
              <div>
                <p className="text-sm text-gray-500 font-medium mb-2">
                  Wallet Address
                </p>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="font-mono text-gray-800 break-all">
                    {detailsModal.request.walletAddr}
                  </p>
                </div>
              </div>

              {/* Network Information */}
              <div>
                <p className="text-lg font-semibold text-gray-700 mb-3">
                  Network Information
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <div className="flex items-center mb-1">
                        <Globe className="w-4 h-4 text-gray-500 mr-1" />
                        <p className="text-sm text-gray-500 font-medium">
                          IP Address
                        </p>
                      </div>
                      <p className="font-mono text-gray-800">
                        {detailsModal.request.userNetworkInfo.ip_address}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center mb-1">
                        <Monitor className="w-4 h-4 text-gray-500 mr-1" />
                        <p className="text-sm text-gray-500 font-medium">
                          Device
                        </p>
                      </div>
                      <p className="text-gray-800 text-sm">
                        {detailsModal.request.userNetworkInfo.user_agent}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <div className="flex items-center mb-1">
                        <MapPin className="w-4 h-4 text-gray-500 mr-1" />
                        <p className="text-sm text-gray-500 font-medium">
                          Location
                        </p>
                      </div>
                      <p className="text-gray-800">
                        {detailsModal.request.userNetworkInfo.city},{" "}
                        {detailsModal.request.userNetworkInfo.country}
                      </p>
                      <p className="text-sm text-gray-500">
                        {detailsModal.request.userNetworkInfo.location_lat},{" "}
                        {detailsModal.request.userNetworkInfo.location_long}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center mb-1">
                        <p className="text-sm text-gray-500 font-medium">
                          Language
                        </p>
                      </div>
                      <p className="text-gray-800">
                        {detailsModal.request.userNetworkInfo.user_language}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">
                        ISP
                      </p>
                      <p className="text-gray-800">
                        {detailsModal.request.userNetworkInfo.isp}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">
                        Connection
                      </p>
                      <p className="text-gray-800">
                        {detailsModal.request.userNetworkInfo.connection_type}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">
                        Timezone
                      </p>
                      <p className="text-gray-800">
                        {detailsModal.request.userNetworkInfo.timezone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="mt-4">
                <p className="text-sm text-gray-500 font-medium mb-2">
                  Location Map
                </p>
                <div className="bg-gray-100 p-2 rounded-lg h-40 flex items-center justify-center">
                  <p className="text-gray-400">
                    Map visualization would appear here
                  </p>
                </div>
              </div>
            </div>
          }
        />
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <TicketIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-800">Requests</h1>
          </div>

          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            {/* Role Selector */}
            <div className="w-full md:w-auto">
              <select
                className="select select-bordered rounded-2xl bg-base-100 text-gray-500 border-none shadow-sm"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="device">Device</option>
              </select>
            </div>

            {/* Status Selector */}
            <div className="w-full md:w-auto">
              <select
                className="select select-bordered rounded-2xl bg-base-100 text-gray-500 border-none shadow-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="w-full md:w-auto">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="select select-bordered rounded-2xl bg-base-100 text-gray-500 border-none shadow-sm"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-auto">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-500" />
              </span>
              <input
                type="text"
                placeholder="Search wallet address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full md:w-60 pl-10 rounded-2xl bg-base-100 text-gray-500 border-none shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Stats summary - optional */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-base-100 rounded-2xl shadow-sm p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Requests</p>
                <p className="text-2xl font-bold text-gray-800">
                  {filteredRequests.length}
                </p>
              </div>
              <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center">
                <TicketIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl shadow-sm p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {
                    filteredRequests.filter((r) => r.status === "pending")
                      .length
                  }
                </p>
              </div>
              <div className="bg-yellow-100 h-12 w-12 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl shadow-sm p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-500">
                  {
                    filteredRequests.filter((r) => r.status === "approved")
                      .length
                  }
                </p>
              </div>
              <div className="bg-green-100 h-12 w-12 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl shadow-sm p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-500">
                  {
                    filteredRequests.filter((r) => r.status === "rejected")
                      .length
                  }
                </p>
              </div>
              <div className="bg-red-100 h-12 w-12 rounded-full flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Requests Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader />
            <span className="mt-4 text-gray-600">Loading requests...</span>
          </div>
        ) : currentRequests.length > 0 ? (
          <div className="grid gap-6">
            {currentRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.005 }}
                className="bg-base-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6"
              >
                {/* Request Header */}
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center mb-3 md:mb-0">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <TicketIcon className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Request #{request.id}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Created on {request.date.toLocaleDateString()} at{" "}
                        {request.date.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div
                      className={`badge ${getRoleBadgeColor(
                        request.role
                      )} text-white capitalize text-xs px-2 py-1`}
                    >
                      {request.role}
                    </div>
                    <div
                      className={`badge ${getStatusBadgeColor(
                        request.status
                      )} text-xs px-2 py-1 capitalize`}
                    >
                      {request.status}
                    </div>
                  </div>
                </div>

                {/* Request Content - 4 fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 font-medium">
                      Wallet Address
                    </p>
                    <p className="text-gray-800 font-mono bg-gray-100 p-2 rounded overflow-x-auto">
                      {request.walletAddr}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 font-medium">
                      IP Address
                    </p>
                    <p className="text-gray-800 font-mono bg-gray-100 p-2 rounded">
                      {request.userNetworkInfo.ip_address}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 font-medium">
                      User Agent
                    </p>
                    <p className="text-gray-800 bg-gray-100 p-2 rounded overflow-x-auto text-sm">
                      {request.userNetworkInfo.user_agent}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 font-medium">
                      Location
                    </p>
                    <p className="text-gray-800 bg-gray-100 p-2 rounded">
                      {request.userNetworkInfo.location_lat},{" "}
                      {request.userNetworkInfo.location_long}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    className="btn btn-outline rounded-xl hover:bg-gray-100 hover:text-gray-800 transition-all duration-200"
                    onClick={() => openDetailsModal(request)}
                  >
                    View Details
                  </button>

                  {request.status === "pending" && (
                    <>
                      <button
                        className="btn bg-primary/90 hover:bg-primary text-white rounded-xl shadow-sm hover:shadow transition-all duration-200"
                        onClick={() => openModal("approve", request.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn bg-red-500/90 hover:bg-red-600 text-white rounded-xl shadow-sm hover:shadow transition-all duration-200"
                        onClick={() => openModal("reject", request.id)}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {request.status === "approved" && (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-1" /> Approved
                    </span>
                  )}

                  {request.status === "rejected" && (
                    <span className="text-red-600 flex items-center">
                      <XCircle className="h-5 w-5 mr-1" /> Rejected
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-base-100 rounded-2xl shadow-md p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <TicketIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No requests found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {selectedStatus !== "all" && selectedRole !== "all"
                  ? `No ${selectedStatus} requests found for ${selectedRole} role.`
                  : selectedStatus !== "all"
                  ? `No ${selectedStatus} requests found.`
                  : selectedRole !== "all"
                  ? `No requests found for ${selectedRole} role.`
                  : "No requests match your search criteria."}
              </p>
              <button
                className="btn btn-outline btn-sm mt-4"
                onClick={() => {
                  setSelectedRole("all");
                  setSelectedStatus("all");
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between mt-8">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              Showing {indexOfFirstRequest + 1}-
              {Math.min(indexOfLastRequest, filteredRequests.length)} of{" "}
              {filteredRequests.length} requests
            </p>

            <div className="join">
              <button
                className="join-item btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => paginate(currentPage - 1)}
              >
                Previous
              </button>

              {totalPages <= 5 ? (
                // Show all pages if 5 or fewer
                [...Array(totalPages).keys()].map((number) => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`btn btn-sm join-item ${
                      currentPage === number + 1
                        ? "btn-primary text-white"
                        : "btn-ghost"
                    }`}
                  >
                    {number + 1}
                  </button>
                ))
              ) : (
                // Show limited pages with ellipsis for many pages
                <>
                  <button
                    onClick={() => paginate(1)}
                    className={`btn btn-sm join-item ${
                      currentPage === 1 ? "btn-primary text-white" : "btn-ghost"
                    }`}
                  >
                    1
                  </button>

                  {currentPage > 3 && (
                    <span className="join-item btn btn-ghost btn-sm btn-disabled">
                      ...
                    </span>
                  )}

                  {/* Pages around current page */}
                  {[...Array(totalPages).keys()]
                    .filter(
                      (number) =>
                        number + 1 > Math.max(2, currentPage - 1) &&
                        number + 1 < Math.min(totalPages, currentPage + 2)
                    )
                    .map((number) => (
                      <button
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        className={`btn btn-sm join-item ${
                          currentPage === number + 1
                            ? "btn-primary text-white"
                            : "btn-ghost"
                        }`}
                      >
                        {number + 1}
                      </button>
                    ))}

                  {currentPage < totalPages - 2 && (
                    <span className="join-item btn btn-ghost btn-sm btn-disabled">
                      ...
                    </span>
                  )}

                  <button
                    onClick={() => paginate(totalPages)}
                    className={`btn btn-sm join-item ${
                      currentPage === totalPages
                        ? "btn-primary text-white"
                        : "btn-ghost"
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                className="join-item btn btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => paginate(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
};

export default Requests;
