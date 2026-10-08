<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'login' => ['required', 'string'],
            'operacion' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if ($this->has('login') && !$this->has('email')) {
            $this->merge(['email' => $this->input('login')]);
        }

        $user = User::where('email', $this->email)
            ->orWhere('username', $this->email)
            ->orWhere('phone', $this->email)
            ->first();

        if (! $user || ! Hash::check($this->password, $user->password)) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
                'login' => trans('auth.failed'),
            ]);
        }

        // Validar coincidencia de operación para TODOS los usuarios
        $inputOperacion = mb_strtolower(trim($this->operacion ?? ''));
        $userOperacion  = mb_strtolower(trim($user->operacion ?? ''));

        $isSuperadmin = $user->is_superadmin || $user->hasRole('superadmin');

        if ($isSuperadmin) {
            if (strtolower(trim($this->operacion ?? '')) !== 'superadmin') {
                RateLimiter::hit($this->throttleKey());

                throw ValidationException::withMessages([
                    'operacion' => __('Organización no válida para el rol Superadmin.'),
                ]);
            }
        } else {
            if ($inputOperacion !== $userOperacion) {
                RateLimiter::hit($this->throttleKey());

                throw ValidationException::withMessages([
                    'email' => 'La Organización seleccionada no corresponde a su usuario.',
                    'operacion' => 'La Organización seleccionada no corresponde a su usuario.',
                ]);
            }
        }

        Auth::login($user, $this->boolean('remember'));
        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('login')).'|'.$this->ip());
    }
}
