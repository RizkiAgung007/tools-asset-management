import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import {
  Calendar,
  ClipboardList,
  Eye,
  Loader2,
  MapPin,
  Plus,
  User,
} from "lucide-react";
import Pagination from "../../components/common/Pagination";

export default function AuditLIstPage() {
  const [audit, setAudit] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAudit();
  }, [page]);

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/audit", {
        params: { page },
      });
      setAudit(response.data.data.data);
      setMeta(response.data.data);
    } catch (err) {
      console.error("Error fetching audit:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Stock Opname List
          </h1>
          <p className="text-sm text-gray-500">
            List of physical asset verification
          </p>
        </div>

        <button
          onClick={() => navigate("/audit/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus size={18} /> <span>New Audit</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase font-bold">
              <tr>
                <th className="px-6 py-3">Audit Date</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Auditor</th>
                <th className="px-6 py-3 text-center">Items Checked</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin inline mr-2" /> Loading
                    Data
                  </td>
                </tr>
              ) : audit.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No audit history found.
                  </td>
                </tr>
              ) : (
                audit.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                        <Calendar size={16} className="text-blue-500" />
                        {new Date(a.audit_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 pl-6">
                        {new Date(a.created_at).toLocaleTimeString()}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-red-500" />
                        <span className="font-bold">{a.location?.name}</span>
                      </div>
                      <div className="text-xs text-gray-400 pl-6 mt-0.5">
                        {a.location?.description}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-green-500" />
                        <span>{a.auditor?.name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <ClipboardList size={16} className="text-orange-500" />
                        <span>{a.items_count} Assets</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/audit/${a.id}`)}
                        className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="View Report"
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
