import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../../components/Layout";
import api from "../../lib/axios";
import QRCode from "react-qr-code";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  Box,
  MapPin,
  Tag,
  Truck,
  Calendar,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";

export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAsset();
  }, [id]);

  const fetchAsset = async () => {
    try {
      const response = await api.get(`/api/assets/${id}`);
      setAsset(response.data.data);
    } catch (error) {
      console.error(error);
      navigate("/assets");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      await api.delete(`/api/assets/${id}`);
      navigate("/assets");
    } catch (err) {
      alert("Failed to delete asset.", err);
    }
  };

  // Helper Warna Status
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

  // Helper Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Helper Format Lokasi Hirarki
  //   const getLocationString = (loc) => {
  //     if (!loc) return "-";
  //     let str = loc.name;
  //     if (loc.parent) {
  //       str += ` (in ${loc.parent.name})`;
  //     }
  //     return str;
  //   };

  if (loading)
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      </Layout>
    );
  if (!asset) return null;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button
            onClick={() => navigate("/assets")}
            className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-2 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Asset List
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 flex-wrap">
            {asset.name}
            {asset.status && (
              <span
                className={`text-sm px-3 py-1 rounded-full border ${getStatusColor(
                  asset.status.style
                )}`}
              >
                {asset.status.name}
              </span>
            )}
          </h1>
          <p className="text-gray-500 font-mono mt-1 text-lg tracking-wide">
            {asset.code}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/assets/${asset.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Pencil size={16} /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">

        <div className="space-y-6">
          {/* Asset Image */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="aspect-square bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center relative border border-gray-100 dark:border-gray-700">
              {asset.image_path ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}/storage/${
                    asset.image_path
                  }`}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                  <span className="text-sm">No Image Available</span>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Generator */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">
              Asset Tag QR
            </h3>
            <div className="p-4 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <QRCode
                value={asset.code} 
                size={140}
                level="H"
              />
            </div>
            <p className="text-lg font-bold text-gray-800 dark:text-white mt-4 font-mono tracking-wide">
              {asset.code}
            </p>
            <p className="text-xs text-gray-400">Scan to view details</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Box size={18} className="text-blue-500" /> General Information
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Category
                </label>
                <div className="font-medium text-gray-900 dark:text-white mt-1">
                  {asset.category?.name}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {asset.category?.code}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Serial Number
                </label>
                <div className="font-medium text-gray-900 dark:text-white mt-1 uppercase">
                  {asset.serial_number || "-"}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Description / Specs
                </label>
                <p className="text-gray-700 dark:text-gray-300 mt-1 leading-relaxed bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-sm">
                  {asset.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          {/* Location & Supplier */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <MapPin size={18} className="text-purple-500" /> Location &
                Origin
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Current Location
                </label>
                <div className="flex items-start gap-3 mt-2">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {asset.location?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {asset.location?.parent
                        ? `in ${asset.location.parent.name}`
                        : ""}
                      {asset.location?.parent?.parent
                        ? `, ${asset.location.parent.parent.name}`
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Supplier / Vendor
                </label>
                <div className="flex items-start gap-3 mt-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Truck size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {asset.supplier?.name || "-"}
                    </div>
                    {asset.supplier && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {asset.supplier.contact_person} • {asset.supplier.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <DollarSign size={18} className="text-green-600" /> Financial
                Details
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Purchase Date
                </label>
                <div className="font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  {asset.purchase_date || "-"}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Price
                </label>
                <div className="font-bold text-green-600 mt-1 text-lg">
                  {asset.purchase_price
                    ? formatRupiah(asset.purchase_price)
                    : "-"}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Useful Life
                </label>
                <div className="font-medium text-gray-900 dark:text-white mt-1">
                  {asset.useful_life ? `${asset.useful_life} Years` : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
