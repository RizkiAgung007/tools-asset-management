import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Service } from "../../lib/axios";
import Layout from "../../components/Layout";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  Save,
  User,
  Wrench,
} from "lucide-react";

export default function MaintenanceDetailPage() {
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [cost, setCost] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [resolution, setResolution] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const response = await Service.maintenances.get(id);
      const data = response.data.data;

      setMaintenance(data);
      setStatus(data.status);
      setCost(data.cost || "");
      setCompletionDate(
        data.completion_date || new Date().toISOString().split("T")[0],
      );
      setResolution(data.resolution || "");
    } catch (err) {
      console.error(err);
      navigate("/maintenances");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!window.confirm("Update maintenance status?")) return;

    setIsSubmitting(true);

    const payload = {
      status,
      cost: cost || null,
      completion_date: completionDate || null,
      resolution,
    };
    try {
      await Service.maintenances.update(id, payload)

      alert("Maintenances updated successfully!");
      if (status === "completed") {
        alert("Asset status has been restored to 'Ready'.");
        navigate("/maintenances");
      } else {
        fetchDetail();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper status clor
  const getStatusColor = (style) => {
    if (style === "completed")
      return "text-green-600 bg-green-50 border-green-200";
    if (style === "in_progress")
      return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  };

  const labelClass =
    "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";
  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none";

  if (loading)
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-none text-blue-600" size={40} />
        </div>
      </Layout>
    );
  if (!maintenance) return null;

  return (
    <Layout>
      {/* Header */}
      <div>
        <button
          className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors"
          onClick={() => navigate("/maintenances")}
        >
          <ArrowLeft size={16} className="mt-1" /> Back to List
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              Ticket #{maintenance.id}
              <span
                className={`text-xs px-3 py-1 rounded-full border uppercase ${getStatusColor(status)}`}
              >
                {maintenance.status.replace("-", " ")}
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Reported on {maintenance.start_date}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        {/* Info Tiket */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
              <AlertTriangle size={18} /> Issue Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Asset</label>
                <div className="font-medium text-gray-900 dark:text-white">
                  {maintenance.asset?.name}
                </div>
                <div className="text-xs text-blue-600 font-mono">
                  {maintenance.asset?.code}
                </div>
              </div>
              <div>
                <label className={labelClass}>Issue Description</label>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800 mt-1">
                  "{maintenance.issue}"
                </div>
              </div>
              <div>
                <label className={labelClass}>Reported by</label>
                <div className="flex items-center gap-2 mt-2">
                  <div className="p-1 bg-gray-200 rounded-full">
                    <User size={14} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">
                    {maintenance.reporter?.name || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
              <Wrench size={18} /> Vendor Info
            </h3>
            {maintenance.supplier ? (
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  {maintenance.supplier?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {maintenance.supplier?.contact_person} (
                  {maintenance.supplier?.phone})
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {maintenance.supplier?.address}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Internal Repair</p>
            )}
          </div>
        </div>

        {/* Form Update */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleUpdate}
            className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Clock size={18} className="text-blue-600" /> Update Progress
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <label className={labelClass}>Current Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {["pending", "in_progress", "completed"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2
                        ${
                          status === s
                            ? s === "completed"
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                        }
                      `}
                    >
                      {s === "completed" && <CheckCircle size={16} />}
                      {s.replace("_", " ").toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-700" />

              {/* Completion Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Repair Cost</label>
                  <div className="relative flex items-center pt-4">
                    <div className="absolute inset-y-0 left-0 top-3 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold text-sm">
                        Rp
                      </span>
                    </div>
                    <input
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Completion Date</label>
                  <div className="relative flex items-center pt-4">
                    <div className="absolute inset-y-0 left-0 top-3 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Calendar size={20} />
                    </div>
                    <input
                      type="date"
                      value={completionDate}
                      onChange={(e) => setCompletionDate(e.target.value)}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Action Taken</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 text-gray-400">
                    <FileText size={20} />
                  </div>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className={`${inputClass} pl-10 h-24 resize-none`}
                    placeholder="Ex: Replaced LCD Screen and updated drivers..."
                  />
                </div>
              </div>

              <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100">
                <strong>Note:</strong> Marking status as{" "}
                <strong>COMPLETED</strong> will automatically set the Asset
                Status back to <strong>"Ready"</strong>.
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 text-right border-t border-gray-100 dark:border-gray-700">
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={() => navigate("/maintenances")}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md flex items-center gap-2 disabled:opacity-70 ml-auto"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Save size={20} /> Update Maintenance
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
