import React, { useEffect, useState } from "react"; 
import axios from "axios";

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

      if (response.data.success && Array.isArray(response.data.message)) {
        setOwners(response.data.message);
        setSelectedOwner(response.data.message[0] || null);
      }
    } catch (error) {
      console.error("Error fetching owners:", error);
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
      <h1 className="text-2xl font-bold mb-6">Owners Profile</h1>

      <div className="flex w-full gap-6">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-lg shadow p-4">
          <ul className="space-y-2">
            {owners.length > 0 ? (
              owners.map((owner) => (
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
              ))
            ) : (
              <p className="text-gray-500 text-sm">No owners found.</p>
            )}
          </ul>
          {selectedOwner && (
            <button className="mt-6 text-red-600 font-semibold">
              Block Account
            </button>
          )}
        </div>

         {/* Main Profile Content */}
      <div className="flex-1 space-y-6">
        {selectedOwner ? (
          <>
            {/* My Profile */}
            <div className="bg-white rounded-xl shadow p-6 flex justify-between items-center w-[130%]">
              <div className="flex items-center gap-4">
                <img
                  src={selectedOwner.profileImage || "/placeholder-profile.png"}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedOwner.firstName} {selectedOwner.lastName}
                  </h2>
                  <p className="text-gray-500">
                    {selectedOwner.bio || "No bio available."}
                  </p>
                </div>
              </div>
              <button className="p-2 rounded-full border hover:bg-gray-100">
                ✏️
              </button>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow p-6 w-[130%]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Personal Information</h3>
                <button className="p-2 rounded-full border hover:bg-gray-100">
                  ✏️
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <p>
                  <span className="font-medium">First Name:</span>{" "}
                  {selectedOwner.firstName || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Last Name:</span>{" "}
                  {selectedOwner.lastName || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {selectedOwner.email || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {selectedOwner.phone || "N/A"}
                </p>
                <p className="col-span-2">
                  <span className="font-medium">Bio:</span>{" "}
                  {selectedOwner.bio || "N/A"}
                </p>
              </div>
            </div>
  

            {/* Address */}
            <div className="bg-white rounded-xl shadow p-6 w-[130%]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Address</h3>
                <button className="p-2 rounded-full border hover:bg-gray-100">
                  ✏️
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  {selectedOwner.address || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Verified:</span>{" "}
                  {selectedOwner.isVerified ? "Yes" : "No"}
                </p>
                <p>
                  <span className="font-medium">Created At:</span>{" "}
                  {formatDate(selectedOwner.createdAt)}
                </p>
                <p>
                  <span className="font-medium">Updated At:</span>{" "}
                  {formatDate(selectedOwner.updatedAt)}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Select an owner to view details.</p>
        )}
      </div>
    </div>
  </div>
);
};

export default Owners;
