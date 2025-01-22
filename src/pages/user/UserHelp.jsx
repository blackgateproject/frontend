import { Search } from "lucide-react";
import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";

const Help = () => {
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxCharCount = 500;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const accessToken = sessionStorage.getItem("access_token") || "";

      const response = await fetch("http://127.0.0.1:8000/user/v1/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: ticketTitle,
          description: ticketDescription,
          user_id: sessionStorage.getItem("uuid"),
        }),
      });
      if (response.status === 401) {
        console.log("Redirecting to:", "/");
        window.location.href = "/";
        return;
      }

      if (!response.ok) throw new Error("Failed to submit ticket");

      setTicketTitle("");
      setTicketDescription("");
      setCharCount(0);
      alert("Ticket submitted successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to submit ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sidebar role={"user"}>
      {/* Main Content */}
      <div className="col-span-12">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-[#333333]">Support</h1>
          </div>
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

        {/* Ticket Form Card */}
        <div className="bg-[#F8F5F9] rounded-2xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Ticket Title"
              className="input input-bordered w-full rounded-2xl bg-[#ffffff] text-gray-700 p-4"
              value={ticketTitle}
              onChange={(e) => setTicketTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Ticket Description"
              className="textarea textarea-bordered w-full rounded-2xl bg-[#ffffff] text-gray-700 p-4"
              value={ticketDescription}
              onChange={(e) => {
                setTicketDescription(e.target.value);
                setCharCount(e.target.value.length);
              }}
              maxLength={maxCharCount}
              rows={6}
              required
            />
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">
                {charCount}/{maxCharCount}
              </span>
              <button
                type="submit"
                className="btn bg-primary/75 hover:bg-primary text-base-100 p-3 rounded-2xl px-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Sidebar>
  );
};

export default Help;
