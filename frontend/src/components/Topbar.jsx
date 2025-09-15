import React from "react";
import { Bell, Mail, User, Search, SlidersHorizontal } from "lucide-react";

const Topbar = () => {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white shadow-sm">
      {/* Left: Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <Search className="text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search something here..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button className="flex items-center gap-2 px-3 py-1 border rounded-full text-sm hover:bg-gray-100">
          <SlidersHorizontal size={16} />
          Filter
        </button>
      </div>

      {/* Right: Icons */}
      <div className="flex items-center gap-6">
        {/* Messages */}
        <button className="relative">
          <Mail size={20} />
          <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            12
          </span>
        </button>

        {/* Notifications */}
        <button className="relative">
          <Bell size={20} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            20
          </span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <img
            src="/user-avatar.jpg" // ✅ replace with actual user image
            alt="User"
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="hidden md:inline font-medium">John Doe</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;