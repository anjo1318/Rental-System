import React, { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_APP_URL;

const ItemApproval = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/item`);
      const unverified = Array.isArray(response.data.data)
        ? response.data.data.filter((item) => !item.isVerified)
        : [];
      const normalized = unverified.map((item) => ({
        ...item,
        parsedImages: (() => {
          try {
            const raw = item.itemImages?.[0];
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return item.itemImages || [];
          }
        })(),
      }));
      setItems(normalized);
      setSelectedItem(normalized[0] || null);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const removeAndSelectNext = (removedId) => {
    setItems((prev) => {
      const updated = prev.filter((c) => c.id !== removedId);
      setSelectedItem(updated[0] || null);
      return updated;
    });
  };

  const handleApprove = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      const response = await axios.put(`${API}/api/item/approve/${selectedItem.id}`);
      if (response.data.success) {
        removeAndSelectNext(selectedItem.id);
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
    if (!selectedItem) return;
    if (!confirm("Are you sure you want to reject this item?")) return;
    setActionLoading(true);
    try {
      const response = await axios.put(`${API}/api/item/reject/${selectedItem.id}`);
      if (response.data.success) {
        removeAndSelectNext(selectedItem.id);
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

      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Item Approval Requests</h1>
            <p className="text-sm text-gray-500 mt-0.5">Review and approve pending item listings</p>
          </div>
          <span className="bg-orange-50 text-orange-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-orange-200">
            {items.length} Pending
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className={`flex-shrink-0 bg-white border-r border-gray-200 flex flex-col w-full md:w-72 lg:w-80 xl:w-96 ${selectedItem ? "hidden md:flex" : "flex"}`}>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4 flex-shrink-0">
            <h2 className="text-white font-semibold text-base">Pending Items</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {items.length > 0 ? (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-150 flex items-center gap-3 ${
                    selectedItem?.id === item.id
                      ? "bg-orange-50 border border-orange-400 shadow-sm"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.parsedImages?.[0] || "/placeholder-profile.png"}
                      alt={item.title}
                      className="w-10 h-10 rounded-lg object-cover border-2 border-gray-200"
                      onError={(e) => { e.target.src = "/placeholder-profile.png"; }}
                    />
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${selectedItem?.id === item.id ? "text-orange-700" : "text-gray-900"}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">₱{item.pricePerDay}/hr · {item.category}</p>
                  </div>
                  {selectedItem?.id === item.id && (
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
                <p className="text-gray-400 text-sm font-medium">No Pending Items</p>
                <p className="text-gray-300 text-xs mt-1">All items have been reviewed</p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto min-w-0">
          {selectedItem ? (
            <div className="p-6 space-y-5">

              {/* Mobile back button */}
              <button
                className="md:hidden flex items-center gap-2 text-orange-600 font-semibold text-sm mb-2"
                onClick={() => setSelectedItem(null)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to list
              </button>

              {/* Item Header Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-28 lg:h-36"></div>
                <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-14 lg:-mt-16 gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={selectedItem.parsedImages?.[0] || "/placeholder-profile.png"}
                          alt={selectedItem.title}
                          className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-xl object-cover border-4 border-white shadow-lg"
                          onError={(e) => { e.target.src = "/placeholder-profile.png"; }}
                        />
                        <span className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full border-4 border-white"></span>
                      </div>
                      <div className="pb-1">
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{selectedItem.title}</h2>
                        <p className="text-gray-500 text-sm mt-1">by {selectedItem.Owner?.firstName} {selectedItem.Owner?.lastName}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                            Pending Verification
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            Item
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Approve / Reject */}
                    <div className="flex gap-3 self-start sm:self-auto sm:mb-2 flex-shrink-0">
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className={`flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm text-sm ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {actionLoading ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={actionLoading}
                        className={`flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm text-sm ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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

              {/* Detail Cards */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                <InfoCard title="Item Information" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Title" value={selectedItem.title} />
                    <Field label="Brand" value={selectedItem.brand} />
                    <Field label="Category" value={selectedItem.category} />
                    <Field label="Location" value={selectedItem.location} />
                    <Field label="Price Per Hour" value={selectedItem.pricePerDay ? `₱${selectedItem.pricePerDay}` : null} />
                    <Field label="Quantity" value={selectedItem.quantity} />
                    <Field label="Listed On" value={formatDate(selectedItem.createdAt)} />
                    <Field label="Availability" value={selectedItem.availability ? "Available" : "Unavailable"} />
                  </div>
                </InfoCard>

                <InfoCard title="Owner Information" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First Name" value={selectedItem.Owner?.firstName} />
                    <Field label="Last Name" value={selectedItem.Owner?.lastName} />
                    <Field label="Email" value={selectedItem.Owner?.email} className="break-all" />
                  </div>
                  {selectedItem.Owner?.idPhoto && (
                    <div className="mt-4">
                      <p className="font-medium text-gray-700 mb-2 text-sm">Owner ID Photo</p>
                      <img
                        src={selectedItem.Owner.idPhoto}
                        alt="Owner ID"
                        className="w-full h-40 object-cover border-2 border-gray-200 rounded-lg shadow-sm"
                        onError={(e) => { e.target.src = "/placeholder-profile.png"; }}
                      />
                    </div>
                  )}
                </InfoCard>

                {selectedItem.specification && (
                  <InfoCard title="Specification" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{selectedItem.specification}</p>
                  </InfoCard>
                )}

                {selectedItem.description && (
                  <InfoCard title="Description" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />}>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{selectedItem.description}</p>
                  </InfoCard>
                )}

                {selectedItem.parsedImages?.length > 0 && (
                  <div className="xl:col-span-2">
                    <InfoCard title="Item Images" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {selectedItem.parsedImages.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Item image ${i + 1}`}
                            className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                            onError={(e) => { e.target.src = "/placeholder-profile.png"; }}
                          />
                        ))}
                      </div>
                    </InfoCard>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-20 h-20 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No Pending Approvals</h3>
                <p className="text-gray-400 text-sm">All items have been reviewed</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const InfoCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 lg:p-7">
    <h3 className="text-base lg:text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
      <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icon}
      </svg>
      {title}
    </h3>
    {children}
  </div>
);

const Field = ({ label, value, className = "" }) => (
  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-orange-500">
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className={`font-semibold text-sm text-gray-900 ${className}`}>{value || "N/A"}</p>
  </div>
);

export default ItemApproval;