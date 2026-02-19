<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Maintenance;
use App\Models\Loan;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Mengambil rangkuman data untuk Dashboard.
     */
    public function index()
    {
        // Hitung Ringkasan Aset
        $totalAssets = Asset::count();

        // Menjumlahkan kolom harga beli
        $totalValue = Asset::sum('purchase_price');

        // Hitung Distribusi Status (Untuk Grafik/Card)
        $statusDistribution = Asset::selectRaw('asset_status_id, count(*) as count')
            ->groupBy('asset_status_id')
            ->with('status') // Load relasi status biar dapat Namanya & Warnanya
            ->get()
            ->map(function ($item) {
                return [
                    'name'  => $item->status->name,
                    'count' => $item->count,
                    'color' => $item->status->style, // success, danger, warning
                ];
            });

        // 3. Hitung Tiket Maintenance
        $maintenanceStats = [
            'pending'     => Maintenance::where('status', 'pending')->count(),
            'in_progress' => Maintenance::where('status', 'in_progress')->count(),
        ];

        // 4. Hitung Peminjaman (Loans)
        $loanStats = [
            'active'  => Loan::whereIn('status', ['approved', 'active'])->count(),

            // Overdue: Yang statusnya Aktif TAPI tanggal kembalinya sudah lewat hari ini
            'overdue' => Loan::whereIn('status', ['approved', 'active'])
                             ->whereDate('return_date', '<', Carbon::now())
                             ->count(),
        ];

        // 5. Kembalikan Data JSON
        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'total_assets' => $totalAssets,
                    'total_value'  => $totalValue,
                ],
                'asset_status_distribution' => $statusDistribution,
                'maintenance_alerts' => $maintenanceStats,
                'loan_alerts' => $loanStats
            ]
        ]);
    }
}
