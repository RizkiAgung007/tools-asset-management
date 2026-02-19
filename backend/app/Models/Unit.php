<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable
     *
     * @var arrray<int, string>
     */
    protected $guarded = [
        'id'
    ];

    // Get the department
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    // Get all assets
    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }

    // Get all users
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
