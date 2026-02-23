<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
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

    // Get all units
    public function units()
    {
        return $this->hasMany(Unit::class);
    }

}
