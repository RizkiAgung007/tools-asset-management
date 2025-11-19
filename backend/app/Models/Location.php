<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Location extends Model
{

    use HasFactory;

    /**
     * The attributes that are mass assignable
     *
     * @var arrray<int, string>
     */
    protected $guarded = [
        'id',
    ];

    /**
     * Get the parent location
     *
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'parent_id');
    }

    /**
     * Get all child locations
     */
    public function children(): HasMany
    {
        return $this->hasMany(Location::class, 'parent_id');
    }
}
