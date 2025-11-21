import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../../components/Layout";
import api from "../../lib/axios";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Box,
  MapPin,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import Pagination from "../../components/common/Pagination";

export default function AssetListPage() {
  const [assets, setAssets] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssets();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, page]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = { search, page };
      const response = await api.get("/api/assets", { params });
      setAssets(response.data.data.data);
      setMeta(response.data.data);
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  //   Delete Modal
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      await api.delete(`/api/assets/${id}`);
      fetchAssets();
    } catch (err) {
      alert("Failed to delete asset.", err);
    }
  };

  // Helper status badge color
  const getStatusColor = (style) => {
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
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Asset Registry
          </h1>
          <p className="text-sm text-gray-500">
            Master database of all company assets
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search asset name, tag, or SN..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
            />
          </div>

          <button
            onClick={() => navigate("/assets/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus size={18} /> <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase font-bold">
              <tr>
                <th className="px-6 py-3 text-center w-16">Img</th>
                <th className="px-6 py-3">Asset Tag & Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin inline mr-2" /> Loading
                    assets...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No assets found. Try adding one!
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {/* Image Thumbnail */}
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded bg-gray-100 border flex items-center justify-center overflow-hidden">
                        {asset.image_path ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL}/storage/${
                              asset.image_path
                            }`}
                            alt="Asset"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={20} className="text-gray-400" />
                        )}
                      </div>
                    </td>

                    {/* Identity */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-blue-600 font-mono">
                        {asset.code}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {asset.name}
                      </div>
                      <div className="text-xs text-gray-400 uppercase">
                        SN: {asset.serial_number || "-"}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Box size={16} className="text-orange-500" />
                        <span>{asset.category?.name}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-purple-500" />
                        <div className="flex flex-col">
                          <span>{asset.location?.name}</span>
                          <span className="text-xs text-gray-400">
                            {asset.location?.parent?.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      {asset.status && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                            asset.status.style
                          )}`}
                        >
                          {asset.status.name}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 pt-8 flex justify-center gap-2">
                      <button
                        onClick={() => navigate(`/assets/${asset.id}`)}
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                        title="Detail"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => navigate(`/assets/${asset.id}/edit`)}
                        className="p-1 text-yellow-500 hover:bg-yellow-50 rounded"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="Delete"
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
        <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
      </div>
    </Layout>
  );
}
