<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\Schedule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class SchedulesTableSeeder extends Seeder
{
    private $employeeMap = [
        'OZMENT' => 'EMP018',
        'CHERRY' => 'EMP019',
        'DECKER' => 'EMP031',
        'RICHARDS' => 'EMP001',
        'LANZENDORF' => 'EMP020',
        'SANDERS' => 'EMP029',
        'DELGADO' => 'EMP005',
        'HATTON' => 'EMP021',
        'CERRUTI' => 'EMP023',
        'AUSTIN' => 'EMP025',
        'CRENSHAW' => 'EMP026',
        'CAMACHO' => 'EMP030',
        'SENTZ' => 'EMP024',
        'REYNOLDS' => 'EMP022',
        'WILLIAMS' => 'EMP028',
        'GOLBAD' => 'EMP027',
    ];

    private $statusMap = [
        'C' => 'C',         // Comp time
        'S' => 'S',         // Sick
        'M' => 'M',         // Military leave
        'SD' => 'SD',       // Scheduled day off
        'CT' => 'CT',       // Court time
        'H' => 'H',         // Holiday
    ];

    public function run()
    {
        // Seed June 2025
        $this->seedMonth('2025-06', [
            'OZMENT' => [
                'working' => [2,3,4,5,6,10,11,12,13,16,17,18,19,20,23,24,25,26,27,30],
                'S' => [9],
            ],
            'CHERRY' => [
                'working' => [6,7,8,12,13,14,15,20,21,22,23,26,27,28,29,30],
                'C' => [2,5,16],
            ],
            'DECKER' => [
                'working' => [1,6,7,8,9,13,14,15,20,21,22,23,27,28,29,30],
                'C' => [20,21],
            ],
            'RICHARDS' => [
                'working' => [2,3,4,5,9,10,11,12,16,17,18,19,23,24,25,30],
                'C' => [1,26,27],
            ],
            'LANZENDORF' => [
                'working' => [2,3,4,5,10,11,12,16,17,18,19,23,24,25,26,27,30],
                'M' => [7,8],
                'S' => [9],
            ],
            'SANDERS' => [
                'working' => [2,3,4,5,6,10,11,12,17,18,19,23,24,25,26,27,30],
                'C' => [13,16,20],
            ],
            'DELGADO' => [
                'working' => [1,2,5,6,7,8,12,13,14,15,20,26,27,28,29,30],
                'C' => [11,16,17,18,19,21,22,23],
                'S' => [9,10],
            ],
            'HATTON' => [
                'working' => [2,3,4,5,9,10,11,12,16,17,18,19,23,24,25,26,30],
            ],
            'CERRUTI' => [
                'working' => [1,6,7,8,9,13,14,15,16,20,21,22,23,27,28,29,30],
            ],
            'AUSTIN' => [
                'working' => [1,6,7,8,9,13,14,15,16,20,21,22,23,27,28,29,30],
            ],
            'CRENSHAW' => [
                'working' => [2,3,4,5,10,11,12,17,18,19,23,24,25,30],
                'C' => [13,16,20,27],
            ],
            'CAMACHO' => [
                'working' => [1,2,5,6,7,8,9,12,13,14,15,16,19,20,21,22,23,26,27,28,29,30],
            ],
            'SENTZ' => [
                'working' => [1,6,7,8,9,13,14,15,20,21,22,23,27,28,29,30],
            ],
            'WILLIAMS' => [
                'working' => [2,3,4,5,9,10,11,12,16,17,18,19,23,24,25,26,30],
                'S' => [1],
            ],
            'GOLBAD' => [
                'working' => [2,3,4,5,9,10,11,12,16,17,18,19,23,24,25,26,30],
                'C' => [27],
            ],
            'REYNOLDS' => [
                'working' => [2,3,4,5,6,10,11,12,13,16,17,18,19,20,23,24,25,26,27,30],
                'S' => [1,7,8,9,14,15,21,22,28,29],
            ],
        ]);

        // Seed July 2025
        $this->seedMonth('2025-07', [
            'OZMENT' => [
                'working' => [1,3,4,5,6,7,12,13,14,17,18,19,20,21,24,25,26,27,28,31],
                'C' => [10,11],
            ],
            'CHERRY' => [
                'working' => [8,9,10,11,14,15,16,17,18,21,22,23,24,25,28,29,30,31],
                'C' => [2,7],
            ],
            'DECKER' => [
                'working' => [3,7,8,9,10,14,15,16,17,21,22,23,24,28,29,30,31],
                'C' => [18],
            ],
            'RICHARDS' => [
                'working' => [4,5,6,11,12,13,18,19,20,25,26,27],
                'C' => [1,7],
            ],
            'LANZENDORF' => [
                'working' => [1,4,5,6,7,14,18,19,20,21,25,26,27,28],
                'M' => [11,12,13],
            ],
            'SANDERS' => [
                'working' => [1,3,5,6,7,10,11,12,13,14,17,19,20,21,24,25,26,27,28,31],
                'C' => [4,18],
            ],
            'DELGADO' => [
                'working' => [2,3,7,8,9,10,14,15,16,17,21,25,26,27,28,31],
                'C' => [5,6,11,12,13,22,23,24],
            ],
            'HATTON' => [
                'working' => [1,4,5,6,7,11,15,16,20,21,22,25,26,27,28,31],
                'S' => [12,13,14],
                'C' => [26,27],
            ],
            'CERRUTI' => [
                'working' => [2,3,7,8,9,10,14,15,16,17,21,22,23,24,28,29,30,31],
                'C' => [25,26,27],
            ],
            'AUSTIN' => [
                'working' => [2,3,7,8,9,10,14,21,22,23,24,28,29,30,31],
                'C' => [15,16,17],
            ],
            'CRENSHAW' => [
                'working' => [10,11,12,13,14,17,18,19,20,24,25,26,27,28,31],
                'C' => [1,3,4,5,6,7],
            ],
            'CAMACHO' => [
                'working' => [2,3,7,8,9,10,11,14,15,16,17,18,21,22,23,24,25,28,29,30,31],
            ],
            'SENTZ' => [
                'working' => [2,3,7,8,9,10,14,15,16,17,21,22,23,24,28,29,30,31],
                'S' => [25,26,27],
            ],
            'WILLIAMS' => [
                'working' => [1,4,5,6,7,11,12,13,18,19,20,25,26,27,28],
            ],
            'GOLBAD' => [
                'working' => [1,4,5,6,7,11,12,13,18,19,20,25,26,27,28],
            ],
            'REYNOLDS' => [
                'working' => [1,2,3,4,7,8,9,10,11,14,15,16,17,18,21,22,23,24,25,28,29,30,31],
                'S' => [12,13,19,20,26,27],
            ],
        ]);

        // Seed August 2025
        $this->seedMonth('2025-08', [
            'OZMENT' => [
                'working' => [1,4,5,6,7,8,11,12,13,14,15,18,19,20,21,22,25,26,27,28,29],
            ],
            'CHERRY' => [
                'working' => [2,3,4,7,8,9,10,14,15,16,17,18,21,22,23,24,25,28,29,30,31],
                'C' => [5,6,11,12,13],
                'S' => [19,20,26,27],
            ],
            'DECKER' => [
                'working' => [3,4,8,9,10,11,15,16,17,18,22,23,24,25,29,30,31],
                'C' => [19],
            ],
            'RICHARDS' => [
                'working' => [4,11,12,13,14,18,19,20,21,25,26,27,28],
                'C' => [5,6,7,8,9,10],
                'S' => [1],
            ],
            'LANZENDORF' => [
                'working' => [1,5,6,7,8,11,12,13,14,18,19,20,21,25,26,27,28],
                'M' => [2,3,4],
            ],
            'SANDERS' => [
                'working' => [1,4,5,6,7,8,11,12,13,14,15,18,19,20,21,22,25,26,27,28,29],
                'C' => [24],
            ],
            'DELGADO' => [
                'working' => [2,3,4,7,8,9,10,14,15,16,17,21,25,26,27,28,29,30,31],
                'C' => [5,6,11,12,13,22,23,24],
            ],
            'HATTON' => [
                'working' => [1,4,5,6,7,11,12,13,14,18,19,20,21,25,26,27,28],
            ],
            'CERRUTI' => [
                'working' => [3,4,8,9,10,11,15,16,17,18,22,23,24,25,29,30,31],
                'C' => [1,2,5,6,7],
            ],
            'AUSTIN' => [
                'working' => [3,4,8,9,10,11,15,16,17,18,22,23,24,25,29,30,31],
                'C' => [1,2,5,6,7,12,13,14],
            ],
            'CRENSHAW' => [
                'working' => [1,4,5,6,7,8,11,12,13,14,18,19,20,21,22,25,26,27,28,29],
                'C' => [2,3],
                'S' => [9,10,15,16,17],
            ],
            'CAMACHO' => [
                'working' => [2,3,4,7,8,9,10,11,14,15,16,17,18,21,22,23,24,25,28,29,30,31],
            ],
            'SENTZ' => [
                'working' => [3,4,8,9,10,11,15,16,17,18,22,23,24,25,29,30,31],
                'S' => [1,2,5,6,7],
            ],
            'WILLIAMS' => [
                'working' => [1,4,5,6,7,11,12,13,14,18,19,20,21,25,26,27,28],
            ],
            'GOLBAD' => [
                'working' => [1,4,5,6,7,11,12,13,14,18,19,20,21,25,26,27,28],
            ],
            'REYNOLDS' => [
                'working' => [1,4,5,6,7,8,11,12,13,14,15,18,19,20,21,22,25,26,27,28,29],
                'C' => [2,3],
            ],
        ]);
    }

    private function seedMonth(string $yearMonth, array $employeeData)
    {
        [$year, $month] = explode('-', $yearMonth);
        $daysInMonth = Carbon::createFromDate($year, $month, 1)->daysInMonth;

        foreach ($employeeData as $lastName => $statusDays) {
            $badgeNumber = $this->employeeMap[$lastName] ?? null;
            if (!$badgeNumber) {
                continue;
            }

            $user = User::where('badge_number', $badgeNumber)->first();
            if (!$user) {
                continue;
            }

            // Process each status type
            foreach ($statusDays as $status => $days) {
                foreach ($days as $day) {
                    if ($day > $daysInMonth) continue;

                    $date = Carbon::createFromDate($year, $month, $day);
                    $timeIn = ($status === 'working') ? $this->getShiftStartTime($lastName) : null;
                    $mappedStatus = $this->statusMap[$status] ?? $status;

                    Schedule::updateOrCreate(
                        [
                            'user_id' => $user->id,
                            'date' => $date->format('Y-m-d'),
                        ],
                        [
                            'time_in' => $timeIn,
                            'status' => $mappedStatus,
                        ]
                    );
                }
            }
        }
    }

    private function getShiftStartTime(string $lastName): string
    {
        // Determine shift start time based on the value in the Excel (7, 15, 16, 22, 23, etc.)
        switch ($lastName) {
            case 'OZMENT':
            case 'CHERRY':
            case 'DECKER':
            case 'RICHARDS':
            case 'LANZENDORF':
            case 'REYNOLDS':
                return '07:00:00'; // 7.0 in Excel
            case 'SANDERS':
            case 'DELGADO':
                return '15:00:00'; // 15.0 in Excel
            case 'HATTON':
            case 'CERRUTI':
            case 'AUSTIN':
                return '16:00:00'; // 16.0 in Excel
            case 'CRENSHAW':
                return '23:00:00'; // 23.0 in Excel
            case 'SENTZ':
            case 'WILLIAMS':
            case 'GOLBAD':
                return '22:00:00'; // 22.0 in Excel
            default:
                return '08:00:00';
        }
    }
}