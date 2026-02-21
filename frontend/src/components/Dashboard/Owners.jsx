import React, { useEffect, useState } from "react";
import axios from "axios";

const Owners = () => {
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/api/owner/all`
      );
      if (response.data.success && Array.isArray(response.data.data)) {
        setOwners(response.data.data);
        setSelectedOwner(response.data.data[0] || null);
      }
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

  const formatAddress = (owner) => {
    const parts = [
      owner.houseNumber,
      owner.street,
      owner.barangay,
      owner.town,
      owner.province,
      owner.country,
      owner.zipCode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading owners...</p>
        </div>
      </div>
    );
  }

  return (
    /* Full viewport height, full width — no artificial max-width cap */
    <div className="flex flex-col w-full h-screen overflow-hidden bg-gray-50">

      {/* ── Top Header Bar ── */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Owner Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage and view owner profiles</p>
          </div>
          <span className="bg-teal-50 text-teal-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-teal-200">
            {owners.length} {owners.length === 1 ? "Owner" : "Owners"}
          </span>
        </div>
      </header>

      {/* ── Body: Sidebar + Main — fills remaining height ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        {/* Fixed width on md+; full-width collapsible on mobile (hidden when owner selected) */}
        <aside
          className={`
            flex-shrink-0 bg-white border-r border-gray-200 flex flex-col
            w-full md:w-72 lg:w-80 xl:w-96
            ${selectedOwner ? "hidden md:flex" : "flex"}
          `}
        >
          {/* Sidebar gradient header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-4 flex-shrink-0">
            <h2 className="text-white font-semibold text-base">All Owners</h2>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {owners.length > 0 ? (
              owners.map((owner) => (
                <button
                  key={owner.id}
                  onClick={() => setSelectedOwner(owner)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-150 flex items-center gap-3 group
                    ${
                      selectedOwner?.id === owner.id
                        ? "bg-teal-50 border border-teal-400 shadow-sm"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                >
                  <img
                    src={owner.profileImage || owner.selfie || "/placeholder-profile.png"}
                    alt={`${owner.firstName} ${owner.lastName}`}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${
                      selectedOwner?.id === owner.id ? "text-teal-700" : "text-gray-900"
                    }`}>
                      {owner.firstName}{owner.middleName ? ` ${owner.middleName}` : ""} {owner.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{owner.email}</p>
                  </div>
                  {selectedOwner?.id === owner.id && (
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
                <p className="text-gray-400 text-sm font-medium">No owners found</p>
              </div>
            )}
          </div>

          {/* Block button */}
          {selectedOwner && (
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

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto">
          {selectedOwner ? (
            <div className="p-6 space-y-5 h-full">

              {/* Mobile back button */}
              <button
                className="md:hidden flex items-center gap-2 text-teal-600 font-semibold text-sm mb-2"
                onClick={() => setSelectedOwner(null)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to list
              </button>

              {/* ── Profile Header ── */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-28 lg:h-36"></div>
                <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-14 lg:-mt-16 gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                      <img
                        src={selectedOwner.profileImage || selectedOwner.selfie || "/placeholder-profile.png"}
                        alt="Profile"
                        className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-xl object-cover border-4 border-white shadow-lg flex-shrink-0"
                      />
                      <div className="pb-1">
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                          {selectedOwner.firstName}{selectedOwner.middleName ? ` ${selectedOwner.middleName}` : ""} {selectedOwner.lastName}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">{selectedOwner.bio || "No bio available."}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            selectedOwner.isVerified
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {selectedOwner.isVerified ? "✓ Verified" : "⚠ Not Verified"}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            selectedOwner.isActive
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {selectedOwner.isActive ? "● Active" : "○ Inactive"}
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

              {/* ── Info Grid: 2 columns on xl+ for denser use of space ── */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                {/* Personal Information */}
                <InfoCard
                  title="Personal Information"
                  icon={
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First Name" value={selectedOwner.firstName} />
                    <Field label="Middle Name" value={selectedOwner.middleName} />
                    <Field label="Last Name" value={selectedOwner.lastName} />
                    <Field label="Email Address" value={selectedOwner.email} className="break-all" />
                    <Field label="Phone Number" value={selectedOwner.phone} />
                    <Field label="Birthday" value={formatDate(selectedOwner.birthday)} />
                    <Field label="Gender" value={selectedOwner.gender} className="capitalize" />
                    <Field label="GCash QR" value={selectedOwner.gcashQR} />
                    <div className="sm:col-span-2">
                      <Field label="Bio" value={selectedOwner.bio} />
                    </div>
                  </div>
                </InfoCard>

                {/* Address Information */}
                <InfoCard
                  title="Address Information"
                  icon={
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </>
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Field label="Full Address" value={formatAddress(selectedOwner)} />
                    </div>
                    <Field label="House Number" value={selectedOwner.houseNumber} />
                    <Field label="Street" value={selectedOwner.street} />
                    <Field label="Barangay" value={selectedOwner.barangay} />
                    <Field label="Town / City" value={selectedOwner.town} />
                    <Field label="Province" value={selectedOwner.province} />
                    <Field label="Country" value={selectedOwner.country} />
                    <Field label="Zip Code" value={selectedOwner.zipCode} />
                  </div>
                </InfoCard>

                {/* Identification & Verification — spans full width */}
                <div className="xl:col-span-2">
                  <InfoCard
                    title="Identification & Verification"
                    icon={
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    }
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      <Field label="ID Type" value={selectedOwner.idType} />
                      <Field label="ID Number" value={selectedOwner.idNumber} />
                      <Field
                        label="Verification Status"
                        value={selectedOwner.isVerified ? "✓ Verified" : "✗ Not Verified"}
                      />
                      <Field
                        label="Account Status"
                        value={selectedOwner.isActive ? "● Active" : "○ Inactive"}
                      />
                      {selectedOwner.idPhoto && (
                        <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-teal-500">
                          <p className="text-xs text-gray-500 mb-2">ID Photo</p>
                          <img
                            src={selectedOwner.idPhoto}
                            alt="ID"
                            className="w-full h-28 object-cover rounded border border-gray-200"
                          />
                        </div>
                      )}
                      {selectedOwner.selfie && (
                        <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-teal-500">
                          <p className="text-xs text-gray-500 mb-2">Selfie Verification</p>
                          <img
                            src={selectedOwner.selfie}
                            alt="Selfie"
                            className="w-full h-28 object-cover rounded border border-gray-200"
                          />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No Owner Selected</h3>
                <p className="text-gray-400 text-sm">Select an owner from the sidebar to view their profile</p>
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
        <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
        {title}
      </h3>
      <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors duration-200">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default Owners;