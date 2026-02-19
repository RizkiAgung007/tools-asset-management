import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../../components/Layout";
import { Service } from "../../lib/axios";
import {
  ArrowLeft,
  Building,
  Layers,
  MapPin,
  Box,
  Loader2,
  ChevronRight,
  Pencil,
  Users,
  Tag,
  Eye,
} from "lucide-react";
import QRCode from "react-qr-code";
import LocationEditModal from "../../components/locations/LocationEditModal";

export default function LocationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const response = await Service.locations.get(id);
      setLocation(response.data.data);
    } catch (err) {
      console.error(err);
      navigate("/locations");
    } finally {
      setLoading(false);
    }
  };

  // Helper badge statys color
  const getStatusColor = (style) => {
    switch (style) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "danger":
        return "bg-red-100 text-red-800 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      </Layout>
    );
  }

  if (!location) return null;

  const isBuilding = location.type === "building";
  const isFloor = location.type === "floor";
  const isRoom = location.type === "room";

  const descriptionLabel = isBuilding
    ? "Building Address"
    : "Notes / Description";
  const subLocationLabel = isBuilding
    ? "Floor List"
    : isFloor
      ? "Room List"
      : "Sub-Locations";

  const hasAssets = location.assets && location.assets.length > 0;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" /> Back
        </button>

        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link to="/locations" className="hover:text-blue-600">
            Locations
          </Link>
          {location.parent?.parent && (
            <>
              <ChevronRight size={14} className="mx-1" />
              <Link
                to={`/locations/${location.parent.parent.id}`}
                className="hover:text-blue-600"
              >
                {location.parent.parent.name}
              </Link>
            </>
          )}
          {location.parent && (
            <>
              <ChevronRight size={14} className="mx-1" />
              <Link
                to={`/locations/${location.parent.id}`}
                className="hover:text-blue-600"
              >
                {location.parent.name}
              </Link>
            </>
          )}
          <ChevronRight size={14} className="mx-1" />
          <span className="font-bold text-gray-800">{location.name}</span>
        </div>

        {/* Title & Edit Button */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-lg ${
                isBuilding
                  ? "bg-blue-100 text-blue-600"
                  : isFloor
                    ? "bg-purple-100 text-purple-600"
                    : "bg-green-100 text-green-600"
              }`}
            >
              {isBuilding && <Building size={32} />}
              {isFloor && <Layers size={32} />}
              {isRoom && <Box size={32} />}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {location.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs uppercase font-bold tracking-wider text-gray-500 border border-gray-300 px-2 py-0.5 rounded">
                  {location.type}
                </span>

                {/* Badge capacity */}
                {location.capacity && (
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1">
                    <Users size={12} /> Capacity: {location.capacity}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-colors"
          >
            <Pencil size={16} /> Edit Info
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Image & QR Code */}
        <div className="space-y-6">
          {/* Image Card */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative">
              {location.image_path ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}/storage/${
                    location.image_path
                  }`}
                  alt={location.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm">No Image Uploaded</span>
              )}
            </div>
          </div>

          {/* QR Code Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">
              Location QR Code
            </h3>
            <div className="p-2 bg-white rounded-lg border border-gray-100">
              <QRCode
                value={`LOC-${location.id}-${location.slug}`}
                size={128}
                level="H"
              />
            </div>
            <p className="text-xs text-gray-400 mt-3 font-mono">
              ID: LOC-{location.id}
            </p>
          </div>
        </div>

        {/* Info & Children */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Box */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">
              {descriptionLabel}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-lg">
              {isBuilding
                ? location.address || "No address provided."
                : location.description || "No notes provided."}
            </p>
          </div>

          {/* Sub-Locations List */}
          {!isRoom ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 dark:text-white">
                  {subLocationLabel}
                </h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                  Total: {location.children.length}
                </span>
              </div>

              {location.children.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {location.children.map((child) => (
                    <div
                      key={child.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors cursor-pointer"
                      onClick={() => navigate(`/locations/${child.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
                          {child.type === "floor" ? (
                            <Layers size={20} />
                          ) : (
                            <Box size={20} />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-gray-700 dark:text-gray-200 block">
                            {child.name}
                          </span>
                          {child.description && (
                            <span className="text-xs text-gray-400">
                              {child.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-400">
                  No {isBuilding ? "floors" : "rooms"} found here.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                <h3 className="flex items-center gap-4">
                  <Box size={18} /> Assets in this Room
                </h3>
                <button
                  onClick={() => navigate("/assets/create")}
                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
                >
                  + Add Asset
                </button>
              </div>

              {hasAssets ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 uppercase font-bold">
                      <tr>
                        <th className="px-6 py-3">Asset Tag</th>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3 text-center">Status</th>
                        <th className="px-6 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {location.assets.map((asset) => (
                        <tr
                          key={asset.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono font-bold text-blue-600">
                            {asset.code}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {asset.name}
                            <div className="text-xs text-gray-400 font-normal">
                              SN: {asset.serial_number || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <Tag size={14} className="text-orange-500" />
                              <span>{asset.category?.name || "-"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {asset.status && (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                                  asset.status.style,
                                )}`}
                              >
                                {asset.status.name}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => navigate(`/assets/${asset.id}`)}
                              className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="inline-block p-4 bg-gray-100 rounded-full text-gray-400 mb-3">
                    <Box size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Empty Room
                  </h3>
                  <p className="text-gray-500 mt-1 mb-4">
                    There are no assets assigned to this room yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <LocationEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        location={location}
        onSuccess={fetchDetail}
      />
    </Layout>
  );
}
