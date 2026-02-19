<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetStatus;
use App\Models\Loan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Loan::with(['user', 'asset.category']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('loan_code', 'ilike', '%' . $request->search . '%')
                  ->orWhereHas('asset', fn($q2) => $q2->where('name', 'ilike', '%' . $request->search . '%'))
                  ->orWhereHas('user', fn($q2) => $q2->where('name', 'ilike', '%' . $request->search . '%'));
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $user = Auth::user();
        if ($user->role === 'staff') {
            $query->where('user_id', $user->id);
        }

        $loans = $query->latest()->paginate(10);

        return response()->json([
            'status' => 'success',
            'data'   => $loans
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
    public function store(Request $request,)
    {
        $request->validate([
            'asset_id'    => 'required|exists:assets,id',
            'return_date' => 'required|date|after:today',
            'reason'      => 'required|string|max:500',
        ]);

        // Cek ketersediaan asset
        $asset = Asset::with('status')->findOrFail($request->asset_id);

        if (!$asset->status->is_deployable) {
            return response()->json([
                'message' => "This asset is not available for loan"
            ], 422);
        }

        $isBusy = Loan::where('asset_id', $asset->id)
                        ->whereIn('status', ['pending', 'active', 'approved'])
                        ->exists();

        if ($isBusy) {
            return response()->json([
                'message' => "This asset is currently being loaned by another user."
            ], 422);
        }

        $prefix = 'LN-' . date('ym');
        $lastLoan = Loan::where('loan_code', 'like' , "$prefix%")->latest('id')->first();
        $number = $lastLoan ? intval(substr($lastLoan->loan_code, -4)) + 1 : 1;
        $loanCode = $prefix . '-' . str_pad($number, 4, '0', STR_PAD_LEFT);

        $loan = Loan::create([
            'loan_code'         => $loanCode,
            'user_id'           => Auth::id(),
            'asset_id'          => $request->asset_id,
            'loan_date'         => Carbon::now(),
            'return_date'       => $request->return_date,
            'reason'            => $request->reason,
            'status_tl_user'    => 'pending',
            'status_tl_asset'   => 'pending',
            'status_ga'         => 'pending',
            'status_vp'         => 'pending',
            'status'            => 'pending'
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Loan request created successfully.',
            'data'    => $loan
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $loan = Loan::with([
            'user.unit',
            'asset.location',
            'asset.category',
            'approverTlUser',
            'approverTlAsset',
            'approverGa',
            'approverVp'
        ])->findOrFail($id);

        return response()->json([
            'status'  => 'success',
            'data'    => $loan
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Approval loans
     */
    public function approve(Request $request, $id)
    {
        $loan = Loan::with('asset')->findOrFail($id);
        $user = Auth::user();
        $isUpdated = false;

        // Superadmin dapat melakukan approve semua
        if ($user->role == 'superadmin') {
            $now = now();

            // Approve user
            if ($loan->status_tl_user == 'pending') {
                $loan->status_tl_user = 'approved';
                $loan->approver_tl_user_id = $user->id;
                $loan->date_tl_user = $now;
            }

            // Approve asset
            if ($loan->status_tl_asset == 'pending') {
                $loan->status_tl_asset = 'approved';
                $loan->approver_tl_asset_id = $user->id;
                $loan->date_tl_asset = $now;
            }

            // Approve GA
            if ($loan->status_ga == 'pending') {
                $loan->status_ga = 'approved';
                $loan->approver_ga_id = $user->id;
                $loan->date_ga = $now;
            }

            // Approve VP
            if ($loan->status_vp == 'pending') {
                $loan->status_vp = 'approved';
                $loan->approver_vp_id = $user->id;
                $loan->date_vp = $now;
            }

            $loan->status = 'approved';
            $this->updateAssetStatus($loan->asset_id, 'in-use');
            $isUpdated = true;

            // Sesuai ROLE
        } else {
            if ($loan->status_tl_user == 'pending' && $user->role == 'head') {
                $loan->status_tl_user = 'approved';
                $loan->approver_tl_user_id = $user->id;
                $loan->date_tl_user = now();
                $isUpdated = true;
            }

            if ($loan->status_tl_asset == 'pending' && $user->role == 'head' && $user->unit_id == $loan->asset->unit_id) {
                $loan->status_tl_asset = 'approved';
                $loan->approver_tl_asset_id = $user->id;
                $loan->date_tl_asset = now();
                $isUpdated = true;
            }

            if ($loan->status_ga == 'pending' && $user->role == 'ga') {
                if ($loan->status_tl_user == 'approved' && $loan->status_tl_asset == 'approved') {
                    $loan->status_ga = 'approved';
                    $loan->approver_ga_id = $user->id;
                    $loan->date_ga = now();
                    $isUpdated = true;
                } else {
                    return response()->json([
                        'message' => 'Waiting for team leader approval first'
                    ]);
                }
            }

            if ($loan->status_vp == 'pending' && $user->role == 'vp') {
                if ($loan->status_ga == 'approved') {
                    $loan->status_vp = 'approved';
                    $loan->approver_vp_id = $user->id;
                    $loan->date_vp = now();
                    $loan->status = 'approved';

                    $this->updateAssetStatus($loan->asset_id, 'in-use');
                    $isUpdated = true;
                } else {
                    return response()->json([
                        'message' => 'Waiting for ga approval first'
                    ]);
                }
            }
        }

        if (!$isUpdated) {
            return response()->json([
                'message' => 'You are not authorized or already token'
            ]);
        }

        $loan->save();

        return response()->json([
            'message' => 'Approval successfully',
            'data'    => $loan
        ]);
    }

    /**
     * Reject loans
     */
    public function reject(Request $request, $id)
    {
        $loan = Loan::findOrFail($id);
        $user = Auth::user();

        $loan->status = 'rejected';
        $loan->notes = $request->reason ?? 'Rejected by' . $user->name;

        if ($user->role == 'superadmin') {
            $loan->status_tl_user = 'rejected';
            $loan->status_tl_asset = 'rejected';
            $loan->status_ga = 'rejected';
            $loan->status_vp = 'rejected';
            $loan->approver_vp_id = $user->id;
        }

        else {
            if ($user->role == 'head') {
                if ($loan->status_tl_user == 'pending') {
                    $loan->status_tl_user = 'rejected';
                }

                if ($loan->status_tl_asset == 'pending') {
                    $loan->status_tl_asset = 'rejected';
                }
            }

            if ($user->role == 'ga') {
                $loan->status_ga = 'rejected';
            }

            if ($loan->role == 'vp') {
                $loan->status_vp = 'rejected';
            }
        }

        $loan->save();

        return response()->json([
            'message' => 'Rqeust rejected',
            'data'    => $loan
        ]);
    }

    /**
     * Return loans
     */
    public function returnAsset (Request $request, $id)
    {
        $loan = Loan::findOrFail($id);

        if ($loan->status != 'approved' && $loan->status != 'active') {
            return response()->json([
                'message' => 'Loan in not active or approved'
            ]);
        }

        $loan->status = 'returned';
        $loan->return_date = now();
        $loan->notes = $request->notes ?? 'Returned.';

        $loan->save();

        $this->updateAssetStatus($loan->asset_id, 'ready');

        return response()->json([
            'message' => 'Asset returned successfully',
            'data'    => $loan
        ]);
    }

    /**
     * Helper status
     */
    private function updateAssetStatus($assetId, $statusSlug)
    {
        $status = AssetStatus::where('slug', $statusSlug)->first();

        if ($status) {
            Asset::where('id', $assetId)->update(['asset_status_id' => $status->id]);
        }
    }
}
