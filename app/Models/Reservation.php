<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_name',
        'service',
        'estimated_amount',
        'company_id',
        'user_id',
        'appointment_datetime',
        'location',
        'modality',
        'meeting_link',
        'contact_phone',
        'contact_email',
        'start_time',
        'end_time',
        'assigned_to',
        'notes',
        'status',
        'deal_id',
    ];

    protected $casts = [
        'appointment_datetime' => 'datetime',
        'estimated_amount' => 'decimal:2',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function deal()
    {
        return $this->belongsTo(Deal::class);
    }
}
