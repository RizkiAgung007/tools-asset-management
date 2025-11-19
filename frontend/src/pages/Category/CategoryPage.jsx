import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/axios";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import CategoryFromModal from "../../components/categories/CategoryFormModal";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/categories");
      setCategories(response.data.data.data);
    } catch (err) {
      console.error("failed to retrieve data:", err);
    } finally {
      setLoading(false);
    }
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
          onClick={() => setIsModalOpen(true)}
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
              <th className="px-6 py-3">No</th>
              <th className="px-6 py-3">Nama Kategori</th>
              <th className="px-6 py-3">Slug</th>
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
                <td colSpan="4" className="px-6 py-3 text-center">
                  No data yet
                </td>
              </tr>
            ) : (
              categories.map((cat, index) => (
                <tr
                  key={cat.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 font-medium">{index + 1}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 italic text-gray-500">{cat.slug}</td>
                  <td className="px-6 py-4 flex justify-center gap-3">
                    <button className="text-yellow-500 hover:text-yellow-600">
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-red-500 hover:text-red-600"
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
      />
    </Layout>
  );
}
