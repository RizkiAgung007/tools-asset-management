import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import api from "../../lib/axios";
import {
  ArrowLeft,
  Box,
  CheckCircle,
  Loader2,
  Pencil,
  Tag,
  XCircle,
} from "lucide-react";
import StatusFormModal from "../../components/statuses/StatusFormModal";

export default function StatusDetailPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDetailStatus();
  }, [id]);

  const fetchDetailStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/asset-status/${id}`);
      setStatus(response.data.data);
    } catch (err) {
      console.error(err);
      navigate("/statuses");
    } finally {
      setLoading(false);
    }
  };

  //   Helper color badge
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

  if (!status) return null;

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
              className={`p-4 rounded-xl border ${getBadgeColor(status.style)}`}
            >
              <Tag size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {status.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs font-mono text-gray-400 uppercase">
                  SLUG: {status.slug}
                </span>

                {/* Badge Deployable */}
                {status.is_deployable ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    <CheckCircle size={12} /> Deployable 
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    <XCircle size={12} /> Not Deployable 
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

      {/* Asset List Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Box size={18} /> Asset Inventory with status "{status.name}"
          </h3>
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
            Total: 0
          </span>
        </div>

        <div className="p-12 text-center">
          <div className="inline-block p-4 bg-gray-100 rounded-full text-gray-400 mb-3">
            <Box size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No Assets Found
          </h3>
          <p className="text-gray-500 mt-1">
            There are no assets currently marked as "{status.name}".
          </p>
        </div>
      </div>

      {/* Modal Edit (Reused) */}
      <StatusFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDetailStatus}
        statusToEdit={status}
      />
    </Layout>
  );
}
