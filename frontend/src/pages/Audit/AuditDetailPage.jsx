import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { Service } from "../../lib/axios";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  FileText,
  Loader2,
  MapPin,
  Printer,
  User,
  XCircle,
} from "lucide-react";

export default function AuditDetailPage() {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await Service.audits.get(id);
        setAudit(response.data.data);
      } catch (err) {
        console.error(err);
        navigate("/audit");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const getStats = () => {
    if (!audit?.items) return { found: 0, missing: 0, damaged: 0 };
    const found = audit.items.filter((i) => i.status === "found").length;
    const missing = audit.items.filter((i) => i.status === "missing").length;
    const damaged = audit.items.filter((i) => i.status === "damaged").length;
    return { found, missing, damaged };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      </Layout>
    );
  }
  if (!audit) return null;

  const stats = getStats();
  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <button
            onClick={() => navigate("/audit")}
            className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-2 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to History
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Audit Report #{audit.id}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Stock Opname performed on{" "}
            {new Date(audit.audit_date).toLocaleDateString()}
          </p>
        </div>{" "}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg shadow-sm transition-colors"
        >
          <Printer size={18} /> Print Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Info Audit */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider">
              Audit Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Target Location
                </label>
                <div className="flex items-start gap-2">
                  <MapPin size={18} className="text-red-500 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {audit.location?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {audit.location?.parent
                        ? `in ${audit.location.parent.name}`
                        : ""}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-700" />

              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Auditor
                </label>
                <div className="flex items-center gap-2">
                  <User size={18} className="text-blue-500" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {audit.auditor?.name}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  General Notes
                </label>
                <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                  <FileText size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{audit.notes || "- No notes -"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-green-700">
                {stats.found}
              </span>
              <span className="text-xs font-bold text-green-600 uppercase flex items-center gap-1 mt-1">
                <CheckCircle size={14} /> Found
              </span>
            </div>
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-red-700">
                {stats.missing}
              </span>
              <span className="text-xs font-bold text-red-600 uppercase flex items-center gap-1 mt-1">
                <XCircle size={14} /> Missing
              </span>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-yellow-700">
                {stats.damaged}
              </span>
              <span className="text-xs font-bold text-yellow-600 uppercase flex items-center gap-1 mt-1">
                <AlertTriangle size={14} /> Damaged
              </span>
            </div>
          </div>

          {/* Detail Items Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-gray-800 dark:text-white">
                Audit Item Details
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-3">Asset Info</th>
                    <th className="px-6 py-3 text-center">Result</th>
                    <th className="px-6 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {audit.items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {item.asset?.name}
                        </div>
                        <div className="text-xs text-blue-600 font-mono">
                          {item.asset?.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.status === "found" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                            <CheckCircle size={12} /> Found
                          </span>
                        )}
                        {item.status === "missing" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                            <XCircle size={12} /> Missing
                          </span>
                        )}
                        {item.status === "damaged" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-200">
                            <AlertTriangle size={12} /> Damaged
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 italic text-gray-500">
                        {item.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
