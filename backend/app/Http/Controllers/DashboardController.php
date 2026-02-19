<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Loan;
use App\Models\Maintenance;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get Index
     */
    public function index()
    {
        $totalAssets = Asset::count();
        $totalValue = Asset::sum('purchase_price');

        $statusDistribution = Asset::selectRaw('asset_status_id, count(*) as count')
            ->groupBy('asset_status_id')
            ->with('status')
            ->get()
            ->map(function ($item) {
                return [
                    'name'  => $item->status->name,
                    'count' => $item->count,
                    'color' => $item->status->style
                ];
            });

        $maintenanceStats = [
            'pending'       => Maintenance::where('status', 'pending')->count(),
            'in_progress'   => Maintenance::where('status', 'in_progress')->count()
        ];

        $loanStats = [
            'active'    => Loan::whereIn('status', ['approved', 'active'])->count(),
            'overdue'   => Loan::whereIn('status', ['approved', 'active'])
                                ->whereDate('return_date', '<', Carbon::now())
                                ->count()
        ];

        return response()->json([
            'status' => 'success',
            'data'   => [
                'summary' => [
                    'total_assets' => $totalAssets,
                    'total_value'  => $totalValue
                ],
                'asset_status_distribution' => $statusDistribution,
                'maintenance_alerts' => $maintenanceStats,
                'loan_alerts' => $loanStats
            ]
        ]);
    }
}
