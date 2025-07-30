<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    public function run()
    {
        // Create admin user
        User::create([
            'first_name' => 'Jason',
            'last_name' => 'Richards',
            'badge_number' => 'ADM001',
            'division' => 'Management',
            'email' => 'jason.richards@cnu.edu',
            'phone' => '1234567890',
            'address' => '123 Admin Street, City',
            'password' => Hash::make('admin123'),
            'role' => 'admin'
        ]);

        // Create sample employees
        $employees = [
            [
                'first_name' => 'CHERRY',
                'last_name' => '',
                'badge_number' => 'EMP001',
                'division' => 'Operations',
                'email' => 'cherry@cnu.edu',
                'phone' => '5551112222',
                'address' => '456 Employee Ave, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'VACANT',
                'last_name' => '',
                'badge_number' => 'EMP002',
                'division' => 'Marketing',
                'email' => 'vacant1@cnu.edu',
                'phone' => '5553334444',
                'address' => '789 Worker Blvd, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'DECKER',
                'last_name' => '',
                'badge_number' => 'EMP003',
                'division' => 'IT',
                'email' => 'decker@cnu.edu',
                'phone' => '5555556666',
                'address' => '321 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'RICHARDS',
                'last_name' => '',
                'badge_number' => 'EMP004',
                'division' => 'IT',
                'email' => 'richards@cnu.edu',
                'phone' => '5555557777',
                'address' => '322 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'LANZENDORF',
                'last_name' => '',
                'badge_number' => 'EMP005',
                'division' => 'IT',
                'email' => 'lanzendorf@cnu.edu',
                'phone' => '5555558888',
                'address' => '323 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'SANDERS',
                'last_name' => '',
                'badge_number' => 'EMP006',
                'division' => 'HR',
                'email' => 'sanders@cnu.edu',
                'phone' => '5555559999',
                'address' => '324 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'DELGADO',
                'last_name' => '',
                'badge_number' => 'EMP007',
                'division' => 'HR',
                'email' => 'delgado@cnu.edu',
                'phone' => '5555550000',
                'address' => '325 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'VACANT',
                'last_name' => '',
                'badge_number' => 'EMP008',
                'division' => 'HR',
                'email' => 'vacant2@cnu.edu',
                'phone' => '5555551111',
                'address' => '326 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'HATTON',
                'last_name' => '',
                'badge_number' => 'EMP009',
                'division' => 'Finance',
                'email' => 'hatton@cnu.edu',
                'phone' => '5555552222',
                'address' => '327 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'CERRUTI',
                'last_name' => '',
                'badge_number' => 'EMP010',
                'division' => 'Finance',
                'email' => 'cerruti@cnu.edu',
                'phone' => '5555553333',
                'address' => '328 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'AUSTIN',
                'last_name' => '',
                'badge_number' => 'EMP011',
                'division' => 'Finance',
                'email' => 'austin@cnu.edu',
                'phone' => '5555554444',
                'address' => '329 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'CRENSHAW',
                'last_name' => '',
                'badge_number' => 'EMP012',
                'division' => 'Operations',
                'email' => 'crenshaw@cnu.edu',
                'phone' => '5555555555',
                'address' => '330 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'CAMACHO',
                'last_name' => '',
                'badge_number' => 'EMP013',
                'division' => 'Operations',
                'email' => 'camacho@cnu.edu',
                'phone' => '5555556666',
                'address' => '331 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'SENTZ',
                'last_name' => '',
                'badge_number' => 'EMP014',
                'division' => 'Operations',
                'email' => 'sentz@cnu.edu',
                'phone' => '5555557777',
                'address' => '332 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'REYNOLDS',
                'last_name' => '',
                'badge_number' => 'EMP015',
                'division' => 'Operations',
                'email' => 'reynolds1@cnu.edu',
                'phone' => '5555558888',
                'address' => '333 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'WILLIAMS',
                'last_name' => '',
                'badge_number' => 'EMP016',
                'division' => 'Marketing',
                'email' => 'williams@cnu.edu',
                'phone' => '5555559999',
                'address' => '334 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'GOLBAD',
                'last_name' => '',
                'badge_number' => 'EMP017',
                'division' => 'Marketing',
                'email' => 'golbad@cnu.edu',
                'phone' => '5555550000',
                'address' => '335 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'REYNOLDS',
                'last_name' => '',
                'badge_number' => 'EMP018',
                'division' => 'Marketing',
                'email' => 'reynolds2@cnu.edu',
                'phone' => '5555551111',
                'address' => '336 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ]
        ];

        foreach ($employees as $employee) {
            User::create($employee);
        }

        $this->command->info('Successfully created admin and 18 sample employees!');
    }
}
