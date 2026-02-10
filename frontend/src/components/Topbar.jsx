// Topbar.jsx
import React, { useState } from "react";
import { Bell, Mail, Search, SlidersHorizontal, X } from "lucide-react";

const Topbar = () => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="bg-white shadow-sm w-full">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between px-6 py-3 w-full">
        {/* Left: Search - REMOVED max-w constraint */}
        <div className="flex items-center gap-3 flex-1 mr-8">
          <Search className="text-gray-500 flex-shrink-0" size={18} />
          <input
            type="text"
            placeholder="Search something here..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button className="flex items-center gap-2 px-3 py-1 border rounded-full text-sm hover:bg-gray-100 whitespace-nowrap flex-shrink-0">
            <SlidersHorizontal size={16} />
            Filter
          </button>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
          {/* Messages */}
          <button className="relative">
            <Mail size={20} />

          </button>

          {/* Notifications */}
          <button className="relative">
            <Bell size={20} />

          </button>

          {/* User Avatar */}
          {/* <div className="flex items-center gap-2">
            <img
              src="https://via.placeholder.com/32"
              alt="User"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="font-medium hidden lg:inline whitespace-nowrap">John Doe</span>
          </div> */}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-semibold text-lg">EzRent</h1>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="p-1"
            >
              {showSearch ? <X size={20} /> : <Search size={20} />}
            </button>

            <button className="relative p-1">
              <Mail size={20} />
              <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs px-1 rounded-full min-w-[16px] h-4 flex items-center justify-center">
                12
              </span>
            </button>

            <button className="relative p-1">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full min-w-[16px] h-4 flex items-center justify-center">
                20
              </span>
            </button>

            <img
              src="https://via.placeholder.com/32"
              alt="User"
              className="h-7 w-7 rounded-full object-cover"
            />
          </div>
        </div>

        {showSearch && (
          <div className="px-4 pb-3 border-t pt-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2">
                <Search className="text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full text-sm focus:outline-none"
                  autoFocus
                />
              </div>
              <button className="flex items-center gap-1 px-3 py-2 border rounded-md text-sm hover:bg-gray-100">
                <SlidersHorizontal size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;