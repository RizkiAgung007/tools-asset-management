import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import api from "../../lib/axios";
import { Loader2 } from "lucide-react";

export default function LocationFormModal({ isOpen, onClose, onSuccess }) {
  const [buildingName, setBuildingName] = useState("");
  const [address, setAddress] = useState(""); // State untuk Alamat Gedung
  const [floorName, setFloorName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setBuildingName("");
      setAddress("");
      setFloorName("");
      setRoomName("");
      setDescription("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post("/api/locations/hierarchy", {
        building_name: buildingName,
        address: address,
        floor_name: floorName,
        room_name: roomName,
        description: description,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "System error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none transition-all";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Complete Location">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Building */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 space-y-3">
          <h4 className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase tracking-wider">
            Building Details
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Building Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              className={inputClass}
              placeholder="Ex: Headquarter Tower"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`${inputClass} h-16 resize-none`}
              placeholder="Ex: Jl. Sudirman No. 1"
            />
          </div>
        </div>

        {/* Floor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Floor Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={floorName}
            onChange={(e) => setFloorName(e.target.value)}
            className={inputClass}
            placeholder="Ex: 1st Floor"
            required
          />
        </div>

        {/* Room */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 space-y-3">
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Room Details
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Room Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className={inputClass}
              placeholder="Ex: Meeting Room A"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes / Landmark
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              placeholder="Ex: Near the pantry"
            />
          </div>
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
