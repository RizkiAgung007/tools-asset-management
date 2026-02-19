import {
  ArrowLeft,
  Box,
  Check,
  CheckCircle,
  Clock,
  Loader2,
  User,
  X,
  XCircle,
  RotateCcw,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { Service } from "../../lib/axios";

export default function LoanDetailPage() {
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isProcess, setIsProcess] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDetailLoan();
  }, [id]);

  const fetchDetailLoan = async () => {
    try {
      const response = await Service.loans.get(id);
      setLoan(response.data.data);
    } catch (err) {
      console.error(err);
      navigate("/loans");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Approve
  const handleApprove = async () => {
    if (!window.confirm("Are you sure you want to Approve this request?"))
      return;
    setIsProcess(true);

    try {
      await Service.loans.approve(id);
      alert("Approval Successful!");
      fetchDetailLoan();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve");
    } finally {
      setIsProcess(false);
    }
  };

  // Fungsi Reject
  const handleReject = async () => {
    const reason = window.prompt("Please enter the reason for rejection:");
    if (reason === null) return;

    setIsProcess(true);
    try {
      await Service.loans.reject(id, reason);

      alert("Request Rejected.");
      fetchDetailLoan();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject.");
    } finally {
      setIsProcess(false);
    }
  };

  // Fungsi Return Asset
  const handleReturn = async () => {
    if (!window.confirm("Confirm asset return?")) return;
    setIsProcess(true);

    try {
      await Service.loans.return(id)
      alert("Asset returned successfully");
      fetchDetailLoan();
    } catch (err) {
      alert(err.response?.data?.message || "Failde to return asset.");
    } finally {
      setIsProcess(false);
    }
  };

  const StatusBadge = ({ status }) => {
    if (status === "approved") {
      return (
        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
          <CheckCircle size={12} /> Approved
        </span>
      );
    }
    if (status === "rejected") {
      return (
        <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
          <XCircle size={12} /> Rejected
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
        <Clock size={12} /> Pending
      </span>
    );
  };

  const ApprovalStep = ({ title, status, date, approver, role }) => {
    const isDone = status === "approved";
    const isRejected = status === "rejected";
    const isPending = status === "pending";

    return (
      <div
        className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all ${
          isPending
            ? "border-gray-200 bg-gray-50"
            : isDone
              ? "border-green-200 bg-green-50/50"
              : "border-red-200 bg-red-50/50"
        }`}
      >
        <div
          className={`p-2 rounded-full ${
            isPending
              ? "border-gray-200 text-gray-500"
              : isDone
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
          }`}
        >
          {isDone ? (
            <Check size={20} />
          ) : isRejected ? (
            <X size={20} />
          ) : (
            <Clock size={20} />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">
            {role}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status={status} />
            {date && (
              <span className="text-xs text-gray-400">
                {new Date(date).toLocaleString}
              </span>
            )}
          </div>

          {approver && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <User size={14} /> By:{" "}
              <span className="font-medium">{approver}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 size={40} className="animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  if (!loan) return null;

  return (
    <Layout>
      <div className="mb-6">
        <button
          onClick={() => navigate("/loans")}
          className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Loans
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Loan Request #{loan.loan_code}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Created on {new Date(loan.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Global status badege */}
          <div
            className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide border ${
              loan.status === "active"
                ? "bg-green-100 text-gray-700 border-gray-200"
                : "bg-yellow-100 text-yellow-700 border-yellow-200"
            }`}
          >
            {loan.status}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Detail Info */}
        <div className="md:col-span-1 space-y-6">
          {/* Asset Info */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
              <Box size={20} /> Asset Details
            </h3>

            <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
              {loan.asset?.image_path ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}/storage/${
                    loan.asset.image_path
                  }`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Box className="text-gray-400" />
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-300 block">
                  Asset Name
                </label>
                <p className="font-medium text-gray-900 dark:text-white">
                  {loan.asset?.name}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-300">
                  Asset Tag
                </label>
                <p className="font-mono text-blue-600">{loan.asset?.code}</p>
              </div>
            </div>
          </div>

          {/* Borrower Info */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
              <User size={20} /> Borrower Detail
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-300 block">
                  Name
                </label>
                <p className="font-medium text-gray-900 dark:text-white">
                  {loan.user?.name}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-300 block">
                  Department / Unit
                </label>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {loan.user?.unit?.name || "-"}
                </p>
              </div>
              <hr className="border-gray-100 dark:border-gray-700" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-300 block">
                    Return Date
                  </label>
                  <p className="text-sm font-bold text-blue-600">
                    {loan.return_date}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-300 block">
                  Reason
                </label>
                <p className="text-sm italic p-2 mt-2 text-gray-600 bg-gray-50 rounded border border-gray-100">
                  "{loan.reason}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Timeline */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <CheckCircle size={20} className="text-blue-600" /> Approval
              Workflow
            </h3>

            <div className="space-y-6 relative">
              <div className="absolute left-[2.25rem] top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>

              {/* Team Leaders */}
              <div className="z-10 relative space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase ml-14">
                  Team Leader
                </p>
                <ApprovalStep
                  title="User's Team Leader"
                  role="Head of User Unit"
                  status={loan.status_tl_user}
                  date={loan.date_tl_user}
                  approver={loan.approver_tl_user?.name}
                />
                <ApprovalStep
                  title="Asset Owner Team Leader"
                  role="Head of Asset Unit"
                  status={loan.status_tl_asset}
                  date={loan.date_tl_asset}
                  approver={loan.approver_tl_asset?.name}
                />
              </div>

              {/* GA */}
              <div className="z-10 relative space-y-4 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase ml-14">
                  Asset Verification
                </p>
                <ApprovalStep
                  title="General Affair (GA)"
                  role="Asset Manager"
                  status={loan.status_ga}
                  date={loan.date_ga}
                  approver={loan.approver_ga?.name}
                />
              </div>

              {/* VP */}
              <div className="z-10 relative space-y-4 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase ml-14">
                  Final Authorization
                </p>
                <ApprovalStep
                  title="Vice President"
                  role="Head of Department"
                  status={loan.status_vp}
                  date={loan.date_vp}
                  approver={loan.approver_vp?.name}
                />
              </div>
            </div>

            {/* Action Buttton */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              {/* Pending -> Butuh Approval */}
              {loan.status === "pending" && (
                <>
                  <button
                    onClick={handleReject}
                    disabled={isProcess}
                    className="px-6 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcess ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <XCircle size={18} /> Reject Request
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleApprove}
                    disabled={isProcess}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcess ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <CheckCircle size={18} /> Approve Request
                      </>
                    )}
                  </button>
                </>
              )}

              {/* Approved -> Butuh Dikembalikan */}
              {(loan.status === "approved" || loan.status === "active") && (
                <button
                  onClick={handleReturn}
                  disabled={isProcess}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcess ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <RotateCcw size={18} /> Process Return
                    </>
                  )}
                </button>
              )}

              {/* Selesai */}
              {(loan.status === "returned" || loan.status === "rejected") && (
                <p className="text-gray-500 italic font-medium">
                  Transaction closed ({loan.status}).
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}