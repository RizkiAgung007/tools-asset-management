<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class LocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Location::with('parent');

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        $locations = $query->latest()->get();

        return response()->json([
            'data' => $locations
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
            'name'        => 'required|string|max:255|unique:locations,name',
            'type'        => 'required|in:building,floor,room',
            'parent_id'   => 'nullable|exists:locations,id',
            'description' => 'nullable|string'
        ]);

        if ($request->type !== 'building' && empty($request->parent_id)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Floors and rooms must choose the building'
            ]);
        }

        $location = Location::create([
            'name'        => $request->name,
            'slug'        => Str::slug($request->name . '-' . Str::random(5)),
            'type'        => $request->type,
            'parent_id'   => $request->parent_id,
            'description' => $request->description
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Location added successfully',
            'data'    => $location
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(String $id)
    {
        $location = Location::with(['parent.parent', 'children', 'assets.category', 'assets.status'])->findOrFail($id);

        return response()->json(['data' => $location]);
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
    public function update(Request $request, $id)
    {
        $location = Location::findOrFail($id);

        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'address'     => 'nullable|string',
            'capacity'    => 'nullable|integer',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = [
            'name'        => $request->name,
            'slug'        => Str::slug($request->name . '-' . ($location->parent_id ?? 'root')),
            'description' => $request->description,
            'address'     => $request->address,
            'capacity'    => $request->capacity,
        ];

        if ($request->hasFile('image')) {
            if ($location->image_path && Storage::disk('public')->exists($location->image_path)) {
                Storage::disk('public')->delete($location->image_path);
            }

            $file = $request->file('image');
            $folderName = 'locations';
            $fileName = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());

            Storage::disk('public')->putFileAs($folderName, $file, $fileName);

            $data['image_path'] = $folderName . '/' . $fileName;
        }

        $location->update($data);

        return response()->json([
            'status'  => 'success',
            'message' => 'Location updated successfully',
            'data'    => $location
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Location::findOrFail($id)->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Location deleted successfully'
        ]);
    }

    /**
     * Add one shoot creation
     */
    public function storeHierarcy(Request $request)
    {
        $request->validate([
            'building_name' => 'required|string|max:255',
            'address'       => 'required|string|max:255',
            'floor_name'    => 'required|string|max:255',
            'room_name'     => 'required|string|max:255',
            'description'   => 'nullable|string'
        ]);

        $building = Location::firstOrCreate(
            ['name' => $request->building_name, 'type' => 'building'],
            [
                'slug'    => Str::slug($request->building_name),
                'address' => $request->address
            ]
        );

        if ($request->address) {
            $building->update(['address' => $request->address]);
        }

        $floor = Location::firstOrCreate(
            [
                'name'      => $request->floor_name,
                'type'      => 'floor',
                'parent_id' => $building->id
            ],
            ['slug' => Str::slug($request->floor_name . '-' . $building->id)]
        );

        $room = Location::firstOrCreate(
            [
                'name'      => $request->room_name,
                'type'      => 'room',
                'parent_id' => $floor->id
            ],
            [
                'slug'        => Str::slug($request->room_name . '-' . $floor->id),
                'description' => $request->description
            ]
        );

        if ($request->description) {
            $room->update(['description' => $request->description]);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Location Hierarchy successfully created/updated',
            'data'    => $room
        ]);
    }
}
