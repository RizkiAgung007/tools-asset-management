import React, { useEffect, useState } from "react";
import { Service } from "../lib/axios";
import {
  BarChart3,
  Box,
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  HelpCircle,
  Loader2,
  Wrench,
  XCircle,
} from "lucide-react";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const userName = sessionStorage.getItem("user_name");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await Service.dashboard.get()
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

  const getStatusConfig = (style) => {
    switch (style) {
      case "success": // Ready
        return {
          icon: <CheckCircle size={20} />,
          color: "text-green-600",
          bg: "bg-green-100",
          bar: "bg-green-500",
        };
      case "danger": // Broken
        return {
          icon: <XCircle size={20} />,
          color: "text-red-600",
          bg: "bg-red-100",
          bar: "bg-red-500",
        };
      case "warning": // Maintenance
        return {
          icon: <Wrench size={20} />,
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          bar: "bg-yellow-500",
        };
      case "info": // In Use
        return {
          icon: <Briefcase size={20} />,
          color: "text-blue-600",
          bg: "bg-blue-100",
          bar: "bg-blue-500",
        };
      default:
        return {
          icon: <HelpCircle size={20} />,
          color: "text-gray-600",
          bg: "bg-gray-100",
          bar: "bg-gray-500",
        };
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

  // TOtal asset bentuk persentase
  const totalAssetCount = stats.summary.total_assets || 1;

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
          <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">
            {formatRupiah(stats.summary.total_value)}
          </p>
          <p className="text-sm text-gray-500 mt-2">Total Acquisition</p>
        </div>

        {/* Maintenance Alert */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
          {stats.maintenance_alerts.pending > 0 && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full m-3 animate-pulses"></div>
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
            <span className="text-sm text-gray-500 mb-1">pending Tickets</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.maintenance_alerts.in_progress} Currently in progress
          </p>
        </div>

        {/* Loan Alerts */}
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
            <span className="text-sm text-gray-500 mb-1">Items Out</span>
          </div>
          <p
            className={`text-sm mt-1 ${stats.loan_alerts.overdue > 0 ? "text-red-600 font-bold" : "text-gray-500"}`}
          >
            {stats.loan_alerts.overdue} Overdue
          </p>
        </div>
      </div>

      {/* Asset Status Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={24} className="text-gray-500" />
            <h3 className="font-bold text-gray-800 dark:text-white">
              Asset Status Distribution
            </h3>
          </div>
          <span className="text-xs dark:text-gray-500 text-white dark:bg-gray-100 bg-gray-700 px-2 py-1 rounded">
            Realtime Data
          </span>
        </div>

        <div className="p-6">
          {stats.asset_status_distribution.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-3 bg-gray-50 rounded-full inline-block mb-3">
                <Box size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500">No assets regitered yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.asset_status_distribution.map((status, index) => {
                const config = getStatusConfig(status.color);
                const percentage = Math.round(
                  (status.count / totalAssetCount) * 100,
                );

                return (
                  <div
                    key={index}
                    className="flex flex-col p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow bg-gray-50/50 dark:bg-gray-700/20"
                  >
                    {/* Header: Icon & Count */}
                    <div className="flex justify-between items-start mb-2">
                      <div
                        className={`p-2 rounded-lg ${config.bg} ${config.color}`}
                      >
                        {config.icon}
                      </div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {status.count}
                      </span>
                    </div>

                    {/* Nama Status */}
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-200">
                        {status.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {percentage}% of total assets
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-auto">
                      <div
                        className={`h-1.5 rounded-full ${config.bar}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
