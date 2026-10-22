<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Deal;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('superadmin') || ($user->is_superadmin ?? false);
        $range = $request->query('range', 'month');
        $organizationId = $request->query('organization_id');
        $fechaInicio = $request->query('fecha_inicio');
        $fechaFin = $request->query('fecha_fin');

        $start = match ($range) {
            'quarter' => now()->subMonths(3)->startOfDay(),
            'year' => now()->startOfYear(),
            'custom' => $fechaInicio ? \Carbon\Carbon::parse($fechaInicio)->startOfDay() : now()->startOfMonth(),
            default => now()->startOfMonth(),
        };

        $dealsQuery = Deal::query()->where('created_at', '>=', $start);
        $reservationsQuery = Reservation::query()->where('appointment_datetime', '>=', $start);
        $usersQuery = User::query();

        if ($range === 'custom' && $fechaFin) {
            $end = \Carbon\Carbon::parse($fechaFin)->endOfDay();
            $dealsQuery->where('created_at', '<=', $end);
            $reservationsQuery->where('appointment_datetime', '<=', $end);
        }

        if ($isSuperAdmin) {
            if ($organizationId) {
                $dealsQuery->where('company_id', $organizationId);
                $reservationsQuery->where('company_id', $organizationId);
                $usersQuery->where('company_id', $organizationId);
            }
        } else {
            $dealsQuery->where('company_id', $user->company_id);
            $reservationsQuery->where('company_id', $user->company_id);
            $usersQuery->where('company_id', $user->company_id);
        }

        $deals = $dealsQuery->get();
        $reservations = $reservationsQuery->get();

        $totalDeals = $deals->count();
        $wonDeals = $deals->where('stage', 'Cierre Ganado')->count();

        $conversionRate = $totalDeals > 0 ? round(($wonDeals / $totalDeals) * 100) : 0;
        $avgValue = $totalDeals > 0 ? (float) round($deals->avg('amount')) : 0.0;

        $cycleDays = $deals
            ->where('stage', 'Cierre Ganado')
            ->map(fn ($deal) => (int) $deal->created_at->diffInDays($deal->updated_at))
            ->filter(fn ($days) => $days >= 0);

        $avgCycle = $cycleDays->count() > 0 ? (int) round($cycleDays->avg()) : 0;

        $totalReservations = $reservations->count();
        $completedReservations = $reservations->where('status', 'Completada')->count();
        $effectiveActivity = $totalReservations > 0
            ? round(($completedReservations / $totalReservations) * 100)
            : 0;

        $advisors = $usersQuery->get()
            ->map(function ($advisor) use ($deals) {
                $advisorDeals = $deals->where('user_id', $advisor->id);
                $total = $advisorDeals->count();
                $won = $advisorDeals->where('stage', 'Cierre Ganado')->count();

                return [
                    'id' => $advisor->id,
                    'name' => $advisor->name,
                    'total' => $total,
                    'won' => $won,
                    'compliance' => $total > 0 ? round(($won / $total) * 100) : 0,
                ];
            })
            ->filter(fn ($advisor) => $advisor['total'] > 0)
            ->sortByDesc('compliance')
            ->values();

        $funnelMap = [
            'Prospectos' => ['Cita Programada'],
            'Contactados' => ['Calificado para Comprar'],
            'Negociación' => ['Presentación Programada'],
            'Propuesta' => ['Propuesta / Cotización', 'Contrato Enviado'],
            'Cerrado' => ['Cierre Ganado', 'Cierre Perdido'],
        ];

        $funnel = collect($funnelMap)
            ->map(function (array $stages, string $label) use ($deals) {
                $stageDeals = $deals->whereIn('stage', $stages);

                return [
                    'stage' => $label,
                    'value' => (float) $stageDeals->sum('amount'),
                    'count' => $stageDeals->count(),
                ];
            })
            ->values();

        return Inertia::render('Reports/Index', [
            'kpis' => [
                'conversionRate' => $conversionRate,
                'avgCycle' => $avgCycle,
                'avgValue' => $avgValue,
                'effectiveActivity' => $effectiveActivity,
                'totalDeals' => $totalDeals,
                'wonDeals' => $wonDeals,
                'totalReservations' => $totalReservations,
                'completedReservations' => $completedReservations,
            ],
            'advisors' => $advisors,
            'funnel' => $funnel,
            'range' => $range,
            'isSuperAdmin' => $isSuperAdmin,
            'organizations' => $isSuperAdmin ? Company::select('id', 'name')->get() : [],
            'filters' => [
                'range' => $range,
                'organization_id' => $organizationId,
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin,
            ],
        ]);
    }
}
