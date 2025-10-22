import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/api/book/fetch-bookings`
      );
      setBookings(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setPending(false);
    }
  };

  const columns = [
    {
      name: "Customer",
      selector: (row) => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      wrap: true,
    },
    {
      name: "Product",
      selector: (row) => row.product,
      sortable: true,
      wrap: true,
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
      wrap: true,
    },
    {
      name: "Price / Day",
      selector: (row) => `₱${row.pricePerDay}`,
      sortable: true,
      right: true,
    },
    {
      name: "Rental Period",
      selector: (row) => row.rentalPeriod,
      sortable: true,
      center: true,
    },
    {
      name: "Amount",
      selector: (row) => `₱${row.amount}`,
      sortable: true,
      right: true,
    },
    {
      name: "Pick-up Date",
      selector: (row) =>
        new Date(row.pickUpDate).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      sortable: true,
      center: true,
    },
    {
      name: "Return Date",
      selector: (row) =>
        new Date(row.returnDate).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      sortable: true,
      center: true,
    },
    {
      name: "Payment",
      selector: (row) => row.paymentMethod,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            row.paymentMethod === "paid"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {row.paymentMethod}
        </span>
      ),
      center: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            row.status === "approved"
              ? "bg-green-100 text-green-700"
              : row.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.status}
        </span>
      ),
      center: true,
    },
  ];

  const customStyles = {
    table: {
      style: {
        width: "100%",
      },
    },
    rows: {
      style: {
        minHeight: "60px",
      },
    },
    headCells: {
      style: {
        backgroundColor: "#f9fafb",
        color: "#374151",
        fontWeight: "600",
        fontSize: "14px",
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        whiteSpace: "normal",
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">


        {/* DataTable */}
        <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <DataTable
              title="All Bookings"
              columns={columns}
              data={bookings}
              progressPending={pending}
              pagination
              highlightOnHover
              striped
              responsive
              persistTableHead
              customStyles={customStyles}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
