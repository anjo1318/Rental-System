import React, { useEffect, useState } from "react";
import axios from "axios";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    console.log("Customer tab to");
    fetchCustomers();
  }, []); 

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/api/customer`
      );
      if (Array.isArray(response.data.data)) {
        setCustomers(response.data.data);
        setSelectedCustomer(response.data.data[0] || null);
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
    });
  };

  // Helper function to create full image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${import.meta.env.VITE_APP_URL}/${imagePath}`;
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
                    src={selectedCustomer.selfie || "/placeholder-profile.png"}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      e.target.src = "/placeholder-profile.png";
                    }}
                  />
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedCustomer.firstName?.trim()} {selectedCustomer.middleName?.trim()} {selectedCustomer.lastName?.trim()}
                    </h2>
                    <p className="text-gray-500">
                      {selectedCustomer.emailAddress}
                    </p>
                    <p className="text-sm text-gray-400">
                      Status: {selectedCustomer.isVerified ? 
                        <span className="text-green-600 font-medium">Verified</span> : 
                        <span className="text-orange-600 font-medium">Pending Verification</span>
                      }
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
                    <span className="font-medium">House/Building:</span>{" "}
                    {selectedCustomer.houseNumber || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Street:</span>{" "}
                    {selectedCustomer.street?.trim() || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Barangay:</span>{" "}
                    {selectedCustomer.barangay?.trim() || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Town:</span>{" "}
                    {selectedCustomer.town || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Province:</span>{" "}
                    {selectedCustomer.province?.trim() || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Country:</span>{" "}
                    {selectedCustomer.country?.trim() || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Zip Code:</span>{" "}
                    {selectedCustomer.zipCode || "N/A"}
                  </p>
                </div>
              </div>

              {/* Guarantors Information */}
              <div className="bg-white rounded-xl shadow p-6 w-[213%]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Guarantors Information</h3>
                  <button className="p-2 rounded-full border hover:bg-gray-100">
                    ✏️
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Guarantor 1</h4>
                    <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {selectedCustomer.guarantor1FullName?.trim() || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Mobile:</span>{" "}
                        {selectedCustomer.guarantor1MobileNumber || "N/A"}
                      </p>
                      <p className="col-span-2">
                        <span className="font-medium">Address:</span>{" "}
                        {selectedCustomer.guarantor1Address?.trim() || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Guarantor 2</h4>
                    <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {selectedCustomer.guarantor2FullName?.trim() || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Mobile:</span>{" "}
                        {selectedCustomer.guarantor2MobileNumber || "N/A"}
                      </p>
                      <p className="col-span-2">
                        <span className="font-medium">Address:</span>{" "}
                        {selectedCustomer.guarantor2Address?.trim() || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ID Verification */}
              <div className="bg-white rounded-xl shadow p-6 w-[213%]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">ID Verification</h3>
                  <button className="p-2 rounded-full border hover:bg-gray-100">
                    ✏️
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-gray-700">
                    <p>
                      <span className="font-medium">ID Type:</span>{" "}
                      {selectedCustomer.idType || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">ID Number:</span>{" "}
                      {selectedCustomer.idNumber || "N/A"}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    {selectedCustomer.idPhoto && (
                      <div className="flex-1">
                        <p className="font-medium text-gray-700 mb-2">ID Photo:</p>
                        <img
                          src={selectedCustomer.idPhoto}
                          alt="ID Document"
                          className="w-full max-w-xs h-48 object-cover border rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    {selectedCustomer.selfie && (
                      <div className="flex-1">
                        <p className="font-medium text-gray-700 mb-2">Selfie:</p>
                        <img
                          src={selectedCustomer.selfie}
                          alt="Customer Selfie"
                          className="w-full max-w-xs h-48 object-cover border rounded-lg"
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
            <p className="text-gray-500">Select a customer to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;