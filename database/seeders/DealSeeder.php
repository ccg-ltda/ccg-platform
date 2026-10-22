<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Deal;
use App\Models\User;
use Illuminate\Database\Seeder;

class DealSeeder extends Seeder
{
    public function run(): void
    {
        $companies = Company::all();
        $users = User::where('operacion', '!=', 'superadmin')->get();

        if ($companies->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Se requieren empresas y usuarios. Ejecuta los seeders base primero.');
            return;
        }

        $deals = [
            [
                'title' => 'Implementación ERP - Fase 1',
                'company' => 'Sede Sur',
                'user' => 'Kevin',
                'amount' => 45000000,
                'stage' => 'Propuesta / Cotización',
                'expected_close_date' => '2026-11-15',
            ],
            [
                'title' => 'Consultoría en Seguridad Informática',
                'company' => 'Sede Norte',
                'user' => 'Lola',
                'amount' => 28000000,
                'stage' => 'Calificado',
                'expected_close_date' => '2026-11-30',
            ],
            [
                'title' => 'Migración Cloud AWS',
                'company' => 'Sede Americas',
                'user' => 'Palo',
                'amount' => 75000000,
                'stage' => 'Presentación',
                'expected_close_date' => '2026-12-10',
            ],
            [
                'title' => 'Desarrollo App Móvil',
                'company' => 'Sede Sur',
                'user' => 'Kevin',
                'amount' => 52000000,
                'stage' => 'Cierre Ganado',
                'expected_close_date' => '2026-10-25',
            ],
            [
                'title' => 'Infraestructura Redes',
                'company' => 'Sede Norte',
                'user' => 'Admin User',
                'amount' => 33000000,
                'stage' => 'Cierre Perdido',
                'expected_close_date' => '2026-10-05',
            ],
            [
                'title' => 'Capacitación Personal TI',
                'company' => 'Sede Americas',
                'user' => 'Lola',
                'amount' => 18000000,
                'stage' => 'Cita Programada',
                'expected_close_date' => '2026-12-20',
            ],
        ];

        foreach ($deals as $deal) {
            $company = $companies->first(fn (Company $c) => $c->name === $deal['company']);
            $user = $users->first(fn (User $u) => $u->name === $deal['user']);

            if (! $company || ! $user) {
                continue;
            }

            Deal::updateOrCreate(
                ['title' => $deal['title']],
                [
                    'company_id' => $company->id,
                    'user_id' => $user->id,
                    'amount' => $deal['amount'],
                    'stage' => $deal['stage'],
                    'expected_close_date' => $deal['expected_close_date'],
                    'notes' => 'Negocio generado por DealSeeder.',
                ]
            );
        }

        $this->command->info('Negocios creados: '.Deal::count());
    }
}
