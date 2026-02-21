import React, { useEffect, useState } from "react";
import axios from "axios";

const Approvals = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("customers");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_APP_URL}/api/customer`);
      const unverified = Array.isArray(response.data.data)
        ? response.data.data.filter((c) => !c.isVerified)
        : [];
      const normalized = unverified.map((c) => ({
        ...c,
        _type: "customer",
        displayEmail: c.emailAddress,
        displayPhone: c.phoneNumber,
      }));
      setCustomers(normalized);
      setSelectedCustomer(normalized[0] || null);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_APP_URL}/api/owner/all`);
      const unverified = Array.isArray(response.data.data)
        ? response.data.data.filter((c) => !c.isVerified)
        : [];
      const normalized = unverified.map((c) => ({
        ...c,
        _type: "owner",
        displayEmail: c.email,
        displayPhone: c.phone,
      }));
      setCustomers(normalized);
      setSelectedCustomer(normalized[0] || null);
    } catch (error) {
      console.error("Error fetching owners:", error);
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

  const removeAndSelectNext = (removedId) => {
    setCustomers((prev) => {
      const updated = prev.filter((c) => c.id !== removedId);
      setSelectedCustomer(updated[0] || null);
      return updated;
    });
  };

  const handleApprove = async () => {
    if (!selectedCustomer) return;
    setActionLoading(true);
    try {
      const endpoint = selectedCustomer._type === "owner"
        ? `${import.meta.env.VITE_APP_URL}/api/admin/approve/owner`
        : `${import.meta.env.VITE_APP_URL}/api/admin/approve/customer`;

      const response = await axios.put(endpoint, { id: selectedCustomer.id });
      if (response.data.success) {
        alert(`${selectedCustomer._type === "owner" ? "Owner" : "Customer"} approved successfully!`);
        removeAndSelectNext(selectedCustomer.id);
      } else {
        alert("Failed to approve: " + response.data.message);
      }
    } catch (error) {
      alert("Error approving: " + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCustomer) return;
    if (!confirm("Are you sure you want to reject this account?")) return;
    setActionLoading(true);
    try {
      const endpoint = selectedCustomer._type === "owner"
        ? `${import.meta.env.VITE_APP_URL}/api/admin/reject/owner`
        : `${import.meta.env.VITE_APP_URL}/api/admin/reject/customer`;

      const response = await axios.put(endpoint, { id: selectedCustomer.id });
      if (response.data.success) {
        alert("Account rejected successfully!");
        removeAndSelectNext(selectedCustomer.id);
      } else {
        alert("Failed to reject: " + response.data.message);
      }
    } catch (error) {
      alert("Error rejecting: " + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading approval requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50" style={{ height: "100vh", overflow: "hidden" }}>

      {/* ── Top Header Bar ── */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Approval Requests</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Review and approve pending registrations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-orange-50 text-orange-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-orange-200">
              {customers.length} Pending
            </span>
            {/* Tab switcher */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => { setActiveTab("customers"); fetchCustomers(); }}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "customers"
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Customers
              </button>
              <button
                onClick={() => { setActiveTab("owners"); fetchOwners(); }}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "owners"
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Owners
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Body: Sidebar + Main ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside
          className={`
            flex-shrink-0 bg-white border-r border-gray-200 flex flex-col
            w-full md:w-72 lg:w-80 xl:w-96
            ${selectedCustomer ? "hidden md:flex" : "flex"}
          `}
        >
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4 flex-shrink-0">
            <h2 className="text-white font-semibold text-base">
              Pending {activeTab === "owners" ? "Owners" : "Customers"}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {customers.length > 0 ? (
              customers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-150 flex items-center gap-3
                    ${
                      selectedCustomer?.id === customer.id
                        ? "bg-orange-50 border border-orange-400 shadow-sm"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={customer.selfie || "/placeholder-profile.png"}
                      alt={`${customer.firstName} ${customer.lastName}`}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => { e.target.src = "/placeholder-profile.png"; }}
                    />
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${
                      selectedCustomer?.id === customer.id ? "text-orange-700" : "text-gray-900"
                    }`}>
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{customer.displayEmail}</p>
                  </div>
                  {selectedCustomer?.id === customer.id && (
                    <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <svg className="w-14 h-14 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400 text-sm font-medium">No Pending Approvals</p>
                <p className="text-gray-300 text-xs mt-1">All have been verified</p>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto min-w-0">
          {selectedCustomer ? (
            <div className="p-6 space-y-5">

              {/* Mobile back button */}
              <button
                className="md:hidden flex items-center gap-2 text-orange-600 font-semibold text-sm mb-2"
                onClick={() => setSelectedCustomer(null)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to list
              </button>

              {/* ── Profile Header ── */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-28 lg:h-36"></div>
                <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-14 lg:-mt-16 gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={selectedCustomer.selfie || "/placeholder-profile.png"}
                          alt="Profile"
                          className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-xl object-cover border-4 border-white shadow-lg"
                          onError={(e) => { e.target.src = "/placeholder-profile.png"; }}
                        />
                        <span className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full border-4 border-white"></span>
                      </div>
                      <div className="pb-1">
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                          {[selectedCustomer.firstName, selectedCustomer.middleName, selectedCustomer.lastName]
                            .filter(Boolean).map((s) => s.trim()).join(" ")}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">{selectedCustomer.displayEmail}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                            ⏳ Pending Verification
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
                            {selectedCustomer._type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Approve / Reject buttons */}
                    <div className="flex gap-3 self-start sm:self-auto sm:mb-2 flex-shrink-0">
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className={`flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200 shadow-sm text-sm ${
                          actionLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {actionLoading ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={actionLoading}
                        className={`flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200 shadow-sm text-sm ${
                          actionLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {actionLoading ? "Processing..." : "Reject"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Info Grid ── */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                {/* Personal Information */}
                <InfoCard
                  title="Personal Information"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First Name" value={selectedCustomer.firstName?.trim()} />
                    <Field label="Middle Name" value={selectedCustomer.middleName?.trim()} />
                    <Field label="Last Name" value={selectedCustomer.lastName?.trim()} />
                    <Field label="Email Address" value={selectedCustomer.displayEmail} className="break-all" />
                    <Field label="Phone Number" value={selectedCustomer.displayPhone} />
                    <Field label="Birthday" value={formatDate(selectedCustomer.birthday)} />
                    <Field label="Gender" value={selectedCustomer.gender} />
                    <Field label="Registered On" value={formatDate(selectedCustomer.createdAt)} />
                  </div>
                </InfoCard>

                {/* Address */}
                <InfoCard
                  title="Address"
                  icon={
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </>
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="House / Building" value={selectedCustomer.houseNumber} />
                    <Field label="Street" value={selectedCustomer.street?.trim()} />
                    <Field label="Barangay" value={selectedCustomer.barangay?.trim()} />
                    <Field label="Town" value={selectedCustomer.town} />
                    <Field label="Province" value={selectedCustomer.province?.trim()} />
                    <Field label="Country" value={selectedCustomer.country?.trim()} />
                    <Field label="Zip Code" value={selectedCustomer.zipCode} />
                  </div>
                </InfoCard>

                {/* ID Verification — spans full width */}
                <div className="xl:col-span-2">
                  <InfoCard
                    title="ID Verification"
                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />}
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Field label="ID Type" value={selectedCustomer.idType} />
                        <Field label="ID Number" value={selectedCustomer.idNumber} />
                      </div>
                      {(selectedCustomer.idPhoto || selectedCustomer.selfie) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          {selectedCustomer.idPhoto && (
                            <div>
                              <p className="font-medium text-gray-700 mb-2 text-sm">ID Photo</p>
                              <img
                                src={selectedCustomer.idPhoto}
                                alt="ID Document"
                                className="w-full h-48 lg:h-64 object-cover border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder-profile.png"; }}
                              />
                            </div>
                          )}
                          {selectedCustomer.selfie && (
                            <div>
                              <p className="font-medium text-gray-700 mb-2 text-sm">Selfie Photo</p>
                              <img
                                src={selectedCustomer.selfie}
                                alt="Customer Selfie"
                                className="w-full h-48 lg:h-64 object-cover border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder-profile.png"; }}
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
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-20 h-20 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No Pending Approvals</h3>
                <p className="text-gray-400 text-sm">All registrations have been reviewed</p>
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
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 lg:p-7">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-base lg:text-lg font-bold text-gray-900 flex items-center gap-2">
        <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const Field = ({ label, value, className = "" }) => (
  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-orange-500">
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className={`font-semibold text-sm text-gray-900 ${className}`}>
      {value || "N/A"}
    </p>
  </div>
);

export default Approvals;