<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    use HasFactory;

    /**
     * Index
     */
    public function index()
    {
        $units = Unit::with('department')->orderBy('name')->get();

        return response()->json([
            'status' => 'success',
            'data'  => $units
        ]);
    }

    /**
     * Store
     */
    public function store(Request $request)
    {
        $request->validate([
            'department_id' => 'required|exists:departments,id',
            'name'          => 'required|string|max:50'
        ]);

        $unit = Unit::create($request->all());

        return response()->json([
            'status' => 'success',
            'data'   => $unit->load('department')
        ]);
    }

    /**
     * Update
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'department_id' => 'required|exists:departments,id',
            'name'          => 'required|string|max:50'
        ]);

        $unit = Unit::findOrFail($id);
        $unit->update($request->all());

        return response()->json([
            'status' => 'success',
            'data'   => $unit->load('department')
        ]);
    }

    /**
     * Destroy
     */
    public function destroy($id)
    {
        $unit = Unit::destroy($id);

        return response()->json([
            'status' => 'success',
            'data'   => $unit,
            'message'=> 'Deleted successfully'
        ]);
    }
}
