import React, { useState, useEffect } from "react";
import axios from "axios";

const Home = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []); // ✅ add [] so it only runs once

  const fetchItems = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/api/item`
      );
      console.log(response.data);
      setItems(response.data.message); // ✅ use response.data.message
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Items</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="border rounded-xl shadow-md p-4 bg-white"
          >
            {/* Item Image */}
            <img
              src={item.itemImage}
              alt={item.title}
              className="w-full h-48 object-cover rounded-lg mb-3"
            />

            {/* Item Info */}
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="text-gray-600">{item.description}</p>
            <p className="text-blue-600 font-bold mt-2">
              ₱{item.pricePerDay} / day
            </p>
            <p className="text-sm mt-1">
              Availability:{" "}
              <span
                className={item.availability ? "text-green-600" : "text-red-600"}
              >
                {item.availability ? "Available" : "Not Available"}
              </span>
            </p>

            {item.Owner && (
              <div className="mt-3 text-sm text-gray-700">

                <p>
                  Owner: {item.Owner.firstName} {item.Owner.lastName}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
