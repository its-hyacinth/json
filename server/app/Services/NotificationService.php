<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\Schedule;
use App\Models\Event;
use App\Models\LeaveRequest;
use App\Models\TrainingRequest;
use App\Models\OvertimeRequest;
use Carbon\Carbon;

class NotificationService
{
    /**
     * Send notification to all users about a new event
     */
    public static function sendNewEventNotificationToAll(Event $event, $createdBy = null)
    {
        $allUserIds = User::pluck('id')->toArray();
        
        $message = "New event '{$event->title}' scheduled for {$event->start_date}";
        self::sendNotification(
            $allUserIds,
            'new_event',
            'New Event',
            $message,
            $createdBy,
            $event->id
        );
    }

    /**
     * Send event update notification to all users
     */
    public static function sendEventUpdateNotificationToAll(Event $event, $changes, $createdBy = null)
    {
        $allUserIds = User::pluck('id')->toArray();

        $message = "Event '{$event->title}' has been updated: ";
        $details = [];
        
        if (isset($changes['title'])) {
            $details[] = "title to '{$changes['title']}'";
        }
        if (isset($changes['start_date'])) {
            $details[] = "date to {$changes['start_date']}";
        }
        if (isset($changes['location'])) {
            $details[] = "location to {$changes['location']}";
        }
        
        $message .= implode(', ', $details) ?: "details have been modified";
        
        self::sendNotification(
            $allUserIds,
            'event_update',
            'Event Updated',
            $message,
            $createdBy,
            $event->id
        );
    }

    /**
     * Send event cancellation notification to all users
     */
    public static function sendEventCancellationNotificationToAll(Event $event, $createdBy = null)
    {
        $allUserIds = User::pluck('id')->toArray();

        $message = "Event '{$event->title}' scheduled for {$event->start_date} has been cancelled";
        self::sendNotification(
            $allUserIds,
            'event_cancelled',
            'Event Cancelled',
            $message,
            $createdBy,
            $event->id
        );
    }

    /**
     * Send event reminder to all users
     */
    public static function sendEventReminderToAll(Event $event, $hoursBefore = 24)
    {
        $allUserIds = User::pluck('id')->toArray();

        $eventTime = Carbon::parse($event->start_date . ' ' . $event->start_time);
        $message = "Reminder: Event '{$event->title}' starts in {$hoursBefore} hours at {$eventTime->format('g:i A')}";
        
        self::sendNotification(
            $allUserIds,
            'event_reminder',
            'Event Reminder',
            $message,
            null, // System generated
            $event->id
        );
    }

    public static function sendScheduleNotification($userId, $message, $createdBy = null)
    {
        self::sendNotification([$userId], 'schedule_update', 'Schedule Update', $message, $createdBy);
    }

    public static function sendScheduleUpdate($userIds, $message, $createdBy = null)
    {
        self::sendNotification($userIds, 'schedule_update', 'Schedule Updated', $message, $createdBy);
    }

    public static function sendBulkScheduleUpdate($userIds, $changes, $createdBy = null)
    {
        $message = "Your schedule has been updated: ";
        $details = [];
        
        if (isset($changes['time_in'])) {
            $details[] = "start time to {$changes['time_in']}";
        }
        if (isset($changes['status'])) {
            $details[] = "status to {$changes['status']}";
        }
        if (isset($changes['recurring_pattern'])) {
            $details[] = "as {$changes['recurring_pattern']} pattern";
        }
        
        $message .= implode(', ', $details);
        
        self::sendNotification($userIds, 'bulk_schedule_update', 'Bulk Schedule Update', $message, $createdBy);
    }

    public static function sendScheduleTemplateApplied($userIds, $templateName, $createdBy = null)
    {
        $message = "A new schedule template '{$templateName}' has been applied to your schedule";
        self::sendNotification($userIds, 'schedule_template_applied', 'Schedule Template Applied', $message, $createdBy);
    }

    public static function sendScheduleGeneratedForMonth($userId, $monthYear, $createdBy = null)
    {
        $message = "Your schedule for {$monthYear} has been generated";
        self::sendNotification([$userId], 'schedule_generated', 'Schedule Generated', $message, $createdBy);
    }

    public static function sendScheduleConflictNotification($adminIds, $employeeName, $date, $createdBy = null)
    {
        $message = "Schedule conflict detected for {$employeeName} on {$date}";
        self::sendNotification($adminIds, 'schedule_conflict', 'Schedule Conflict', $message, $createdBy);
    }

    /**
     * Enhanced leave request notifications
     */
    public static function sendLeaveRequestSubmitted(LeaveRequest $leaveRequest)
    {
        $adminIds = self::getAdminUserIds();
        $user = $leaveRequest->user;
        $duration = Carbon::parse($leaveRequest->start_date)->diffInDays($leaveRequest->end_date) + 1;
        
        $message = "{$user->first_name} {$user->last_name} has submitted a new {$leaveRequest->type} leave request for {$duration} day(s) " . 
                  "({$leaveRequest->start_date} to {$leaveRequest->end_date})";
                  
        self::sendNotification(
            $adminIds,
            'new_leave_request',
            'New Leave Request',
            $message,
            $user->id,
            null,
            ['leave_request_id' => $leaveRequest->id]
        );
    }

    public static function sendLeaveRequestStatusUpdate(LeaveRequest $leaveRequest, $previousStatus = null)
    {
        $user = $leaveRequest->user;
        $status = $leaveRequest->status;
        $duration = Carbon::parse($leaveRequest->start_date)->diffInDays($leaveRequest->end_date) + 1;
        
        // Notification to employee
        $employeeMessage = "Your {$leaveRequest->type} leave request for {$duration} day(s) " . 
                         "({$leaveRequest->start_date} to {$leaveRequest->end_date}) has been {$status}";
        
        self::sendNotification(
            [$user->id],
            'leave_request_update',
            'Leave Request Update',
            $employeeMessage,
            null, // System generated
            null,
            ['leave_request_id' => $leaveRequest->id]
        );
        
        // Notification to admins if status changed
        if ($previousStatus && $previousStatus != $status) {
            $adminMessage = "{$user->first_name} {$user->last_name}'s {$leaveRequest->type} leave request has been changed from " . 
                          "{$previousStatus} to {$status}";
            
            self::sendNotification(
                self::getAdminUserIds(),
                'leave_request_status_change',
                'Leave Request Status Changed',
                $adminMessage,
                null, // System generated
                null,
                ['leave_request_id' => $leaveRequest->id]
            );
        }
    }

    /**
     * Enhanced training request notifications
     */
    public static function sendTrainingRequestCreated(TrainingRequest $trainingRequest)
    {
        $adminIds = self::getAdminUserIds();
        $user = $trainingRequest->user;
        
        $message = "{$user->first_name} {$user->last_name} has submitted a new training request for '{$trainingRequest->training_title}' " .
                  "({$trainingRequest->start_date} to {$trainingRequest->end_date})";
                  
        self::sendNotification(
            $adminIds,
            'new_training_request',
            'New Training Request',
            $message,
            $user->id,
            null,
            ['training_request_id' => $trainingRequest->id]
        );
    }

    public static function sendTrainingRequestApproved(TrainingRequest $trainingRequest)
    {
        $user = $trainingRequest->user;
        $message = "Your training request for '{$trainingRequest->training_title}' has been approved " .
                  "({$trainingRequest->start_date} to {$trainingRequest->end_date})";
        
        self::sendNotification(
            [$user->id],
            'training_request_approved',
            'Training Request Approved',
            $message,
            $trainingRequest->approved_by,
            null,
            ['training_request_id' => $trainingRequest->id]
        );
    }

    public static function sendTrainingRequestDeclined(TrainingRequest $trainingRequest)
    {
        $user = $trainingRequest->user;
        $message = "Your training request for '{$trainingRequest->training_title}' has been declined. " .
                  "Reason: {$trainingRequest->admin_notes}";
        
        self::sendNotification(
            [$user->id],
            'training_request_declined',
            'Training Request Declined',
            $message,
            $trainingRequest->approved_by,
            null,
            ['training_request_id' => $trainingRequest->id]
        );
    }

    public static function sendTrainingRequestCompleted(TrainingRequest $trainingRequest)
    {
        $user = $trainingRequest->user;
        $message = "Your training '{$trainingRequest->training_title}' has been marked as completed";
        
        self::sendNotification(
            [$user->id],
            'training_completed',
            'Training Completed',
            $message,
            null, // System generated
            null,
            ['training_request_id' => $trainingRequest->id]
        );

        // Notify HR/admins as well
        $adminMessage = "{$user->first_name} {$user->last_name} has completed training '{$trainingRequest->training_title}'";
        self::sendNotification(
            self::getAdminUserIds(),
            'training_completed_admin',
            'Employee Training Completed',
            $adminMessage,
            null,
            null,
            ['training_request_id' => $trainingRequest->id]
        );
    }

    public static function sendTrainingRequestUpdated(TrainingRequest $trainingRequest)
    {
        $adminIds = self::getAdminUserIds();
        $user = $trainingRequest->user;
        
        $message = "{$user->first_name} {$user->last_name} has updated their training request for '{$trainingRequest->title}'";
                  
        self::sendNotification(
            $adminIds,
            'training_request_updated',
            'Training Request Updated',
            $message,
            $user->id,
            null,
            ['training_request_id' => $trainingRequest->id]
        );
    }

    public static function sendTrainingRequestDeleted(TrainingRequest $trainingRequest)
    {
        $adminIds = self::getAdminUserIds();
        $user = $trainingRequest->user;
        
        $message = "{$user->first_name} {$user->last_name} has withdrawn their training request for '{$trainingRequest->title}'";
                  
        self::sendNotification(
            $adminIds,
            'training_request_withdrawn',
            'Training Request Withdrawn',
            $message,
            $user->id,
            null,
            ['training_request_id' => $trainingRequest->id]
        );
    }

    /**
     * Send notification when a new overtime request is created
     */
    public static function sendOvertimeRequestCreated(OvertimeRequest $overtimeRequest)
    {
        $adminIds = self::getAdminUserIds();
        $user = $overtimeRequest->requester;
        $assignedUser = $overtimeRequest->assignedEmployee;
        
        $message = "{$user->first_name} {$user->last_name} has submitted a new overtime request for " .
                  "{$assignedUser->first_name} {$assignedUser->last_name} on {$overtimeRequest->overtime_date} " .
                  "({$overtimeRequest->start_time} to {$overtimeRequest->end_time})";
                  
        self::sendNotification(
            $adminIds,
            'new_overtime_request',
            'New Overtime Request',
            $message,
            $user->id,
            null,
            ['overtime_request_id' => $overtimeRequest->id]
        );
    }

    /**
     * Send notification when an overtime request is updated
     */
    public static function sendOvertimeRequestUpdated(OvertimeRequest $overtimeRequest)
    {
        $adminIds = self::getAdminUserIds();
        $user = $overtimeRequest->requester;
        $assignedUser = $overtimeRequest->assignedEmployee;
        
        $message = "{$user->first_name} {$user->last_name} has updated the overtime request for " .
                  "{$assignedUser->first_name} {$assignedUser->last_name} on {$overtimeRequest->overtime_date}";
                  
        self::sendNotification(
            $adminIds,
            'overtime_request_updated',
            'Overtime Request Updated',
            $message,
            $user->id,
            null,
            ['overtime_request_id' => $overtimeRequest->id]
        );
    }

    /**
     * Send notification when an overtime request is accepted
     */
    public static function sendOvertimeRequestAccepted(OvertimeRequest $overtimeRequest)
    {
        $user = $overtimeRequest->assignedEmployee;
        $message = "Your overtime request for {$overtimeRequest->overtime_date} has been accepted";
        
        self::sendNotification(
            [$user->id],
            'overtime_request_accepted',
            'Overtime Request Accepted',
            $message,
            $overtimeRequest->responded_by,
            null,
            ['overtime_request_id' => $overtimeRequest->id]
        );

        // Notify requester
        $requesterMessage = "Your overtime request for {$user->first_name} {$user->last_name} on " .
                           "{$overtimeRequest->overtime_date} has been accepted";
        self::sendNotification(
            [$overtimeRequest->requested_by],
            'overtime_request_accepted',
            'Overtime Request Accepted',
            $requesterMessage,
            $overtimeRequest->responded_by,
            null,
            ['overtime_request_id' => $overtimeRequest->id]
        );
    }

    /**
     * Send notification when an overtime request is declined
     */
    public static function sendOvertimeRequestDeclined(OvertimeRequest $overtimeRequest)
    {
        $user = $overtimeRequest->assignedEmployee;
        $message = "Your overtime request for {$overtimeRequest->overtime_date} has been declined. " .
                  "Reason: {$overtimeRequest->employee_notes}";
        
        self::sendNotification(
            [$user->id],
            'overtime_request_declined',
            'Overtime Request Declined',
            $message,
            $overtimeRequest->responded_by,
            null,
            ['overtime_request_id' => $overtimeRequest->id]
        );

        // Notify requester
        $requesterMessage = "Your overtime request for {$user->first_name} {$user->last_name} on " .
                           "{$overtimeRequest->overtime_date} has been declined";
        self::sendNotification(
            [$overtimeRequest->requested_by],
            'overtime_request_declined',
            'Overtime Request Declined',
            $requesterMessage,
            $overtimeRequest->responded_by,
            null,
            ['overtime_request_id' => $overtimeRequest->id]
        );
    }

    /**
     * Send notification when overtime requests are auto-created for leave coverage
     */
    public static function sendAutoCreatedOvertimeRequests(array $overtimeRequests, User $admin)
    {
        foreach ($overtimeRequests as $overtimeRequest) {
            $user = $overtimeRequest->assignedEmployee;
            $coveringFor = $overtimeRequest->coveringForEmployee;
            
            $message = "You have been assigned overtime on {$overtimeRequest->overtime_date} " .
                      "to cover for {$coveringFor->first_name} {$coveringFor->last_name}'s leave";
            
            self::sendNotification(
                [$user->id],
                'auto_overtime_assigned',
                'Overtime Assignment',
                $message,
                $admin->id,
                null,
                ['overtime_request_id' => $overtimeRequest->id]
            );
        }
    }

    /**
     * Send notification when an overtime request is deleted
     */
    public static function sendOvertimeRequestDeleted(OvertimeRequest $overtimeRequest)
    {
        $adminIds = self::getAdminUserIds();
        $user = $overtimeRequest->requester;
        $assignedUser = $overtimeRequest->assignedEmployee;
        
        $message = "{$user->first_name} {$user->last_name} has withdrawn the overtime request for " .
                  "{$assignedUser->first_name} {$assignedUser->last_name} on {$overtimeRequest->overtime_date}";
                  
        self::sendNotification(
            $adminIds,
            'overtime_request_withdrawn',
            'Overtime Request Withdrawn',
            $message,
            $user->id,
            null,
            ['overtime_request_id' => $overtimeRequest->id]
        );
    }

    private static function sendNotification($userIds, $type, $title, $message, $createdBy = null, $eventId = null)
    {
        $notifications = [];
        foreach ($userIds as $userId) {
            $notificationData = [
                'title' => $title,
                'message' => $message,
                'created_by' => $createdBy
            ];

            if ($eventId) {
                $notificationData['event_id'] = $eventId;
            }

            $notifications[] = [
                'user_id' => $userId,
                'type' => $type,
                'data' => json_encode($notificationData),
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        if (!empty($notifications)) {
            Notification::insert($notifications);
        }
    }

    public static function getAdminUserIds()
    {
        return User::where('role', 'admin')->pluck('id')->toArray();
    }
}