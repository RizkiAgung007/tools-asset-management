import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { Service } from "../../lib/axios";
import {
  Building2,
  Loader2,
  Pencil,
  Plus,
  Shield,
  Trash2,
  X,
} from "lucide-react";

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department_id: "",
    unit_id: "",
    manager_id: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [userRes, deptRes, unitRes] = await Promise.all([
        Service.users.list(),
        Service.departments.list(),
        Service.units.list(),
      ]);
      setUsers(userRes.data.data || userRes.data.data.data);
      setDepartments(deptRes.data.data);
      setUnits(unitRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditId(user.id);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id || "",
        unit_id: user.unit_id || "",
        manager_id: user.manager_id || "",
        password: "",
      });
    } else {
      setEditId(null);
      setFormData({
        name: "",
        email: "",
        role: "staff",
        department_id: "",
        unit_id: "",
        manager_id: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        unit_id: formData.unit_id || null,
        manager_id: formData.manager_id || null,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editId) {
        await Service.users.update(editId, payload);
      } else {
        await Service.users.create(payload);
      }

      fetchUsers();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus user ini?")) return;

    try {
      await Service.users.delete(id);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  // filter dropdown
  const filterResults = units.filter(
    (unit) =>
      unit.department_id.toString() === formData.department_id.toString(),
  );

  // filter manager / head
  const managerResults = users.filter((user) => user.id !== editId);

  const inputClass =
    "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white";

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            User & Employee
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage system access and organization structure
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Organization</th>
                <th className="px-6 py-4">Head</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <Loader2 className="animate-spin inline mr-2 text-blue-600" />{" "}
                    Loading ...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-bold border uppercase flex items-center w-fit gap-1
                        ${
                          user.role === "superadmin"
                            ? "bg-purple-100 text-purple-700 border-purple-200"
                            : user.role === "vp" || user.role === "head"
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : user.role === "ga"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        <Shield size={12} /> {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {user.unit ? (
                        <div>
                          <div className="font-bold text-gray-800 dark:text-gray-200">
                            {user.unit?.name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Building2 size={12} />{" "}
                            {user.unit?.department?.name}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 items-baseline">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {user.manager ? (
                        <div className="text-sm font-medium">
                          {user.manager.name}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-600 rounded"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-gray-600 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {editId ? "Edit User" : "Add New User"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Password{" "}
                    {editId ? (
                      <span className="text-xs font-normal text-gray-400">
                        (Leave blank to keep current password)
                      </span>
                    ) : (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <input
                    type="password"
                    required={!editId}
                    minLength={6}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className={`${inputClass} uppercase`}
                  >
                    <option value="staff">Staff</option>
                    <option value="head">Head</option>
                    <option value="vp">VP</option>
                    <option value="ga">GA</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>

                <div className="col-span-2 mt-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <h4 className="font-bold text-sm text-gray-500 uppercase mb-3">
                    Oraganization Info
                  </h4>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.department_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department_id: e.target.value,
                        unit_id: "",
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.unit_id}
                    onChange={(e) =>
                      setFormData({ ...formData, unit_id: e.target.value })
                    }
                    disabled={!formData.department_id}
                    className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  >
                    <option value="">Select Unit</option>
                    {filterResults.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Head
                  </label>
                  <select
                    required
                    value={formData.manager_id}
                    onChange={(e) =>
                      setFormData({ ...formData, manager_id: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="">Select Head</option>
                    {managerResults.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Used for system approval flow
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-white bg-red-500 hover:bg-red-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={16} />
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
