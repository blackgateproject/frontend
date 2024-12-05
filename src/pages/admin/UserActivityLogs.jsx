import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import UserActivity from '../../components/UserActivity';
import { Search } from 'lucide-react';

const UserActivityLogs = () => {
  const [userActivitiesData, setUserActivitiesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchUserActivities = async () => {
      try {
        const response = await fetch('http://localhost:8000/admin/v1/user-activity-logs');
        if (!response.ok) throw new Error('Failed to fetch user activities');
        const activities = await response.json();

        const userResponse = await fetch('http://localhost:8000/admin/v1/getAllUsers');
        if (!userResponse.ok) throw new Error('Failed to fetch user details');
        const users = await userResponse.json();

        const userMap = users.reduce((acc, user) => {
          acc[user.id] = user.email;
          return acc;
        }, {});

        const userActivitiesWithDetails = activities.map(activity => ({
          ...activity,
          name: userMap[activity.user_id] || 'Unknown User',
        }));

        setUserActivitiesData(userActivitiesWithDetails);
      } catch (error) {
        console.error('Error fetching user activities:', error);
      }
    };

    fetchUserActivities();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  const filteredActivities = userActivitiesData
    .filter((activity) => {
      const matchesSearch =
        (activity.name && activity.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (activity.activity && activity.activity.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'All' || activity.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  return (
    <Sidebar role="admin">
      {/* Header Row */}
      <div className="flex lg:justify-between lg:items-center lg:flex-row flex-col mb-6">
        <h1 className="text-3xl font-bold text-[#333333]">User Activities</h1>
        <div className="flex lg:items-center lg:space-x-4 space-y-5 lg:space-y-0 mt-4 lg:mt-0 flex-col lg:flex-row ">
          {/* Filter Dropdown */}
          <select
            value={filterType}
            onChange={handleFilterTypeChange}
            className="select select-bordered rounded-2xl bg-white text-gray-500 border-none shadow-sm"
          >
            <option value="All">All Types</option>
            <option value="Login">Login</option>
            <option value="Logout">Logout</option>
            <option value="Profile Edit">Profile Edit</option>
            <option value="App Access">App Access</option>
            <option value="Profile View">Profile View</option>
            <option value="User Edit">User Edit</option>
            <option value="Ticket Submission">Ticket Submission</option>
            <option value="Ticket Creation">Ticket Creation</option>
            <option value="Ticket Completion">Ticket Completion</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={handleSortOrderChange}
            className="select select-bordered rounded-2xl bg-white text-gray-500 border-none shadow-sm"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          {/* Search Input */}
          <div className="relative ">
            {/* Search Icon inside the input field */}
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-500" />
            </span>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              className="input input-bordered lg:w-60 w-full pl-10 rounded-2xl bg-white text-gray-500 border-none shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* User Activity List */}
      <UserActivity activities={filteredActivities} />
    </Sidebar>
  );
};

export default UserActivityLogs;