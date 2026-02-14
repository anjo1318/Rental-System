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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${import.meta.env.VITE_APP_URL}/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-2">Manage and view customer profiles</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Sidebar Header */}
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
                <h2 className="text-white font-semibold text-lg">
                  Customers ({customers.length})
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
                            ? "bg-teal-50 border-2 border-teal-500 shadow-sm"
                            : "hover:bg-gray-50 border-2 border-transparent"
                        }`}
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={customer.selfie || "/placeholder-profile.png"}
                            alt={`${customer.firstName} ${customer.lastName}`}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.target.src = "/placeholder-profile.png";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold truncate ${
                              selectedCustomer?.id === customer.id
                                ? "text-teal-700"
                                : "text-gray-900"
                            }`}>
                              {customer.firstName} {customer.lastName}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {customer.emailAddress}
                            </p>
                          </div>
                          {selectedCustomer?.id === customer.id && (
                            <svg className="w-5 h-5 text-teal-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-gray-500 font-medium">No customers found</p>
                      <p className="text-gray-400 text-sm mt-1">Customers will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Block Account Button */}
              {selectedCustomer && (
                <div className="border-t border-gray-200 p-4">
                  <button className="w-full bg-red-50 text-red-600 font-semibold py-3 px-4 rounded-lg hover:bg-red-100 transition-colors duration-200 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Block Account
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Profile Content */}
          <div className="flex-1 space-y-6">
            {selectedCustomer ? (
              <>
                {/* Profile Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-32"></div>
                  <div className="px-8 pb-8">
                    <div className="flex items-end justify-between -mt-16">
                      <div className="flex items-end gap-6">
                        <img
                          src={selectedCustomer.selfie || "/placeholder-profile.png"}
                          alt="Profile"
                          className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-lg"
                          onError={(e) => {
                            e.target.src = "/placeholder-profile.png";
                          }}
                        />
                        <div className="pb-2">
                          <h2 className="text-2xl font-bold text-gray-900">
                            {selectedCustomer.firstName?.trim()} {selectedCustomer.middleName?.trim()} {selectedCustomer.lastName?.trim()}
                          </h2>
                          <p className="text-gray-600 mt-1">
                            {selectedCustomer.emailAddress}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
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
                      <button className="bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition-colors duration-200 mb-2">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Personal Information Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Information
                    </h3>
                    <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors duration-200">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">First Name</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.firstName?.trim() || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Middle Name</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.middleName?.trim() || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Last Name</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.lastName?.trim() || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Email Address</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.emailAddress || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.phoneNumber || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Birthday</p>
                      <p className="font-semibold text-gray-900">{formatDate(selectedCustomer.birthday)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Gender</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.gender || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Member Since</p>
                      <p className="font-semibold text-gray-900">{formatDate(selectedCustomer.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Address Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Address
                    </h3>
                    <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors duration-200">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">House/Building</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.houseNumber || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Street</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.street?.trim() || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Barangay</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.barangay?.trim() || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Town</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.town || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Province</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.province?.trim() || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Country</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.country?.trim() || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Zip Code</p>
                      <p className="font-semibold text-gray-900">{selectedCustomer.zipCode || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Guarantors Information Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Guarantors Information
                    </h3>
                    <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors duration-200">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-6">
                    {/* Guarantor 1 */}
                    <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-6 rounded-lg border border-teal-100">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                        Guarantor 1
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Full Name</p>
                          <p className="font-semibold text-gray-900">{selectedCustomer.guarantor1FullName?.trim() || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Mobile Number</p>
                          <p className="font-semibold text-gray-900">{selectedCustomer.guarantor1MobileNumber || "N/A"}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500 mb-1">Address</p>
                          <p className="font-semibold text-gray-900">{selectedCustomer.guarantor1Address?.trim() || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Guarantor 2 */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                        Guarantor 2
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Full Name</p>
                          <p className="font-semibold text-gray-900">{selectedCustomer.guarantor2FullName?.trim() || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Mobile Number</p>
                          <p className="font-semibold text-gray-900">{selectedCustomer.guarantor2MobileNumber || "N/A"}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500 mb-1">Address</p>
                          <p className="font-semibold text-gray-900">{selectedCustomer.guarantor2Address?.trim() || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ID Verification Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      ID Verification
                    </h3>
                    <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors duration-200">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">ID Type</p>
                        <p className="font-semibold text-gray-900">{selectedCustomer.idType || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">ID Number</p>
                        <p className="font-semibold text-gray-900">{selectedCustomer.idNumber || "N/A"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedCustomer.idPhoto && (
                        <div>
                          <p className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Customer Selected</h3>
                  <p className="text-gray-500">Select a customer from the sidebar to view their profile details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;