import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { Service } from "../../lib/axios";
import { Plus, Building, Trash2, Loader2, Eye } from "lucide-react";
import LocationFormModal from "../../components/locations/LocationFormModal";

export default function LocationPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();

  const fetchLocations = async () => {
    try {
      const response = await Service.locations.list({type: 'building'})
      setLocations(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleShowDetail = (id) => {
    navigate(`/locations/${id}`);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Delete this location? Child data will also be deleted.")
    )
      return;
    try {
      await Service.locations.delete(id)
      fetchLocations();
    } catch (err) {
      alert("Failed to delete", err);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Location Data
        </h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} />
          <span>Add Location</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase font-bold">
            <tr>
              <th className="px-6 py-3">Building Name</th>
              <th className="px-6 py-3">Address</th>
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
            ) : locations.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center">
                  No location data found.
                </td>
              </tr>
            ) : (
              locations.map((loc) => (
                <tr
                  key={loc.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {/* Building Name */}
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600">
                      <Building size={20} />
                    </div>
                    {loc.name}
                  </td>

                  {/* Address */}
                  <td className="px-6 py-4 truncate max-w-xs text-gray-500">
                    {loc.address || "-"}
                  </td>

                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleShowDetail(loc.id)}
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                      title="View Floors & Rooms"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(loc.id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                      title="Delete Building"
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

      <LocationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchLocations}
      />
    </Layout>
  );
}
