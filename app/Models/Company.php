<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'project',
        'activity',
        'status',
        'plan_type',
        'subscription_status',
        'subscription_expires_at',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function quotations()
    {
        return $this->hasMany(Quotation::class);
    }

    public function deals()
    {
        return $this->hasMany(Deal::class);
    }
}
