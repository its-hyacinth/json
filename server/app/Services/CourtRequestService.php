<?php

namespace App\Services;

use App\Models\CourtRequest;
use App\Models\User;
use App\Models\Schedule;
use App\Services\NotificationService;
use App\Services\ScheduleService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class CourtRequestService
{
    public function __construct(
        private NotificationService $notificationService,
        private ScheduleService $scheduleService
    ) {}

    public function getAllCourtRequests(int $employeeId, array $filters = []): LengthAwarePaginator
    {
        $query = CourtRequest::with(['creator'])
            ->where('employee_id', $employeeId)
            ->orderBy('court_date', 'desc');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['court_type'])) {
            $query->where('court_type', $filters['court_type']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('court_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('court_date', '<=', $filters['date_to']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($eq) use ($search) {
                      $eq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        return $query->paginate(15);
    }

    public function getEmployeeCourtRequests(int $employeeId, array $filters = []): LengthAwarePaginator
    {
        $query = CourtRequest::with(['employee'])
            ->where('created_by', $employeeId)
            ->orderBy('court_date', 'desc');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['court_type'])) {
            $query->where('court_type', $filters['court_type']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('court_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('court_date', '<=', $filters['date_to']);
        }

        return $query->paginate(15);
    }

    public function createCourtRequest(array $data, User $creator, ?UploadedFile $attachment = null): CourtRequest
    {
        $data['created_by'] = $creator->id;
        
        // Handle file upload
        if ($attachment) {
            $attachmentData = $this->handleFileUpload($attachment, $creator->id);
            $data = array_merge($data, $attachmentData);
        }
        
        $courtRequest = CourtRequest::create($data);
        $courtRequest->load(['employee', 'creator']);

        // Send notification to employee
        $this->notificationService->sendNewCourtRequestNotification($courtRequest, $creator);

        return $courtRequest;
    }

    public function updateCourtRequest(CourtRequest $courtRequest, array $data, ?UploadedFile $attachment = null): CourtRequest
    {
        // Handle file upload
        if ($attachment) {
            // Delete old attachment if exists
            if ($courtRequest->attachment_path && Storage::exists($courtRequest->attachment_path)) {
                Storage::delete($courtRequest->attachment_path);
            }
            
            $attachmentData = $this->handleFileUpload($attachment, $courtRequest->created_by);
            $data = array_merge($data, $attachmentData);
        }

        $courtRequest->update($data);
        $courtRequest->load(['employee', 'creator']);

        return $courtRequest;
    }

    /**
     * Handle file upload for court request attachments.
     */
    private function handleFileUpload(UploadedFile $file, int $userId): array
    {
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $mimeType = $file->getMimeType();
        $size = $file->getSize();
        
        // Generate unique filename
        $filename = 'court_' . $userId . '_' . time() . '_' . uniqid() . '.' . $extension;
        
        // Store file in court-attachments directory
        $path = $file->storeAs('court-attachments', $filename, 'public');
        
        return [
            'attachment_name' => $originalName,
            'attachment_path' => $path,
            'attachment_mime_type' => $mimeType,
            'attachment_size' => $size,
        ];
    }

    /**
     * Download attachment for a court request.
     */
    public function downloadAttachment(CourtRequest $courtRequest): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        if (!$courtRequest->attachment_path || !Storage::exists($courtRequest->attachment_path)) {
            throw new \Exception('Attachment not found.');
        }

        return Storage::download($courtRequest->attachment_path, $courtRequest->attachment_name);
    }

    public function updateCourtRequestResponse(CourtRequest $courtRequest, array $data): CourtRequest
    {
        $previousStatus = $courtRequest->status;
        
        $courtRequest->update([
            'status' => $data['status'],
            'employee_notes' => $data['employee_notes'] ?? null,
            'responded_at' => now(),
        ]);

        $courtRequest->load(['employee', 'creator']);

        // Send appropriate notifications based on status change
        if ($previousStatus === 'pending' && $data['status'] === 'accepted') {
            $this->notificationService->sendCourtRequestAcceptedNotification($courtRequest);
            $this->updateScheduleForCourtRequest($courtRequest);
        } elseif ($previousStatus === 'pending' && $data['status'] === 'declined') {
            $this->notificationService->sendCourtRequestDeclinedNotification($courtRequest);
        }

        return $courtRequest;
    }

    public function deleteCourtRequest(CourtRequest $courtRequest): bool
    {
        $user = Auth::user();
        $deletedBy = $user;
        $result = $courtRequest->delete();

        if ($result) {
            $this->notificationService->sendCourtRequestDeletedNotification($courtRequest, $deletedBy);
        }

        return $result;
    }

    public function getCourtRequestById(int $id): ?CourtRequest
    {
        return CourtRequest::with(['employee', 'creator'])->find($id);
    }

    public function getUpcomingCourtRequests(int $days = 7): Collection
    {
        $requests = CourtRequest::with(['employee', 'creator'])
            ->where('status', 'accepted')
            ->whereBetween('court_date', [now(), now()->addDays($days)])
            ->orderBy('court_date')
            ->get();

        // Send reminders for upcoming court requests
        foreach ($requests as $request) {
            $this->notificationService->sendCourtRequestReminder($request, $days);
        }

        return $requests;
    }

    public function getCourtRequestsForDate(string $date): Collection
    {
        return CourtRequest::with(['employee', 'creator'])
            ->whereDate('court_date', $date)
            ->where('status', 'accepted')
            ->orderBy('court_time')
            ->get();
    }

    public function getCourtStatistics(): array
    {
        $total = CourtRequest::count();
        $pending = CourtRequest::where('status', 'pending')->count();
        $accepted = CourtRequest::where('status', 'accepted')->count();
        $declined = CourtRequest::where('status', 'declined')->count();
        
        $thisMonth = CourtRequest::whereMonth('court_date', now()->month)
            ->whereYear('court_date', now()->year)
            ->count();

        $upcoming = CourtRequest::where('status', 'accepted')
            ->where('court_date', '>=', now())
            ->count();

        return [
            'total' => $total,
            'pending' => $pending,
            'accepted' => $accepted,
            'declined' => $declined,
            'this_month' => $thisMonth,
            'upcoming' => $upcoming,
        ];
    }

    /**
     * Accept a court request.
     */
    public function acceptCourtRequest(CourtRequest $courtRequest, ?string $employeeNotes = null): CourtRequest
    {
        if ($courtRequest->status !== 'pending') {
            throw new \Exception('Court request has already been responded to.');
        }

        $courtRequest->update([
            'status' => 'accepted',
            'employee_notes' => $employeeNotes,
            'responded_at' => now(),
        ]);

        $this->updateScheduleForCourtRequest($courtRequest);
        $this->notificationService->sendCourtRequestAcceptedNotification($courtRequest);
        
        return $courtRequest->fresh();
    }

    /**
     * Decline a court request.
     */
    public function declineCourtRequest(CourtRequest $courtRequest, string $employeeNotes): CourtRequest
    {
        if ($courtRequest->status !== 'pending') {
            throw new \Exception('Court request has already been responded to.');
        }

        $courtRequest->update([
            'status' => 'declined',
            'employee_notes' => $employeeNotes,
            'responded_at' => now(),
        ]);

        $this->notificationService->sendCourtRequestDeclinedNotification($courtRequest);
        
        return $courtRequest->fresh();
    }

    public function updateScheduleForCourtRequest(CourtRequest $courtRequest): void
    {
        Schedule::updateOrCreate([
            'user_id' => $courtRequest->employee_id,
            'date' => $courtRequest->court_date,
        ], [
            'status' => 'CT',
            'time_in' => $courtRequest->court_time ? $courtRequest->court_time->format('H:i') : null,
        ]);
    }

    /**
     * Send court request updated notification
     */
    public function sendCourtRequestUpdatedNotification(CourtRequest $courtRequest, User $updatedBy): void
    {
        $this->notificationService->sendCourtRequestUpdatedNotification($courtRequest, $updatedBy);
    }
}
