<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Quotation;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the authenticated user's profile.
     */
    public function show(Request $request): Response
    {
        $user = $request->user()->load(['roles', 'permissions', 'company']);

        return Inertia::render('Profile/Show', [
            'user' => $user,
            'role' => $user->roles->pluck('name')->first() ?? 'cliente',
            'metrics' => [
                'requests' => Reservation::where('user_id', $user->id)->count(),
                'quotations' => Quotation::where('user_id', $user->id)->count(),
                'deals' => $user->deals()->count(),
            ],
        ]);
    }

    /**
     * Display another user's profile (read-only).
     */
    public function showVisitor(User $user): Response
    {
        return Inertia::render('Profile/Visitor', [
            'profileUser' => $user->only(['id', 'name', 'email', 'created_at']),
            'isOwnProfile' => auth()->id() === $user->id,
        ]);
    }

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
