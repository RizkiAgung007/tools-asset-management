import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Service } from "../../lib/axios";
import Layout from "../../components/Layout";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Loader2,
  Search,
  Truck,
  Wrench,
} from "lucide-react";
import Pagination from "../../components/common/Pagination";

export default function MaintenanceListPage() {
  const [maintenances, setMaintenances] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMaintenances();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, page]);

  const fetchMaintenances = async () => {
    setLoading(true);
    try {
      const params = { search, page };
      const response = await Service.maintenances.list(params);
      setMaintenances(response.data.data.data);
      setMeta(response.data.data);
    } catch (err) {
      console.error("Error Fetching Data:", err);
    } finally {
      setLoading(false);
    }
  };

  //   Helper status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
            <CheckCircle size={12} /> Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
            <Wrench size={12} /> In Progress
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  // Helper format IDR
  const formatRupiah = (number) => {
    if (!number) {
      return "-";
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Maintenance & Repair
          </h1>
          <p className="text-sm text-gray-500">
            Track asset repairs and service costs
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search Asset..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
            />
          </div>
          <button
            onClick={() => navigate("/maintenance/create")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap"
          >
            <AlertTriangle size={18} /> <span>Report Issue</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase font-bold">
              <tr>
                <th className="px-6 py-3">Asset Details</th>
                <th className="px-6 py-3">Issue Description</th>
                <th className="px-6 py-3">Vendor / Supplier</th>
                <th className="px-6 py-3">Date & Cost</th>
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
              ) : maintenances.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No maintenances records found.
                  </td>
                </tr>
              ) : (
                maintenances.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {item.asset?.name}
                      </div>
                      <div className="text-xs text-blue-600 font-mono mt-1">
                        {item.asset?.code}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="truncate max-w-xs">{item.issue}</div>
                    </td>

                    <td className="px-6 py-4">
                      {item.supplier ? (
                        <div className="flex items-center gap-4">
                          <Truck size={16} className="text-gray-400" />
                          {item.supplier.name}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">
                          - Internal / Not Set -
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-gray-500">
                          <Clock size={14} /> Start: {item.start_date}
                        </span>
                        {item.cost && (
                          <span className="flex items-center gap-2 text-green-600 font-bold">
                            <DollarSign size={14} /> {formatRupiah(item.cost)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {getStatusBadge(item.status)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/maintenance/${item.id}`)}
                        className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="View Detai"
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
