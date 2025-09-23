import React, { useEffect, useState } from "react";
import axios from "axios";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []); //effect

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/api/customer`
      );
      if (Array.isArray(response.data.message)) {
        setCustomers(response.data.message);
        setSelectedCustomer(response.data.message[0] || null);
      }
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full h-screen p-6 overflow-visible pt-14">
      <h1 className="text-2xl font-bold mb-6">Customers Profile</h1>

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
                  <button className="text-gray-500 hover:text-black">⋮</button>
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No customers found.</p>
            )}
          </ul>
          {selectedCustomer && (
            <button className="mt-6 text-red-600 font-semibold">
              Block Account
            </button>
          )}
        </div>

        {/* Main Profile Content */}
        <div className="flex-1 space-y-6">
          {selectedCustomer ? (
            <>
              {/* Profile */}
              <div className="bg-white rounded-xl shadow p-6 flex justify-between items-center w-[213%]">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      selectedCustomer.profileImage ||
                      "/placeholder-profile.png"
                    }
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </h2>
                    <p className="text-gray-500">
                      {selectedCustomer.bio || "No bio available."}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-full border hover:bg-gray-100">
                  ✏️
                </button>
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow p-6 w-[213%]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Personal Information</h3>
                  <button className="p-2 rounded-full border hover:bg-gray-100">
                    ✏️
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <p>
                    <span className="font-medium">First Name:</span>{" "}
                    {selectedCustomer.firstName || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Last Name:</span>{" "}
                    {selectedCustomer.lastName || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedCustomer.email || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedCustomer.phone || "N/A"}
                  </p>
                  <p className="col-span-2">
                    <span className="font-medium">Bio:</span>{" "}
                    {selectedCustomer.bio || "N/A"}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-xl shadow p-6 w-[213%]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Address</h3>
                  <button className="p-2 rounded-full border hover:bg-gray-100">
                    ✏️
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-gray-700">
                  <p>
                    <span className="font-medium">Country:</span>{" "}
                    {selectedCustomer.country || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">City / State:</span>{" "}
                    {selectedCustomer.city || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Postal Code:</span>{" "}
                    {selectedCustomer.postalCode || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Tax ID:</span>{" "}
                    {selectedCustomer.taxId || "N/A"}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Select a customer to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;
