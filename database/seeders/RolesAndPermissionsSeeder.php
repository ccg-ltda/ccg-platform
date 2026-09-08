<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Permission::firstOrCreate(['name' => 'manage-users']);
        Permission::firstOrCreate(['name' => 'manage-settings']);
        Permission::firstOrCreate(['name' => 'view-dashboard']);
        Permission::firstOrCreate(['name' => 'view-users']);

        Role::firstOrCreate(['name' => 'Admin']);
        $supervisorRole = Role::firstOrCreate(['name' => 'Supervisor']);
        Role::firstOrCreate(['name' => 'Agente']);

        $supervisorRole->syncPermissions(['view-dashboard', 'view-users']);

        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $adminRole->syncPermissions(Permission::all());

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password123'),
            ],
        );
        $admin->assignRole('Admin');
    }
}
