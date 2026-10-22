<?php

namespace App\Http\Controllers;

use App\Models\Quotation;
use App\Models\Deal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuotationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('superadmin') || ($user->is_superadmin ?? false);

        $companyId = $request->query('company_id') ?? auth()->user()->company_id;

        if (!$isSuperAdmin) {
            $companyId = $user->company_id;
        }

        $query = Quotation::with(['user', 'company', 'deal'])
            ->when($companyId, fn ($q) => $q->where('company_id', $companyId));

        $quotations = $query->clone()->latest()->get()->map(function ($q) {
            return [
                'id' => $q->id,
                'code' => $q->code,
                'client' => $q->user ? $q->user->name : 'Cliente General',
                'company' => $q->company ? $q->company->name : 'Sin Organización',
                'product' => $q->product_service,
                'date' => $q->date->format('Y-m-d'),
                'total' => $q->total,
                'total_formatted' => '$'.number_format($q->total, 0, ',', '.').' COP',
                'status' => $q->status,
                'deal_title' => $q->deal ? $q->deal->title : null,
                'deal_id' => $q->deal_id,
            ];
        });

        // Cálculo de KPIs Reales
        $openStatuses = ['Enviada', 'Borrador'];
        $statsQuery = $query->clone();
        
        $openCount = $statsQuery->clone()->whereIn('status', $openStatuses)->count();
        $openValue = $statsQuery->clone()->whereIn('status', $openStatuses)->sum('total');
        $acceptedCount = $statsQuery->clone()->where('status', 'Aceptada')->count();
        $totalCount = $statsQuery->clone()->count();
        
        $conversionRate = $totalCount > 0 ? round(($acceptedCount / $totalCount) * 100) : 0;

        return Inertia::render('Quotations/Index', [
            'quotations' => $quotations,
            'kpis' => [
                'open_count' => $openCount,
                'open_value' => '$'.number_format($openValue, 0, ',', '.').' COP',
                'accepted_count' => $acceptedCount,
                'conversion_rate' => $conversionRate.'%',
            ],
            'filters' => $request->only(['company_id']),
            'isSuperAdmin' => $isSuperAdmin,
            'userCompanyId' => $user->company_id,
        ]);
    }

    public function updateStatus(Request $request, Quotation $quotation)
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('superadmin') || ($user->is_superadmin ?? false);

        if (!$isSuperAdmin && $quotation->company_id !== $user->company_id) {
            abort(403, 'No autorizado para modificar esta cotización.');
        }

        $validated = $request->validate([
            'status' => 'required|in:Borrador,Enviada,Aceptada,Rechazada',
            'observation' => 'nullable|string|max:1000',
        ]);

        $quotation->update($validated);

        if ($quotation->deal_id) {
            $dealStage = match ($validated['status']) {
                'Aceptada' => 'Cierre Ganado',
                'Rechazada' => 'Cierre Perdido',
                'Enviada' => 'Contrato Enviado',
                default => null,
            };

            if ($dealStage) {
                Deal::where('id', $quotation->deal_id)->update(['stage' => $dealStage]);
            }
        }

        return back();
    }
}
