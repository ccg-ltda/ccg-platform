<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quotation extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'user_id',
        'company_id',
        'deal_id',
        'product_service',
        'date',
        'total',
        'status',
        'observation',
    ];

    protected $casts = [
        'date' => 'date',
        'total' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function deal()
    {
        return $this->belongsTo(Deal::class);
    }
}