<?php

namespace App\Services;

use App\Models\OvertimeRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class OvertimeRequestService
{
    /**
     * Get overtime requests for an employee.
     */
    public function getOvertimeRequestsForEmployee(User $user, array $filters = []): Collection|LengthAwarePaginator
    {
        $query = OvertimeRequest::with(['requester', 'assignedEmployee', 'coveringForEmployee'])
            ->where('assigned_to', $user->id)
            ->orderBy('created_at', 'desc');

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['overtime_type'])) {
            $query->where('overtime_type', $filters['overtime_type']);
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
     * Get all overtime requests for admin management.
     */
    public function getAdminOvertimeRequests(array $filters = []): Collection|LengthAwarePaginator
    {
        $query = OvertimeRequest::with(['requester', 'assignedEmployee', 'coveringForEmployee'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['overtime_type'])) {
            $query->where('overtime_type', $filters['overtime_type']);
        }

        if (isset($filters['assigned_to'])) {
            $query->where('assigned_to', $filters['assigned_to']);
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
        
        // Calculate overtime hours if not provided
        if (!isset($data['overtime_hours'])) {
            $start = \Carbon\Carbon::parse($data['start_time']);
            $end = \Carbon\Carbon::parse($data['end_time']);
            $data['overtime_hours'] = $end->diffInHours($start, true);
        }
        
        $overtimeRequest = OvertimeRequest::create($data);
        
        // Send notification
        NotificationService::sendOvertimeRequestCreated($overtimeRequest->load(['requester', 'assignedEmployee']));
        
        return $overtimeRequest;
    }

    /**
     * Update an existing overtime request.
     */
    public function updateOvertimeRequest(OvertimeRequest $overtimeRequest, array $data): OvertimeRequest
    {
        // Only allow updates if status is pending
        if ($overtimeRequest->status !== 'pending') {
            throw new \Exception('Cannot update overtime request that has already been responded to.');
        }

        // Recalculate overtime hours if times are updated
        if (isset($data['start_time']) || isset($data['end_time'])) {
            $startTime = $data['start_time'] ?? $overtimeRequest->start_time;
            $endTime = $data['end_time'] ?? $overtimeRequest->end_time;
            
            $start = \Carbon\Carbon::parse($startTime);
            $end = \Carbon\Carbon::parse($endTime);
            $data['overtime_hours'] = $end->diffInHours($start, true);
        }

        $overtimeRequest->update($data);
        
        // Send notification if any significant fields were changed
        if (count(array_intersect(array_keys($data), ['start_time', 'end_time', 'reason', 'overtime_type']))) {
            NotificationService::sendOvertimeRequestUpdated($overtimeRequest->load(['requester', 'assignedEmployee']));
        }
        
        return $overtimeRequest->fresh();
    }

    /**
     * Delete an overtime request.
     */
    public function deleteOvertimeRequest(OvertimeRequest $overtimeRequest): bool
    {
        // Only allow deletion if status is pending
        if ($overtimeRequest->status !== 'pending') {
            throw new \Exception('Cannot delete overtime request that has already been responded to.');
        }

        // Send notification before deletion
        NotificationService::sendOvertimeRequestDeleted($overtimeRequest->load(['requester', 'assignedEmployee']));
        
        return $overtimeRequest->delete();
    }

    /**
     * Accept an overtime request.
     */
    public function acceptOvertimeRequest(OvertimeRequest $overtimeRequest, ?string $employeeNotes = null): OvertimeRequest
    {
        if ($overtimeRequest->status !== 'pending') {
            throw new \Exception('Overtime request has already been responded to.');
        }

        $overtimeRequest->update([
            'status' => 'accepted',
            'employee_notes' => $employeeNotes,
            'responded_at' => now(),
        ]);

        // Send notification
        NotificationService::sendOvertimeRequestAccepted($overtimeRequest->load(['requester', 'assignedEmployee']));
        
        return $overtimeRequest->fresh();
    }

    /**
     * Decline an overtime request.
     */
    public function declineOvertimeRequest(OvertimeRequest $overtimeRequest, string $employeeNotes): OvertimeRequest
    {
        if ($overtimeRequest->status !== 'pending') {
            throw new \Exception('Overtime request has already been responded to.');
        }

        $overtimeRequest->update([
            'status' => 'declined',
            'employee_notes' => $employeeNotes,
            'responded_at' => now(),
        ]);

        // Send notification
        NotificationService::sendOvertimeRequestDeclined($overtimeRequest->load(['requester', 'assignedEmployee']));
        
        return $overtimeRequest->fresh();
    }

    /**
     * Auto-create overtime requests for leave coverage.
     */
    public function autoCreateOvertimeForLeave(string $leaveDate, int $employeeOnLeave, array $coverageEmployees, User $admin): array
    {
        $overtimeRequests = [];

        foreach ($coverageEmployees as $employeeId) {
            $overtimeRequest = $this->createOvertimeRequest([
                'assigned_to' => $employeeId,
                'covering_for' => $employeeOnLeave,
                'overtime_date' => $leaveDate,
                'start_time' => '08:00',
                'end_time' => '16:00',
                'reason' => 'Coverage required for employee leave',
                'overtime_type' => 'leave_coverage',
                'overtime_hours' => 8.0,
            ], $admin);

            $overtimeRequests[] = $overtimeRequest->load(['requester', 'assignedEmployee', 'coveringForEmployee']);
        }

        // Send notifications for all auto-created requests
        NotificationService::sendAutoCreatedOvertimeRequests($overtimeRequests, $admin);
        
        return $overtimeRequests;
    }

    /**
     * Check if user can view overtime request.
     */
    public function canViewOvertimeRequest(OvertimeRequest $overtimeRequest, User $user): bool
    {
        return $overtimeRequest->assigned_to === $user->id || 
               $overtimeRequest->requested_by === $user->id || 
               $user->is_admin;
    }

    /**
     * Get overtime statistics.
     */
    public function getOvertimeStatistics(User $user = null): array
    {
        $query = OvertimeRequest::query();
        
        if ($user && !$user->is_admin) {
            $query->where('assigned_to', $user->id);
        }

        return [
            'total' => $query->count(),
            'pending' => $query->where('status', 'pending')->count(),
            'accepted' => $query->where('status', 'accepted')->count(),
            'declined' => $query->where('status', 'declined')->count(),
            'total_hours' => $query->where('status', 'accepted')->sum('overtime_hours'),
            'this_month' => $query->whereMonth('overtime_date', now()->month)
                                 ->whereYear('overtime_date', now()->year)
                                 ->count(),
        ];
    }
}
