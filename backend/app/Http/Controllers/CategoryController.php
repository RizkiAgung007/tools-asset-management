<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Category::whereNull('parent_id')->withCount('children');

        $categories = $query->latest()->paginate(10);

        return response()->json([
            'status' => 'success',
            'data'   => $categories
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
            'name'        => 'required|string|max:255|unique:categories,name',
            'code'        => 'required|string|max:10|unique:categories,code',
            'useful_life' => 'nullable|integer|min:1',
            'parent_id'   => 'nullable|exists:categories,id'
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

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $category = Category::with(['parent', 'children'])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data'   => $category
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
        $category = Category::findOrFail($id);

        $request->validate([
            'name'        => 'required|string|max:255|unique:categories,name,' . $id,
            'code'        => 'required|string|max:10|unique:categories,code,' . $id,
            'useful_life' => 'nullable|integer|min:1',
            'parent_id'   => 'nullable|exists:categories,id'
        ]);

        if ($request->parent_id == $id) {
            return response()->json([
                'message' => 'Category cannot be its own parent'
            ]);
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

    /**
     * Remove the specified resource from storage.
     */
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
