import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../lib/axios";
import Layout from "../../components/Layout";
import {
  ArrowLeft,
  Folder,
  Box,
  Hash,
  DollarSign,
  Loader2,
  ChevronRight,
  Clock,
  Layers,
  Pencil,
  Trash2,
} from "lucide-react";
import CategoryFormModal from "../../components/categories/CategoryFormModal";

export default function CategoryDetailPage() {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDetailCategory();
  }, [id]);

  const fetchDetailCategory = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/categories/${id}`);
      setCategory(response.data.data);
    } catch (err) {
      console.error(err);
      navigate("/categories");
    } finally {
      setLoading(false);
    }
  };

  const handleEditChild = (e, childCategory) => {
    e.stopPropagation();
    setSelectedCategory(childCategory);
    setIsModalOpen(true);
  };

  const handleDeleteChild = async (e, childId) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Delete this sub-category? Items inside will lose their category."
      )
    )
      return;

    try {
      await api.delete(`/api/categories/${childId}`);
      fetchDetailCategory();
    } catch (err) {
      alert("Failed to delete.", err);
    }
  };

  const handleSuccess = () => {
    fetchDetailCategory();
    setLoading(true);
  };

  if (loading)
    return (
      <Layout>
        <div className="flex h-screen justify-center items-center">
          <Loader2 className="animate-spin text-blue-600" />
        </div>
      </Layout>
    );

  if (!category) return null;

  const hasChildren = category.children && category.children.length > 0;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/categories")}
          className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" /> Back
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center  text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors">
          <Link to="/categories" className="hover:text-blue-600">
            Root
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

        {/* Title */}
        <div className="flex items-center gap-4">
          <div className="p-4 bg-orange-100 text-orange-600 rounded-xl">
            <Folder size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {category.name}
            </h1>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                CODE: {category.code || "-"}
              </span>

              {category.useful_life && (
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded">
                  <Clock size={12} /> Life: {category.useful_life} Years
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistic Cards (Mockup Data dulu karena tabel Aset belum ada) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <Box size={20} />{" "}
            <span className="text-sm font-medium uppercase">Total Assets</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            0 <span className="text-sm font-normal text-gray-400">Items</span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <Hash size={20} />{" "}
            <span className="text-sm font-medium uppercase">Available</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            0 <span className="text-sm font-normal text-gray-400">Ready</span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <DollarSign size={20} />{" "}
            <span className="text-sm font-medium uppercase">Total Value</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">Rp 0</p>
        </div>
      </div>

      {/* Category Content */}
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
                onClick={() => navigate(`/categories/${child.id}`)} // Drill down
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
                      CODE: {child.code}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleEditChild(e, child)}
                    className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                    title="Edit Sub-Category"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteChild(e, child.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Sub-Category"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Box size={18} /> Asset Inventory List
            </h3>
            <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
              + Register Asset
            </button>
          </div>

          {/* Placeholder Asset Table (Nanti gati sama data asli) */}
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
        </div>
      )}

      <CategoryFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        categoryToEdit={selectedCategory}
      />
    </Layout>
  );
}
