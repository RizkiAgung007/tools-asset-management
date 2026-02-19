<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Category::with('parent');
        // $query = Category::query();

        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        } elseif ($request->has('only_root')) {
            $query->whereNull('parent_id')->withCount('children');
        } elseif ($request->has('only_children')) {
            $query->whereNotNull('parent_id');
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', '%' . $request->search . '%')
                ->orWhere('code', 'ilike', '%' . $request->search . '%');
            });
        }

        if ($request->has('no_paginate') || $request->has('per_page')) {
            return response()->json([
                'status' => 'success',
                'data'   => $query->orderBy('name', 'asc')->get()
            ]);
        }

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
        $category = Category::with(['parent', 'children', 'assets.location', 'assets.status'])->findOrFail($id);

        $categories = collect([$category->id]);
        foreach ($category->children as $child) {
            $categories->push($child->id);
        }

        $stats = Asset::whereIn('category_id', $categories)->selectRaw('count(*) as total_items')
                ->selectRaw("sum(case when asset_status_id = (select id from asset_statuses where slug = 'ready' limit 1) then 1 else 0 end) as total_ready")
                ->selectRaw("sum(purchase_price) as total_price")
                ->first();

        $category->stats = [
            'total_assets' => $stats->total_items ?? 0,
            'total_price'  => $stats->total_price ?? 0,
            'total_ready'  => $stats->total_ready ?? 0
        ];

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
