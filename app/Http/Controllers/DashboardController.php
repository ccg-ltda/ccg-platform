<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Deal;
use App\Models\Company;
use App\Models\Reservation;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DashboardController extends Controller
{
    public function index()
    {
        $stages = [
            'Cita Programada',
            'Calificado para Comprar',
            'Presentación Programada',
            'Propuesta / Cotización',
            'Contrato Enviado',
            'Cierre Ganado',
            'Cierre Perdido',
        ];

        $funnelStats = [];
        $totalDeals = Deal::count();
        foreach ($stages as $stage) {
            $count = Deal::where('stage', $stage)->count();
            $amount = Deal::where('stage', $stage)->sum('amount');
            $funnelStats[] = [
                'stage' => $stage,
                'count' => $count,
                'amount' => $amount,
                'percentage' => $totalDeals > 0 ? round(($count / $totalDeals) * 100) : 0,
            ];
        }

        $reservationsTotal = Reservation::count();
        $reservationsCompleted = Reservation::where('status', 'Completada')->count();
        $reservationsPending = Reservation::where('status', 'Pendiente')->count();

        $dealsByCompany = Company::withCount('deals')
            ->orderBy('deals_count', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($c) => ['name' => $c->name, 'count' => $c->deals_count]);

        $usersByPlan = [
            'normal' => User::where('plan_type', 'normal')->count(),
            'vip' => User::where('plan_type', 'vip')->count(),
        ];

        $wonDeals = Deal::where('stage', 'Cierre Ganado')->count();
        $conversionRate = $totalDeals > 0 ? round(($wonDeals / $totalDeals) * 100) : 0;

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
                    ->get(['id', 'name', 'username', 'email', 'phone', 'operacion', 'status', 'created_at']),
                'allRequests' => User::where('id', '!=', auth()->id())
                    ->where('operacion', '!=', 'superadmin')
                    ->whereDoesntHave('roles', function ($query) {
                        $query->where('name', 'superadmin');
                    })
                    ->orderBy('created_at', 'desc')
                    ->take(10)
                    ->get(['id', 'name', 'username', 'email', 'phone', 'operacion', 'status', 'created_at']),
            ],
            'funnelStats' => $funnelStats,
            'reservationsStats' => [
                'total' => $reservationsTotal,
                'completed' => $reservationsCompleted,
                'pending' => $reservationsPending,
                'completionRate' => $reservationsTotal > 0 ? round(($reservationsCompleted / $reservationsTotal) * 100) : 0,
            ],
            'dealsByCompany' => $dealsByCompany,
            'usersByPlan' => $usersByPlan,
            'conversionRate' => $conversionRate,
            'totalDeals' => $totalDeals,
            'wonDeals' => $wonDeals,
        ]);
    }
}
