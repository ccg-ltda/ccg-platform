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

        $superadminRole = Role::firstOrCreate(['name' => 'superadmin']);
        $superadminRole->syncPermissions(Permission::all());

        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions(Permission::all());

        Role::firstOrCreate(['name' => 'cliente']);

        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'username' => 'adminuser',
                'phone' => '3007776655',
                'operacion' => 'Sede Sur',
                'status' => 'aprobado',
                'password' => bcrypt('password'),
            ],
        );

        $kevin = User::firstOrCreate(
            ['email' => 'kevin@gmail.com'],
            [
                'name' => 'Kevin',
                'username' => 'kevin',
                'phone' => '3009876543',
                'operacion' => 'superadmin',
                'status' => 'aprobado',
                'password' => bcrypt('123456789'),
            ],
        );
        $kevin->syncRoles(['superadmin']);

        $lola = User::updateOrCreate(
            ['email' => 'lola@gmail.com'],
            [
                'name' => 'Lola',
                'username' => 'lola',
                'phone' => '3008889900',
                'operacion' => 'Sede Américas',
                'status' => 'aprobado',
                'password' => bcrypt('123456789'),
            ],
        );
        $lola->assignRole('admin');

        $palo = User::updateOrCreate(
            ['email' => 'palo@gmail.com'],
            [
                'name' => 'Palo',
                'username' => 'palo',
                'phone' => '3001112233',
                'operacion' => 'Sede Norte',
                'status' => 'aprobado',
                'password' => bcrypt('123456789'),
            ],
        );
        $palo->assignRole('cliente');
    }
}
