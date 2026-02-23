import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { Service } from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  ClipboardList,
  Loader2,
  MapPin,
  Save,
  XCircle,
} from "lucide-react";

export default function AuditFormPage() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedBuildings, setSelectedBuildings] = useState("");
  const [selectedFloors, setSelectedFloors] = useState("");
  const [selectedRooms, setSelectedRooms] = useState("");
  const [auditDate, setAuditDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [generalNotes, setGeneralNotes] = useState("");
  const [assets, setAssets] = useState([]);
  const [auditItems, setAuditItems] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await Service.resources.locations("building");
        setBuildings(response.data.data);
      } catch (err) {
        console.error("Failed fetching data: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuildings();
  }, []);

  const fetchFloors = async (buildingId) => {
    try {
      const response = await Service.resources.locations("floor", buildingId);
      setFloors(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRooms = async (floorId) => {
    try {
      const response = await Service.resources.locations("room", floorId);
      setRooms(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuildingChange = (e) => {
    const val = e.target.value;
    setSelectedBuildings(val);
    setSelectedFloors("");
    setFloors([]);
    setSelectedRooms("");
    setRooms([]);
    setAssets([]);
    if (val) fetchFloors(val);
  };

  const handleFloorChange = (e) => {
    const val = e.target.value;
    setSelectedFloors(val);
    setSelectedRooms("");
    setRooms([]);
    setAssets([]);
    if (val) fetchRooms(val);
  };

  const handleRoomChange = (e) => {
    const val = e.target.value;
    setSelectedRooms(val);
    if (val) fetchAssetInLocation(val);
    else setAssets([]);
  };

  // Fetch asset
  const fetchAssetInLocation = async (locationId) => {
    setLoading(true);
    const payload = {
      location_id: locationId,
      per_page: 1000,
    };
    try {
      const response = await Service.audits.list({ payload });
      const assetList = response.data.data.data || response.data.data;
      setAssets(assetList);

      const initialItems = {};
      assetList.forEach((asset) => {
        initialItems[asset.id] = {
          status: "found",
          notes: "",
        };
      });
      setAuditItems(initialItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle change audit item
  const handleItemChange = (assetId, field, value) => {
    setAuditItems((prev) => ({
      ...prev,
      [assetId]: {
        ...prev[assetId],
        [field]: value,
      },
    }));
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRooms) return alert("Please select a room to audit.");
    if (assets.length === 0)
      return alert("No asset to audit in this location.");
    if (
      !window.confirm(
        "Submit audit result? This will record the status of all items.",
      )
    )
      return;

    setIsSubmitting(true);
    try {
      const payload = {
        location_id: selectedRooms,
        audit_date: auditDate,
        notes: generalNotes,
        items: Object.keys(auditItems).map((assetId) => ({
          asset_id: assetId,
          status: auditItems[assetId].status,
          notes: auditItems[assetId].notes,
        })),
      };

      await Service.audits.create(payload);
      alert("Audit submitted successfully.");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit audit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white outline-none transition-all";

  if (loading && !buildings.length) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/audit")}
            className="flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft className="mr-2" size={20} /> Back
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-medium text-gray-900 dark:text-white">
              Stock Opname
            </h1>
            <p className="text-sm text-gray-500">Physical asset verivication</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Location */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
              <MapPin className="text-blue-600" size={20} />
              Select Location Audit
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Building
                </label>
                <select
                  className={inputClass}
                  value={selectedBuildings}
                  onChange={handleBuildingChange}
                >
                  <option value="">-- Select Building --</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Floor
                </label>
                <select
                  className={inputClass}
                  value={selectedFloors}
                  onChange={handleFloorChange}
                >
                  <option value="">-- Select Floor --</option>
                  {floors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Room
                </label>
                <select
                  className={inputClass}
                  value={selectedRooms}
                  onChange={handleRoomChange}
                >
                  <option value="">-- Select Room --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Audit Date
                </label>
                <input
                  type="date"
                  className={inputClass}
                  value={auditDate}
                  onChange={(e) => setAuditDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  General Notes
                </label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Ex: Annual Audit Q3"
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Asset Checklist */}
          {selectedRooms && (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <ClipboardList size={20} className="text-green-600" />
                  Asset Checklist
                </h3>
                <span className="bg-blue-100 text-blue-800 texxs font-bold px-3 py-1 rounded-full">
                  Total: {assets.length} Items
                </span>
              </div>

              {assets.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No assets registered in this location.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="px-6 py-3 w-1/4">Asset Info</th>
                      <th className="px-6 py-3 text-center">Physical Status</th>
                      <th className="px-6 py-3 w-1/3">Notes</th>
                    </tr>
                  </table>
                  <tbody>
                    {assets.map((asset) => {
                      const currentStatus =
                        auditItems[asset.id]?.status || "found";

                      return (
                        <tr
                          key={asset.id}
                          className={`transition-colors ${
                            currentStatus === "missing"
                              ? "bg-red-50 dark:bg-red-900/10"
                              : currentStatus === "damaged"
                                ? "bg-yellow-50 dark:bg-yellow-900/10"
                                : "hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 dark:text-white">
                              {asset.mame}
                            </div>
                            <div className="text-xs font-mono text-blue-600">
                              {asset.code}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              SN: {asset.serial_number || "-"}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <label
                                className={`cursor-pointer px-3 py-2 rounded-lg border flex items-center gap-2 transition-all ${currentStatus === "found" ? "bg-green-600 text-white border-green-600 shadow-md transform scale-105" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                              >
                                <input
                                  type="radio"
                                  name={`status-${asset.id}`}
                                  value="found"
                                  checked={currentStatus === "found"}
                                  onChange={() =>
                                    handleItemChange(
                                      asset.id,
                                      "status",
                                      "found",
                                    )
                                  }
                                  className="hidden"
                                />
                                <CheckCircle size={16} />
                                <span className="text-xs font-bold">Found</span>
                              </label>

                              <label
                                className={`cursor-pointer px-3 py-2 rounded-lg border flex items-center gap-2 transition-all ${currentStatus === "damaged" ? "bg-yellow-500 text-white border-yellow-500 shadow-md transform scale-105" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                              >
                                <input
                                  type="radio"
                                  name={`status-${asset.id}`}
                                  value="damaged"
                                  checked={currentStatus === "damaged"}
                                  onChange={() =>
                                    handleItemChange(
                                      asset.id,
                                      "status",
                                      "damaged",
                                    )
                                  }
                                  className="hidden"
                                />
                                <AlertTriangle size={16} />
                                <span className="text-xs font-bold">
                                  Damage
                                </span>
                              </label>

                              <label
                                className={`cursor-pointer px-3 py-2 rounded-lg border flex items-center gap-2 transition-all ${currentStatus === "missing" ? "bg-red-600 text-white border-red-600 shadow-md transform scale-105" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                              >
                                <input
                                  type="radio"
                                  name={`status-${asset.id}`}
                                  value="missing"
                                  checked={currentStatus === "missing"}
                                  onChange={() =>
                                    handleItemChange(
                                      asset.id,
                                      "status",
                                      "missing",
                                    )
                                  }
                                  className="hidden"
                                />
                                <XCircle size={16} />
                                <span className="text-xs font-bold">
                                  Missing
                                </span>
                              </label>
                            </div>
                          </td>

                          <td>
                            <input
                              type="text"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="Notes (e.g. user moved)"
                              value={auditItems[asset.id]?.notes || ""}
                              onChange={(e) =>
                                handleItemChange(
                                  asset.id,
                                  "notes",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-40 transition-all">
            <div className="max-w-6xl mx-auto flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-6 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                // Pastikan button disable jika form belum siap
                disabled={isSubmitting || !selectedRooms || assets.length === 0}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Save size={20} /> Submit Audit Result
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
