import React, { useEffect, useState } from "react";
import axios from "axios";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
       `${import.meta.env.VITE_APP_URL}/api/customer`
      );
      setCustomers(response.data.message); // ✅ API returns "message" array
      setSelectedCustomer(response.data.message[0]); // select first customer by default
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full p-6 pl-64 overflow-hidden">
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6">Customers Profile</h1>

      <div className="flex w-full">
        {/* Sidebar */}
        <div className="w-1/4 bg-white rounded-lg shadow p-4">
          <ul className="space-y-2">
            {customers.map((customer) => (
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
                {/* More options (block/delete) */}
                <button className="text-gray-500 hover:text-black">⋮</button>
              </li>
            ))}
          </ul>
          {selectedCustomer && (
            <button className="mt-6 text-red-600 font-semibold">
              Block Account
            </button>
          )}
        </div>

        {/* Main Profile Content */}
        <div className="flex-1 ml-6 space-y-6">
          {selectedCustomer && (
            <>
              {/* Profile */}
              <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
                <img
                  src={selectedCustomer.profileImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h2>
                  <p className="text-gray-500">{selectedCustomer.bio}</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-gray-700">
                  <p>
                    <span className="font-medium">First Name:</span>{" "}
                    {selectedCustomer.firstName}
                  </p>
                  <p>
                    <span className="font-medium">Last Name:</span>{" "}
                    {selectedCustomer.lastName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedCustomer.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedCustomer.phone}
                  </p>
                  <p className="col-span-2">
                    <span className="font-medium">Bio:</span>{" "}
                    {selectedCustomer.bio}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold mb-4">Address</h3>
                <div className="grid grid-cols-2 gap-4 text-gray-700">
                  <p>
                    <span className="font-medium">Country:</span>{" "}
                    {selectedCustomer.country}
                  </p>
                  <p>
                    <span className="font-medium">City / State:</span>{" "}
                    {selectedCustomer.city}
                  </p>
                  <p>
                    <span className="font-medium">Postal Code:</span>{" "}
                    {selectedCustomer.postalCode}
                  </p>
                  <p>
                    <span className="font-medium">Tax ID:</span>{" "}
                    {selectedCustomer.taxId}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;