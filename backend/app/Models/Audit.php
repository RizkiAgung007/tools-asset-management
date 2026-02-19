<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Audit extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    /**
     * Relation to Location
     */
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Relation to auditor
     */
    public function auditor()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation to Audit Item
     */
    public function items()
    {
        return $this->hasMany(AuditItem::class);
    }

}
