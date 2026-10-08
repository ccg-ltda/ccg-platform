<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard', [
            'stats' => [
                'users' => User::count(),
                'roles' => Role::count(),
                'permissions' => Permission::count(),
                'pendingUsers' => User::where('status', 'pendiente')
                    ->where('id', '!=', auth()->id())
                    ->where('operacion', '!=', 'superadmin')
                    ->whereDoesntHave('roles', function ($query) {
                        $query->where('name', 'superadmin');
                    })
                    ->get(['id', 'name', 'username', 'email', 'phone', 'operacion']),
            ],
        ]);
    }
}
