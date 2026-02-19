<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetStatus extends Model
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

    // Menamnpilkan asset pada relasi status
    public function assets()
    {
        return $this->hasMany(Asset::class, 'asset_status_id');
    }
}
