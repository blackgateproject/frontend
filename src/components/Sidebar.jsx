import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Home,  Users, Ticket, ChartArea, User, HelpCircle, Shapes } from 'lucide-react'; // Importing icons
import logo from '../assets/logo.png'

const Sidebar = ({ role, children }) => {
  const location = useLocation();

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <ChartArea /> },
    { name: 'Applications', path: '/admin/applications', icon: <Shapes /> },
    { name: 'Users', path: '/admin/users', icon: <Users /> },
    { name: 'Tickets', path: '/admin/tickets', icon: <Ticket /> },
    { name: 'Profile', path: '/admin/profile', icon: <User /> },
  ];

  const userLinks = [
    { name: 'Home', path: '/home', icon: <Home /> },
    { name: 'Help', path: '/help', icon: <HelpCircle /> },
    { name: 'Profile', path: '/profile', icon: <User /> },
  ];

  const links = role === 'admin' ? adminLinks : userLinks;
  const logoutPath = role === 'admin' ? '/admin/login' : '/';

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="bg-base-100 w-20 h-full flex flex-col items-center justify-between py-4 shadow-md">
        {/* Logo */}
        <div className="mb-8">
          <img src={logo} alt="Company Logo" className="w-10 h-10" />
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-3">
          {links.map((link) => (
            <Link to={link.path} key={link.name} className="group">
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-lg 
                ${
                  location.pathname === link.path
                    ? 'bg-gradient-to-br from-primary to-secondary text-white'
                    : 'shadow-sm shadow-primary  text-primary'
                } group-hover:scale-105 transition-transform`}
              >
                {link.icon}
              </div>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mb-4">
          <Link to={logoutPath}>
            <div className="w-12 h-12 flex items-center justify-center rounded-lg shadow-md shadow-primary text-primary group-hover:scale-105 transition-transform">
              <LogOut />
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-base-200 p-6 lg:px-20 md:px-8 sm:px-1 ">{children}</div>
    </div>
  );
};

export default Sidebar;
