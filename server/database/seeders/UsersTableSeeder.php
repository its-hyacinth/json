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
            'first_name' => 'Admin',
            'last_name' => 'User',
            'badge_number' => 'ADM001',
            'division' => 'Management',
            'email' => 'admin@company.com',
            'phone' => '1234567890',
            'address' => '123 Admin Street, City',
            'password' => Hash::make('admin123'),
            'role' => 'admin'
        ]);

        // Create sample employees
        $employees = [
            [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'badge_number' => 'EMP001',
                'division' => 'Operations',
                'email' => 'john.doe@company.com',
                'phone' => '5551112222',
                'address' => '456 Employee Ave, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'badge_number' => 'EMP002',
                'division' => 'Marketing',
                'email' => 'jane.smith@company.com',
                'phone' => '5553334444',
                'address' => '789 Worker Blvd, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'Robert',
                'last_name' => 'Johnson',
                'badge_number' => 'EMP003',
                'division' => 'IT',
                'email' => 'robert.johnson@company.com',
                'phone' => '5555556666',
                'address' => '321 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ]
        ];

        foreach ($employees as $employee) {
            User::create($employee);
        }

        $this->command->info('Successfully created admin and 3 sample employees!');
    }
}