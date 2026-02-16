import React, { useEffect, useState } from "react";
import axios from "axios";

const Approvals = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/api/customer`
      );

      // Filter out verified customers so only pending ones show
      const unverifiedCustomers = Array.isArray(response.data.data)
        ? response.data.data.filter((c) => !c.isVerified)
        : [];

      setCustomers(unverifiedCustomers);
      setSelectedCustomer(unverifiedCustomers[0] || null);
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

  const handleApprove = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer first");
      return;
    }

    setActionLoading(true);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_URL}/api/admin/approve/customer`,
        { id: selectedCustomer.id }
      );

      if (response.data.success) {
        alert("Customer approved successfully!");
        // Remove approved customer from the list
        setCustomers((prev) =>
          prev.filter((customer) => customer.id !== selectedCustomer.id)
        );
        setSelectedCustomer(customers.find(c => c.id !== selectedCustomer.id) || null);
      } else {
        alert("Failed to approve customer: " + response.data.message);
      }
    } catch (error) {
      console.error("Error approving customer:", error);
      alert(
        "Error approving customer: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer first");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to reject this customer? This action will deactivate their account."
      )
    ) {
      return;
    }

    setActionLoading(true);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_URL}/api/admin/reject/customer`,
        { id: selectedCustomer.id }
      );

      if (response.data.success) {
        alert("Customer rejected successfully!");
        // Remove rejected customer from the list
        setCustomers((prev) =>
          prev.filter((customer) => customer.id !== selectedCustomer.id)
        );
        setSelectedCustomer(customers.find(c => c.id !== selectedCustomer.id) || null);
      } else {
        alert("Failed to reject customer: " + response.data.message);
      }
    } catch (error) {
      console.error("Error rejecting customer:", error);
      alert(
        "Error rejecting customer: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading approval requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Approval Requests</h1>
          <p className="text-gray-600 mt-2">Review and approve pending customer registrations</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Sidebar Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <h2 className="text-white font-semibold text-lg">
                  Pending Approvals ({customers.length})
                </h2>
              </div>

              {/* Customers List */}
              <div className="p-4">
                <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <div
                        key={customer.id}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedCustomer?.id === customer.id
                            ? "bg-orange-50 border-2 border-orange-500 shadow-sm"
                            : "hover:bg-gray-50 border-2 border-transparent"
                        }`}
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={customer.selfie || "/placeholder-profile.png"}
                              alt={`${customer.firstName} ${customer.lastName}`}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                e.target.src = "/placeholder-profile.png";
                              }}
                            />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold truncate ${
                              selectedCustomer?.id === customer.id
                                ? "text-orange-700"
                                : "text-gray-900"
                            }`}>
                              {customer.firstName} {customer.lastName}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {customer.emailAddress}
                            </p>
                          </div>
                          {selectedCustomer?.id === customer.id && (
                            <svg className="w-5 h-5 text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-500 font-medium">No Pending Approvals</p>
                      <p className="text-gray-400 text-sm mt-1">All customers have been verified</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Profile Content */}
          <div className="flex-1 space-y-6">
            {selectedCustomer ? (
              <>
                {/* Profile Header Card with Action Buttons */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-32"></div>
                  <div className="px-8 pb-8">
                    <div className="flex items-end justify-between -mt-16">
                      <div className="flex items-end gap-6">
                        <div className="relative">
                          <img
                            src={selectedCustomer.selfie || "/placeholder-profile.png"}
                            alt="Profile"
                            className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-lg"
                            onError={(e) => {
                              e.target.src = "/placeholder-profile.png";
                            }}
                          />
                          <span className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full border-4 border-white"></span>
                        </div>
                        <div className="pb-2">
                          <h2 className="text-2xl font-bold text-gray-900">
                            {selectedCustomer.firstName?.trim()} {selectedCustomer.middleName?.trim()} {selectedCustomer.lastName?.trim()}
                          </h2>
                          <p className="text-gray-600 mt-1">
                            {selectedCustomer.emailAddress}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                              ⏳ Pending Verification
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 mb-2">
                        <button
                          className={`flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-sm ${
                            actionLoading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          onClick={handleApprove}
                          disabled={actionLoading}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {actionLoading ? "Processing..." : "Approve"}
                        </button>
                        <button
                          className={`flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-sm ${
                            actionLoading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          onClick={handleReject}
                          disabled={actionLoading}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {actionLoading ? "Processing..." : "Reject"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-500 mb-1">First Name</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.firstName?.trim() || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-500 mb-1">Middle Name</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.middleName?.trim() || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-500 mb-1">Last Name</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.lastName?.trim() || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-500 mb-1">Email Address</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.emailAddress || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.phoneNumber || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-500 mb-1">Birthday</p>
                      <p className="font-semibold text-gray-900">{formatDate(selectedCustomer.birthday)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-500 mb-1">Gender</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.gender || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-500 mb-1">Registered On</p>
                      <p className="font-semibold text-gray-900">{formatDate(selectedCustomer.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Address Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Address
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-500 mb-1">House/Building</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.houseNumber || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-500 mb-1">Street</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.street?.trim() || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-500 mb-1">Barangay</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.barangay?.trim() || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-500 mb-1">Town</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.town || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-500 mb-1">Province</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.province?.trim() || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-500 mb-1">Country</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.country?.trim() || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-500 mb-1">Zip Code</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.zipCode || "N/A"}</p>
                    </div>
                  </div>
                </div>


                {/* ID Verification Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      ID Verification
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                        <p className="text-sm text-gray-500 mb-1">ID Type</p>
                        <p className="font-semibold text-gray-900">{selectedCustomer.idType || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                        <p className="text-sm text-gray-500 mb-1">ID Number</p>
                        <p className="font-semibold text-gray-900">{selectedCustomer.idNumber || "N/A"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedCustomer.idPhoto && (
                        <div>
                          <p className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                            ID Photo
                          </p>
                          <img
                            src={selectedCustomer.idPhoto}
                            alt="ID Document"
                            className="w-full h-64 object-cover border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      {selectedCustomer.selfie && (
                        <div>
                          <p className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Selfie Photo
                          </p>
                          <img
                            src={selectedCustomer.selfie}
                            alt="Customer Selfie"
                            className="w-full h-64 object-cover border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Approvals</h3>
                  <p className="text-gray-500">All customer registrations have been reviewed</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Approvals;