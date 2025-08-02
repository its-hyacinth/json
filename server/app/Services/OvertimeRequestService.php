<?php

namespace App\Services;

use App\Models\OvertimeRequest;
use App\Models\OvertimeApplication;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class OvertimeRequestService
{
    /**
     * Get available overtime requests for an employee to apply.
     */
    public function getAvailableOvertimeRequests(User $user, array $filters = []): Collection
    {
        $query = OvertimeRequest::with(['requester', 'applications.employee'])
            ->where('is_closed', false)
            ->where('overtime_date', '>=', now()->toDateString())
            ->whereDoesntHave('applications', function ($q) use ($user) {
                $q->where('employee_id', $user->id);
            })
            ->orderBy('overtime_date', 'asc');

        // Apply filters
        if (isset($filters['overtime_type'])) {
            $query->where('overtime_type', $filters['overtime_type']);
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('overtime_date', [$filters['start_date'], $filters['end_date']]);
        }

        return $query->get();
    }

    /**
     * Get employee's overtime applications.
     */
    public function getEmployeeApplications(User $user, array $filters = []): Collection
    {
        $query = OvertimeApplication::with(['overtimeRequest.requester', 'employee'])
            ->where('employee_id', $user->id)
            ->orderBy('applied_at', 'desc');

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->get();
    }

    /**
     * Get all overtime requests for admin management.
     */
    public function getAdminOvertimeRequests(array $filters = []): Collection|LengthAwarePaginator
    {
        $query = OvertimeRequest::with(['requester', 'applications.employee'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if (isset($filters['overtime_type'])) {
            $query->where('overtime_type', $filters['overtime_type']);
        }

        if (isset($filters['is_closed'])) {
            $query->where('is_closed', $filters['is_closed']);
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('overtime_date', [$filters['start_date'], $filters['end_date']]);
        }

        // Pagination
        if (isset($filters['per_page'])) {
            return $query->paginate($filters['per_page']);
        }

        return $query->get();
    }

    /**
     * Create a new overtime request.
     */
    public function createOvertimeRequest(array $data, User $admin): OvertimeRequest
    {
        $data['requested_by'] = $admin->id;
        
        $overtimeRequest = OvertimeRequest::create($data);
        
        // Send notification to all employees
        // NotificationService::sendOvertimeRequestCreated($overtimeRequest);
        
        if ($overtimeRequest->overtime_type === 'leave_coverage') {
            NotificationService::sendNewPatrolOvertimeRequest($overtimeRequest);
        } else {
            NotificationService::sendNewEventOvertimeRequest($overtimeRequest);
        }
        
        return $overtimeRequest;
    }

    /**
     * Update an existing overtime request.
     */
    public function updateOvertimeRequest(OvertimeRequest $overtimeRequest, array $data): OvertimeRequest
    {
        // Only allow updates if no applications yet or if closed
        if ($overtimeRequest->employees_applied > 0 && !$overtimeRequest->is_closed) {
            throw new \Exception('Cannot update overtime request that has applications.');
        }

        $overtimeRequest->update($data);
        
        $user = Auth::user();
        // Send notification about update
        NotificationService::sendOvertimeRequestUpdated($overtimeRequest, $user);
        
        return $overtimeRequest->fresh();
    }

    /**
     * Delete an overtime request.
     */
    public function deleteOvertimeRequest(OvertimeRequest $overtimeRequest): bool
    {
        // Only allow deletion if no applications
        if ($overtimeRequest->employees_applied > 0) {
            throw new \Exception('Cannot delete overtime request that has applications.');
        }

        $user = Auth::user();
        // Send notification about deletion
        NotificationService::sendOvertimeRequestDeleted($overtimeRequest, $user);

        return $overtimeRequest->delete();
    }

    /**
     * Apply for overtime request.
     */
    public function applyForOvertime(OvertimeRequest $overtimeRequest, User $employee, ?string $notes = null): OvertimeApplication
    {
        // Check if request is still open
        if ($overtimeRequest->is_closed) {
            throw new \Exception('This overtime request is closed.');
        }

        // Check if employee already applied
        $existingApplication = OvertimeApplication::where('overtime_request_id', $overtimeRequest->id)
            ->where('employee_id', $employee->id)
            ->first();

        if ($existingApplication) {
            throw new \Exception('You have already applied for this overtime request.');
        }

        // Create application
        $application = OvertimeApplication::create([
            'overtime_request_id' => $overtimeRequest->id,
            'employee_id' => $employee->id,
            'employee_notes' => $notes,
            'applied_at' => now(),
        ]);

        // Update request counters
        $overtimeRequest->increment('employees_applied');

        // Send notification
        // NotificationService::sendOvertimeApplicationSubmitted($application);
        
        // Send notification to admins
        NotificationService::sendOvertimeApplicationSubmitted($application);
        
        return $application->load(['overtimeRequest', 'employee']);
    }

    /**
     * Approve overtime application.
     */
    public function approveApplication(OvertimeApplication $application, ?string $adminNotes = null): OvertimeApplication
    {
        if ($application->status !== 'pending') {
            throw new \Exception('Application has already been responded to.');
        }

        $overtimeRequest = $application->overtimeRequest;

        // Check if request is full
        if ($overtimeRequest->employees_approved >= $overtimeRequest->employees_required) {
            throw new \Exception('This overtime request is already full.');
        }

        $application->update([
            'status' => 'approved',
            'admin_notes' => $adminNotes,
            'responded_at' => now(),
        ]);

        // Update request counters
        $overtimeRequest->increment('employees_approved');

        // Check if request should be closed
        if ($overtimeRequest->employees_approved >= $overtimeRequest->employees_required) {
            $overtimeRequest->update([
                'is_closed' => true,
                'closed_at' => now(),
            ]);
        }

        // Send notification
        // NotificationService::sendOvertimeApplicationApproved($application);
        
        $user = Auth::user();
        // Send notification to employee
        NotificationService::sendOvertimeApplicationApproved($application, $user);

        // Check if request should be closed and send auto-close notification
        if ($overtimeRequest->employees_approved >= $overtimeRequest->employees_required) {
            NotificationService::sendOvertimeRequestAutoClosed($overtimeRequest);
        }
        
        return $application->fresh();
    }

    /**
     * Decline overtime application.
     */
    public function declineApplication(OvertimeApplication $application, string $adminNotes): OvertimeApplication
    {
        if ($application->status !== 'pending') {
            throw new \Exception('Application has already been responded to.');
        }

        $application->update([
            'status' => 'declined',
            'admin_notes' => $adminNotes,
            'responded_at' => now(),
        ]);

        // Send notification
        // NotificationService::sendOvertimeApplicationDeclined($application);
        
        $user = Auth::user();
        // Send notification to employee
        NotificationService::sendOvertimeApplicationDeclined($application, $user);
        
        return $application->fresh();
    }

    /**
     * Close overtime request manually.
     */
    public function closeOvertimeRequest(OvertimeRequest $overtimeRequest): OvertimeRequest
    {
        if ($overtimeRequest->is_closed) {
            throw new \Exception('Overtime request is already closed.');
        }

        $overtimeRequest->update([
            'is_closed' => true,
            'closed_at' => now(),
        ]);

        $user = Auth::user();
        // Send notification about manual closure
        NotificationService::sendOvertimeRequestManuallyClosed($overtimeRequest, $user);

        return $overtimeRequest->fresh();
    }

    /**
     * Get overtime statistics.
     */
    public function getOvertimeStatistics(User $user = null): array
    {
        if ($user && !$user->is_admin) {
            // Employee statistics
            $applications = OvertimeApplication::where('employee_id', $user->id);
            
            return [
                'total_applications' => $applications->count(),
                'pending_applications' => $applications->where('status', 'pending')->count(),
                'approved_applications' => $applications->where('status', 'approved')->count(),
                'declined_applications' => $applications->where('status', 'declined')->count(),
                'available_requests' => OvertimeRequest::where('is_closed', false)
                    ->where('overtime_date', '>=', now()->toDateString())
                    ->whereDoesntHave('applications', function ($q) use ($user) {
                        $q->where('employee_id', $user->id);
                    })->count(),
            ];
        } else {
            // Admin statistics
            $requests = OvertimeRequest::query();
            
            return [
                'total_requests' => $requests->count(),
                'open_requests' => $requests->where('is_closed', false)->count(),
                'closed_requests' => $requests->where('is_closed', true)->count(),
                'total_applications' => OvertimeApplication::count(),
                'pending_applications' => OvertimeApplication::where('status', 'pending')->count(),
                'approved_applications' => OvertimeApplication::where('status', 'approved')->count(),
            ];
        }
    }
}
