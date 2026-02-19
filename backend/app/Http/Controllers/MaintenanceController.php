<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetStatus;
use App\Models\Maintenance;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Maintenance::with(['asset', 'supplier', 'reporter']);

        // Filter Asset
        if ($request->asset_id) {
            $query->where('asset_id', $request->asset_id);
        }

        // Filter status mainenantce
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $maintenances = $query->latest()->paginate(10);

        return response()->json([
            'status' => 'success',
            'data'   => $maintenances
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'asset_id'    => 'required|exists:assets,id',
            'issue'       => 'required|string',
            'start_date'  => 'required|date',
            'supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        $maintenance = Maintenance::create([
            'asset_id'    => $request->asset_id,
            'issue'       => $request->issue,
            'start_date'  => $request->start_date,
            'supplier_id' => $request->supplier_id,
            'reporter_id' => $request->reporter_id,
            'status'      => 'pending'
        ]);

        $this->updateAssetStatus($request->asset_id, 'maintenance');

        return response()->json([
            'status'    => 'success',
            'message'   => 'Maintenance ticket created',
            'data'      => $maintenance
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $maintenance = Maintenance::with(['asset', 'supplier', 'reporter'])->findOrFail($id);
        return response()->json([
            'data'  => $maintenance
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $maintenance = Maintenance::findOrFail($id);

        $request->validate([
            'status'          => 'required|in:pending,in_progress,completed',
            'cost'            => 'nullable|numeric',
            'completion_date' => 'nullable|date',
            'resolution'      => 'nullable|string'
        ]);

        $maintenance->update([
            'status'          => $request->status,
            'cost'            => $request->cost,
            'completion_date' => $request->completion_date,
            'resolution'      => $request->resolution,
            'supplier_id'     => $request->supplier_id ?? $maintenance->supplier_id
        ]);

        if ($request->status === 'completed') {
            $this->updateAssetStatus($maintenance->asset_id, 'ready');
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Maintenance updated',
            'data'    => $maintenance
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Helper change status update
     */
    private function updateAssetStatus($assetId, $statusSlug) {
        $status = AssetStatus::where('slug', $statusSlug)->first();

        if (!$status && $statusSlug === 'maintenance') {
            $status = AssetStatus::where('slug', 'broken')->first();
        }

        if ($status) {
            Asset::where('id', $assetId)->update(['asset_status_id' => $status->id]);
        }
    }
}
