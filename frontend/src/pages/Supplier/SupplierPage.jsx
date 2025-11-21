import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Layout from "../../components/Layout";
import SupplierFormModal from "../../components/suppliers/SupplierFormModal";
import {
  Plus,
  Trash2,
  Loader2,
  Truck,
  Phone,
  Mail,
  User,
  Pencil,
  Search,
} from "lucide-react";
import Pagination from "../../components/common/Pagination";

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meta, setMeta] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuppliers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, page]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        search: search,
      };

      const response = await api.get("/api/suppliers", { params });
      setSuppliers(response.data.data.data);
      setMeta(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create Modal
  const handleCreate = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  // Edit Modal
  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;
    try {
      await api.delete(`api/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      alert("Failed", err);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Suppliers
          </h1>
          <p className="text-sm text-gray-500">Manage vendors and contacts</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search suppliers..."
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus size={18} /> <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase font-bold">
              <tr>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Contact Person</th>
                <th className="px-6 py-3">Contact Info</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <Loader2 className="animate-spin inline mr-2" /> Loading...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                suppliers.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Truck size={16} className="text-blue-500" />{" "}
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                        {item.address || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.contact_person ? (
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />{" "}
                          {item.contact_person}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      {item.phone && (
                        <div className="flex items-center gap-2 text-xs">
                          <Phone size={12} className="text-green-500" />{" "}
                          {item.phone}
                        </div>
                      )}
                      {item.email && (
                        <div className="flex items-center gap-2 text-xs">
                          <Mail size={12} className="text-orange-500" />{" "}
                          {item.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(item)} 
                        className="text-yellow-500 hover:text-yellow-600 p-1 hover:bg-yellow-50 rounded"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
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

      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSuppliers}
        supplierToEdit={selectedSupplier}
      />
    </Layout>
  );
}
