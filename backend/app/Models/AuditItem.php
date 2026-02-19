<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditItem extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    /**
     * Relation to Asset
     */
    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}
