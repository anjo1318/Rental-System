import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [recentLogins, setRecentLogins] = useState([]);
  const [currentBookings, setCurrentBookings] = useState([]);
  const [showAllLogins, setShowAllLogins] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    totalOwners: 0,
    totalItems: 0,
    totalBookings: 0,
  });

  useEffect(() => {
    fetchDashboardData();
    fetchRecentLogins();
    fetchCurrentBookings();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/api/dashboard/dashboard-data`
      );
      setDashboardData(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchRecentLogins = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/api/login-history/login-history`
      );
      setRecentLogins(response.data.data || []);
    } catch (error) {
      console.error("Error fetching recent logins:", error);
    }
  };

  const fetchCurrentBookings = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/api/book/fetch-bookings?status=approved`
      );
      setCurrentBookings(response.data.data || []);
    } catch (error) {
      console.error("Error fetching current bookings:", error);
    }
  };

  const formatLoginTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) return `Today, ${timeStr}`;
    else if (isYesterday) return `Yesterday, ${timeStr}`;
    else
      return (
        date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }) +
        ", " +
        timeStr
      );
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "customer": return "text-blue-600";
      case "owner": return "text-orange-500";
      case "admin": return "text-teal-600";
      default: return "text-gray-600";
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case "customer": return "👤";
      case "owner": return "💼";
      case "admin": return "👨‍💼";
      default: return "👤";
    }
  };

  const statCards = [
    {
      title: "Total Customers",
      value: dashboardData.totalCustomers || 0,
      percentage: 80,
      color: "#3B82F6",
      bgFrom: "#EFF6FF",
      bgTo: "#DBEAFE",
      accent: "#BFDBFE",
      icon: (
        <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      ),
    },
    {
      title: "Total Owners",
      value: dashboardData.totalOwners || 0,
      percentage: 60,
      color: "#F97316",
      bgFrom: "#FFF7ED",
      bgTo: "#FFEDD5",
      accent: "#FED7AA",
      icon: (
        <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
        </svg>
      ),
    },
    {
      title: "Total Units",
      value: dashboardData.totalItems || 0,
      percentage: 70,
      color: "#22C55E",
      bgFrom: "#F0FDF4",
      bgTo: "#DCFCE7",
      accent: "#BBF7D0",
      icon: (
        <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
        </svg>
      ),
    },
    {
      title: "Current Bookings",
      value: dashboardData.totalBookings || 0,
      percentage: 85,
      color: "#A855F7",
      bgFrom: "#FAF5FF",
      bgTo: "#F3E8FF",
      accent: "#E9D5FF",
      icon: (
        <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
        </svg>
      ),
    },
  ];

  const CircularStatCard = ({
    title,
    value,
    icon,
    color,
    accent,
    percentage = 75,
  }) => {
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 mb-3">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
            <circle cx="96" cy="96" r="54" stroke={accent} strokeWidth="14" fill="none" />
            <circle
              cx="96"
              cy="96"
              r="54"
              stroke={color}
              strokeWidth="14"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="mb-1" style={{ color }}>
              {icon}
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-800">
              {value.toLocaleString()}
            </p>
          </div>
        </div>

        <p className="font-bold text-sm sm:text-base tracking-wide" style={{ color }}>
          {title}
        </p>
      </div>
    );
  };

  const displayedLogins = showAllLogins ? recentLogins : recentLogins.slice(0, 4);
  const displayedBookings = showAllBookings ? currentBookings : currentBookings.slice(0, 4);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full h-full p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Welcome back — here's what's happening today.
          </p>
        </div>

      <div className="rounded-3xl p-8 shadow-xl bg-gradient-to-br from-gray-50 to-white w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {statCards.map((card, index) => (
            <CircularStatCard key={index} {...card} />
          ))}
        </div>
      </div>

        {/* Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
          {/* Recent Logins */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 flex flex-col">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
              Recent Logins
            </h2>
            <div className="overflow-x-auto flex-1">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">User</th>
                    <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                    <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">Login Time</th>
                    <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedLogins.length > 0 ? (
                    displayedLogins.map((login, index) => (
                      <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{getRoleIcon(login.role)}</span>
                            <span className={`font-semibold text-sm ${getRoleColor(login.role)}`}>
                              {login.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-gray-600 capitalize text-sm">{login.role}</td>
                        <td className="py-3 px-2 text-gray-500 text-xs sm:text-sm whitespace-nowrap">{formatLoginTime(login.loginTime)}</td>
                        <td className="py-3 px-2 text-gray-400 text-xs font-mono">{login.ipAddress}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-gray-400 text-sm">
                        No recent logins
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {recentLogins.length > 4 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAllLogins(!showAllLogins)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1 transition-colors"
                >
                  {showAllLogins ? "Show Less" : "View All"}
                  <svg
                    className={`w-4 h-4 transition-transform ${showAllLogins ? "rotate-90" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Current Bookings */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 flex flex-col">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
              Current Bookings
            </h2>
            <div className="overflow-x-auto flex-1">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">Booking ID</th>
                    <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">Unit</th>
                    <th className="text-left py-3 px-2 text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">Check-In / Out</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedBookings.length > 0 ? (
                    displayedBookings.map((booking, index) => (
                      <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-2">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold text-xs border border-blue-100">
                            BK-{booking.id}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-semibold text-gray-900 text-sm">{booking.name}</td>
                        <td className="py-3 px-2 text-gray-500 text-sm">{booking.product}</td>
                        <td className="py-3 px-2 text-gray-500 text-xs whitespace-nowrap">
                          {formatDate(booking.pickUpDate)} / {formatDate(booking.returnDate)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-gray-400 text-sm">
                        No current bookings
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {currentBookings.length > 4 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAllBookings(!showAllBookings)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center gap-1 transition-colors"
                >
                  {showAllBookings ? "Show Less" : "View All"}
                  <svg
                    className={`w-4 h-4 transition-transform ${showAllBookings ? "rotate-90" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;