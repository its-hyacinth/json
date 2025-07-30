<?php

namespace App\Services;

use App\Models\User;
use App\Models\Schedule;
use App\Models\LeaveRequest;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EmployeeService
{
    /**
     * Create a new employee with default schedule generation
     */
    public function createEmployee(array $data)
    {
        return DB::transaction(function () use ($data) {
            $employee = User::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'badge_number' => $data['badge_number'],
                'division' => $data['division'] ?? null,
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'password' => bcrypt($data['password']),
                'role' => $data['role']
            ]);

            // Generate current month schedule for new employee
            if ($data['role'] === 'employee') {
                $this->generateInitialSchedule($employee);
            }

            return $employee;
        });
    }

    /**
     * Update employee information
     */
    public function updateEmployee(User $employee, array $data)
    {
        $updateData = collect($data)->only([
            'first_name', 
            'last_name', 
            'badge_number', 
            'division', 
            'email', 
            'phone', 
            'address', 
            'role'
        ])->toArray();

        if (isset($data['password']) && !empty($data['password'])) {
            $updateData['password'] = bcrypt($data['password']);
        }

        $employee->update($updateData);

        return $employee->fresh();
    }

    /**
     * Delete employee and handle related data
     */
    public function deleteEmployee(User $employee)
    {
        return DB::transaction(function () use ($employee) {
            // Check for existing data
            $hasSchedules = $employee->schedules()->exists();
            $hasLeaveRequests = $employee->leaveRequests()->exists();

            if ($hasSchedules || $hasLeaveRequests) {
                throw new \Exception('Cannot delete employee with existing schedules or leave requests');
            }

            $employee->delete();

            return true;
        });
    }

    /**
     * Get employee with related data
     */
    public function getEmployeeWithDetails(User $employee)
    {
        return $employee->load([
            'schedules' => function ($query) {
                $query->whereMonth('date', Carbon::now()->month)
                      ->whereYear('date', Carbon::now()->year)
                      ->orderBy('date');
            },
            'leaveRequests' => function ($query) {
                $query->orderBy('created_at', 'desc')
                      ->limit(10);
            }
        ]);
    }

    /**
     * Generate initial schedule for new employee
     */
    protected function generateInitialSchedule(User $employee)
    {
        $now = Carbon::now();
        $startDate = $now->copy()->startOfMonth();
        $endDate = $now->copy()->endOfMonth();

        $defaultTimeIn = '08:00:00';

        while ($startDate <= $endDate) {
            Schedule::create([
                'user_id' => $employee->id,
                'date' => $startDate->toDateString(),
                'time_in' => $defaultTimeIn,
                'status' => 'working'
            ]);

            $startDate->addDay();
        }
    }

    /**
     * Get employee statistics
     */
    public function getStatistics()
    {
        $stats = [
            'total_employees' => User::count(),
            'admin_count' => User::where('role', 'admin')->count(),
            'employee_count' => User::where('role', 'employee')->count(),
            'active_employees' => User::whereHas('schedules', function ($query) {
                $query->whereMonth('date', Carbon::now()->month)
                      ->whereYear('date', Carbon::now()->year);
            })->count(),
            'division_statistics' => User::select('division')
                ->selectRaw('COUNT(*) as count')
                ->whereNotNull('division')
                ->groupBy('division')
                ->get(),
            'recent_hires' => User::where('created_at', '>=', Carbon::now()->subDays(30))
                ->count()
        ];

        return $stats;
    }

    /**
     * Search employees with filters
     */
    public function searchEmployees(string $query, array $filters = [])
    {
        $employeeQuery = User::select([
            'id', 
            'first_name', 
            'last_name', 
            'badge_number', 
            'division', 
            'email', 
            'role',
            'created_at'
        ]);

        // Search in multiple fields
        $employeeQuery->where(function($q) use ($query) {
            $q->where('first_name', 'LIKE', "%{$query}%")
              ->orWhere('last_name', 'LIKE', "%{$query}%")
              ->orWhere('badge_number', 'LIKE', "%{$query}%")
              ->orWhere('email', 'LIKE', "%{$query}%");
        });

        // Apply filters
        if (isset($filters['division']) && !empty($filters['division'])) {
            $employeeQuery->where('division', $filters['division']);
        }

        if (isset($filters['role']) && !empty($filters['role'])) {
            $employeeQuery->where('role', $filters['role']);
        }

        return $employeeQuery->orderBy('last_name')
                           ->orderBy('first_name')
                           ->limit(50)
                           ->get();
    }
}