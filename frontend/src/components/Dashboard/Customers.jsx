import React, { useEffect, useState } from "react";
import axios from "axios";

const Customers = () => {
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/api/owner`
      );

      console.log(response.data.message);
      setOwners(response.data.message); // ✅ use "message" array
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-6">Customer Profile</h1>

      {owners.map((customer) => (
        <div key={customer.id} className="bg-white shadow rounded-2xl p-6 mb-6">
          {/* Profile Header */}
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div className="flex items-center gap-4">
              <img
                src={customer.profileImage}
                alt="profile"
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold">
                  {customer.firstName} {customer.lastName}
                </h2>
                <p className="text-gray-500">{customer.bio}</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
              Edit
            </button>
          </div>

          {/* Personal Information */}
          <div className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Personal Information</h3>
              <button className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm">
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <span className="font-medium">First Name:</span>{" "}
                {customer.firstName}
              </p>
              <p>
                <span className="font-medium">Last Name:</span>{" "}
                {customer.lastName}
              </p>
              <p>
                <span className="font-medium">Email:</span> {customer.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {customer.phone}
              </p>
              <p className="col-span-2">
                <span className="font-medium">Bio:</span> {customer.bio}
              </p>
            </div>
          </div>

          {/* Address Information */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Address</h3>
              <button className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm">
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <span className="font-medium">Address:</span>{" "}
                {customer.address}
              </p>
              <p>
                <span className="font-medium">Verified:</span>{" "}
                {customer.isVerified ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-medium">Created At:</span>{" "}
                {new Date(customer.createdAt).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Updated At:</span>{" "}
                {new Date(customer.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Customers;
