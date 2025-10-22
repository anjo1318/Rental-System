import React, { useEffect, useState } from "react";
import axios from "axios";

const Approvals = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    console.log("Approvals.jsx loaded");
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/api/customer`
      );

      console.log("API response:", response.data);

      // Filter out verified customers so only pending ones show
      const unverifiedCustomers = Array.isArray(response.data.data)
        ? response.data.data.filter((c) => !c.isVerified)
        : [];

      setCustomers(unverifiedCustomers);
      setSelectedCustomer(unverifiedCustomers[0] || null);
    } catch (error) {
      console.error("Error fetching customers:", error);
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

    console.log("Handle Approve for customer ID:", selectedCustomer.id);
    setLoading(true);

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
        setSelectedCustomer(null);
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
      setLoading(false);
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

    console.log("Handle Reject for customer ID:", selectedCustomer.id);
    setLoading(true);

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
        setSelectedCustomer(null);
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
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
      <h1 className="text-2xl font-bold mb-6">Approval Request</h1>

      <div className="flex w-full gap-6">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-lg shadow p-4">
          <ul className="space-y-2">
            {customers.length > 0 ? (
              customers.map((customer) => (
                <li
                  key={customer.id}
                  className={`p-2 rounded-lg cursor-pointer flex justify-between items-center ${
                    selectedCustomer?.id === customer.id
                      ? "bg-teal-100 font-semibold"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <span>
                    {customer.firstName} {customer.lastName}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <button className="text-gray-500 hover:text-black">⋮</button>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No pending approvals.</p>
            )}
          </ul>
        </div>

        {/* Main Profile Content */}
        <div className="flex-1 space-y-6">
          {selectedCustomer ? (
            <>
              {/* Profile */}
              <div className="bg-white rounded-xl shadow p-6 flex justify-between items-center w-[213%]">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedCustomer.selfie || "/placeholder-profile.png"}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      e.target.src = "/placeholder-profile.png";
                    }}
                  />
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedCustomer.firstName?.trim()}{" "}
                      {selectedCustomer.middleName?.trim()}{" "}
                      {selectedCustomer.lastName?.trim()}
                    </h2>
                    <p className="text-gray-500">
                      {selectedCustomer.emailAddress}
                    </p>
                    <p className="text-sm text-gray-400">
                      Status:{" "}
                      <span className="text-orange-600 font-medium">
                        Pending Verification
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`px-4 py-2 rounded-lg border transition-colors bg-green-500 hover:bg-green-600 text-white ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={handleApprove}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Approve"}
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg border transition-colors bg-red-500 hover:bg-red-600 text-white ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={handleReject}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Reject"}
                  </button>
                </div>
              </div>

              {/* Personal Information, Address, Guarantors, ID */}
              {/* (kept unchanged, still displays selected unverified customer's info) */}

              {/* Personal Info */}
              <div className="bg-white rounded-xl shadow p-6 w-[213%]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Personal Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <p>
                    <span className="font-medium">First Name:</span>{" "}
                    {selectedCustomer.firstName?.trim() || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Middle Name:</span>{" "}
                    {selectedCustomer.middleName?.trim() || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Last Name:</span>{" "}
                    {selectedCustomer.lastName?.trim() || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedCustomer.emailAddress || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedCustomer.phoneNumber || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Birthday:</span>{" "}
                    {formatDate(selectedCustomer.birthday)}
                  </p>
                  <p>
                    <span className="font-medium">Gender:</span>{" "}
                    {selectedCustomer.gender || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Member Since:</span>{" "}
                    {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Select a pending customer to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Approvals;
