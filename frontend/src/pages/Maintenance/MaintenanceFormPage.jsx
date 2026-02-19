import React, { useEffect, useState } from "react";
import { Service } from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  AlertTriangle,
  ArrowLeft,
  Box,
  Calendar,
  ChevronDown,
  FileText,
  Loader2,
  Save,
  Search,
  Truck,
} from "lucide-react";

export default function MaintenanceFormPage() {
  const [assets, setAssets] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchAsset, setSearchAsset] = useState("");
  const [form, setForm] = useState({
    asset_id: "",
    supplier_id: "",
    issue: "",
    start_date: new Date().toISOString().split("T")[0],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [assetRes, supRes] = await Promise.all([
          Service.assets.list({ per_page: 100 }),
          Service.suppliers.list({ per_page: 100 }),
        ]);

        setAssets(assetRes.data.data.data || assetRes.data.data);
        setSuppliers(supRes.data.data.data || supRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.asset_id) {
      alert("Please select an asset.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await Service.maintenances.create(form)
      alert("Maintenances ticket created successfully");
      navigate("/maintenances");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter aset di dropdown
  const filteredAssets = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(searchAsset.toLowerCase()) ||
      a.code.toLowerCase().includes(searchAsset.toLowerCase()),
  );

  // Styling
  const labelClass =
    "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";
  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors";

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
      <div className="max-w-3xl mx-auto pb-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/maintenances")}
            className="flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to List
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Report Issue
            </h1>
            <p className="text-sm text-gray-500">
              Create a new maintenance ticket
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden p-8 space-y-8"
        >
          {error && (
            <div className="bg-red-50 text-red-600 p-4 border-b border-red-100 text-center font-medium rounded-lg">
              {error}
            </div>
          )}

          {/* Asset Selection */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
              <Box size={20} className="text-blue-600" /> Select Asset
            </h3>

            <div className="space-y-4">
              {/* Search Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Filter list by name or code..."
                  value={searchAsset}
                  onChange={(e) => setSearchAsset(e.target.value)}
                  className={`${inputClass} pl-9`}
                />
              </div>

              {/* Dropdown */}
              <div className="relative">
                <select
                  className={`${inputClass} pr-10 appearance-none`}
                  value={form.asset_id}
                  onChange={(e) =>
                    setForm({ ...form, asset_id: e.target.value })
                  }
                  required
                >
                  <option value="">-- Choose an Asset --</option>

                  {filteredAssets.length === 0 ? (
                    <option disabled>No assets found.</option>
                  ) : (
                    filteredAssets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        [{asset.code}] {asset.name} ({asset.status?.name})
                      </option>
                    ))
                  )}
                </select>

                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-700" />

          {/* Issue Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
              <AlertTriangle size={20} className="text-red-600" /> Issue Details
            </h3>

            <div className="grid grid-cols-1 gap-6">
              {/* Issue Description */}
              <div>
                <label className={labelClass}>
                  Description of the Problem{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                    <FileText size={18} />
                  </div>
                  <textarea
                    className={`${inputClass} pl-10 h-24 resize-none`}
                    placeholder="Ex: The screen is flickering..."
                    value={form.issue}
                    onChange={(e) =>
                      setForm({ ...form, issue: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div>
                  <label className={labelClass}>
                    Date Reported <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Calendar size={18} />
                    </div>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) =>
                        setForm({ ...form, start_date: e.target.value })
                      }
                      className={`${inputClass} pl-10`}
                      required
                    />
                  </div>
                </div>

                {/* Supplier / Vendor */}
                <div>
                  <label className={labelClass}>
                    Assign to Vendor (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Truck size={18} />
                    </div>
                    <select
                      value={form.supplier_id}
                      onChange={(e) =>
                        setForm({ ...form, supplier_id: e.target.value })
                      }
                      className={`${inputClass} pl-10 pr-10 appearance-none`}
                    >
                      <option value="">-- Internal / Not Set --</option>
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
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate("/maintenances")}
              className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-md flex items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Save size={20} /> Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
