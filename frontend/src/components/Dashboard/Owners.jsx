
import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from '../Layout';
const Owners = () => {
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);

  useEffect(() => {
    fetchOwners();
  }, []);


  const fetchOwners = async () => {

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/api/owner`
      );
      setOwners(response.data.message); // ✅ API returns "message" array
      setSelectedOwner(response.data.message[0]); // select first owner by default
    } catch (error) {
      console.log(error);
    }
  };

  return (
      <div className="w-full p-6 pl-64 overflow hidden">
    {/* Page Title */}
    <h1 className="text-2xl font-bold mb-6">Owners Profile</h1>

    <div className="flex w-full">
      {/* Sidebar */}
      <div className="w-1/4 bg-white rounded-lg shadow p-4">
        <ul className="space-y-2">
          {owners.map((owner) => (
            <li
              key={owner.id}
              className={`p-2 rounded-lg cursor-pointer ${
                selectedOwner?.id === owner.id
                  ? "bg-teal-100 font-semibold"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setSelectedOwner(owner)}
            >
              {owner.firstName} {owner.lastName}
            </li>
          ))}
        </ul>
        {selectedOwner && (
          <button className="mt-6 text-red-600 font-semibold">
            Block Account
          </button>
        )}
      </div>

      {/* Main Profile Content */}
      <div className="flex-1 ml-6 space-y-6">
        {selectedOwner && (
          <>
            {/* My Profile */}
            <div className="bg-white rounded-xl shadow p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img
                  src={selectedOwner.profileImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedOwner.firstName} {selectedOwner.lastName}
                  </h2>
                  <p className="text-gray-500">{selectedOwner.bio}</p>
                </div>
              </div>
              <button className="p-2 rounded-full border hover:bg-gray-100">
                ✏️
              </button>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Personal Information</h3>
                <button className="p-2 rounded-full border hover:bg-gray-100">
                  ✏️
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <p>
                  <span className="font-medium">First Name:</span>{" "}
                  {selectedOwner.firstName}
                </p>
                <p>
                  <span className="font-medium">Last Name:</span>{" "}
                  {selectedOwner.lastName}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {selectedOwner.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {selectedOwner.phone}
                </p>
                <p className="col-span-2">
                  <span className="font-medium">Bio:</span>{" "}
                  {selectedOwner.bio}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Address</h3>
                <button className="p-2 rounded-full border hover:bg-gray-100">
                  ✏️
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  {selectedOwner.address}
                </p>
                <p>
                  <span className="font-medium">Verified:</span>{" "}
                  {selectedOwner.isVerified ? "Yes" : "No"}
                </p>
                <p>
                  <span className="font-medium">Created At:</span>{" "}
                  {new Date(selectedOwner.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Updated At:</span>{" "}
                  {new Date(selectedOwner.updatedAt).toLocaleDateString()}
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

export default Owners;