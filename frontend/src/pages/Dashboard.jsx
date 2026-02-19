import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import Layout from "../components/Layout";
import {
  BarChart3,
  Box,
  Clock,
  DollarSign,
  Loader2,
  Wrench,
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const userName = sessionStorage.getItem("user_name");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/api/dashboard");
        setStats(response.data.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  const getStatusColor = (style) => {
    switch (style) {
      case "success":
        return "bg-green-100 text-green-700 border-green-200";
      case "danger":
        return "bg-red-100 text-red-700 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "info":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
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
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 text-sm">
          Welcome back, {userName}. Here is what's happening today.
        </p>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Asset */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-start mb-4 gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Box size={24} />
            </div>
            <span className="text-lg font-bold text-gray-400 uppercase tracking-wider">
              Total Assets
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.summary.total_assets}
          </p>
          <p className="text-sm text-gray-500 mt-2">Registered Items</p>
        </div>

        {/* Total Value */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-start mb-4 gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <DollarSign size={24} />
            </div>
            <span className="text-lg font-bold text-gray-400 uppercase tracking-wider">
              Asset Value
            </span>
          </div>
          <p
            className="text-2xl font-bold text-gray-900 dark:text-white truncate"
            title={formatRupiah(stats.summary.total_value)}
          >
            {formatRupiah(stats.summary.total_value)}
          </p>
          <p className="text-sm text-gray-500 mt-2">Total Acquisition cost</p>
        </div>

        {/* Maintenance Alert */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
          {stats.maintenance_alerts.pending > 0 && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full m-3 animate-pulse"></div>
          )}
          <div className="flex items-center justify-start mb-4 gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
              <Wrench size={24} />
            </div>
            <span className="text-lg font-bold text-gray-400 uppercase tracking-wider">
              Maintenance
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.maintenance_alerts.pending}
            </p>
            <span className="text-sm text-gray-500 mb-1">Pending</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {stats.maintenance_alerts.in_progress} Currently in progress
          </p>
        </div>

        {/* Loan Alert (Overdue) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
          {stats.loan_alerts.overdue > 0 && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full m-3 animate-pulse"></div>
          )}
          <div className="flex items-center justify-start mb-4 gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Clock size={24} />
            </div>
            <span className="text-lg font-bold text-gray-400 uppercase tracking-wider">
              Active Loans
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.loan_alerts.active}
            </p>
            <span className="text-sm text-gray-500 mb-1">Items out</span>
          </div>
          <p
            className={`text-sm mt-2 ${stats.loan_alerts.overdue > 0 ? "text-red-600 font-bold" : "text-gray-500"}`}
          >
            {stats.loan_alerts.overdue} Overdue (Late Return)
          </p>
        </div>
      </div>

      {/* Asset Status Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <BarChart3 size={24} className="text-gray-500" />
          <h3 className="font-bold text-gray-800 dark:text-white">
            Asset Status Distribution
          </h3>
        </div>
        <div className="p-6">
          {stats.asset_status_distribution.length === 0 ? (
            <p className="text-center text-gray-500">
              No assets registered yet.
            </p>
          ) : (
            <div>
              {stats.asset_status_distribution.map((status, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${getStatusColor(status.color)}`}
                >
                  <span className="text-2xl font-bold mb-1">
                    {status.count}
                  </span>
                  <span className="text-xs uppercase font-bold opacity-80">
                    {status.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
