import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Modal from "../common/Modal";
import { Loader2 } from "lucide-react";

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  categoryToEdit,
}) {
  // State Form
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [usefulLife, setUsefulLife] = useState("");
  const [parentId, setParentId] = useState("");

  // State Data Dropdown (INI PENTING: Pisahkan data parents dengan parentId)
  const [parents, setParents] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data untuk dropdown saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      fetchParents();

      if (categoryToEdit) {
        // MODE EDIT: Isi form dengan data lama
        setFormName(categoryToEdit.name);
        setFormCode(categoryToEdit.code);
        setUsefulLife(categoryToEdit.useful_life || "");
        setParentId(categoryToEdit.parent_id || ""); // Pastikan ini ID (angka/string), bukan object
      } else {
        // MODE CREATE: Kosongkan
        setFormName("");
        setFormCode("");
        setUsefulLife("");
        setParentId("");
      }
      setError(null);
    }
  }, [isOpen, categoryToEdit]);

  const fetchParents = async () => {
    try {
      const response = await api.get("/api/categories");
      // Handle struktur response (sesuaikan dengan backend)
      const list = response.data.data.data || response.data.data;

      // Filter: Cegah kategori memilih dirinya sendiri sebagai bapak
      const filtered = list.filter((c) => c.id !== categoryToEdit?.id);

      // PERBAIKAN UTAMA: Simpan list ke state 'parents', BUKAN 'parentId'
      setParents(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: formName,
      code: formCode,
      useful_life: usefulLife,
      parent_id: parentId || null, // Kirim null jika kosong
    };

    try {
      if (categoryToEdit) {
        // UPDATE
        await api.put(`/api/categories/${categoryToEdit.id}`, payload);
      } else {
        // CREATE
        await api.post("/api/categories", payload);
      }

      onSuccess(); // Refresh data di parent page
      onClose(); // Tutup modal
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("A system error occurred. Check console for details.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none transition-all";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? "Edit Category" : "Add Category"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {/* Code */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formCode || ""}
              onChange={(e) => setFormCode(e.target.value.toUpperCase())}
              className={inputClass}
              placeholder="Ex: LAP"
              required
              maxLength={5}
            />
          </div>

          {/* Parent Category Dropdown */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Parent Category
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className={inputClass}
            >
              <option value="">-- No Parent (Root) --</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Useful Life */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Useful Life (Years)
          </label>
          <input
            type="number"
            value={usefulLife || ""}
            onChange={(e) => setUsefulLife(e.target.value)}
            className={inputClass}
            placeholder="Ex: 4"
            min="0"
          />
          <p className="text-xs text-gray-400 mt-1">
            Standard: Laptop (4), Furniture (8)
          </p>
        </div>

        {/* Name Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formName || ""}
            onChange={(e) => setFormName(e.target.value)}
            className={inputClass}
            placeholder="Ex: Laptop & PC"
            required
          />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : categoryToEdit ? (
              "Update Changes"
            ) : (
              "Save Category"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
