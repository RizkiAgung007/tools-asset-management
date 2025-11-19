<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::whereNull('parent_id')
            ->withCount('children');

        $categories = $query->latest()->get(); // Atau paginate(25)

        return response()->json([
            'status' => 'success',
            'data' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255|unique:categories,name',
            'code'        => 'required|string|max:10|unique:categories,code',
            'useful_life' => 'nullable|integer|min:1',
            'parent_id'   => 'nullable|exists:categories,id' // Validasi Parent
        ]);

        $category = Category::create([
            'name'        => $request->name,
            'code'        => strtoupper($request->code),
            'slug'        => Str::slug($request->name),
            'useful_life' => $request->useful_life,
            'parent_id'   => $request->parent_id
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Category added successfully',
            'data'    => $category
        ], 201);
    }

    public function show(string $id)
    {
        // Load 'parent' (induk) dan 'children' (anak-anaknya)
        $category = Category::with(['parent', 'children'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data'   => $category
        ]);
    }

    public function update(Request $request, string $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name'        => 'required|string|max:255|unique:categories,name,' . $id,
            'code'        => 'required|string|max:10|unique:categories,code,' . $id,
            'useful_life' => 'nullable|integer|min:1',
            'parent_id'   => 'nullable|exists:categories,id'
        ]);

        // Validasi Logika: Kategori tidak boleh menjadi induk dirinya sendiri
        if ($request->parent_id == $id) {
            return response()->json([
                'message' => 'Category cannot be its own parent'
            ], 422);
        }

        $category->update([
            'name'        => $request->name,
            'code'        => strtoupper($request->code),
            'slug'        => Str::slug($request->name),
            'useful_life' => $request->useful_life,
            'parent_id'   => $request->parent_id
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Category updated successfully',
            'data'    => $category
        ]);
    }

    public function destroy(string $id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Category deleted successfully'
        ]);
    }
}
