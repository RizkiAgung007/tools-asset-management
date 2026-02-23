<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Http\Request;

class DepartementController extends Controller
{

    use HasFactory;

    /**
     * Index
     */
    public function index()
    {
        $departements = Department::orderBy('name')->get();
        return response()->json([
            'status' => 'success',
            'data'   => $departements
        ]);
    }

    /**
     * Store
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:255|unique:departments'
        ]);

        $departement = Department::create($request->all());

        return response()->json([
            'status' => 'success',
            'data'  => $departement
        ]);
    }

    /**
     * Update
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name'  => 'required|string|max:255|unique:departments,name,' .$id
        ]);

        $departement = Department::findOrFail($id);
        $departement->update($request->all());

        return response()->json([
            'status' => 'success',
            'data'   => $departement
        ]);
    }

    /**
     * Destroy
     */
    public function destroy($id)
    {
        $departement = Department::destroy($id);

        return response()->json([
            'status' => 'successs',
            'data'   => $departement,
            'message'=> 'Deleted successfully'
        ]);
    }
}
