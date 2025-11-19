import { useState } from "react";
import Modal from "../common/Modal";
import api from "../../lib/axios";
import { Loader2 } from "lucide-react";

export default function StatusFormModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [style, setStyle] = useState("secondary");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post("/api/asset-status", { name, style });
      setName("");
      setStyle("secondary");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none transition-all";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Asset Status">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Input Status Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Ex: Ready to Use"
            required
            autoFocus
          />
        </div>

        {/* Color Badge */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Badge Color
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                val: "success",
                label: "Green (Good)",
                color: "bg-green-100 text-green-800 border-green-200",
              },
              {
                val: "danger",
                label: "Red (Bad)",
                color: "bg-red-100 text-red-800 border-red-200",
              },
              {
                val: "warning",
                label: "Yellow (Warning)",
                color: "bg-yellow-100 text-yellow-800 border-yellow-200",
              },
              {
                val: "info",
                label: "Blue (Info)",
                color: "bg-blue-100 text-blue-800 border-blue-200",
              },
              {
                val: "secondary",
                label: "Gray (Default)",
                color: "bg-gray-100 text-gray-800 border-gray-200",
              },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setStyle(opt.val)}
                className={`text-xs font-bold px-2 py-2 rounded border transition-all 
                                    ${
                                      style === opt.val
                                        ? "ring-2 ring-offset-1 ring-blue-500"
                                        : "opacity-60 hover:opacity-100"
                                    }
                                    ${opt.color}
                                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Save Status"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
