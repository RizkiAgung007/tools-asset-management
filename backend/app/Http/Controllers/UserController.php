<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    use HasFactory;

    /**
     * Index
     */
    public function index()
    {
        $users = User::with('unit.department')->orderBy('name')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $users
        ]);
    }

    /**
     * Store
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'   => 'required|string|max:50',
            'email'  => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role'   => 'required|in:superadmin,vp,head,ga,staff',
            'unit_id' => 'nullable|exists:units,id',
            'manager_id' => 'nullable|exists:users,id'
        ]);

        $data = $request->all();
        $data['password'] = Hash::make($request->password);

        $user = User::create($data);

        return response()->json([
            'status' => 'success',
            'data'   => $user->load('unit', 'manager')
        ]);
    }

    /**
     * Update
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name'   => 'required|string|max:50',
            'email'  => 'required|email|unique:users,email'.$id,
            'role'   => 'required|in:superadmin,vp,head,ga,staff',
            'unit_id' => 'nullable|exists:units,id',
            'manager_id' => 'nullable|exists:users,id'
        ]);

        $user = User::findOrFail($id);
        $data = $request->excepts('password');

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'status' => 'success',
            'data'   => $user->load('unit', 'manager')
        ]);
    }

    /**
     * Destroy
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id)->delete();

        return response()->json([
            'status' => 'success',
            'data'   => $user,
            'message'=> 'Deleted successfully'
        ]);
    }
}
