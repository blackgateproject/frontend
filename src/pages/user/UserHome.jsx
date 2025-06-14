import { Search, Shapes } from "lucide-react";
import React, { useState } from "react";
import facebookLogo from "../../assets/facebook.png";
import githubLogo from "../../assets/github.png";
import hfLogo from "../../assets/hf.png";
import instagramLogo from "../../assets/instagram.jpg";
import linkedinLogo from "../../assets/linkedin.jpg";
import pinterestLogo from "../../assets/pinterest.png";
import pp from "../../assets/pp.png";
import word from "../../assets/word.png";
import ApplicationsGrid from "../../components/ApplicationsGrid";
import Sidebar from "../../components/Sidebar";

const Applications = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy data for applications (Replace this with backend data)
  const applications = [
    { name: "LinkedIn", icon: linkedinLogo },
    { name: "Instagram", icon: instagramLogo },
    { name: "HuggingFace", icon: hfLogo },
    { name: "Github", icon: githubLogo },
    { name: "Facebook", icon: facebookLogo },
    { name: "Pinterest", icon: pinterestLogo },
    { name: "Microsoft Word", icon: word },
    { name: "Microsoft Powerpoint", icon: pp },
  ];

  // Filter applications based on search query
  const filteredApplications = applications.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sidebar role={"user"}>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <Shapes className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-800">Applications</h1>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {/* Search Icon inside the input field */}
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-500" />
                </span>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered w-60 pl-10 rounded-2xl bg-base-100 text-gray-500 border-none shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Applications Grid */}
        {filteredApplications.length > 0 ? (
          <ApplicationsGrid applications={filteredApplications} />
        ) : (
          <div className="text-center text-gray-500 mt-10">
            No applications found, please try a different keyword.
          </div>
        )}
      </div>
    </Sidebar>
  );
};

export default Applications;