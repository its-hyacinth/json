<?php

namespace App\Services;

use App\Models\TrainingRequest;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class TrainingRequestService
{
    /**
     * Get training requests for a user with optional filters.
     */
    public function getTrainingRequests(User $user, array $filters = []): Collection|LengthAwarePaginator
    {
        $query = TrainingRequest::with(['user', 'approver'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('start_date', [$filters['start_date'], $filters['end_date']]);
        }

        // Pagination
        if (isset($filters['per_page'])) {
            return $query->paginate($filters['per_page']);
        }

        return $query->get();
    }

    /**
     * Get all training requests for admin review.
     */
    public function getAdminTrainingRequests(array $filters = []): Collection|LengthAwarePaginator
    {
        $query = TrainingRequest::with(['user', 'approver'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('start_date', [$filters['start_date'], $filters['end_date']]);
        }

        // Pagination
        if (isset($filters['per_page'])) {
            return $query->paginate($filters['per_page']);
        }

        return $query->get();
    }

    /**
     * Create a new training request.
     */
    public function createTrainingRequest(array $data, User $user): TrainingRequest
    {
        $data['user_id'] = $user->id;
        
        $trainingRequest = TrainingRequest::create($data);
        
        // Send notification to admins
        NotificationService::sendTrainingRequestCreated($trainingRequest);
        
        return $trainingRequest;
    }

    /**
     * Update an existing training request.
     */
    public function updateTrainingRequest(TrainingRequest $trainingRequest, array $data): TrainingRequest
    {
        // Only allow updates if status is pending
        if ($trainingRequest->status !== 'pending') {
            throw new \Exception('Cannot update training request that has already been processed.');
        }

        $trainingRequest->update($data);
        
        // Send notification about the update
        NotificationService::sendTrainingRequestUpdated($trainingRequest);
        
        return $trainingRequest->fresh();
    }

    /**
     * Delete a training request.
     */
    public function deleteTrainingRequest(TrainingRequest $trainingRequest): bool
    {
        // Only allow deletion if status is pending
        if ($trainingRequest->status !== 'pending') {
            throw new \Exception('Cannot delete training request that has already been processed.');
        }

        // Store info for notification before deletion
        $user = $trainingRequest->user;
        $title = $trainingRequest->title;
        
        $deleted = $trainingRequest->delete();
        
        if ($deleted) {
            // Create a temporary object for notification
            $tempRequest = new TrainingRequest([
                'title' => $title,
                'user' => $user
            ]);
            
            NotificationService::sendTrainingRequestDeleted($tempRequest);
        }
        
        return $deleted;
    }

    /**
     * Approve a training request and update employee schedule.
     */
    public function approveTrainingRequest(TrainingRequest $trainingRequest, User $admin, ?string $adminNotes = null): TrainingRequest
    {
        if ($trainingRequest->status !== 'pending') {
            throw new \Exception('Training request has already been processed.');
        }

        $trainingRequest->update([
            'status' => 'approved',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'admin_notes' => $adminNotes,
        ]);

        // Update employee schedule to mark training days as "S"
        $this->updateScheduleForTraining($trainingRequest);

        // Send approval notification
        NotificationService::sendTrainingRequestApproved($trainingRequest);
        
        return $trainingRequest->fresh();
    }

    /**
     * Decline a training request.
     */
    public function declineTrainingRequest(TrainingRequest $trainingRequest, User $admin, string $adminNotes): TrainingRequest
    {
        if ($trainingRequest->status !== 'pending') {
            throw new \Exception('Training request has already been processed.');
        }

        $trainingRequest->update([
            'status' => 'declined',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'admin_notes' => $adminNotes,
        ]);

        // Send declined notification
        NotificationService::sendTrainingRequestDeclined($trainingRequest);
        
        return $trainingRequest->fresh();
    }

    /**
     * Mark training request as completed and ensure schedule is updated.
     */
    public function markTrainingCompleted(TrainingRequest $trainingRequest, User $admin): TrainingRequest
    {
        if ($trainingRequest->status !== 'approved') {
            throw new \Exception('Only approved training requests can be marked as completed.');
        }

        $trainingRequest->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Ensure schedule is marked as "S" for training days
        $this->updateScheduleForTraining($trainingRequest);

        // Send completion notifications
        NotificationService::sendTrainingRequestCompleted($trainingRequest);
        
        return $trainingRequest->fresh();
    }

    /**
     * Update employee schedule to mark training days as "S".
     */
    protected function updateScheduleForTraining(TrainingRequest $trainingRequest): void
    {
        $startDate = Carbon::parse($trainingRequest->start_date);
        $endDate = Carbon::parse($trainingRequest->end_date);
        
        // Get all dates in the training period
        $currentDate = $startDate->copy();
        
        while ($currentDate <= $endDate) {
            // Update or create schedule entry for each training day
            Schedule::updateOrCreate([
                'user_id' => $trainingRequest->user_id,
                'date' => $currentDate->toDateString()
            ], [
                'status' => 'S', // School/Training
                'time_in' => null, // Clear time_in for training days
            ]);
            
            $currentDate->addDay();
        }
    }

    /**
     * Check if user can view training request.
     */
    public function canViewTrainingRequest(TrainingRequest $trainingRequest, User $user): bool
    {
        return $trainingRequest->user_id === $user->id || $user->is_admin;
    }

    /**
     * Check if user can update training request.
     */
    public function canUpdateTrainingRequest(TrainingRequest $trainingRequest, User $user): bool
    {
        return $trainingRequest->user_id === $user->id && $trainingRequest->status === 'pending';
    }

    /**
     * Check if user can delete training request.
     */
    public function canDeleteTrainingRequest(TrainingRequest $trainingRequest, User $user): bool
    {
        return $trainingRequest->user_id === $user->id && $trainingRequest->status === 'pending';
    }

    /**
     * Get training statistics.
     */
    public function getTrainingStatistics(User $user = null): array
    {
        $query = TrainingRequest::query();
        
        if ($user && !$user->is_admin) {
            $query->where('user_id', $user->id);
        }

        return [
            'total' => $query->count(),
            'pending' => $query->where('status', 'pending')->count(),
            'approved' => $query->where('status', 'approved')->count(),
            'declined' => $query->where('status', 'declined')->count(),
            'completed' => $query->where('status', 'completed')->count(),
            'high_priority' => $query->where('priority', 'high')->count(),
        ];
    }

    /**
     * Get upcoming training sessions for an employee.
     */
    public function getUpcomingTraining(User $user): Collection
    {
        return TrainingRequest::where('user_id', $user->id)
            ->whereIn('status', ['approved', 'completed'])
            ->where('start_date', '>=', now()->toDateString())
            ->orderBy('start_date')
            ->get();
    }

    /**
     * Get training history for an employee.
     */
    public function getTrainingHistory(User $user): Collection
    {
        return TrainingRequest::where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('end_date', '<', now()->toDateString())
            ->orderBy('end_date', 'desc')
            ->get();
    }
}
