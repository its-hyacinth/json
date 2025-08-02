<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\Schedule;
use App\Models\Event;
use App\Models\LeaveRequest;
use App\Models\TrainingRequest;
use App\Models\OvertimeRequest;
use App\Models\OvertimeApplication;
use App\Models\CourtRequest;
use Carbon\Carbon;

class NotificationService
{
    /**
     * Send notification when a new court request is created (admin to employee)
     */
    public static function sendNewCourtRequestNotification(CourtRequest $courtRequest, User $createdBy)
    {
        $employee = $courtRequest->employee;
        
        $message = "You have a new court request for {$courtRequest->court_date} - " .
                 "Case: {$courtRequest->case_number} at {$courtRequest->location}";
                  
        self::sendNotification(
            [$employee->id],
            'new_court_request',
            'New Court Request',
            $message,
            $createdBy->id,
            null,
            ['court_request_id' => $courtRequest->id]
        );
    }

    /**
     * Send notification when an employee accepts a court request
     */
    public static function sendCourtRequestAcceptedNotification(CourtRequest $courtRequest)
    {
        $employee = $courtRequest->employee;
        $message = "Your court request for {$courtRequest->court_date} has been accepted";
        
        // Notify the employee who accepted
        self::sendNotification(
            [$employee->id],
            'court_request_accepted',
            'Court Request Accepted',
            $message,
            $employee->id,
            null,
            ['court_request_id' => $courtRequest->id]
        );

        // Notify admins/creator
        $adminMessage = "{$employee->first_name} {$employee->last_name} has accepted the court request for " .
                       "{$courtRequest->court_date} (Case: {$courtRequest->case_number})";
        
        self::sendNotification(
            self::getAdminUserIds(),
            'court_request_accepted_admin',
            'Court Request Accepted',
            $adminMessage,
            $employee->id,
            null,
            ['court_request_id' => $courtRequest->id]
        );
    }

    /**
     * Send notification when an employee declines a court request
     */
    public static function sendCourtRequestDeclinedNotification(CourtRequest $courtRequest)
    {
        $employee = $courtRequest->employee;
        $message = "Your court request for {$courtRequest->court_date} has been declined. " .
                  "Reason: {$courtRequest->employee_notes}";
        
        // Notify the employee who declined
        self::sendNotification(
            [$employee->id],
            'court_request_declined',
            'Court Request Declined',
            $message,
            $employee->id,
            null,
            ['court_request_id' => $courtRequest->id]
        );

        // Notify admins/creator
        $adminMessage = "{$employee->first_name} {$employee->last_name} has declined the court request for " .
                       "{$courtRequest->court_date}. Reason: {$courtRequest->employee_notes}";
        
        self::sendNotification(
            self::getAdminUserIds(),
            'court_request_declined_admin',
            'Court Request Declined',
            $adminMessage,
            $employee->id,
            null,
            ['court_request_id' => $courtRequest->id]
        );
    }

    /**
     * Send notification when a court request is updated by admin
     */
    public static function sendCourtRequestUpdatedNotification(CourtRequest $courtRequest, User $updatedBy)
    {
        $employee = $courtRequest->employee;
        
        $message = "Your court request for {$courtRequest->court_date} has been updated. " .
                 "Case: {$courtRequest->case_number} at {$courtRequest->location}";
                  
        self::sendNotification(
            [$employee->id],
            'court_request_updated',
            'Court Request Updated',
            $message,
            $updatedBy->id,
            null,
            ['court_request_id' => $courtRequest->id]
        );
    }

    /**
     * Send notification when a court request is deleted
     */
    public static function sendCourtRequestDeletedNotification(CourtRequest $courtRequest, User $deletedBy)
    {
        $employee = $courtRequest->employee;
        
        $message = "Your court request for {$courtRequest->court_date} has been cancelled";
                  
        self::sendNotification(
            [$employee->id],
            'court_request_cancelled',
            'Court Request Cancelled',
            $message,
            $deletedBy->id,
            null,
            ['court_request_id' => $courtRequest->id]
        );
    }

    /**
     * Send reminder notification for upcoming court requests
     */
    public static function sendCourtRequestReminder(CourtRequest $courtRequest, $daysBefore = 1)
    {
        $employee = $courtRequest->employee;
        
        $message = "Reminder: You have a court appearance in {$daysBefore} day(s) on {$courtRequest->court_date} " .
                  "for case {$courtRequest->case_number} at {$courtRequest->location}";
                  
        self::sendNotification(
            [$employee->id],
            'court_request_reminder',
            'Court Appearance Reminder',
            $message,
            null, // System generated
            null,
            ['court_request_id' => $courtRequest->id]
        );
    }
    
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

    // ========================================
    // NEW OVERTIME NOTIFICATION METHODS
    // ========================================

    /**
     * Send notification to all employees when a new patrol overtime request is created
     */
    public static function sendNewPatrolOvertimeRequest(OvertimeRequest $overtimeRequest)
    {
        $allEmployeeIds = User::where('role', '!=', 'admin')->pluck('id')->toArray();
        $requester = $overtimeRequest->requester;
        $coveringFor = $overtimeRequest->coveringForEmployee;
        
        $message = "New patrol overtime available on {$overtimeRequest->overtime_date} " .
                  "({$overtimeRequest->start_time} - {$overtimeRequest->end_time})";
        
        if ($coveringFor) {
            $message .= " - Coverage for {$coveringFor->first_name} {$coveringFor->last_name}";
        }
        
        $message .= ". {$overtimeRequest->employees_required} officer(s) needed.";
                  
        self::sendNotification(
            $allEmployeeIds,
            'new_patrol_overtime',
            'New Patrol Overtime Available',
            $message,
            $requester->id,
            null,
            ['overtime_request_id' => $overtimeRequest->id]
        );
    }

    /**
     * Send notification to all employees when a new event overtime request is created
     */
    public static function sendNewEventOvertimeRequest(OvertimeRequest $overtimeRequest)
    {
        $allEmployeeIds = User::where('role', '!=', 'admin')->pluck('id')->toArray();
        $requester = $overtimeRequest->requester;
        
        $message = "New event overtime available on {$overtimeRequest->overtime_date} " .
                  "({$overtimeRequest->start_time} - {$overtimeRequest->end_time})";
        
        if ($overtimeRequest->event_location) {
            $message .= " at {$overtimeRequest->event_location}";
        }
        
        $message .= ". {$overtimeRequest->employees_required} officer(s) needed.";
                  
        self::sendNotification(
            $allEmployeeIds,
            'new_event_overtime',
            'New Event Overtime Available',
            $message,
            $requester->id,
            null,
            ['overtime_request_id' => $overtimeRequest->id]
        );
    }

    /**
     * Send notification when an overtime request is updated
     */
    public static function sendOvertimeRequestUpdated(OvertimeRequest $overtimeRequest, User $updatedBy)
    {
        $allEmployeeIds = User::where('role', '!=', 'admin')->pluck('id')->toArray();
        $type = $overtimeRequest->overtime_type === 'leave_coverage' ? 'patrol' : 'event';
        
        $message = "The {$type} overtime request for {$overtimeRequest->overtime_date} has been updated";
                  
        self::sendNotification(
            $allEmployeeIds,
            'overtime_request_updated',
            'Overtime Request Updated',
            $message,
            $updatedBy->id,
            null,
            ['overtime_request_id' => $overtimeRequest->id]
        );
    }

    /**
     * Send notification when an employee applies for overtime
     */
    public static function sendOvertimeApplicationSubmitted(OvertimeApplication $application)
    {
        $adminIds = self::getAdminUserIds();
        $employee = $application->employee;
        $overtimeRequest = $application->overtimeRequest;
        $type = $overtimeRequest->overtime_type === 'leave_coverage' ? 'patrol' : 'event';
        
        $message = "{$employee->first_name} {$employee->last_name} has applied for {$type} overtime " .
                  "on {$overtimeRequest->overtime_date} ({$overtimeRequest->start_time} - {$overtimeRequest->end_time})";
                  
        self::sendNotification(
            $adminIds,
            'overtime_application_submitted',
            'New Overtime Application',
            $message,
            $employee->id,
            null,
            [
                'overtime_request_id' => $overtimeRequest->id,
                'overtime_application_id' => $application->id
            ]
        );
    }

    /**
     * Send notification when an overtime application is approved
     */
    public static function sendOvertimeApplicationApproved(OvertimeApplication $application, User $approvedBy)
    {
        $employee = $application->employee;
        $overtimeRequest = $application->overtimeRequest;
        $type = $overtimeRequest->overtime_type === 'leave_coverage' ? 'patrol' : 'event';
        
        $message = "Your {$type} overtime application for {$overtimeRequest->overtime_date} " .
                  "({$overtimeRequest->start_time} - {$overtimeRequest->end_time}) has been approved";
        
        if ($overtimeRequest->overtime_type === 'leave_coverage' && $overtimeRequest->coveringForEmployee) {
            $message .= " - You will be covering for {$overtimeRequest->coveringForEmployee->first_name} {$overtimeRequest->coveringForEmployee->last_name}";
        } elseif ($overtimeRequest->overtime_type === 'event_coverage' && $overtimeRequest->event_location) {
            $message .= " at {$overtimeRequest->event_location}";
        }
        
        self::sendNotification(
            [$employee->id],
            'overtime_application_approved',
            'Overtime Application Approved',
            $message,
            $approvedBy->id,
            null,
            [
                'overtime_request_id' => $overtimeRequest->id,
                'overtime_application_id' => $application->id
            ]
        );
    }

    /**
     * Send notification when an overtime application is declined
     */
    public static function sendOvertimeApplicationDeclined(OvertimeApplication $application, User $declinedBy)
    {
        $employee = $application->employee;
        $overtimeRequest = $application->overtimeRequest;
        $type = $overtimeRequest->overtime_type === 'leave_coverage' ? 'patrol' : 'event';
        
        $message = "Your {$type} overtime application for {$overtimeRequest->overtime_date} " .
                  "({$overtimeRequest->start_time} - {$overtimeRequest->end_time}) has been declined";
        
        if ($application->admin_notes) {
            $message .= ". Reason: {$application->admin_notes}";
        }
        
        self::sendNotification(
            [$employee->id],
            'overtime_application_declined',
            'Overtime Application Declined',
            $message,
            $declinedBy->id,
            null,
            [
                'overtime_request_id' => $overtimeRequest->id,
                'overtime_application_id' => $application->id
            ]
        );
    }

    /**
     * Send notification when an overtime request is automatically closed (full)
     */
    public static function sendOvertimeRequestAutoClosed(OvertimeRequest $overtimeRequest)
    {
        $allEmployeeIds = User::where('role', '!=', 'admin')->pluck('id')->toArray();
        $type = $overtimeRequest->overtime_type === 'leave_coverage' ? 'patrol' : 'event';
        
        $message = "The {$type} overtime request for {$overtimeRequest->overtime_date} is now full and has been closed";
                  
        self::sendNotification(
            $allEmployeeIds,
            'overtime_request_closed',
            'Overtime Request Closed',
            $message,
            null, // System generated
            null,
            ['overtime_request_id' => $overtimeRequest->id]
        );
    }

    /**
     * Send notification when an overtime request is manually closed by admin
     */
    public static function sendOvertimeRequestManuallyClosed(OvertimeRequest $overtimeRequest, User $closedBy)
    {
        $allEmployeeIds = User::where('role', '!=', 'admin')->pluck('id')->toArray();
        $type = $overtimeRequest->overtime_type === 'leave_coverage' ? 'patrol' : 'event';
        
        $message = "The {$type} overtime request for {$overtimeRequest->overtime_date} has been closed by administration";
                  
        self::sendNotification(
            $allEmployeeIds,
            'overtime_request_closed',
            'Overtime Request Closed',
            $message,
            $closedBy->id,
            null,
            ['overtime_request_id' => $overtimeRequest->id]
        );
    }

    /**
     * Send notification when an overtime request is deleted
     */
    public static function sendOvertimeRequestDeleted(OvertimeRequest $overtimeRequest, User $deletedBy)
    {
        // Notify employees who applied
        $applicantIds = $overtimeRequest->applications->pluck('employee_id')->toArray();
        $type = $overtimeRequest->overtime_type === 'leave_coverage' ? 'patrol' : 'event';
        
        if (!empty($applicantIds)) {
            $message = "The {$type} overtime request for {$overtimeRequest->overtime_date} that you applied for has been cancelled";
                      
            self::sendNotification(
                $applicantIds,
                'overtime_request_cancelled',
                'Overtime Request Cancelled',
                $message,
                $deletedBy->id,
                null,
                ['overtime_request_id' => $overtimeRequest->id]
            );
        }

        // Notify all employees
        $allEmployeeIds = User::where('role', '!=', 'admin')->pluck('id')->toArray();
        $generalMessage = "The {$type} overtime request for {$overtimeRequest->overtime_date} has been cancelled";
        
        self::sendNotification(
            $allEmployeeIds,
            'overtime_request_cancelled',
            'Overtime Request Cancelled',
            $generalMessage,
            $deletedBy->id,
            null,
            ['overtime_request_id' => $overtimeRequest->id]
        );
    }

    /**
     * Send reminder notification for upcoming overtime assignments
     */
    public static function sendOvertimeReminder(OvertimeApplication $application, $hoursBefore = 24)
    {
        $employee = $application->employee;
        $overtimeRequest = $application->overtimeRequest;
        $type = $overtimeRequest->overtime_type === 'leave_coverage' ? 'patrol' : 'event';
        
        $message = "Reminder: You have {$type} overtime in {$hoursBefore} hours on {$overtimeRequest->overtime_date} " .
                  "({$overtimeRequest->start_time} - {$overtimeRequest->end_time})";
        
        if ($overtimeRequest->overtime_type === 'leave_coverage' && $overtimeRequest->coveringForEmployee) {
            $message .= " - Coverage for {$overtimeRequest->coveringForEmployee->first_name} {$overtimeRequest->coveringForEmployee->last_name}";
        } elseif ($overtimeRequest->overtime_type === 'event_coverage' && $overtimeRequest->event_location) {
            $message .= " at {$overtimeRequest->event_location}";
        }
                  
        self::sendNotification(
            [$employee->id],
            'overtime_reminder',
            'Overtime Reminder',
            $message,
            null, // System generated
            null,
            [
                'overtime_request_id' => $overtimeRequest->id,
                'overtime_application_id' => $application->id
            ]
        );
    }

    /**
     * Send notification when overtime request reaches capacity threshold
     */
    public static function sendOvertimeCapacityAlert(OvertimeRequest $overtimeRequest, $threshold = 0.8)
    {
        $adminIds = self::getAdminUserIds();
        $type = $overtimeRequest->overtime_type === 'leave_coverage' ? 'patrol' : 'event';
        $percentage = round(($overtimeRequest->employees_approved / $overtimeRequest->employees_required) * 100);
        
        $message = "The {$type} overtime request for {$overtimeRequest->overtime_date} is {$percentage}% full " .
                  "({$overtimeRequest->employees_approved}/{$overtimeRequest->employees_required} positions filled)";
                  
        self::sendNotification(
            $adminIds,
            'overtime_capacity_alert',
            'Overtime Capacity Alert',
            $message,
            null, // System generated
            null,
            ['overtime_request_id' => $overtimeRequest->id]
        );
    }

    private static function sendNotification($userIds, $type, $title, $message, $createdBy = null, $eventId = null, $additionalData = [])
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

            // Merge additional data
            $notificationData = array_merge($notificationData, $additionalData);

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
