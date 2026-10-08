<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MigrateOrganizationsToCompaniesSeeder extends Seeder
{
    public function run(): void
    {
        $operations = User::whereNotNull('operacion')
            ->where('operacion', '!=', '')
            ->distinct('operacion')
            ->pluck('operacion');

        if ($operations->isEmpty()) {
            $this->command->info('No hay valores de operacion para migrar.');

            return;
        }

        $operationToCompanyId = [];

        foreach ($operations as $operacion) {
            $companyName = ucwords(strtolower(trim($operacion)));

            $company = Company::firstOrCreate(
                ['name' => $companyName],
                [
                    'project' => $companyName,
                    'activity' => 'Operación migrada: ' . $companyName,
                    'status' => 'activo',
                ]
            );

            $operationToCompanyId[strtolower(trim($operacion))] = $company->id;

            $this->command->info("Empresa creada: {$companyName} (ID: {$company->id})");
        }

        $updatedCount = 0;
        foreach ($operationToCompanyId as $operacionLower => $companyId) {
            $affected = User::whereRaw('LOWER(TRIM(operacion)) = ?', [$operacionLower])
                ->whereNotNull('operacion')
                ->update(['company_id' => $companyId]);

            $updatedCount += $affected;
            $this->command->info("Vinculados {$affected} usuario(s) a empresa ID {$companyId} (operacion: {$operacionLower})");
        }

        $this->command->info("Migración completada: " . count($operationToCompanyId) . " empresas creadas, {$updatedCount} usuarios vinculados.");
    }
}
