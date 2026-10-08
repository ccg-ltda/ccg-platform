<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'username', 'email', 'phone', 'operacion', 'company_id', 'status', 'password', 'email_verified_at', 'remember_token'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    protected static function booted(): void
    {
        static::creating(function ($user) {
            if (is_null($user->email_verified_at)) {
                $user->email_verified_at = now();
            }
            if (is_null($user->remember_token)) {
                $user->remember_token = Str::random(10);
            }
            if ($user->operacion === 'superadmin') {
                $user->status = 'aprobado';
            }
        });

        static::saving(function ($user) {
            if ($user->operacion === 'superadmin') {
                $user->status = 'aprobado';
            }
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('superadmin') || $this->operacion === 'superadmin' || $this->roles->pluck('name')->contains('superadmin');
    }

    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }
}
