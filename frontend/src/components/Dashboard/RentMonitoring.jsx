import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

const COMMISSION_RATE = 0.30;

const StatusBadge = ({ status }) => {
  const styles = {
    ongoing: "bg-blue-100 text-blue-700 border border-blue-200",
    terminated: "bg-red-100 text-red-700 border border-red-200",
    completed: "bg-green-100 text-green-700 border border-green-200",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

const RentMonitoring = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/api/book/ongoing-book/admin`
      );
      setData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatCurrency = (value) =>
    `₱ ${parseFloat(value || 0).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  const columns = useMemo(() => [
    {
      accessorKey: "id",
      header: "Booking ID",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-gray-500">
          #{getValue().slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Renter",
      cell: ({ getValue, row }) => (
        <div>
          <p className="font-semibold text-gray-900 text-sm">{getValue()}</p>
          <p className="text-xs text-gray-400">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "product",
      header: "Property",
      cell: ({ getValue, row }) => (
        <div>
          <p className="font-medium text-gray-800 text-sm">{getValue()}</p>
          <p className="text-xs text-gray-400">{row.original.category}</p>
        </div>
      ),
    },
    {
      accessorKey: "rentalPeriod",
      header: "Period",
      cell: ({ getValue, row }) => (
        <div>
          <p className="text-sm text-gray-700">{getValue()}</p>
          <p className="text-xs text-gray-400">{row.original.rentalDuration} day(s)</p>
        </div>
      ),
    },
    {
      accessorKey: "pickUpDate",
      header: "Pick Up",
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">{formatDate(getValue())}</span>
      ),
    },
    {
      accessorKey: "returnDate",
      header: "Return",
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">{formatDate(getValue())}</span>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: "Total",
      cell: ({ getValue }) => (
        <span className="font-semibold text-gray-900 text-sm">{formatCurrency(getValue())}</span>
      ),
    },
    {
      id: "commission",
      header: "Commission (30%)",
      accessorKey: "grandTotal",
      cell: ({ getValue }) => {
        const commission = parseFloat(getValue() || 0) * COMMISSION_RATE;
        return (
          <span className="text-sm font-semibold text-emerald-600">
            {formatCurrency(commission)}
          </span>
        );
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment",
      cell: ({ getValue }) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <button
          onClick={() => alert(`View booking: ${row.original.id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shadow-sm"
        >
          View Details
        </button>
      ),
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  // Summary stats
  const totalAmount = data.reduce((sum, r) => sum + parseFloat(r.grandTotal || 0), 0);
  const totalCommission = totalAmount * COMMISSION_RATE;
  const ongoingCount = data.filter((r) => r.status === "ongoing").length;

  return (
    <div className="w-full bg-gray-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          <span className="font-black">Ongoing</span>{" "}
          <span className="font-light text-gray-500">Bookings</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">All active rental bookings are listed below.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-600 rounded-xl px-6 py-5 flex items-center gap-3 shadow-md">
          <div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide">Total Bookings</p>
            <p className="text-white text-2xl font-extrabold">{data.length}</p>
          </div>
        </div>
        <div className="bg-emerald-500 rounded-xl px-6 py-5 flex items-center gap-3 shadow-md">
          <div>
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wide">Total Revenue</p>
            <p className="text-white text-2xl font-extrabold">{formatCurrency(totalAmount)}</p>
          </div>
        </div>
        <div className="bg-violet-500 rounded-xl px-6 py-5 flex items-center gap-3 shadow-md">
          <div>
            <p className="text-violet-100 text-xs font-semibold uppercase tracking-wide">Total Commission</p>
            <p className="text-white text-2xl font-extrabold">{formatCurrency(totalCommission)}</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Booking Records</h2>
            <p className="text-sm text-gray-400">
              {table.getFilteredRowModel().rows.length} result(s) found
            </p>
          </div>
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search bookings..."
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    {table.getHeaderGroups().map((headerGroup) =>
                      headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap cursor-pointer select-none"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span className="flex items-center gap-1">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === "asc" && " ▲"}
                            {header.column.getIsSorted() === "desc" && " ▼"}
                            {header.column.getCanSort() && !header.column.getIsSorted() && (
                              <span className="text-gray-300">⇅</span>
                            )}
                          </span>
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="py-4 px-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="py-16 text-center text-gray-400 text-sm">
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Rows per page:</span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none"
                >
                  {[5, 10, 20].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200 rounded-lg px-4 py-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => table.setPageIndex(page - 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                      table.getState().pagination.pageIndex === page - 1
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200 rounded-lg px-4 py-2 transition-colors"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <p className="text-sm text-gray-400">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RentMonitoring;