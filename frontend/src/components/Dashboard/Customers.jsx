import React, { useEffect, useState } from "react";
import axios from "axios";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/api/customer`
      );
      if (Array.isArray(response.data.data)) {
        setCustomers(response.data.data);
        setSelectedCustomer(response.data.data[0] || null);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    /*
     * LAYOUT STRATEGY
     * – The component itself is a full-height flex column.
     * – Parent must give it height (e.g. parent is h-screen or the router outlet
     *   is styled with h-full). Add `h-screen` here if this is the root element.
     * – On mobile: sidebar OR detail panel shown (toggle via selectedCustomer).
     * – On md+: sidebar (fixed width) + detail panel side-by-side, both scrollable
     *   independently inside the flex row.
     */
    <div className="flex flex-col h-full min-h-0 bg-gray-50">

      {/* ── Top Header ── */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shadow-sm z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              Customer Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
              Manage and view customer profiles
            </p>
          </div>
          <span className="flex-shrink-0 bg-teal-50 text-teal-700 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full border border-teal-200 whitespace-nowrap">
            {customers.length} {customers.length === 1 ? "Customer" : "Customers"}
          </span>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Sidebar ──
            • Mobile  : full-width, shown only when no customer is selected
            • md+     : fixed-width column, always visible, scrolls independently
        */}
        <aside
          className={`
            flex-shrink-0 bg-white border-r border-gray-200 flex flex-col
            w-full md:w-72 lg:w-80
            ${selectedCustomer ? "hidden md:flex" : "flex"}
          `}
        >
          {/* Sidebar header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3 flex-shrink-0">
            <h2 className="text-white font-semibold text-sm sm:text-base">All Customers</h2>
          </div>

          {/* Scrollable list — fills remaining sidebar height */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5">
            {customers.length > 0 ? (
              customers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-150 flex items-center gap-3
                    ${
                      selectedCustomer?.id === customer.id
                        ? "bg-teal-50 border border-teal-400 shadow-sm"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                >
                  <img
                    src={customer.selfie || "/placeholder-profile.png"}
                    alt={`${customer.firstName} ${customer.lastName}`}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                    onError={(e) => { e.target.src = "/placeholder-profile.png"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${
                      selectedCustomer?.id === customer.id ? "text-teal-700" : "text-gray-900"
                    }`}>
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{customer.emailAddress}</p>
                  </div>
                  {selectedCustomer?.id === customer.id && (
                    <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <svg className="w-14 h-14 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-400 text-sm font-medium">No customers found</p>
                <p className="text-gray-300 text-xs mt-1">Customers will appear here</p>
              </div>
            )}
          </div>

          {/* Block button pinned to sidebar bottom */}
          {selectedCustomer && (
            <div className="flex-shrink-0 border-t border-gray-100 p-3">
              <button className="w-full bg-red-50 text-red-600 font-semibold py-2.5 px-4 rounded-lg hover:bg-red-100 transition-colors duration-200 flex items-center justify-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Block Account
              </button>
            </div>
          )}
        </aside>

        {/* ── Main Content ── scrolls independently on md+ */}
        <main
          className={`
            flex-1 min-w-0 overflow-y-auto
            ${!selectedCustomer ? "hidden md:block" : "block"}
          `}
        >
          {selectedCustomer ? (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">

              {/* Mobile back button */}
              <button
                className="md:hidden flex items-center gap-2 text-teal-600 font-semibold text-sm"
                onClick={() => setSelectedCustomer(null)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to list
              </button>

              {/* ── Profile Header ── */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-24 sm:h-28 lg:h-36"></div>
                <div className="px-4 sm:px-6 lg:px-8 pb-5 sm:pb-6 lg:pb-8">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-10 sm:-mt-12 lg:-mt-16 gap-3 sm:gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4">
                      <img
                        src={selectedCustomer.selfie || "/placeholder-profile.png"}
                        alt="Profile"
                        className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-xl object-cover border-4 border-white shadow-lg flex-shrink-0"
                        onError={(e) => { e.target.src = "/placeholder-profile.png"; }}
                      />
                      <div className="pb-1">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                          {[selectedCustomer.firstName, selectedCustomer.middleName, selectedCustomer.lastName]
                            .filter(Boolean)
                            .map((s) => s.trim())
                            .join(" ")}
                        </h2>
                        <p className="text-gray-500 text-sm mt-0.5">{selectedCustomer.emailAddress}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            selectedCustomer.isVerified
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}>
                            {selectedCustomer.isVerified ? "✓ Verified" : "⚠ Pending Verification"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="self-start sm:self-auto bg-gray-100 hover:bg-gray-200 p-2.5 rounded-lg transition-colors duration-200 flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Info Grid ── */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">

                <InfoCard
                  title="Personal Information"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                >
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
                    <Field label="First Name" value={selectedCustomer.firstName?.trim()} />
                    <Field label="Middle Name" value={selectedCustomer.middleName?.trim()} />
                    <Field label="Last Name" value={selectedCustomer.lastName?.trim()} />
                    <Field label="Email Address" value={selectedCustomer.emailAddress} className="break-all" />
                    <Field label="Phone Number" value={selectedCustomer.phoneNumber} />
                    <Field label="Birthday" value={formatDate(selectedCustomer.birthday)} />
                    <Field label="Gender" value={selectedCustomer.gender} />
                    <Field label="Member Since" value={formatDate(selectedCustomer.createdAt)} />
                  </div>
                </InfoCard>

                <InfoCard
                  title="Address"
                  icon={
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </>
                  }
                >
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
                    <Field label="House / Building" value={selectedCustomer.houseNumber} />
                    <Field label="Street" value={selectedCustomer.street?.trim()} />
                    <Field label="Barangay" value={selectedCustomer.barangay?.trim()} />
                    <Field label="Town" value={selectedCustomer.town} />
                    <Field label="Province" value={selectedCustomer.province?.trim()} />
                    <Field label="Country" value={selectedCustomer.country?.trim()} />
                    <Field label="Zip Code" value={selectedCustomer.zipCode} />
                  </div>
                </InfoCard>

                {/* ID Verification — full width */}
                <div className="xl:col-span-2">
                  <InfoCard
                    title="ID Verification"
                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />}
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Field label="ID Type" value={selectedCustomer.idType} />
                        <Field label="ID Number" value={selectedCustomer.idNumber} />
                      </div>
                      {(selectedCustomer.idPhoto || selectedCustomer.selfie) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          {selectedCustomer.idPhoto && (
                            <div>
                              <p className="font-medium text-gray-700 mb-2 flex items-center gap-2 text-sm">
                                <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                                ID Photo
                              </p>
                              <img
                                src={selectedCustomer.idPhoto}
                                alt="ID Document"
                                className="w-full h-44 sm:h-52 lg:h-64 object-cover border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            </div>
                          )}
                          {selectedCustomer.selfie && (
                            <div>
                              <p className="font-medium text-gray-700 mb-2 flex items-center gap-2 text-sm">
                                <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Selfie Photo
                              </p>
                              <img
                                src={selectedCustomer.selfie}
                                alt="Customer Selfie"
                                className="w-full h-44 sm:h-52 lg:h-64 object-cover border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </InfoCard>
                </div>
              </div>
            </div>
          ) : (
            /* Empty state — centered in the full available space */
            <div className="flex items-center justify-center w-full h-full min-h-[300px]">
              <div className="text-center px-6">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-1">No Customer Selected</h3>
                <p className="text-gray-400 text-sm">Select a customer from the sidebar to view their profile</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

/* ── Reusable sub-components ── */

const InfoCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 lg:p-7">
    <div className="flex items-center justify-between mb-4 sm:mb-5">
      <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 flex items-center gap-2">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
        {title}
      </h3>
      <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors duration-200 flex-shrink-0">
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>
    {children}
  </div>
);

const Field = ({ label, value, className = "" }) => (
  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-teal-500">
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className={`font-semibold text-sm text-gray-900 ${className}`}>
      {value || "N/A"}
    </p>
  </div>
);

export default Customers;