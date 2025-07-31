<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    public function run()
    {
        // Create admin users
        $admins = [
            [
                'first_name' => 'Jason',
                'last_name' => 'Richards',
                'badge_number' => 'ADM001',
                'division' => 'Management',
                'email' => 'jason.richards@cnu.edu',
                'phone' => '1234567890',
                'address' => '123 Admin Street, City',
                'password' => Hash::make('admin123'),
                'role' => 'admin'
            ],
            [
                'first_name' => 'Bill',
                'last_name' => 'Zins',
                'badge_number' => 'ADM002',
                'division' => 'Management',
                'email' => 'william.zins@cnu.edu',
                'phone' => '1234567891',
                'address' => '124 Admin Street, City',
                'password' => Hash::make('admin123'),
                'role' => 'admin'
            ],
            [
                'first_name' => 'Daniel',
                'last_name' => 'Woloszynowski',
                'badge_number' => 'ADM003',
                'division' => 'Management',
                'email' => 'daniel.woloszynowski@cnu.edu',
                'phone' => '1234567892',
                'address' => '125 Admin Street, City',
                'password' => Hash::make('admin123'),
                'role' => 'admin'
            ],
            [
                'first_name' => 'Gerard',
                'last_name' => 'Danko',
                'badge_number' => 'ADM004',
                'division' => 'Management',
                'email' => 'gerard.danko@cnu.edu',
                'phone' => '1234567893',
                'address' => '126 Admin Street, City',
                'password' => Hash::make('admin123'),
                'role' => 'admin'
            ],
            [
                'first_name' => 'Edwin',
                'last_name' => 'Delgado',
                'badge_number' => 'ADM005',
                'division' => 'Management',
                'email' => 'edwin.delgado@cnu.edu',
                'phone' => '1234567894',
                'address' => '127 Admin Street, City',
                'password' => Hash::make('admin123'),
                'role' => 'admin'
            ],
            [
                'first_name' => 'Bruce',
                'last_name' => 'Ferguson',
                'badge_number' => 'ADM006',
                'division' => 'Management',
                'email' => 'bruce.ferguson@cnu.edu',
                'phone' => '1234567895',
                'address' => '128 Admin Street, City',
                'password' => Hash::make('admin123'),
                'role' => 'admin'
            ],
            [
                'first_name' => 'Tara',
                'last_name' => 'Lacour',
                'badge_number' => 'ADM007',
                'division' => 'Management',
                'email' => 'tlacour@cnu.edu',
                'phone' => '1234567896',
                'address' => '129 Admin Street, City',
                'password' => Hash::make('admin123'),
                'role' => 'admin'
            ],
        ];

        foreach ($admins as $admin) {
            User::create($admin);
            
            // Create corresponding employee account
            $employeeAdmin = [
                'first_name' => $admin['first_name'],
                'last_name' => $admin['last_name'],
                'badge_number' => 'EMP' . substr($admin['badge_number'], 3),
                'division' => $admin['division'],
                'email' => str_replace('@cnu.edu', '.employee@cnu.edu', $admin['email']),
                'phone' => $admin['phone'],
                'address' => $admin['address'],
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ];
            User::create($employeeAdmin);
        }

        // Create sample employees
        $employees = [
            [
                'first_name' => 'Craig',
                'last_name' => 'Ozment',
                'badge_number' => 'EMP018',
                'division' => 'Operations',
                'email' => 'cozment@cnu.edu',
                'phone' => '5551112223',
                'address' => '456 Employee Ave, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'Kevin',
                'last_name' => 'Cherry',
                'badge_number' => 'EMP019',
                'division' => 'Operations',
                'email' => 'kevin.cherry@cnu.edu',
                'phone' => '5551112224',
                'address' => '457 Employee Ave, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'Richard',
                'last_name' => 'Lanzendorf',
                'badge_number' => 'EMP020',
                'division' => 'IT',
                'email' => 'richard.lanzendorf@cnu.edu',
                'phone' => '5555556667',
                'address' => '321 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'Jon',
                'last_name' => 'Hatton',
                'badge_number' => 'EMP021',
                'division' => 'Finance',
                'email' => 'jonathan.hatton@cnu.edu',
                'phone' => '5555552223',
                'address' => '327 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'Robert',
                'last_name' => 'Reynolds',
                'badge_number' => 'EMP022',
                'division' => 'Operations',
                'email' => 'robert.reynolds@cnu.edu',
                'phone' => '5555558889',
                'address' => '333 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'Isaac',
                'last_name' => 'Cerruti',
                'badge_number' => 'EMP023',
                'division' => 'Finance',
                'email' => 'isaac.cerruti@cnu.edu',
                'phone' => '5555553334',
                'address' => '328 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'David',
                'last_name' => 'Sentz',
                'badge_number' => 'EMP024',
                'division' => 'Operations',
                'email' => 'david.sentz@cnu.edu',
                'phone' => '5555557778',
                'address' => '332 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'Darryl',
                'last_name' => 'Austin',
                'badge_number' => 'EMP025',
                'division' => 'Finance',
                'email' => 'darryl.austin@cnu.edu',
                'phone' => '5555554445',
                'address' => '329 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'Stan',
                'last_name' => 'Crenshaw',
                'badge_number' => 'EMP026',
                'division' => 'Operations',
                'email' => 'crenshaw@cnu.edu',
                'phone' => '5555555556',
                'address' => '330 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'Kia',
                'last_name' => 'Golbad',
                'badge_number' => 'EMP027',
                'division' => 'Marketing',
                'email' => 'kia.golbad@cnu.edu',
                'phone' => '5555550001',
                'address' => '335 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'Bill',
                'last_name' => 'Williams',
                'badge_number' => 'EMP028',
                'division' => 'Marketing',
                'email' => 'bill.williams@cnu.edu',
                'phone' => '5555559990',
                'address' => '334 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'Dewayne',
                'last_name' => 'Sanders',
                'badge_number' => 'EMP029',
                'division' => 'HR',
                'email' => 'dewayne.sanders@cnu.edu',
                'phone' => '5555559991',
                'address' => '324 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'Eduardo',
                'last_name' => 'Camacho',
                'badge_number' => 'EMP030',
                'division' => 'Operations',
                'email' => 'eduardo.camacho@cnu.edu',
                'phone' => '5555556667',
                'address' => '331 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'Stephen',
                'last_name' => 'Decker',
                'badge_number' => 'EMP031',
                'division' => 'IT',
                'email' => 'stephen.decker@cnu.edu',
                'phone' => '5555556668',
                'address' => '321 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
            [
                'first_name' => 'Malia',
                'last_name' => 'Wagner',
                'badge_number' => 'EMP032',
                'division' => 'HR',
                'email' => 'malia.wagner@cnu.edu',
                'phone' => '5555550002',
                'address' => '336 Staff Lane, City',
                'password' => Hash::make('employee123'),
                'role' => 'employee'
            ],
        ];

        foreach ($employees as $employee) {
            User::create($employee);
        }

        $this->command->info('Successfully created admins, supervisors, and all employees!');
    }
}