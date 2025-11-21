<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AssetController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::with('parent');

        // 1. Filter Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', '%' . $request->search . '%')
                ->orWhere('code', 'ilike', '%' . $request->search . '%');
            });
        }

        // 2. Filter Parent/Child (LOGIKA BARU DI SINI)
        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }
        elseif ($request->has('only_root')) {
            $query->whereNull('parent_id')->withCount('children');
        }
        elseif ($request->has('only_children')) {
            $query->whereNotNull('parent_id');
        }

        // 3. Return Data (Tanpa Paginasi jika diminta frontend)
        if ($request->has('no_paginate') || $request->has('per_page')) {
             // Jika minta 100 data atau no_paginate, kita anggap list dropdown
             // Urutkan berdasarkan nama biar rapi
             $categories = $query->orderBy('name', 'asc')->get();

             return response()->json([
                'status' => 'success',
                'data' => $categories
             ]);
        }

        // Default Pagination (Untuk Halaman List Kategori)
        $categories = $query->latest()->paginate(10);

        return response()->json([
            'status' => 'success',
            'data'   => $categories
        ]);
    }
// ```

// ### TAHAP 2: Update Frontend (`AssetFormPage.jsx`)

// Sekarang kita suruh Frontend meminta data khusus anak saja.

// Buka file **`frontend/src/pages/AssetFormPage.jsx`**.
// Cari bagian `useEffect` -> `loadData`.

// Ubah baris request kategori menjadi:

// ```javascript
// // Tambahkan parameter 'only_children=true'
// api.get("/api/categories?per_page=100&only_children=true"),
// ```

// Dan pastikan cara set state-nya sesuai format `get()` (bukan paginate):

// ```javascript
// // Ubah cara ambil datanya karena struktur responnya beda (langsung array data)
// setCategories(catRes.data.data);
// ```

// ---

// ### Ringkasan Kode `AssetFormPage.jsx` (Bagian useEffect)

// Ini potongan kode yang harus Anda ubah di `AssetFormPage.jsx`:

// ```javascript
//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         const [catRes, locRes, staRes, supRes] = await Promise.all([
//           // UPDATE DI SINI: Tambah &only_children=true
//           api.get("/api/categories?per_page=100&only_children=true"),
//           api.get("/api/locations"),
//           api.get("/api/asset-status"),
//           api.get("/api/suppliers?per_page=100"),
//         ]);

//         // UPDATE DI SINI: Ambil langsung .data.data (karena get(), bukan paginate)
//         setCategories(catRes.data.data);

//         setLocations(locRes.data.data);
//         setStatuses(staRes.data.data);
//         setSuppliers(supRes.data.data.data || supRes.data.data);

//         // ... sisa kode logic edit ...

    // 2. Simpan Data Baru (Store)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'location_id' => 'required|exists:locations,id',
            'asset_status_id' => 'required|exists:asset_statuses,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric',
            'serial_number' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048', // Max 2MB
            'description' => 'nullable|string',
        ]);

        // --- LOGIKA AUTO GENERATE CODE ---
        // 1. Ambil kode prefix kategori (Misal: LAP)
        $category = Category::findOrFail($request->category_id);
        $prefix = $category->code ?? 'AST'; // Default AST jika kosong

        // 2. Cari nomor urut terakhir untuk kategori ini
        $lastAsset = Asset::where('category_id', $request->category_id)->latest('id')->first();

        // 3. Ambil angka dari kode terakhir, atau mulai dari 0
        // Asumsi format: LAP-0001
        $nextNumber = 1;
        if ($lastAsset && preg_match('/-(\d+)$/', $lastAsset->code, $matches)) {
            $nextNumber = intval($matches[1]) + 1;
        }

        // 4. Format kode baru (LAP-0005)
        $generatedCode = $prefix . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        // Pastikan unik (looping check jika perlu, tapi logic di atas biasanya aman)
        while(Asset::where('code', $generatedCode)->exists()) {
            $nextNumber++;
            $generatedCode = $prefix . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        }
        // ---------------------------------

        $data = $request->all();
        $data['code'] = $generatedCode; // Masukkan kode otomatis

        // Copy useful life dari kategori jika user tidak isi manual (optional logic)
        if (empty($request->useful_life)) {
            $data['useful_life'] = $category->useful_life;
        }

        // Upload Gambar
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $fileName = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
            // Simpan di folder 'assets'
            Storage::disk('public')->putFileAs('assets', $file, $fileName);
            $data['image_path'] = 'assets/' . $fileName;
        }

        $asset = Asset::create($data);

        return response()->json(['message' => 'Asset created successfully', 'data' => $asset], 201);
    }

    // 3. Ambil Detail (Show)
    public function show($id)
    {
        $asset = Asset::with(['category', 'location.parent', 'supplier', 'status'])->findOrFail($id);
        return response()->json(['data' => $asset]);
    }

    // 4. Update Data
    public function update(Request $request, $id)
    {
        $asset = Asset::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'location_id' => 'required|exists:locations,id',
            'asset_status_id' => 'required|exists:asset_statuses,id',
            'image' => 'nullable|image|max:2048',
        ]);

        $data = $request->except(['code']); // Code tidak boleh diubah sembarangan

        // Upload Gambar Baru
        if ($request->hasFile('image')) {
            // Hapus lama
            if ($asset->image_path && Storage::disk('public')->exists($asset->image_path)) {
                Storage::disk('public')->delete($asset->image_path);
            }
            // Simpan baru
            $file = $request->file('image');
            $fileName = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
            Storage::disk('public')->putFileAs('assets', $file, $fileName);
            $data['image_path'] = 'assets/' . $fileName;
        }

        $asset->update($data);

        return response()->json(['message' => 'Asset updated', 'data' => $asset]);
    }

    // 5. Hapus (Soft Delete)
    public function destroy($id)
    {
        $asset = Asset::findOrFail($id);
        $asset->delete(); // Ini soft delete karena model pakai SoftDeletes
        return response()->json(['message' => 'Asset moved to trash']);
    }
}

