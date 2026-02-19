<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Maintenance extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    /**
     * Relation with asset
     */
    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * Relation with supplier
     */
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Relation with user
     */
    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }
}
