import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import api from "../../lib/axios";
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  Image as ImageIcon,
  Box,
  MapPin,
  Tag,
  Truck,
  Calendar,
  DollarSign,
  FileText,
  Hash,
  ChevronDown,
  FolderTree,
  Building,
  Layers,
} from "lucide-react";

export default function AssetFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // const [locations, setLocations] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    location_id: "",
    asset_status_id: "",
    supplier_id: "",
    purchase_date: "",
    purchase_price: "",
    serial_number: "",
    description: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [catRes, buildRes, statRes, supRes] = await Promise.all([
          api.get("/api/categories?per_page=100&only_children=true"),
          api.get("/api/locations?type=building"),
          api.get("/api/asset-status"),
          api.get("/api/suppliers?per_page=100"),
        ]);

        setCategories(catRes.data.data.data || catRes.data.data);
        setBuildings(buildRes.data.data);
        setStatuses(statRes.data.data);
        setSuppliers(supRes.data.data.data || supRes.data.data);

        if (isEditMode) {
          const assetRes = await api.get(`/api/assets/${id}`);
          const data = assetRes.data.data;

          const loc = data.locations;

          if (loc) {
            if (loc.type === "room" && loc.parent && loc.parent.parent) {
              setSelectedBuilding(loc.parent.parent.id);
              await fetchFloors(loc.parent.parent.id);

              setSelectedFloor(loc.parent.id);
              await fetchRooms(loc.parent.id);
            } else if (loc.type === "floor" && loc.parent) {
              setSelectedBuilding(loc.parent.id);
              await fetchFloors(loc.parent.id);
              setSelectedFloor(loc.id);
            } else if (loc.type === "building") {
              setSelectedBuilding(loc.id);
            }
          }

          setForm({
            name: data.name,
            category_id: data.category_id,
            location_id: data.location_id,
            asset_status_id: data.asset_status_id,
            supplier_id: data.supplier_id || "",
            purchase_date: data.purchase_date || "",
            purchase_price: data.purchase_price || "",
            serial_number: data.serial_number || "",
            description: data.description || "",
            image: null,
          });

          if (data.image_path) {
            setPreview(
              `${import.meta.env.VITE_API_URL}/storage/${data.image_path}`
            );
          }
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode]);

  const fetchFloors = async (buildingId) => {
    try {
      const res = await api.get(
        `/api/locations?type=floor&parent_id=${buildingId}`
      );
      setFloors(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRooms = async (floorId) => {
    try {
      const res = await api.get(
        `/api/locations?type=room&parent_id=${floorId}`
      );
      setRooms(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBuildingChange = (e) => {
    const buildId = e.target.value;
    setSelectedBuilding(buildId);

    setSelectedFloor("");
    setRooms([]);
    setForm((prev) => ({ ...prev, location_id: buildId }));

    if (buildId) fetchFloors(buildId);
    else setFloors([]);
  };

  const handleFloorChange = (e) => {
    const floorId = e.target.value;
    setSelectedFloor(floorId);

    setForm((prev) => ({ ...prev, location_id: floorId }));

    if (floorId) fetchRooms(floorId);
    else setRooms([]);
  };

  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    setForm((prev) => ({ ...prev, location_id: roomId || selectedFloor }));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null && key !== "image") {
        formData.append(key, form[key]);
      }
    });
    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      if (isEditMode) {
        formData.append("_method", "PUT");
        await api.post(`/api/assets/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/assets", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      navigate("/assets");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Terjadi kesalahan saat menyimpan."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper Format Lokasi (Gedung > Lantai > Ruang)
  // const getLocationLabel = (l) => {
  //   if (l.type === "floor" && l.parent) {
  //     return `${l.parent.name} > ${l.name}`;
  //   }
  //   if (l.type === "room" && l.parent) {
  //     const grandParent = l.parent.parent ? `${l.parent.parent.name} > ` : "";
  //     return `${grandParent}${l.parent.name} > ${l.name}`;
  //   }
  //   return `${l.name} (${l.type})`;
  // };

  // Helper Format Kategori (Induk > Anak)
  const getCategoryLabel = (c) => {
    if (c.parent) {
      return `${c.parent.name} > ${c.name} (${c.code})`;
    }
    return `${c.name} (${c.code})`;
  };

  // Styling
  const labelClass =
    "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";
  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors";
  const sectionTitleClass =
    "text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4";

  if (loading)
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="w-full mx-auto pb-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/assets")}
            className="flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Asset List
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? "Edit Asset Details" : "Register New Asset"}
            </h1>
            <p className="text-sm text-gray-500">
              Fill in the information below
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden"
        >
          {error && (
            <div className="bg-red-50 text-red-600 p-4 border-b border-red-100 text-center font-medium">
              {error}
            </div>
          )}

          <div className="p-8 space-y-8">
            {/* SECTION 1: IDENTITY */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <label className={labelClass}>Asset Image</label>
                <div className="relative group">
                  <div
                    className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl h-64 w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 overflow-hidden transition-colors hover:border-blue-400 ${
                      preview ? "border-solid border-blue-200" : ""
                    }`}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <div className="bg-blue-50 p-3 rounded-full inline-block mb-3">
                          <ImageIcon size={24} className="text-blue-500" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                          Upload Photo
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG up to 2MB
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />

                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-white font-medium flex items-center gap-2">
                        <Upload size={16} /> Change
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-5">
                <div>
                  <label className={labelClass}>
                    Asset Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FileText size={18} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={`${inputClass} pl-10`}
                      placeholder="e.g. MacBook Pro M2 2023"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Serial Number (Factory SN)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Hash size={18} />
                    </div>
                    <input
                      type="text"
                      name="serial_number"
                      value={form.serial_number}
                      onChange={handleChange}
                      className={`${inputClass} pl-10`}
                      placeholder="e.g. C02XXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Description / Notes</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className={inputClass}
                    placeholder="Add any additional details here..."
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* SECTION 2: CLASSIFICATION & LOCATION */}
            <div>
              <h3 className={sectionTitleClass}>
                <Box size={20} className="text-blue-600" /> Classification &
                Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <label className={labelClass}>
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FolderTree size={18} />
                    </div>
                    <select
                      name="category_id"
                      value={form.category_id}
                      onChange={handleChange}
                      className={`${inputClass} pl-10 pr-10 appearance-none`}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {getCategoryLabel(c)}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className={labelClass}>
                    Current Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Tag size={18} />
                    </div>
                    <select
                      name="asset_status_id"
                      value={form.asset_status_id}
                      onChange={handleChange}
                      className={`${inputClass} pl-10 pr-10 appearance-none`}
                      required
                    >
                      <option value="">Select Status</option>
                      {statuses.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  {/* Building */}
                  <div>
                    <label className={labelClass}>
                      Building <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                        <Building size={18} />
                      </div>
                      <select
                        value={selectedBuilding}
                        onChange={handleBuildingChange}
                        className={`${inputClass} pl-10 pr-10 appearance-none`}
                        required
                      >
                        <option value="">Select Building</option>
                        {buildings.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Floor */}
                  <div>
                    <label className={labelClass}>
                      Floor <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                        <Layers size={18} />
                      </div>
                      <select
                        value={selectedFloor}
                        onChange={handleFloorChange}
                        className={`${inputClass} pl-10 pr-10 appearance-none`}
                        required
                      >
                        <option value="">Select Floor</option>
                        {floors.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Room */}
                  <div>
                    <label className={labelClass}>
                      Room <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                        <MapPin size={18} />
                      </div>
                      <select
                        name="location_id"
                        value={
                          form.location_id === selectedFloor ||
                          form.location_id === selectedBuilding
                            ? ""
                            : form.location_id
                        }
                        onChange={handleRoomChange}
                        disabled={!selectedFloor}
                        className={`${inputClass} pl-10 pr-10 appearance-none disabled:opacity-50`}
                      >
                        <option value="">Select Room</option>
                        {rooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-3 text-xs text-gray-500 italic text-right">
                    * Item location will be set to:
                    <span className="font-bold ml-1 text-blue-600">
                      {rooms.find((r) => r.id == form.location_id)?.name ||
                        floors.find((f) => f.id == form.location_id)?.name ||
                        buildings.find((b) => b.id == form.location_id)?.name ||
                        "None"}
                    </span>
                  </div>
                </div>

                {/* Supplier */}
                <div>
                  <label className={labelClass}>Supplier / Vendor</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Truck size={18} />
                    </div>
                    <select
                      name="supplier_id"
                      value={form.supplier_id}
                      onChange={handleChange}
                      className={`${inputClass} pl-10 pr-10 appearance-none`}
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* SECTION 3: FINANCIAL */}
            <div>
              <h3 className={sectionTitleClass}>
                <DollarSign size={20} className="text-green-600" /> Financial
                Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Purchase Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Calendar size={18} />
                    </div>
                    <input
                      type="date"
                      name="purchase_date"
                      value={form.purchase_date}
                      onChange={handleChange}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Purchase Price (IDR)</label>
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold text-sm">
                        Rp
                      </span>
                    </div>
                    <input
                      type="number"
                      name="purchase_price"
                      value={form.purchase_price}
                      onChange={handleChange}
                      className={`${inputClass} pl-10`}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700/50 px-8 py-5 flex items-center justify-end gap-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate("/assets")}
              className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Save size={20} /> Save Asset
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
