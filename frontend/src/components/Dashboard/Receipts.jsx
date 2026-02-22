import React, { useEffect, useState } from "react";
import axios from "axios";

const COMMISSION_RATE = 0.30;
const PAGE_SIZE = 5;

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/api/book/ongoing-terminated/admin`
      );
      setReceipts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalSales = receipts.reduce((sum, r) => sum + parseFloat(r.grandTotal || 0), 0);
  const totalCommission = totalSales * COMMISSION_RATE;
  const totalOwnerShare = totalSales - totalCommission;

  const totalPages = Math.ceil(receipts.length / PAGE_SIZE);
  const paginated = receipts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const handleNotifyOwner = (receipt) => {
    alert(`Notifying owner for booking: ${receipt.product} (ID: ${receipt.id.slice(0, 8)}...)`);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          <span className="font-black">Admin Receipt</span>{" "}
          <span className="font-light text-gray-500">Page</span>
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-600 rounded-xl px-6 py-5 flex items-center gap-3 shadow-md">
          <span className="text-white text-base font-semibold">Total Sales:</span>
          <span className="text-white text-2xl font-extrabold">
            ₱ {totalSales.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </span>
        </div>
        <div className="bg-emerald-500 rounded-xl px-6 py-5 flex items-center gap-3 shadow-md">
          <span className="text-white text-base font-semibold">Total Commission:</span>
          <span className="text-white text-2xl font-extrabold">
            ₱ {totalCommission.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </span>
        </div>
        <div className="bg-violet-500 rounded-xl px-6 py-5 flex items-center gap-3 shadow-md">
          <span className="text-white text-base font-semibold">Total Owner Share:</span>
          <span className="text-white text-2xl font-extrabold">
            ₱ {totalOwnerShare.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </span>
        </div>
      </div>
      <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Rental Receipts</h2>
        <p className="text-sm text-gray-400 mb-5">All successful rental transactions are listed below.</p>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">


        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    {["Receipt No.", "Renter", "Property", "Total Amount", "Admin Commission ▾", "Owner Share", "Date", "Action"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? (
                    paginated.map((receipt, index) => {
                      const total = parseFloat(receipt.grandTotal || 0);
                      const commission = total * COMMISSION_RATE;
                      const ownerShare = total - commission;
                      const receiptNum = `RCPT-${String((currentPage - 1) * PAGE_SIZE + index + 1001).slice(1)}`;

                      return (
                        <tr key={receipt.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-3 text-sm font-medium text-gray-700">{receiptNum}</td>
                          <td className="py-4 px-3 text-sm text-gray-800 font-medium">{receipt.name}</td>
                          <td className="py-4 px-3 text-sm text-gray-600">{receipt.product}</td>
                          <td className="py-4 px-3 text-sm font-semibold text-gray-900">
                            ₱ {total.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                          </td>
                          <td className="py-4 px-3 text-sm font-semibold text-gray-900">
                            ₱ {commission.toLocaleString("en-US", { minimumFractionDigits: 0 })}{" "}
                            <span className="text-emerald-500 font-semibold">(30%)</span>
                          </td>
                          <td className="py-4 px-3 text-sm font-semibold text-gray-900">
                            ₱ {ownerShare.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                          </td>
                          <td className="py-4 px-3 text-sm text-gray-500 whitespace-nowrap">
                            {formatDate(receipt.created_at)}
                          </td>
                          <td className="py-4 px-3">
                            <button
                              onClick={() => handleNotifyOwner(receipt)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm"
                            >
                              Notify Owner
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-16 text-center text-gray-400 text-sm">
                        No rental receipts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200 rounded-lg px-4 py-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, i) =>
                    page === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200 rounded-lg px-4 py-2 transition-colors"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Receipts;