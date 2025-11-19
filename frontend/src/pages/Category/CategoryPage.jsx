import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/axios";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  Folder,
  Layers,
} from "lucide-react";
import CategoryFromModal from "../../components/categories/CategoryFormModal";
import { useNavigate } from "react-router-dom";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/categories");
      setCategories(response.data.data.data || response.data.data);
    } catch (err) {
      console.error("failed to retrieve data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create Modal
  const handleCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  // Edit Modal
  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  // View Modal
  const handleShowDetail = (id) => {
    navigate(`/categories/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus kategori ini?")) return;
    try {
      await api.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert("Gagal menghapus.", err);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Kategori Asset
        </h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          <span>Add</span>
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase font-bold">
            <tr>
              <th className="px-6 py-3 w-12 text-center">No</th>
              <th className="px-6 py-3 text-center">Category Name</th> 
              <th className="px-6 py-3 text-center">Category Code</th> 
              <th className="px-6 py-3 text-center">Sub-Categories</th>
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
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No root categories found.
                </td>
              </tr>
            ) : (
              categories.map((cat, index) => (
                <tr
                  key={cat.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {/* No */}
                  <td className="px-6 py-4 font-medium text-center">{index + 1}</td>

                  {/* Name */}
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white flex items-center justify-center text-center gap-3">
                    <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                      <Folder size={18} />
                    </div>
                    {cat.name}
                  </td>

                  {/* Code */}
                  <td className="px-6 py-4 text-center">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                      {cat.code || "-"}
                    </span>
                  </td>

                  {/* Child Count */}
                  <td className="px-6 py-4 text-center">
                    {cat.children_count > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Layers size={12} /> {cat.children_count}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs italic">None</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleShowDetail(cat.id)}
                      className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                      title="View Details (Drill Down)"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-1 text-yellow-500 hover:bg-yellow-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
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

      <CategoryFromModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCategories}
        categoryToEdit={selectedCategory}
      />
    </Layout>
  );
}
