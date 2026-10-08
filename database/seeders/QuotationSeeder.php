<?php

namespace Database\Seeders;

use App\Models\Quotation;
use App\Models\User;
use App\Models\Company;
use Illuminate\Database\Seeder;

class QuotationSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $companies = Company::all();

        if ($users->isEmpty() || $companies->isEmpty()) {
            $this->command->warn('No users or companies found. Run RolesAndPermissionsSeeder and MigrateOrganizationsToCompaniesSeeder first.');
            return;
        }

        $quotations = [
            ['code' => 'COT-2026-001', 'user_id' => $users[1]->id, 'company_id' => $companies[0]->id, 'product_service' => 'Suscripción empresarial', 'date' => '2026-09-01', 'total' => 19040000, 'status' => 'Aceptada'],
            ['code' => 'COT-2026-002', 'user_id' => $users[3]->id, 'company_id' => $companies[1]->id, 'product_service' => 'Servicio de soporte', 'date' => '2026-09-05', 'total' => 8500000, 'status' => 'Enviada'],
            ['code' => 'COT-2026-003', 'user_id' => $users[4]->id, 'company_id' => $companies[2]->id, 'product_service' => 'Consultoría IT', 'date' => '2026-09-10', 'total' => 25000000, 'status' => 'Borrador'],
            ['code' => 'COT-2026-004', 'user_id' => $users[5]->id, 'company_id' => $companies[1]->id, 'product_service' => 'Licencias software', 'date' => '2026-09-12', 'total' => 12000000, 'status' => 'Rechazada'],
            ['code' => 'COT-2026-005', 'user_id' => $users[6]->id, 'company_id' => $companies[2]->id, 'product_service' => 'Soporte 24/7', 'date' => '2026-09-15', 'total' => 32000000, 'status' => 'Aceptada'],
            ['code' => 'COT-2026-006', 'user_id' => $users[7]->id, 'company_id' => $companies[0]->id, 'product_service' => 'Capacitación equipos', 'date' => '2026-09-18', 'total' => 5600000, 'status' => 'Enviada'],
            ['code' => 'COT-2026-007', 'user_id' => $users[1]->id, 'company_id' => $companies[0]->id, 'product_service' => 'Migración cloud', 'date' => '2026-09-20', 'total' => 45000000, 'status' => 'Borrador'],
            ['code' => 'COT-2026-008', 'user_id' => $users[3]->id, 'company_id' => $companies[1]->id, 'product_service' => 'Auditoría seguridad', 'date' => '2026-09-22', 'total' => 18000000, 'status' => 'Enviada'],
        ];

        foreach ($quotations as $q) {
            Quotation::create($q);
        }
    }
}