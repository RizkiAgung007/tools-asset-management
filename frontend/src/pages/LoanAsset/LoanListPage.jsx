import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Service } from "../../lib/axios";
import Layout from "../../components/Layout";
import {
  Box,
  Eye,
  Loader2,
  Plus,
  Search,
  User,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  PlayCircle,
} from "lucide-react";
import Pagination from "../../components/common/Pagination";

export default function LoanListPage() {
  const [loans, setLoans] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");

  const navigate = useNavigate();

  // Definisi Tabs
  const tabs = [
    { id: "pending", label: "Pending Approval", icon: <Clock size={16} /> },
    { id: "approved", label: "Approved", icon: <CheckCircle size={16} /> },
    { id: "active", label: "Active (In Use)", icon: <PlayCircle size={16} /> },
    { id: "returned", label: "Returned", icon: <RotateCcw size={16} /> },
    { id: "rejected", label: "Rejected", icon: <XCircle size={16} /> },
  ];

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLoans();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, page, statusFilter]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        search: search,
        status: statusFilter,
      };

      const response = await Service.loans.list(params)
      setLoans(response.data.data.data);
      setMeta(response.data.data);
    } catch (err) {
      console.error("Error fetching loans:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper badge status color
  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-blue-100 text-blue-800 border-blue-200",
      active: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      returned: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return styles[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Loan Requests
          </h1>
          <p className="text-sm text-gray-500">
            Manage asset lending and returns
          </p>
        </div>

        <button
          onClick={() => navigate("/loans/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus size={18} /> <span>New Request</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Tab Filter */}
        <div className="flex overflow-x-auto justify-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                statusFilter === tab.id
                  ? "border-blue-600 text-blue-600 bg-white dark:bg-gray-800"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-end">
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search in ${statusFilter} list...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-4 py-2 w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
            />
          </div>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase font-bold">
              <tr>
                <th className="px-6 py-3">Loan ID</th>
                <th className="px-6 py-3">Asset Details</th>
                <th className="px-6 py-3">Borrower</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin inline mr-2" /> Loading
                    data...
                  </td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No <strong>{statusFilter}</strong> requests found.
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr
                    key={loan.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">
                      {loan.loan_code}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Box size={16} className="text-orange-500" />
                        {loan.asset?.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {loan.asset?.code}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span>{loan.user?.name}</span>
                      </div>
                      <div className="text-xs text-gray-400 pl-6">
                        {loan.user?.role}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs">
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          Out: {loan.loan_date}
                        </span>
                        <span className="flex items-center gap-1 text-red-500 mt-1">
                          In: {loan.return_date}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getStatusBadge(
                          loan.status,
                        )}`}
                      >
                        {loan.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/loans/${loan.id}`)}
                        className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
      </div>
    </Layout>
  );
}
