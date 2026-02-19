import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Service } from "../../lib/axios";
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
  Search,
  Plus,
  MapPin,
  Eye,
} from "lucide-react";
import CategoryFormModal from "../../components/categories/CategoryFormModal";
import Pagination from "../../components/common/Pagination";

export default function CategoryDetailPage() {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [children, setChildren] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loadingTable, setLoadingTable] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDetailCategory();
    setSearch("");
    setPage(1);
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTableChild();
    }, 500);

    return () => clearTimeout(timer);
  }, [id, search, page]);

  const fetchDetailCategory = async () => {
    setLoading(true);
    try {
      const response = await Service.categories.get(id);
      setCategory(response.data.data);
    } catch (err) {
      navigate("/categories", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableChild = async () => {
    setLoadingTable(true);
    try {
      const params = {
        page: page,
        search: search,
        parent_id: id,
      };

      const response = await Service.categories.list(params);
      setChildren(response.data.data.data || response.data.data);
      setMeta(response.data.data);
    } catch (err) {
      console.error(err);
      navigate("/categories");
    } finally {
      setLoadingTable(false);
    }
  };

  // Create Modal
  const handleCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  // Edit Modal
  const handleEditChild = (e, childCategory) => {
    e.stopPropagation();
    setSelectedCategory(childCategory);
    setIsModalOpen(true);
  };

  // Delete Modal
  const handleDeleteChild = async (e, childId) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Delete this sub-category? Items inside will lose their category.",
      )
    )
      return;

    try {
      await Service.categories.delete(childId)
      fetchTableChild();
    } catch (err) {
      alert("Failed to delete.", err);
    }
  };

  const handleSuccess = () => {
    fetchDetailCategory();
    fetchTableChild();
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

  //   const hasChildren = category.children && category.children.length > 0;
  const isParentCategory = category.children && category.children.length > 0;

  // Get statistical data from backend
  const stats = category.stats || {
    total_assets: 0,
    total_ready: 0,
    total_price: 0,
  };

  // Rupiah Format
  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

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
            Category
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
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
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
          <button
            onClick={() => {
              setSelectedCategory(category);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <Pencil size={16} /> Edit Parent
          </button>
        </div>
      </div>

      {/* Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <Box size={20} />{" "}
            <span className="text-sm font-medium uppercase">Total Assets</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.total_assets}{" "}
            <span className="text-sm font-normal text-gray-400">Items</span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <Hash size={20} />{" "}
            <span className="text-sm font-medium uppercase">Available</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {stats.total_ready}{" "}
            <span className="text-sm font-normal text-gray-400">Ready</span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <DollarSign size={20} />{" "}
            <span className="text-sm font-medium uppercase">Total Value</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {formatRupiah(stats.total_price)}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Bar & Add New */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search ${category.name}...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
            />
          </div>

          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Category Content */}
      {isParentCategory ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Layers size={18} /> Sub-Categories
            </h3>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {loadingTable ? (
              <div className="p-8 text-center text-gray-500">
                <Loader2 className="animate-spin inline mr-2" /> Loading
                sub-categories...
              </div>
            ) : children.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                {search
                  ? `No results found for "${search}"`
                  : "No sub-categories found."}
                {!search && (
                  <button
                    onClick={handleCreate}
                    className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Add Sub-Category Manually
                  </button>
                )}
              </div>
            ) : (
              children.map((child) => (
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
                        CODE: {child.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleEditChild(e, child)}
                      className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteChild(e, child.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={18} className="text-gray-300" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Box size={18} /> Asset Inventory ({category.assets?.length || 0})
            </h3>
            <button
              onClick={() => navigate("/assets/create")}
              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors shadow-sm"
            >
              + Register Asset
            </button>
          </div>

          {category.assets && category.assets.length > 0 ? (
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
                        {asset.status ? (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
                            {asset.status.name}
                          </span>
                        ) : (
                          "-"
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
            // Placeholder for no assets
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

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        categoryToEdit={selectedCategory}
      />
    </Layout>
  );
}
