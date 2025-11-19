import { useEffect, useState } from "react";
import Modal from "../common/Modal";
import api from "../../lib/axios";
import { Loader2, Mail, MapPin, Phone, User } from "lucide-react";

export default function SupplierFormModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Reset Form
  useEffect(() => {
    if (isOpen) {
      setForm({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
      });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post("/api/suppliers", form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper update state form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none transition-all pl-10";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add new Vendor">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm border-red-200">
            {error}
          </div>
        )}

        {/* Compant Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Company Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            autoFocus
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
            placeholder="Ex: PT. Jaya Printer"
          />
        </div>

        {/* Contact Person */}
        <div className="relative">
          <User className="absolute left-3 top-9 text-gray-400" size={18} />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contact Person
          </label>
          <input
            type="text"
            name="contact_person"
            value={form.contact_person}
            onChange={handleChange}
            required
            autoFocus
            className={inputClass}
            placeholder="Ex: Mr. Gunawan"
          />
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <Phone className="absolute left-3 top-9 text-gray-400" size={18} />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              autoFocus
              className={inputClass}
              placeholder="081X-XXXX-XXXX"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-9 text-gray-400" size={18} />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
              className={inputClass}
              placeholder="Your@mail.com"
            />
          </div>
        </div>

        {/* Address */}
        <div className="relative">
          <MapPin className="absolute left-3 top-9 text-gray-400" size={18} />
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Address
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            autoFocus
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pl-10 h-20 resize-none dark:bg-gray-700 dark:text-white"
            placeholder="Office address.."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Save Structure"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
