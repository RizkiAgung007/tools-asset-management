<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index()
    {
        $units = Unit::orderBy('name', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $units
        ]);
    }
}
