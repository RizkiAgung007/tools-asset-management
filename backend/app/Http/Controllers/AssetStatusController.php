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
            'name'  => 'required|string|max:255|unique:asset_statuses,name',
            'style' => 'required|in:success,danger,warning,info,secondary'
        ]);

        $status = AssetStatus::create([
            'name'  => $request->name,
            'slug'  => Str::slug($request->name),
            'style' => $request->style
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Status saved',
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
