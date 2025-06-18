import {
  ChartArea,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LucideDatabase,
  LucideNotepadTextDashed,
  Menu,
  Send,
  Ticket,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { connectorURL } from "../utils/readEnv";
const Sidebar = ({ role, children }) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebarExpanded");
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebarExpanded", JSON.stringify(isExpanded));
  }, [isExpanded]);

  const adminLinks = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <ChartArea /> },
    {
      name: "Statistics",
      path: "/admin/grafana-dashboard",
      icon: <LucideDatabase />,
    },
    // { name: "Applications", path: "/admin/applications", icon: <Shapes /> },
    { name: "Users", path: "/admin/users", icon: <Users /> },
    { name: "Requests", path: "/admin/requests", icon: <Ticket /> },
    { name: "Profile", path: "/admin/profile", icon: <User /> },
  ];

  const userLinks = [
    {
      name: "Dashboard",
      path: "/user/grafana-dashboard",
      icon: <LucideDatabase />,
    },
    // { name: "Applications", path: "/user/dashboard", icon: <Home /> },
    // { name: "Help", path: "/user/help", icon: <HelpCircle /> },
    { name: "Profile", path: "/user/profile", icon: <User /> },
  ];

  const devicelinks = [
    {
      name: "Dashboard",
      path: "/device/dashboard",
      icon: <LucideDatabase />,
    },
    // { name: "Applications", path: "/device/dashboard", icon: <Home /> },
    // { name: "Help", path: "/user/help", icon: <HelpCircle /> },
    { name: "Profile", path: "/device/profile", icon: <User /> },
  ];

  const testlinks = [
    {
      name: "Dashboard",
      path: "/test/serial",
      icon: <LucideNotepadTextDashed />,
    },
    {
      name: "Parallel",
      path: "/test/parallel",
      icon: <Send />,
    },
  ];

  const links =
    role === "admin"
      ? adminLinks
      : role === "device"
      ? devicelinks
      : role === "test"
      ? testlinks
      : userLinks;
  const logoutPath = role === "admin" ? "/" : "/";

  const handleLogout = async () => {
    const accessToken = sessionStorage.getItem("access_token");
    const did = localStorage.getItem("did");
    console.warn("Logging out\n", did);
    if (accessToken) {
      await fetch(`${connectorURL}/auth/v1/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: accessToken, did: did }),
      });
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
      // sessionStorage.removeItem("uuid");
    }
    window.location.href = logoutPath;
  };

  return (
    <>
      {/** Medium & Large screens */}
      <div className="flex h-screen max-sm:hidden">
        {/* Sidebar */}
        <div
          className={`bg-base-100 ${
            isExpanded ? "w-64" : "w-20"
          } h-screen flex flex-col justify-between py-4 shadow-lg transition-all duration-300 ease-in-out`}
        >
          {/* Logo and Toggle Button */}
          <div
            className={`flex flex-col gap-4 ${
              !isExpanded && "items-center"
            } justify-between px-4`}
          >
            <div className="flex items-center">
              <img src={logo} alt="Company Logo" className="w-10 h-10" />
              {isExpanded && (
                <span className="ml-2 text-xl font-bold">BlackGate</span>
              )}
            </div>
            <button
              className="btn btn-ghost btn-square"
              onClick={() => {
                const newState = !isExpanded;
                setIsExpanded(newState);
                localStorage.setItem(
                  "sidebarExpanded",
                  JSON.stringify(newState)
                );
              }}
            >
              {isExpanded ? <ChevronLeft /> : <ChevronRight />}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-3 mt-8 ">
            {links.map((link) => (
              <Link to={link.path} key={link.name} title={link.name}>
                <div
                  className={`w-full flex items-center ml-4 ${
                    isExpanded ? "px-4" : "pl-5"
                  } py-3 rounded-lg ${
                    location.pathname === link.path
                      ? "bg-gradient-to-br from-primary to-secondary text-white"
                      : "hover:bg-base-200 text-primary ring-base-200 ring-1 shadow"
                  }`}
                >
                  {link.icon}
                  {isExpanded && <span className="ml-4">{link.name}</span>}
                </div>
              </Link>
            ))}
          </div>

          {/* Logout Button */}
          <div className="mb-4">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${
                isExpanded ? "px-4" : "justify-center"
              } py-2 rounded-lg hover:bg-base-200 text-primary`}
            >
              <LogOut />
              {isExpanded && <span className="ml-4">Logout</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-base-200 p-6 lg:px-20 lg:pt-16 lg:pb-20 md:px-8 sm:px-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {/***************************************************/}

      {/** Small screens */}
      <div className="drawer drawer-mobile h-screen sm:hidden">
        {/* Drawer Toggle */}
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        {/* Page Content */}
        <div className="drawer-content flex flex-col">
          {/* Navbar for Small Screens */}
          <div className="navbar bg-base-100 lg:hidden">
            <div className="flex-none">
              <label htmlFor="my-drawer" className="btn btn-square btn-ghost">
                {/* Hamburger Icon */}
                <Menu />
              </label>
            </div>
            <div className="flex-1">
              <Link to="/" className="btn btn-ghost normal-case text-xl">
                <img src={logo} alt="BlackGate Logo" className="w-6 h-6 mr-2" />
                BlackGate
              </Link>
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1 bg-base-200 p-6 lg:px-20 md:px-8 sm:px-1 overflow-y-auto">
            {children}
          </div>
        </div>
        {/* Sidebar */}
        <div className="drawer-side">
          <label
            htmlFor="my-drawer"
            className="drawer-overlay lg:hidden"
          ></label>
          <div className="bg-base-100 w-20 h-screen flex flex-col items-center justify-between py-4 shadow-md">
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
                      ? "bg-gradient-to-br from-primary to-secondary text-white"
                      : "shadow-sm shadow-primary text-primary"
                  } group-hover:scale-105 transition-transform`}
                  >
                    {link.icon}
                  </div>
                </Link>
              ))}
            </div>

            {/* Logout Button */}
            <div className="mb-4">
              <button
                onClick={handleLogout}
                className="w-12 h-12 flex items-center justify-center rounded-lg shadow-md shadow-primary text-primary group-hover:scale-105 transition-transform"
              >
                <LogOut />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
