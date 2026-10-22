<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Company;
use App\Models\Branch;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class SettingsController extends Controller
{
    public function index(Request $request)
    {
        $authUser = auth()->user();
        $isSuperAdmin = $authUser->hasRole('superadmin') || $authUser->isSuperAdmin();

        if ($request->query('tab') === 'roles' && !$isSuperAdmin) {
            abort(403, 'Acceso denegado.');
        }

        $activeCompanyId = $request->query('organization_id') ?? $request->query('company_id') ?? $request->query('branch_id');

        $usersQuery = User::query()->with(['roles', 'company']);
        $branchesQuery = Branch::query()->with(['company']);
        $companiesQuery = Company::query();

        if ($isSuperAdmin) {
            if ($activeCompanyId) {
                $usersQuery->where('company_id', $activeCompanyId);
                $branchesQuery->where('company_id', $activeCompanyId);
            }
        } else {
            $orgId = $authUser->organization_id ?? $authUser->company_id;
            $usersQuery->where('company_id', $orgId);
            $branchesQuery->where('company_id', $orgId);
            $companiesQuery->where('id', $orgId);
        }

        $users = $usersQuery->latest()->get();
        $branches = $branchesQuery->latest()->get();
        $companies = $companiesQuery->latest()->get();

        // Ensure roles superadmin, admin, cliente exist
        foreach (['superadmin', 'admin', 'cliente'] as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        // Definir la lista base de todos los permisos soportados
        $allPermissions = [
            'manage-users',
            'manage-settings',
            'view-dashboard',
            'view-users',
            'manage-companies',
            'manage-branches',
            'manage-plans',
            'view-reports',
            'manage-deals',
            'manage-bookings',
            'manage-reservations',
        ];

        // Garantizar que todos los permisos existan en la BD
        foreach ($allPermissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // Default permissions for roles that have none assigned yet
        $defaultAdminPermissions = [
            'view-dashboard',
            'manage-users',
            'view-users',
            'manage-branches',
            'view-reports',
            'manage-deals',
            'manage-bookings',
        ];

        $defaultClientePermissions = [
            'view-dashboard',
            'manage-bookings',
        ];

        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole && $adminRole->permissions->count() === 0) {
            $adminRole->syncPermissions($defaultAdminPermissions);
        }

        $clienteRole = Role::where('name', 'cliente')->first();
        if ($clienteRole && $clienteRole->permissions->count() === 0) {
            $clienteRole->syncPermissions($defaultClientePermissions);
        }

        // Ensure superadmin has all permissions
        $superadminRole = Role::where('name', 'superadmin')->first();
        if ($superadminRole) {
            $superadminRole->syncPermissions(Permission::all());
        }

        $roles = Role::whereIn('name', ['superadmin', 'admin', 'cliente'])->with('permissions')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => strtolower($role->name),
                'raw_name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->toArray(),
            ];
        });

        $permissions = Permission::all();

        $totalCompanies = Company::count();
        $activeCompanies = Company::where('status', 'activo')->count();
        $linkedUsers = User::whereNotNull('company_id')->count();

        $plans = [
            [
                'id' => 'normal',
                'name' => 'Básico / Normal',
                'max_users' => 5,
                'max_branches' => 1,
                'price' => '$0 COP / mes',
            ],
            [
                'id' => 'pro',
                'name' => 'Pro',
                'max_users' => 20,
                'max_branches' => 5,
                'price' => '$150.000 COP / mes',
            ],
            [
                'id' => 'vip',
                'name' => 'Enterprise / VIP',
                'max_users' => 'Ilimitados',
                'max_branches' => 'Ilimitadas',
                'price' => '$500.000 COP / mes',
            ],
        ];

        $userPermissions = $authUser->getAllPermissions()->pluck('name');
        $canViewUsers = $isSuperAdmin || $userPermissions->contains('view-users') || $userPermissions->contains('manage-users') || $authUser->hasRole('admin');

        $preferences = cache()->get('system_preferences', [
            'currency' => 'COP',
            'tax_name' => 'IVA',
            'tax_rate' => 19,
            'timezone' => 'America/Bogota',
        ]);

        return Inertia::render('Settings/Index', [
            'users' => $users->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'username' => $u->username,
                'email' => $u->email,
                'phone' => $u->phone,
                'operacion' => $u->operacion,
                'company_id' => $u->company_id,
                'organization_id' => $u->company_id,
                'company_name' => $u->company ? $u->company->name : null,
                'status' => $u->status ?? 'aprobado',
                'roles' => $u->roles->pluck('name'),
                'created_at' => $u->created_at ? $u->created_at->format('d/m/Y') : '',
            ]),
            'branches' => $branches->map(fn($b) => [
                'id' => $b->id,
                'name' => $b->name,
                'address' => $b->address,
                'phone' => $b->phone,
                'status' => $b->status,
                'company_id' => $b->company_id,
                'company_name' => $b->company ? $b->company->name : null,
            ]),
            'companies' => $companies,
            'totalCompanies' => $totalCompanies,
            'activeCompanies' => $activeCompanies,
            'linkedUsers' => $linkedUsers,
            'plans' => $plans,
            'roles' => $roles->map(function ($r) {
                $isObject = is_object($r);

                $id = $isObject ? $r->id : ($r['id'] ?? null);
                $name = $isObject ? $r->name : ($r['name'] ?? '');

                if ($isObject && method_exists($r, 'getAllPermissions')) {
                    $permissions = $r->getAllPermissions()->pluck('name')->toArray();
                } elseif ($isObject && isset($r->permissions)) {
                    $permissions = is_array($r->permissions) ? $r->permissions : $r->permissions->pluck('name')->toArray();
                } else {
                    $permissions = $r['permissions'] ?? [];
                }

                return [
                    'id' => $id,
                    'name' => strtoupper($name),
                    'raw_name' => strtolower($name),
                    'permissions' => $permissions,
                ];
            }),
            'permissions' => $permissions,
            'isSuperAdmin' => $isSuperAdmin,
            'canViewUsers' => $canViewUsers,
            'systemPreferences' => $preferences,
            'currentTab' => $request->query('tab', 'general'),
            'filters' => ['organization_id' => $activeCompanyId],
        ]);
    }

    public function updateRolePermissions(Request $request)
    {
        $authUser = auth()->user();
        if (!$authUser || (!$authUser->hasRole('superadmin') && !$authUser->isSuperAdmin())) {
            abort(403, 'Acceso denegado. Se requiere rol de Superadmin.');
        }

        $validated = $request->validate([
            'roles' => 'required|array',
            'roles.*.role_id' => 'required|exists:roles,id',
            'roles.*.permissions' => 'array',
            'roles.*.permissions.*' => 'string',
        ]);

        // Ensure all requested permissions exist in the database
        $requestedPermissions = collect($validated['roles'])->flatMap(fn($r) => $r['permissions'] ?? [])->unique()->values()->all();
        foreach ($requestedPermissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        foreach ($validated['roles'] as $roleData) {
            $role = Role::findOrFail($roleData['role_id']);
            if (strtolower($role->name) === 'superadmin') {
                $role->syncPermissions(Permission::all());
            } else {
                $role->syncPermissions($roleData['permissions'] ?? []);
            }
        }

        return back()->with('success', 'Permisos actualizados correctamente.');
    }

    public function storeBranch(Request $request)
    {
        $authUser = auth()->user();
        $isSuperAdmin = $authUser->hasRole('superadmin') || $authUser->isSuperAdmin();

        $validated = $request->validate([
            'company_id' => $isSuperAdmin ? 'required|exists:companies,id' : 'nullable',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
        ]);

        if (!$isSuperAdmin) {
            $validated['company_id'] = $authUser->company_id;
        }

        Branch::create([
            'company_id' => $validated['company_id'],
            'name' => $validated['name'],
            'address' => $validated['address'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'status' => 'activo',
        ]);

        return redirect()->route('settings.index', ['tab' => 'branches']);
    }

    public function updateBranch(Request $request, Branch $branch)
    {
        $authUser = auth()->user();
        $isSuperAdmin = $authUser->hasRole('superadmin') || $authUser->isSuperAdmin();

        if (!$isSuperAdmin && $branch->company_id !== $authUser->company_id) {
            abort(403);
        }

        $validated = $request->validate([
            'company_id' => $isSuperAdmin ? 'required|exists:companies,id' : 'nullable',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'status' => 'required|in:activo,inactivo',
        ]);

        if (!$isSuperAdmin) {
            $validated['company_id'] = $authUser->company_id;
        }

        $branch->update($validated);

        return redirect()->route('settings.index', ['tab' => 'branches']);
    }

    public function toggleBranchStatus(Branch $branch)
    {
        $authUser = auth()->user();
        if (!$authUser->hasRole('superadmin') && !$authUser->isSuperAdmin() && $branch->company_id !== $authUser->company_id) {
            abort(403);
        }

        $branch->update(['status' => $branch->status === 'activo' ? 'inactivo' : 'activo']);

        return redirect()->route('settings.index', ['tab' => 'branches']);
    }

    public function assignPlan(Request $request)
    {
        $authUser = auth()->user();
        if (!$authUser->hasRole('superadmin') && !$authUser->isSuperAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'plan_type' => 'required|in:normal,pro,vip',
        ]);

        $company = Company::findOrFail($validated['company_id']);
        $company->update([
            'plan_type' => $validated['plan_type'],
            'subscription_status' => 'active',
            'subscription_expires_at' => now()->addYear(),
        ]);

        return redirect()->route('settings.index', ['tab' => 'plans']);
    }

    public function updatePreferences(Request $request)
    {
        $validated = $request->validate([
            'currency' => 'nullable|string|max:10',
            'tax_name' => 'nullable|string|max:50',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'timezone' => 'nullable|string|max:100',
        ]);

        $preferences = cache()->get('system_preferences', [
            'currency' => 'COP',
            'tax_name' => 'IVA',
            'tax_rate' => 19,
            'timezone' => 'America/Bogota',
        ]);

        $preferences = array_merge($preferences, array_filter($validated, fn($v) => !is_null($v)));

        cache()->forever('system_preferences', $preferences);

        if (!empty($preferences['timezone'])) {
            session(['system_timezone' => $preferences['timezone']]);
            @date_default_timezone_set($preferences['timezone']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Las preferencias del sistema han sido actualizadas correctamente.',
            'preferences' => $preferences,
        ]);
    }
}
