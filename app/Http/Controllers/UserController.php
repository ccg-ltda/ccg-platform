<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        return redirect()->route('settings.index', array_merge(['tab' => 'users'], $request->all()));
    }

    public function store(Request $request): RedirectResponse
    {
        $authUser = auth()->user();
        $isSuperAdmin = $authUser->isSuperAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|exists:roles,name',
            'company_id' => 'nullable|exists:companies,id',
            'operacion' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        if (!$isSuperAdmin) {
            if (strtolower($validated['role']) === 'superadmin') {
                abort(403, 'No autorizado para asignar rol de superadmin');
            }
            $validated['company_id'] = $authUser->company_id;
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'company_id' => $validated['company_id'] ?? null,
            'operacion' => $validated['operacion'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'status' => 'aprobado',
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('settings.index', ['tab' => 'users']);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $authUser = auth()->user();
        $isSuperAdmin = $authUser->isSuperAdmin();

        if (!$isSuperAdmin && $user->company_id !== $authUser->company_id) {
            abort(403, 'No autorizado');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'nullable|string|max:255',
            'email' => 'required|string|email|max:255',
            'phone' => 'nullable|string|max:20',
            'operacion' => 'nullable|string|max:255',
            'company_id' => 'nullable|exists:companies,id',
            'role' => 'required|string|exists:roles,name',
        ]);

        if (!$isSuperAdmin) {
            if (strtolower($validated['role']) === 'superadmin') {
                abort(403, 'No autorizado para asignar rol de superadmin');
            }
            $validated['company_id'] = $authUser->company_id;
        }

        $user->update([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'operacion' => $validated['operacion'],
            'company_id' => $validated['company_id'] ?? null,
        ]);

        $user->syncRoles([$validated['role']]);

        return redirect()->route('settings.index', ['tab' => 'users']);
    }

    public function toggleStatus(User $user): RedirectResponse
    {
        $authUser = auth()->user();
        if (!$authUser->isSuperAdmin() && $user->company_id !== $authUser->company_id) {
            abort(403, 'No autorizado');
        }

        $newStatus = $user->status === 'aprobado' ? 'inhabilitado' : 'aprobado';
        $user->update(['status' => $newStatus]);

        return redirect()->route('settings.index', ['tab' => 'users']);
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'No autorizado');
        }

        if ($user->id !== auth()->id()) {
            $user->delete();
        }

        return redirect()->route('settings.index', ['tab' => 'users']);
    }
}
