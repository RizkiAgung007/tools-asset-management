<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    /**
     * Get the Category
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the Locatin
     *
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    // Get the status
    public function status(): BelongsTo
    {
        return $this->belongsTo(AssetStatus::class, 'asset_status_id');
    }

    // Get the supplier
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    // Get the unit
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    // Get loan
    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    /**
     * Get maintenance
     */
    public function maintenances()
    {
        return $this->hasMany(Maintenance::class);
    }
}
