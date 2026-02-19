import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { Service } from "../../lib/axios";
import {
  AlignLeft,
  ArrowLeft,
  Box,
  Calendar,
  CalendarDays,
  ChevronDown,
  FileText,
  Info,
  Loader2,
  Save,
  Search,
} from "lucide-react";

export default function LoanFormPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    asset_id: "",
    return_date: "",
    reason: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await Service.resources.deployableAssets({
          per_page: 100,
        });
        setAssets(response.data.data.data || response.data.data);
      } catch (err) {
        console.error("Failed to fetch assets", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.asset_id) {
      alert("Please select an asset first!");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    console.log("Sending Payload:", form);

    try {
      await Service.loans.create(form);
      alert("Loan request submitted successfully!");
      navigate("/loans");
    } catch (err) {
      console.error("Failed to submit loan request. Please try again.");
      setError(err.response?.data?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAssets = assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.code.toLowerCase().includes(search.toLowerCase()),
  );

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
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/loans")}
            className="flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Loan List
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Request Asset Loan
            </h1>
            <p className="text-sm text-gray-500">
              Create a new borrowing request
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
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-blue-800">
              <Info size={20} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">Important Info</p>
                <p className="text-sm mt-1">
                  You can only borrow assets with status{" "}
                  <strong>"Ready / Deployable"</strong>. If the item you are
                  looking for is not here, please contact the admin.
                </p>
              </div>
            </div>

            {/* Select assets */}
            <div>
              <label className={labelClass}>
                Select Asset <span className="text-red-500">*</span>
              </label>

              {/* Search Filter */}
              <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Filter dropdown by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Dropdown Asset */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Box size={18} />
                </div>

                <select
                  className={`${inputClass} pl-10 pr-10 appearance-none`}
                  value={form.asset_id}
                  onChange={(e) =>
                    setForm({ ...form, asset_id: e.target.value })
                  }
                  required
                >
                  <option value="">-- Choose an Asset --</option>

                  {filteredAssets.length === 0 ? (
                    <option disabled>
                      No assets found matching "{search}"
                    </option>
                  ) : (
                    filteredAssets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        [{asset.code}] {asset.name} — {asset.location?.name}
                      </option>
                    ))
                  )}
                </select>

                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                  <ChevronDown size={16} />
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-1 text-right">
                Showing {filteredAssets.length} available items
              </p>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* LOAN DETAILS */}
            <div>
              <h3 className={sectionTitleClass}>
                <CalendarDays size={20} className="text-green-600" /> Loan
                Details
              </h3>

              <div className="grid grid-cols-1 gap-6">
                {/* Return Date */}
                <div>
                  <label className={labelClass}>
                    Expected Return Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Calendar size={18} />
                    </div>
                    <input
                      type="date"
                      className={`${inputClass} pl-10`}
                      value={form.return_date}
                      onChange={(e) =>
                        setForm({ ...form, return_date: e.target.value })
                      }
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className={labelClass}>
                    Reason for Loan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                      <AlignLeft size={18} />
                    </div>
                    <textarea
                      className={`${inputClass} pl-10 h-24 resize-none`}
                      placeholder="Ex: Used for presentation at Client Office..."
                      value={form.reason}
                      onChange={(e) =>
                        setForm({ ...form, reason: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 px-8 py-5 flex items-center justify-end gap-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate("/loans")}
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
                  <Save size={20} /> Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
