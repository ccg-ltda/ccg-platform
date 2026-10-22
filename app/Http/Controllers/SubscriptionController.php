<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('superadmin') || ($user->is_superadmin ?? false);
        $userRole = $isSuperAdmin ? 'admin' : ($user->hasRole('admin') ? 'admin' : 'cliente');

        if (Plan::count() === 0) {
            Plan::create([
                'name' => 'Básico / Normal',
                'code' => 'normal',
                'price' => '$0 COP / mes',
                'max_users' => '5',
                'max_branches' => '1',
                'is_active' => true,
                'benefits' => [
                    'Gestión básica de pipeline y negocios',
                    'Cotizaciones estándar',
                    'Hasta 50 reservas/citas mensuales',
                    'Soporte por email',
                ],
            ]);
            Plan::create([
                'name' => 'Pro',
                'code' => 'pro',
                'price' => '$150.000 COP / mes',
                'max_users' => '20',
                'max_branches' => '5',
                'is_active' => true,
                'benefits' => [
                    'Métricas Avanzadas y Reportes',
                    'Reservas e Historial Extendido',
                    'Alertas y Recordatorios Automáticos',
                    'Soporte Prioritario',
                ],
            ]);
            Plan::create([
                'name' => 'Enterprise / VIP',
                'code' => 'vip',
                'price' => '$500.000 COP / mes',
                'max_users' => 'Ilimitados',
                'max_branches' => 'Ilimitadas',
                'is_active' => true,
                'benefits' => [
                    'Métricas Avanzadas y Reportes detallados',
                    'Reservas e Historial Ilimitado',
                    'Alertas vía WhatsApp/Email',
                    'Personalización Completa de Marca',
                    'Soporte Prioritario 24/7',
                ],
            ]);
        }

        $plans = Plan::where('is_active', true)->get();
        $currentPlan = $user->plan_type ?? 'normal';
        $company = $user->company;

        return Inertia::render('Subscription/Index', [
            'plans' => $plans,
            'currentPlan' => $currentPlan,
            'userRole' => $userRole,
            'company' => $company ? [
                'id' => $company->id,
                'name' => $company->name,
                'plan_type' => $company->plan_type,
                'subscription_status' => $company->subscription_status,
                'subscription_expires_at' => $company->subscription_expires_at,
            ] : null,
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();
        $validated = $request->validate([
            'plan_type' => 'nullable|string|exists:plans,code',
            'plan_id' => 'nullable|exists:plans,id',
        ]);

        $planCode = $validated['plan_type'] ?? null;
        if (!$planCode && !empty($validated['plan_id'])) {
            $plan = Plan::find($validated['plan_id']);
            $planCode = $plan ? $plan->code : 'normal';
        }
        $planCode = $planCode ?? 'normal';

        $user->update([
            'plan_type' => $planCode,
            'subscription_status' => 'active',
            'subscription_expires_at' => $planCode !== 'normal' ? now()->addYear() : null,
        ]);

        if ($user->company) {
            $user->company->update([
                'plan_type' => $planCode,
                'subscription_status' => 'active',
                'subscription_expires_at' => $planCode !== 'normal' ? now()->addYear() : null,
            ]);
        }

        return back()->with('success', 'Plan actualizado exitosamente.');
    }
}
