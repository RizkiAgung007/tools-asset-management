import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { Service } from "../../lib/axios";
import {
  ArrowLeft,
  Tag,
  Box,
  CheckCircle,
  XCircle,
  Loader2,
  Pencil,
  MapPin,
  Eye,
} from "lucide-react";
import StatusFormModal from "../../components/statuses/StatusFormModal";

export default function StatusDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const response = await Service.statuses.get(id)
      setStatusData(response.data.data);
    } catch (error) {
      console.error(error);
      navigate("/statuses");
    } finally {
      setLoading(false);
    }
  };

  // Helper warna badge
  const getBadgeColor = (style) => {
    switch (style) {
      case "success":
        return "text-green-600 bg-green-100 border-green-200";
      case "danger":
        return "text-red-600 bg-red-100 border-red-200";
      case "warning":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "info":
        return "text-blue-600 bg-blue-100 border-blue-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
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

  if (!statusData) return null;

  // Cek apakah ada aset
  const hasAssets = statusData.assets && statusData.assets.length > 0;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/statuses")}
          className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Statuses
        </button>

        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div
              className={`p-4 rounded-xl border ${getBadgeColor(statusData.style)}`}
            >
              <Tag size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {statusData.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs font-mono text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded">
                  SLUG: {statusData.slug}
                </span>

                {statusData.is_deployable ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    <CheckCircle size={12} /> Deployable (Ready to Loan)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    <XCircle size={12} /> Not Deployable (Locked)
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Pencil size={16} /> Edit Status
          </button>
        </div>
      </div>

      {/* Asset List Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Box size={18} /> Asset Inventory ({statusData.assets?.length || 0})
          </h3>
        </div>

        {hasAssets ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase font-bold">
                <tr>
                  <th className="px-6 py-3">Asset Tag</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {statusData.assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">
                      {asset.code}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {asset.name}
                      <div className="text-xs text-gray-400 font-normal">
                        SN: {asset.serial_number || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-xs font-bold border border-orange-100">
                        {asset.category?.name || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-purple-500" />
                        <span>{asset.location?.name || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/assets/${asset.id}`)}
                        className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                        title="View Asset"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-block p-4 bg-gray-100 rounded-full text-gray-400 mb-3">
              <Box size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No Assets Found
            </h3>
            <p className="text-gray-500 mt-1">
              There are no assets currently marked as "{statusData.name}".
            </p>
          </div>
        )}
      </div>

      {/* Modal Edit */}
      <StatusFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDetail}
        statusToEdit={statusData}
      />
    </Layout>
  );
}
