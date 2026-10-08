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
        $authUser = auth()->user();
        $activeCompanyId = session('active_company_id');

        $query = User::query()->with(['roles', 'company']);

        if ($authUser->isSuperAdmin()) {
            if ($activeCompanyId) {
                $query->where('company_id', $activeCompanyId);
            }
        } else {
            $query->forCompany($authUser->company_id);
        }

        $users = $query->latest()->get();
        $roles = Role::all(['id', 'name']);
        $companies = Company::where('status', 'activo')->get(['id', 'name']);

        return Inertia::render('Users/Index', [
            'users' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'operacion' => $user->operacion,
                    'company_id' => $user->company_id,
                    'company_name' => $user->company ? $user->company->name : null,
                    'status' => $user->status ?? 'aprobado',
                    'roles' => $user->roles->pluck('name'),
                    'created_at' => $user->created_at ? $user->created_at->format('d/m/Y') : '',
                ];
            }),
            'roles' => $roles,
            'companies' => $companies,
            'auth' => [
                'user' => $authUser,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (!auth()->user()->hasRole('superadmin')) {
            abort(403, 'No autorizado');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|exists:roles,name',
            'company_id' => 'nullable|exists:companies,id',
            'operacion' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

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

        return redirect()->route('users.index');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $authUser = auth()->user();
        if (!$authUser->isSuperAdmin() && $user->company_id !== $authUser->company_id) {
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

        $user->update([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'operacion' => $validated['operacion'],
            'company_id' => $validated['company_id'] ?? null,
        ]);

        $user->syncRoles([$validated['role']]);

        return redirect()->route('users.index');
    }

    public function toggleStatus(User $user): RedirectResponse
    {
        $authUser = auth()->user();
        if (!$authUser->isSuperAdmin() && $user->company_id !== $authUser->company_id) {
            abort(403, 'No autorizado');
        }

        $newStatus = $user->status === 'aprobado' ? 'inhabilitado' : 'aprobado';
        $user->update(['status' => $newStatus]);

        return redirect()->route('users.index');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'No autorizado');
        }

        if ($user->id !== auth()->id()) {
            $user->delete();
        }

        return redirect()->route('users.index');
    }
}
