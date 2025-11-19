import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Layout from "../../components/Layout";
import SupplierFormModal from "../../components/suppliers/SupplierFormModal";
import { Plus, Trash2, Loader2, Truck, Phone, Mail, User } from "lucide-react";

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get("/api/suppliers");
      setSuppliers(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Suppliers / Vendors
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} /> <span>Add Supplier</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
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
                <td colSpan="5" className="px-6 py-8 text-center">
                  <Loader2 className="animate-spin inline mr-2" /> Loading...
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center">
                  No data.
                </td>
              </tr>
            ) : (
              suppliers.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Truck size={16} className="text-blue-500" /> {item.name}
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
                  <td className="px-6 py-4 text-center">
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

      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSuppliers}
      />
    </Layout>
  );
}
