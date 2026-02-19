<?php

namespace App\Http\Controllers;

use App\Models\Audit;
use App\Models\AuditItem;
use App\Models\Asset; // Untuk update status jika damaged/missing (opsional)
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // Penting untuk Transaction

class AuditController extends Controller
{
    // 1. List Riwayat Audit
    public function index()
    {
        // Tampilkan audit terbaru, beserta lokasi dan siapa auditornya
        $audits = Audit::with(['location', 'auditor'])
                    ->withCount('items') // Hitung total item yang diaudit
                    ->latest()
                    ->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $audits
        ]);
    }

    // 2. Simpan Hasil Audit (Bulk Insert)
    public function store(Request $request)
    {
        $request->validate([
            'location_id' => 'required|exists:locations,id',
            'audit_date'  => 'required|date',
            'notes'       => 'nullable|string',
            'items'       => 'required|array|min:1', // Wajib ada item yang diaudit
            'items.*.asset_id' => 'required|exists:assets,id',
            'items.*.status'   => 'required|in:found,missing,damaged',
            'items.*.notes'    => 'nullable|string',
        ]);

        // Gunakan Transaction agar aman
        DB::beginTransaction();

        try {
            // A. Buat Header Audit
            $audit = Audit::create([
                'location_id' => $request->location_id,
                'auditor_id'  => Auth::id(), // User yang login
                'audit_date'  => $request->audit_date,
                'notes'       => $request->notes,
            ]);

            // B. Simpan Detail Items (Looping)
            foreach ($request->items as $item) {
                AuditItem::create([
                    'audit_id' => $audit->id,
                    'asset_id' => $item['asset_id'],
                    'status'   => $item['status'],
                    'notes'    => $item['notes'] ?? null,
                ]);

                // (OPSIONAL) CANGGIH: Update status aset master otomatis
                // Jika hasil audit 'missing', ubah status aset jadi 'Lost'
                // Jika 'damaged', ubah jadi 'Broken'
                if ($item['status'] === 'missing') {
                    $this->updateAssetStatus($item['asset_id'], 'lost'); // Pastikan slug 'lost' ada di DB
                } elseif ($item['status'] === 'damaged') {
                    $this->updateAssetStatus($item['asset_id'], 'broken');
                }
            }

            DB::commit(); // Simpan permanen jika sukses

            return response()->json([
                'status' => 'success',
                'message' => 'Audit submitted successfully',
                'data' => $audit
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack(); // Batalkan semua jika error
            return response()->json([
                'message' => 'Failed to save audit: ' . $e->getMessage()
            ], 500);
        }
    }

    // 3. Detail Hasil Audit
    public function show($id)
    {
        $audit = Audit::with(['location', 'auditor', 'items.asset'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $audit
        ]);
    }

    // Helper Update Status Aset
    private function updateAssetStatus($assetId, $statusSlug)
    {
        $status = \App\Models\AssetStatus::where('slug', $statusSlug)->first();
        if ($status) {
            Asset::where('id', $assetId)->update(['asset_status_id' => $status->id]);
        }
    }
}
