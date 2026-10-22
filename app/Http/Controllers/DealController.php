<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\Company;
use App\Models\Quotation;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;
use App\Events\DealCreated;

class DealController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('superadmin') || ($user->is_superadmin ?? false);

        $activeCompanyId = session('active_company_id');
        $scopeCompanyId = $isSuperAdmin ? ($activeCompanyId ?: null) : $user->company_id;

        $query = Deal::with(['company', 'user']);

        if ($scopeCompanyId) {
            $query->where('company_id', $scopeCompanyId);
        }

        $deals = $query->latest()->get()->map(function ($deal) {
            $quotation = $deal->quotations()->first();
            $hasQuotation = in_array($deal->stage, ['Propuesta / Cotización', 'Contrato Enviado', 'Cierre Ganado']) || $quotation;

            return [
                'id' => $deal->id,
                'title' => $deal->title,
                'company' => $deal->company->name,
                'company_id' => $deal->company_id,
                'user' => $deal->user->name,
                'amount' => (float) $deal->amount,
                'amount_formatted' => '$'.number_format($deal->amount, 0, ',', '.').' COP',
                'stage' => $deal->stage,
                'expected_close_date' => $deal->expected_close_date ? \Carbon\Carbon::parse($deal->expected_close_date)->format('Y-m-d') : null,
                'notes' => $deal->notes,
                'has_quotation' => (bool) $hasQuotation,
                'quotation_code' => $quotation?->code,
                'quotation_status' => $quotation?->status,
                'is_accepted' => $deal->stage === 'Cierre Ganado' || $quotation?->status === 'Aceptada',
                'appointment_date' => $deal->appointment_date ? \Carbon\Carbon::parse($deal->appointment_date)->format('Y-m-d H:i') : null,
                'appointment_time' => $deal->appointment_time,
                'appointment_location' => $deal->appointment_location,
                'appointment_notes' => $deal->appointment_notes,
            ];
        });

        $stages = [
            'Cita Programada',
            'Calificado para Comprar',
            'Presentación Programada',
            'Propuesta / Cotización',
            'Contrato Enviado',
            'Cierre Ganado',
            'Cierre Perdido'
        ];

        $companiesQuery = Company::query();
        $usersQuery = \App\Models\User::where('operacion', '!=', 'superadmin');

        if (!$isSuperAdmin) {
            $companiesQuery->where('id', $user->company_id);
        }

        if ($scopeCompanyId) {
            $usersQuery->where('company_id', $scopeCompanyId);
        }

        $bookingsQuery = Reservation::with(['company', 'deal']);

        if ($scopeCompanyId) {
            $bookingsQuery->where('company_id', $scopeCompanyId);
        }

        $bookings = $bookingsQuery->orderBy('appointment_datetime')->get()->map(function ($reservation) {
            return [
                'id' => $reservation->id,
                'client_name' => $reservation->client_name,
                'service' => $reservation->service,
                'status' => $reservation->status,
                'appointment_datetime' => $reservation->appointment_datetime
                    ? $reservation->appointment_datetime->format('Y-m-d H:i')
                    : null,
                'location' => $reservation->location,
                'modality' => $reservation->modality ?? 'Presencial',
                'meeting_link' => $reservation->meeting_link,
                'contact_phone' => $reservation->contact_phone,
                'contact_email' => $reservation->contact_email,
                'notes' => $reservation->notes,
                'estimated_amount_formatted' => $reservation->estimated_amount
                    ? '$'.number_format($reservation->estimated_amount, 0, ',', '.').' COP'
                    : null,
                'company' => $reservation->company?->name,
                'company_id' => $reservation->company_id,
                'deal_id' => $reservation->deal_id,
                'deal_title' => $reservation->deal?->title,
                'deal_stage' => $reservation->deal?->stage,
            ];
        });

        return Inertia::render('Deals/Index', [
            'deals' => $deals,
            'bookings' => $bookings,
            'stages' => $stages,
            'companies' => $companiesQuery->get(['id', 'name']),
            'users' => $usersQuery->get(['id', 'name']),
            'isSuperAdmin' => $isSuperAdmin,
            'userCompanyId' => $user->company_id,
            'quotations' => Quotation::with('deal')->get()->map(fn ($q) => [
                'id' => $q->id,
                'code' => $q->code,
                'status' => $q->status,
                'date' => $q->date->format('Y-m-d'),
                'total_formatted' => '$'.number_format($q->total, 0, ',', '.').' COP',
                'product' => $q->product_service,
                'deal_id' => $q->deal_id,
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('superadmin') || ($user->is_superadmin ?? false);

        $rules = [
            'title' => 'required|string|max:255',
            'company_id' => 'required|exists:companies,id',
            'amount' => 'required|numeric',
            'stage' => 'required|string',
            'expected_close_date' => 'required|date',
            'notes' => 'nullable|string',
        ];

        if (!$isSuperAdmin) {
            $rules['company_id'] = 'required|exists:companies,id|in:'.$user->company_id;
        }

        $validated = $request->validate($rules);

        $deal = Deal::create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);

        $this->syncQuotation($deal);

        DealCreated::dispatch($deal);

        return back();
    }

    public function update(Request $request, Deal $deal)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('superadmin') || ($user->is_superadmin ?? false);

        if (!$isSuperAdmin && $deal->company_id !== $user->company_id) {
            abort(403, 'No autorizado para editar este negocio.');
        }

        $rules = [
            'title' => 'sometimes|required|string|max:255',
            'company_id' => 'sometimes|required|exists:companies,id',
            'user_id' => 'sometimes|required|exists:users,id',
            'amount' => 'sometimes|required|numeric',
            'stage' => 'sometimes|required|string',
            'expected_close_date' => 'sometimes|required|date',
            'notes' => 'sometimes|nullable|string',
            'appointment_date' => 'sometimes|nullable|date',
            'appointment_time' => 'sometimes|nullable|date_format:H:i',
            'appointment_location' => 'sometimes|nullable|string|max:500',
            'appointment_notes' => 'sometimes|nullable|string',
        ];

        if (!$isSuperAdmin) {
            $rules['company_id'] = 'sometimes|required|exists:companies,id|in:'.$user->company_id;
        }

        $validated = $request->validate($rules);

        if (isset($validated['stage']) && $validated['stage'] !== $deal->stage) {
            $stagesOrder = [
                'Cita Programada' => 0,
                'Calificado para Comprar' => 1,
                'Presentación Programada' => 2,
                'Propuesta / Cotización' => 3,
                'Contrato Enviado' => 4,
                'Cierre Ganado' => 5,
            ];

            $newStage = $validated['stage'];

            if ($newStage === 'Cierre Perdido') {
                // allowed from any stage
            } elseif (!isset($stagesOrder[$newStage])) {
                return back()->with('error', 'Etapa no válida.');
            } else {
                $currentOrder = $stagesOrder[$deal->stage] ?? null;
                $newOrder = $stagesOrder[$newStage];

                if ($currentOrder === null || $newOrder > $currentOrder + 1) {
                    return back()->with('error', 'Debes completar la etapa anterior antes de avanzar a ' . $newStage);
                }
            }
        }

        $deal->update($validated);

        $this->syncQuotation($deal);

        return back();
    }

    public function scheduleAppointment(Request $request, Deal $deal)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('superadmin') || ($user->is_superadmin ?? false);

        if (!$isSuperAdmin && $deal->company_id !== $user->company_id) {
            abort(403, 'No autorizado para programar citas en este negocio.');
        }

        $validated = $request->validate([
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|date_format:H:i',
            'appointment_location' => 'required|string|max:500',
            'appointment_notes' => 'nullable|string',
        ]);

        $deal->update($validated);

        return back();
    }

    private function syncQuotation(Deal $deal)
    {
        $triggerStages = ['Propuesta / Cotización', 'Contrato Enviado', 'Cierre Ganado'];
        
        if (in_array($deal->stage, $triggerStages)) {
            $statusMap = [
                'Propuesta / Cotización' => 'Borrador',
                'Contrato Enviado' => 'Enviada',
                'Cierre Ganado' => 'Aceptada',
            ];

            Quotation::updateOrCreate(
                ['deal_id' => $deal->id],
                [
                    'code' => 'COT-'.Str::upper(Str::random(6)),
                    'user_id' => $deal->user_id,
                    'company_id' => $deal->company_id,
                    'product_service' => $deal->title,
                    'date' => now(),
                    'total' => (int) $deal->amount,
                    'status' => $statusMap[$deal->stage] ?? 'Borrador',
                ]
            );
        }
    }
}
