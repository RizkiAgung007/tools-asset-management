<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Loan extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    /**
     * Get the User
     *
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the Asset
     *
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * Relation Approved
     *
     */
    public function approverTlUser()
    {
        return $this->belongsTo(User::class, 'approver_tl_user_id');
    }

    public function approverTlAsset()
    {
        return $this->belongsTo(User::class, 'approver_tl_asset_id');
    }

    public function approverGa()
    {
        return $this->belongsTo(User::class, 'approver_ga_id');
    }

    public function approverVp()
    {
        return $this->belongsTo(User::class, 'approver_vp_id');
    }
}
