<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetStatus;
use App\Models\Audit;
use App\Models\AuditItem;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AuditController extends Controller
{
    /**
     * Index
     */
    public function index()
    {
        $audits = Audit::with(['location', 'auditor'])
                    ->withCount('items')
                    ->latest()
                    ->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $audits
        ]);
    }

    /**
     * Store
     */
    public function store(Request $request)
    {
        $request->validate([
            'location_id'   => 'required|exists:locations,id',
            'audit_date'    => 'required|date',
            'notes'         => 'nullable|string',
            'items'         => 'required|array|min:1',
            'items.*.asset_id' => 'required|exists:assets,id',
            'items.*.status'   => 'required|in:found,missing,damaged',
            'items.*.notes'    => 'nullable|string'
        ]);

        DB::beginTransaction();

        try {
            $audit = Audit::create([
                'location_id' => $request->location_id,
                'auditor_id'  => Auth::id(),
                'audit_date'  => $request->audit_date,
                'notes'       => $request->notes,
            ]);

            foreach ($request->items as $item) {
                AuditItem::create([
                    'audit_id'  => $audit->id,
                    'asset_id'  => $item['asset_id'],
                    'status'    => $item['status'],
                    'notes'     => $item['notes'] ?? null
                ]);

                if ($item['status'] === 'missing') {
                    $this->updateAssetStatus($item['asset_id'], 'lost');
                } elseif ($item['status'] === 'damaged') {
                    $this->updateAssetStatus($item['asset_id'], 'broken');
                }
            }

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Audit Submitted Successfully',
                'data'    => $audit
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message'   => 'Failed to save audit ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Show
     */
    public function show($id)
    {
        $audit = Audit::with(['location', 'auditor', 'items.asset'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $audit
        ]);
    }

    /**
     * Helper update status
     */
    private function updateAssetStatus($assetId, $statusSlug)
    {
        $status = AssetStatus::where('slug', $statusSlug)->first();
        if ($status) {
            Asset::where('id', $assetId)->update(['asset_status_id' => $status->id]);
        }
    }
}
