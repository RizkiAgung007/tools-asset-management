<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AssetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Asset::with(['category', 'location', 'supplier', 'status', 'unit.department']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', '%' . $request->search . '%')
                ->orWhere('code', 'ilike', '%' . $request->search . '%')
                ->orWhere('serial_number', 'ilike', '%' . $request->search . '%');
            });
        }

        // Cek status asset harus is_deployable
        if ($request->has('only_deployable')) {
            $query->whereHas('status', function ($q) {
                $q->where('is_deployable', true);
            });

            // Asst dipinjam
            $query->whereDoesntHave('loans', function ($q) {
                $q->where('status', ['pending', 'approved', 'active']);
            });
        }


        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        } elseif ($request->location_id) {
            $query->where('location_id', $request->location_id);
        } elseif ($request->status_id) {
            $query->where('asset_status_id', $request->status_id);
        } elseif ($request->unit_id) {
            $query->where('unit_id', $request->unit_id);
        }

        $assets = $query->latest()->paginate(10);

        return response()->json([
            'status'  => 'success',
            'data' => $assets
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
            'name'            => 'required|string|max:255',
            'category_id'     => 'required|exists:categories,id',
            'location_id'     => 'required|exists:locations,id',
            'asset_status_id' => 'required|exists:asset_statuses,id',
            'unit_id'         => 'required|exists:units,id',
            'supplier_id'     => 'nullable|exists:suppliers,id',
            'purchase_date'   => 'nullable|date',
            'purchase_price'  => 'nullable|numeric',
            'serial_number'   => 'nullable|string|max:255',
            'image'           => 'nullable|image|max:2048',
            'description'     => 'nullable|string',
        ]);

        // Mengambil prefix kategori
        $category = Category::findOrFail($request->category_id);
        $prefix = $category->code ?? 'AST';

        // Mencari no urut terakhir kategori
        $lastAsset = Asset::withTrashed()
                    ->where('category_id', $request->category_id)
                    ->latest('id')
                    ->first();

        // Mengambil angka dari kode terakhir atau dari 0
        $nextNumber = 1;
        if ($lastAsset && preg_match('/-(\d+)$/', $lastAsset->code, $matches)) {
            $nextNumber = intval($matches[1]) + 1;
        }

        // Format kode baru
        $generatedCode = $prefix . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        // Melakukakn looping check data
        while(Asset::withTrashed()->where('code', $generatedCode)->exists()) {
            $nextNumber++;
            $generatedCode = $prefix . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        }

        $data = $request->all();
        $data['code'] = $generatedCode;

        // Mengisi useful life dari kategori jika user ga diisi manual
        if (empty($request->useful_life)) {
            $data['useful_life'] = $category->useful_life;
        }

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $folderName = 'assets';
            $fileName = time() . '-' . str_replace(' ', '_', $file->getClientOriginalName());

            Storage::disk('public')->putFileAs($folderName, $file, $fileName);

            $data['image_path'] = $folderName . '/' . $fileName;
        }

        $asset = Asset::create($data);

        return response()->json([
            'status'  => 'success',
            'message' => 'Asset created successfully',
            'data'    => $asset
        ]);

    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $asset = Asset::with([
            'category',
            'location.parent.parent',
            'supplier',
            'status',
            'unit.department',
            'loans.user'
        ])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data'   => $asset
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Asset $asset)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $asset = Asset::findOrFail($id);

        $request->validate([
            'name'            => 'required|string|max:255',
            'category_id'     => 'required|exists:categories,id',
            'location_id'     => 'required|exists:locations,id',
            'asset_status_id' => 'required|exists:asset_statuses,id',
            'unit_id'         => 'required|exists:units,id',
            'image'           => 'nullable|image|max:2048',
        ]);

        $data = $request->except(['code']);

        if ($request->hasFile('image')) {
            if ($asset->image_path && Storage::disk('public')->exists($asset->image_path)) {
                Storage::disk('public')->delete($asset->image_path);
            }

            $file = $request->file('image');
            $fileName = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
            Storage::disk('public')->putFileAs('assets', $file, $fileName);
            $data['image_path'] = 'assets/' . $fileName;
        }

        $asset->update($data);

        return response()->json([
            'status'  => 'success',
            'message' => 'Asset updated',
            'data'    => $asset
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $asset = Asset::findOrFail($id);
        $asset->delete();
        return response()->json([
            'staus'   => 'success',
            'message' => 'Asset moved to trash',
            'data'    => $asset
        ]);
    }
}
