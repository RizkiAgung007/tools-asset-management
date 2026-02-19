import { useEffect, useState } from "react";
import { Service } from "../../lib/axios";
import Modal from "../common/Modal";
import { Loader2 } from "lucide-react";

export default function CategoryFromModal({
  isOpen,
  onClose,
  onSuccess,
  categoryToEdit,
}) {
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [usefulLife, setUsefulLife] = useState("");
  const [parents, setParents] = useState([]);
  const [parentId, setParentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchParents();

      if (categoryToEdit) {
        setFormName(categoryToEdit.name);
        setFormCode(categoryToEdit.code);
        setUsefulLife(categoryToEdit.useful_life);
        setParentId(categoryToEdit.parent_id);
      } else {
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
      const response = await Service.categories.list();
      const list = response.data.data.data || response.data.data;

      const filtered = list.filter((c) => c.id !== categoryToEdit?.id);
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
      parent_id: parentId || null,
    };

    try {
      if (categoryToEdit) {
        await Service.categories.update(categoryToEdit.id, payload);
      } else {
        await Service.categories.create(payload);
      }

      setFormName("");
      setFormCode("");
      setUsefulLife("");
      setParentId("");

      onSuccess();
      onClose();
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("A system error occurred");
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

        {/* Code */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Code <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="formCode"
              value={formCode || ""}
              onChange={(e) => setFormCode(e.target.value.toUpperCase())}
              className={inputClass}
              placeholder="Ex: LAP"
              required
              autoFocus
              maxLength={5}
            />
          </div>
        </div>

        {/* Parent Category Dropdown */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Parent Category
          </label>

          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className={inputClass}
          >
            <option>Choose Parent</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Useful Life */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Useful Life
          </label>

          <input
            type="number"
            name="usefulLife"
            value={usefulLife || ""}
            onChange={(e) => setUsefulLife(e.target.value)}
            className={inputClass}
            placeholder="Ex: 1"
            required
            autoFocus
            min="1"
          />
          <p className="text-xs text-gray-400 mt-1">
            Standard: Laptop (4), Furniture (8)
          </p>
        </div>

        {/* Name Category */}
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Name Category
          </label>

          <input
            type="text"
            value={formName || ""}
            onChange={(e) => setFormName(e.target.value)}
            className={inputClass}
            placeholder="Ex: Laptop & PC"
            required
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
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
