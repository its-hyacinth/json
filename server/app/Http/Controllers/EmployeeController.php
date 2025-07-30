<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * Get all employees (Admin only)
     */
    public function index(Request $request)
    {
        $employees = User::select([
            'id', 
            'first_name', 
            'last_name', 
            'badge_number', 
            'division', 
            'email', 
            'role',
            'phone',
            'address',
            'created_at'
        ])
        ->orderBy('last_name')
        ->orderBy('first_name')
        ->get();

        return response()->json($employees);
    }

    /**
     * Get a specific employee (Admin only)
     */
    public function show(Request $request, User $user)
    {
        return response()->json([
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'badge_number' => $user->badge_number,
            'division' => $user->division,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'role' => $user->role,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at
        ]);
    }

    /**
     * Create a new employee (Admin only)
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'badge_number' => 'required|string|unique:users,badge_number|max:50',
            'division' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,employee'
        ]);

        $employee = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'badge_number' => $request->badge_number,
            'division' => $request->division,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'password' => bcrypt($request->password),
            'role' => $request->role
        ]);

        return response()->json([
            'message' => 'Employee created successfully',
            'employee' => [
                'id' => $employee->id,
                'first_name' => $employee->first_name,
                'last_name' => $employee->last_name,
                'badge_number' => $employee->badge_number,
                'division' => $employee->division,
                'email' => $employee->email,
                'phone' => $employee->phone,
                'address' => $employee->address,
                'role' => $employee->role
            ]
        ], 201);
    }

    /**
     * Update an employee (Admin only)
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'badge_number' => 'sometimes|required|string|max:50|unique:users,badge_number,' . $user->id,
            'division' => 'nullable|string|max:255',
            'email' => 'sometimes|required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'password' => 'nullable|string|min:8',
            'role' => 'sometimes|required|in:admin,employee'
        ]);

        $updateData = $request->only([
            'first_name', 
            'last_name', 
            'badge_number', 
            'division', 
            'email', 
            'phone', 
            'address', 
            'role'
        ]);

        if ($request->filled('password')) {
            $updateData['password'] = bcrypt($request->password);
        }

        $user->update($updateData);

        return response()->json([
            'message' => 'Employee updated successfully',
            'employee' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'badge_number' => $user->badge_number,
                'division' => $user->division,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'role' => $user->role
            ]
        ]);
    }

    /**
     * Delete an employee (Admin only)
     */
    public function destroy(User $user)
    {
        // Check if employee has schedules or leave requests
        $hasSchedules = $user->schedules()->exists();
        $hasLeaveRequests = $user->leaveRequests()->exists();

        if ($hasSchedules || $hasLeaveRequests) {
            return response()->json([
                'message' => 'Cannot delete employee with existing schedules or leave requests'
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'Employee deleted successfully'
        ]);
    }

    /**
     * Get employee statistics (Admin only)
     */
    public function statistics()
    {
        $totalEmployees = User::count();
        $adminCount = User::where('role', 'admin')->count();
        $employeeCount = User::where('role', 'employee')->count();
        
        $divisionStats = User::select('division')
            ->selectRaw('COUNT(*) as count')
            ->whereNotNull('division')
            ->groupBy('division')
            ->get();

        return response()->json([
            'total_employees' => $totalEmployees,
            'admin_count' => $adminCount,
            'employee_count' => $employeeCount,
            'division_statistics' => $divisionStats
        ]);
    }

    /**
     * Search employees (Admin only)
     */
    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:2|max:255',
            'division' => 'nullable|string|max:255',
            'role' => 'nullable|in:admin,employee'
        ]);

        $query = User::select([
            'id', 
            'first_name', 
            'last_name', 
            'badge_number', 
            'division', 
            'email', 
            'role'
        ]);

        // Search in name, badge number, or email
        $searchTerm = $request->query;
        $query->where(function($q) use ($searchTerm) {
            $q->where('first_name', 'LIKE', "%{$searchTerm}%")
              ->orWhere('last_name', 'LIKE', "%{$searchTerm}%")
              ->orWhere('badge_number', 'LIKE', "%{$searchTerm}%")
              ->orWhere('email', 'LIKE', "%{$searchTerm}%");
        });

        // Filter by division if provided
        if ($request->filled('division')) {
            $query->where('division', $request->division);
        }

        // Filter by role if provided
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $employees = $query->orderBy('last_name')
                          ->orderBy('first_name')
                          ->limit(50)
                          ->get();

        return response()->json($employees);
    }
}