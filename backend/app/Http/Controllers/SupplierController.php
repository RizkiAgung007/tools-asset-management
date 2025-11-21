<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Supplier::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', '%' . $request->search . '%')
                ->orWhere('contact_person', 'ilike', '%' . $request->search . '%')
                ->orWhere('email', 'ilike', '%' . $request->search . '%');
            });
        }

        $suppliers = $query->latest()->paginate(10);

        return response()->json([
            'status' => 'success',
            'data'   => $suppliers
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
            'name'           => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'email'          => 'required|email',
            'phone'          => 'nullable|string|max:20',
            'address'        => 'nullable|string'
        ]);

        $supplier = Supplier::create([
            'name'           => $request->name,
            'contact_person' => $request->contact_person,
            'email'          => $request->email,
            'phone'          => $request->phone,
            'address'        => $request->address
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Supplier added successfully',
            'data'    => $supplier
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
        $supplier = Supplier::findOrFail($id);

        $request->validate([
            'name'           => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'email'          => 'required|email',
            'phone'          => 'nullable|string|max:20',
            'address'        => 'nullable|string'
        ]);

        $supplier->update([
            'name'           => $request->name,
            'contact_person' => $request->contact_person,
            'email'          => $request->email,
            'phone'          => $request->phone,
            'address'        => $request->address
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Supplier updated successfully',
            'data'    => $supplier
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        Supplier::findOrFail($id)->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Supplier deleted successfully'
        ]);
    }
}
