import React, { useState, useEffect } from "react";
import axios from "axios";

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/api/item`
      );
      console.log(response.data);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        setItems(response.data.data);
      } else {
        setItems([]);
      }
      setError(null);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to load items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Items</h1>
      
      {items.length === 0 ? (
        <p className="text-gray-500">No items available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 bg-white flex flex-col"
            >
              {/* Item Image */}
            {(() => {
              let images = [];
              try {
                const raw = item.itemImages?.[0];
                images = typeof raw === "string" ? JSON.parse(raw) : raw || [];
              } catch {
                images = [];
              }
              return images.length > 0 ? (
                <img
                  src={images[0]}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No Image</span>
                </div>
              );
            })()}

              {/* Item Info */}
              <div className="flex-1 flex flex-col">
                <h2 className="text-base sm:text-lg font-semibold mb-1 line-clamp-1">
                  {item.title || "Untitled"}
                </h2>
                
                <p className="text-sm text-gray-600 mb-2 line-clamp-2 flex-1">
                  {item.description || "No description"}
                </p>
                
                <p className="text-blue-600 font-bold text-base sm:text-lg mb-2">
                  ₱{item.pricePerDay || 0} / day
                </p>
                
                <p className="text-xs sm:text-sm mb-3">
                  Availability:{" "}
                  <span
                    className={`font-medium ${
                      item.availability ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.availability ? "Available" : "Not Available"}
                  </span>
                </p>

                {item.Owner && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs sm:text-sm text-gray-700">
                      Owner: {item.Owner.firstName} {item.Owner.lastName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;