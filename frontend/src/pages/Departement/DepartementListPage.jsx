import React, { useEffect, useState } from "react";
import { Service } from "../../lib/axios";
import Layout from "../../components/Layout";
import { Building2, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

export default function DepartementListPage() {
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    fetchDepartements();
  }, []);

  const fetchDepartements = async () => {
    setLoading(true);
    try {
      const response = await Service.departments.list();
      setDepartements(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditId(dept.id);
      setFormData({ name: dept.name });
    } else {
      setEditId(null);
      setFormData({ name: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ name: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editId) {
        await Service.departments.update(editId, formData);
      } else {
        await Service.departments.create(formData);
      }
      fetchDepartements();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save departement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this departement?"))
      return;

    try {
      await Service.departments.delete(id);
      fetchDepartements();
    } catch (err) {
      console.error(err);
      alert("Failed to delete departement.");
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Building2 /> Departments
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage company divisions</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} /> Add Department
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase font-bold text-xs">
            <tr>
              <th className="px-6 py-4">Department Name</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan="2" className="px-6 py-8 text-center">
                  <Loader2 className="animate-spin inline mr-2 text-blue-600" />{" "}
                  Loading...
                </td>
              </tr>
            ) : departements.length === 0 ? (
              <tr>
                <td colSpan="2" className="px-6 py-8 text-center text-gray-500">
                  No Departments found.
                </td>
              </tr>
            ) : (
              departements.map((dept) => (
                <tr
                  key={dept.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {dept.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => handleOpenModal(dept)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-600 rounded"
                      >
                        <Pencil />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-gray-600 rounded"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {editId ? "Edit Department" : "Add Department"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="eg. IT & Technology"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={isSubmitting}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
