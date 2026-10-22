<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Quotation;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class QuotationSeeder extends Seeder
{
    public function run(): void
    {
        $users = $this->getUsers();
        $companies = $this->getCompanies();

        if ($users->isEmpty() || $companies->isEmpty()) {
            $this->command->warn('No users or companies found. Run RolesAndPermissionsSeeder and MigrateOrganizationsToCompaniesSeeder first.');

            return;
        }

        $quotations = [
            [
                'code' => 'COT-2026-001',
                'user' => 'Admin User',
                'company' => 'Sede Sur',
                'product_service' => 'Suscripción empresarial',
                'date' => '2026-09-01',
                'total' => 19040000,
                'status' => 'Aceptada',
            ],
            [
                'code' => 'COT-2026-002',
                'user' => 'Kevin',
                'company' => 'Sede Americas',
                'product_service' => 'Servicio de soporte',
                'date' => '2026-09-05',
                'total' => 8500000,
                'status' => 'Enviada',
            ],
            [
                'code' => 'COT-2026-003',
                'user' => 'Lola',
                'company' => 'Sede Norte',
                'product_service' => 'Consultoría IT',
                'date' => '2026-09-10',
                'total' => 25000000,
                'status' => 'Borrador',
            ],
            [
                'code' => 'COT-2026-004',
                'user' => 'Palo',
                'company' => 'Sede Americas',
                'product_service' => 'Licencias software',
                'date' => '2026-09-12',
                'total' => 12000000,
                'status' => 'Rechazada',
            ],
            [
                'code' => 'COT-2026-005',
                'user' => 'Admin User',
                'company' => 'Sede Norte',
                'product_service' => 'Soporte 24/7',
                'date' => '2026-09-15',
                'total' => 32000000,
                'status' => 'Aceptada',
            ],
            [
                'code' => 'COT-2026-006',
                'user' => 'Kevin',
                'company' => 'Sede Sur',
                'product_service' => 'Capacitación equipos',
                'date' => '2026-09-18',
                'total' => 5600000,
                'status' => 'Enviada',
            ],
            [
                'code' => 'COT-2026-007',
                'user' => 'Admin User',
                'company' => 'Sede Sur',
                'product_service' => 'Migración cloud',
                'date' => '2026-09-20',
                'total' => 45000000,
                'status' => 'Borrador',
            ],
            [
                'code' => 'COT-2026-008',
                'user' => 'Lola',
                'company' => 'Sede Americas',
                'product_service' => 'Auditoría seguridad',
                'date' => '2026-09-22',
                'total' => 18000000,
                'status' => 'Enviada',
            ],
        ];

        foreach ($quotations as $q) {
            $user = $users->first(fn (User $u) => $u->name === $q['user']);
            $company = $companies->first(fn (Company $c) => $c->name === $q['company']);

            if (! $user || ! $company) {
                $this->command->warn("Saltando {$q['code']}: usuario o empresa no encontrado ({$q['user']} / {$q['company']}).");

                continue;
            }

            Quotation::updateOrCreate(
                ['code' => $q['code']],
                [
                    'user_id' => $user->id,
                    'company_id' => $company->id,
                    'product_service' => $q['product_service'],
                    'date' => $q['date'],
                    'total' => $q['total'],
                    'status' => $q['status'],
                ]
            );
        }

        $this->command->info('Cotizaciones creadas: '.Quotation::count());
    }

    private function getUsers(): Collection
    {
        return User::whereIn('name', ['Admin User', 'Kevin', 'Lola', 'Palo'])->get();
    }

    private function getCompanies(): Collection
    {
        return Company::whereIn('name', ['Sede Sur', 'Sede Americas', 'Sede Norte'])->get();
    }
}
