<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'price',
        'max_users',
        'max_branches',
        'is_active',
        'benefits',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'benefits' => 'array',
    ];
}
