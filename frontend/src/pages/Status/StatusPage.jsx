import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/axios";
import {
  Plus,
  Tag,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Pencil,
  Eye,
} from "lucide-react";
import StatusFormModal from "../../components/statuses/StatusFormModal";
import { useNavigate } from "react-router-dom";

export default function StatusPage() {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const navigate = useNavigate();

  const fetchStatuses = async () => {
    try {
      const response = await api.get("/api/asset-status");
      setStatuses(response.data.data || []);
    } catch (error) {
      console.error(error);
      setStatuses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  // Create Modal
  const handleCreate = () => {
    setSelectedStatus(null);
    setIsModalOpen(true);
  };

  // Edit Modal
  const handleEdit = (status) => {
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  // View Modal
  const handleView = (id) => {
    navigate(`/statuses/${id}`);
  };

  // Delete Modal
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this status?")) return;
    try {
      await api.delete(`/api/asset-status/${id}`);
      fetchStatuses();
    } catch (err) {
      alert("Failed", err);
    }
  };

  // Helper Class COlor
  const getBadgeClass = (style) => {
    switch (style) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "danger":
        return "bg-red-100 text-red-800 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Asset Status
        </h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> <span>Add Status</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase font-bold">
            <tr>
              <th className="px-6 py-3">Status Name</th>
              <th className="px-6 py-3">Lable</th>
              <th className="px-6 py-3 text-center">Deployable</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center">
                  <Loader2 className="animate-spin inline mr-2" /> Loading...
                </td>
              </tr>
            ) : statuses.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center">
                  No data.
                </td>
              </tr>
            ) : (
              statuses.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Tag size={16} className="text-gray-400" /> {item.name}
                  </td>
                  {/* <td className="px-6 py-4 font-mono text-xs">{item.slug}</td> */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeClass(
                        item.style
                      )}`}
                    >
                      {item.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.is_deployable ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle size={12} /> Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        <XCircle size={12} /> No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center flex justify-center gap-2">
                    <button
                      onClick={() => handleView(item.id)}
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-yellow-500 hover:text-yellow-600"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <StatusFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchStatuses}
        statusToEdit={selectedStatus}
      />
    </Layout>
  );
}
