<?php

namespace App\Http\Controllers;

use App\Models\AssetStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AssetStatusController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data'   => AssetStatus::latest()->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:255|unique:asset_statuses,name',
            'style'         => 'required|in:success,danger,warning,info,secondary',
            'is_deployable' => 'boolean',
        ]);

        $status = AssetStatus::create([
            'name'          => $request->name,
            'slug'          => Str::slug($request->name),
            'style'         => $request->style,
            'is_deployable' => $request->is_deployable ?? true
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Status saved',
            'data'    => $status
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $status = AssetStatus::with([
            'assets.category',
            'assets.location'
        ])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data'   => $status
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $status = AssetStatus::findOrFail($id);

        $request->validate([
            'name'          => 'required|string|max:255|unique:asset_statuses,name,' . $id,
            'style'         => 'required|in:success,danger,warning,info,secondary',
            'is_deployable' => 'boolean'
        ]);

        $status->update([
            'name'          => $request->name,
            'slug'          => Str::slug($request->name),
            'style'         => $request->style,
            'is_deployable' => $request->is_deployable
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Status updated',
            'data'    => $status
        ], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        AssetStatus::findOrFail($id)->delete();
        return response()->json([
            'status'  => 'success',
            'message' => 'Status deleted'
        ]);
    }
}
