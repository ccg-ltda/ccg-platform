<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Deal extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'company_id',
        'user_id',
        'amount',
        'stage',
        'expected_close_date',
        'notes',
        'appointment_date',
        'appointment_time',
        'appointment_location',
        'appointment_notes',
    ];

    protected $casts = [
        'expected_close_date' => 'date',
        'appointment_date' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function quotations()
    {
        return $this->hasMany(Quotation::class);
    }
}
