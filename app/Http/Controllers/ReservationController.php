<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Deal;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use App\Events\DealCreated;

class ReservationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('superadmin') || ($user->is_superadmin ?? false);

        $query = Reservation::with(['company', 'user', 'deal', 'assignedUser']);

        $activeCompanyId = session('active_company_id');
        $scopeCompanyId = $isSuperAdmin ? ($activeCompanyId ?: null) : $user->company_id;

        if ($scopeCompanyId) {
            $query->where('company_id', $scopeCompanyId);
        }

        if ($request->query('date_from')) {
            $query->where('appointment_datetime', '>=', $request->query('date_from'));
        }

        if ($request->query('date_to')) {
            $query->where('appointment_datetime', '<=', $request->query('date_to'));
        }

        if ($request->query('status')) {
            $query->where('status', $request->query('status'));
        }

        $reservations = $query->orderBy('appointment_datetime')->get()->map(function ($r) {
            return [
                'id' => $r->id,
                'client_name' => $r->client_name,
                'service' => $r->service,
                'estimated_amount' => $r->estimated_amount ? (float) $r->estimated_amount : null,
                'estimated_amount_formatted' => $r->estimated_amount ? '$'.number_format($r->estimated_amount, 0, ',', '.').' COP' : '-',
                'company' => $r->company->name,
                'company_id' => $r->company_id,
                'user' => $r->user->name,
                'appointment_datetime' => $r->appointment_datetime->format('Y-m-d H:i'),
                'location' => $r->location,
                'modality' => $r->modality ?? 'Presencial',
                'meeting_link' => $r->meeting_link,
                'contact_phone' => $r->contact_phone,
                'contact_email' => $r->contact_email,
                'start_time' => $r->start_time,
                'end_time' => $r->end_time,
                'assigned_to' => $r->assigned_to,
                'assigned_to_name' => $r->assignedUser?->name,
                'notes' => $r->notes,
                'status' => $r->status,
                'deal_id' => $r->deal_id,
                'deal_stage' => $r->deal?->stage,
            ];
        });

        $companiesQuery = Company::query();
        if (!$isSuperAdmin) {
            $companiesQuery->where('id', $user->company_id);
        }

        $usersQuery = User::query()->select(['id', 'name']);
        if (!$isSuperAdmin) {
            $usersQuery->where('company_id', $user->company_id);
        }

        return Inertia::render('Reservations/Index', [
            'reservations' => $reservations,
            'companies' => $companiesQuery->get(['id', 'name']),
            'users' => $usersQuery->orderBy('name')->get(),
            'isSuperAdmin' => $isSuperAdmin,
            'userCompanyId' => $user->company_id,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('superadmin') || ($user->is_superadmin ?? false);

        $rules = [
            'client_name' => 'required|string|max:255',
            'service' => 'required|string|max:255',
            'estimated_amount' => 'nullable|numeric',
            'company_id' => 'required|exists:companies,id',
            'appointment_datetime' => 'required|date',
            'location' => 'required|string|max:500',
            'modality' => 'required|in:Presencial,Virtual',
            'meeting_link' => ['nullable', Rule::requiredIf($request->input('modality') === 'Virtual'), 'url'],
            'contact_phone' => 'nullable|string|max:30',
            'contact_email' => 'nullable|email|max:255',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'assigned_to' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ];

        if (!$isSuperAdmin) {
            $rules['company_id'] = 'required|exists:companies,id|in:'.$user->company_id;
            $rules['assigned_to'] = 'nullable|exists:users,id,company_id,'.$user->company_id;
        }

        $validated = $request->validate($rules);

        $isVirtual = ($validated['modality'] ?? 'Presencial') === 'Virtual';
        $startTime = $validated['start_time'] ?? date('H:i', strtotime($validated['appointment_datetime']));

        $deal = Deal::create([
            'title' => $validated['service'] . ' - ' . $validated['client_name'],
            'company_id' => $validated['company_id'],
            'user_id' => auth()->id(),
            'amount' => $validated['estimated_amount'] ?? 0,
            'stage' => 'Cita Programada',
            'expected_close_date' => date('Y-m-d', strtotime($validated['appointment_datetime'])),
            'notes' => $validated['notes'] ?? null,
            'appointment_date' => date('Y-m-d', strtotime($validated['appointment_datetime'])),
            'appointment_time' => $startTime,
            'appointment_location' => $isVirtual
                ? ($validated['meeting_link'] ?? $validated['location'])
                : $validated['location'],
            'appointment_notes' => $validated['notes'] ?? null,
        ]);

        DealCreated::dispatch($deal);

        $reservation = Reservation::create([
            ...$validated,
            'company_id' => $validated['company_id'],
            'user_id' => auth()->id(),
            'status' => 'Pendiente',
            'deal_id' => $deal->id,
        ]);

        return back()->with('success', 'Reserva creada y negocio agregado al pipeline.');
    }

    public function updateStatus(Request $request, Reservation $reservation)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('superadmin') || ($user->is_superadmin ?? false);

        if (!$isSuperAdmin && $reservation->company_id !== $user->company_id) {
            abort(403, 'No autorizado.');
        }

        $validated = $request->validate([
            'status' => 'required|in:Pendiente,Confirmada,Cancelada,Completada',
        ]);

        $reservation->update($validated);

        if ($reservation->deal_id && $validated['status'] === 'Cancelada') {
            Deal::where('id', $reservation->deal_id)->update(['stage' => 'Cierre Perdido']);
        }

        return back();
    }

    public function destroy(Reservation $reservation)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('superadmin') || ($user->is_superadmin ?? false);

        if (!$isSuperAdmin && $reservation->company_id !== $user->company_id) {
            abort(403, 'No autorizado.');
        }

        $reservation->delete();

        return back();
    }
}
