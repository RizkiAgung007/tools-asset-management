import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../lib/axios";
import {
  ArrowLeft,
  Folder,
  Box,
  ChevronRight,
  Loader2,
  Clock,
  Layers,
  MapPin,
  Tag,
  Eye,
} from "lucide-react";

export default function CategoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      // Backend sekarang mengirimkan .assets juga
      const response = await api.get(`/api/categories/${id}`);
      setCategory(response.data.data);
    } catch (error) {
      console.error(error);
      navigate("/categories");
    } finally {
      setLoading(false);
    }
  };

  // Helper Warna Status
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

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      </Layout>
    );
  }

  if (!category) return null;

  const hasChildren = category.children && category.children.length > 0;
  const hasAssets = category.assets && category.assets.length > 0;

  return (
    <Layout>
      {/* Header & Breadcrumbs */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link to="/categories" className="hover:text-blue-600">
            Categories
          </Link>
          {category.parent && (
            <>
              <ChevronRight size={14} className="mx-1" />
              <Link
                to={`/categories/${category.parent.id}`}
                className="hover:text-blue-600"
              >
                {category.parent.name}
              </Link>
            </>
          )}
          <ChevronRight size={14} className="mx-1" />
          <span className="font-bold text-gray-800">{category.name}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-4 bg-orange-100 text-orange-600 rounded-xl">
            <Folder size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {category.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded border border-gray-300">
                CODE: {category.code}
              </span>
              {category.useful_life && (
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <Clock size={12} /> Life: {category.useful_life} Years
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- LOGIKA TAMPILAN --- */}

      {/* 1. Jika punya Anak -> Tampilkan List Sub-Kategori */}
      {hasChildren ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Layers size={18} /> Sub-Categories ({category.children.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {category.children.map((child) => (
              <div
                key={child.id}
                onClick={() => navigate(`/categories/${child.id}`)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-50 text-orange-500 rounded group-hover:bg-white group-hover:shadow-sm transition-all">
                    <Folder size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 dark:text-gray-200 block">
                      {child.name}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {child.code}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-gray-300 group-hover:text-blue-500"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        // 2. Jika Tidak Punya Anak -> Tampilkan Tabel Aset (Inventory)
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Box size={18} /> Asset Inventory (
              {category.assets ? category.assets.length : 0})
            </h3>
            <button
              onClick={() => navigate("/assets/create")}
              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
            >
              + Add Asset
            </button>
          </div>

          {/* TABEL ASET */}
          {hasAssets ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase font-bold">
                  <tr>
                    <th className="px-6 py-3">Asset Tag</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {category.assets.map((asset) => (
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
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-purple-500" />
                          <span>{asset.location?.name || "-"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {asset.status && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                              asset.status.style
                            )}`}
                          >
                            {asset.status.name}
                          </span>
                        )}
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
            // Placeholder jika kosong
            <div className="p-12 text-center">
              <div className="inline-block p-4 bg-gray-100 rounded-full text-gray-400 mb-3">
                <Box size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No Assets Yet
              </h3>
              <p className="text-gray-500 mt-1 mb-4">
                You haven't registered any items under {category.name} yet.
              </p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
