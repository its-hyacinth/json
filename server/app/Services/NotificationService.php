<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    public static function sendEventNotification($userIds, $message, $createdBy = null, $eventId = null)
    {
        $data = [
            'title' => 'Event Notification',
            'message' => $message,
            'created_by' => $createdBy
        ];

        if ($eventId) {
            $data['event_id'] = $eventId;
        }

        self::sendNotification($userIds, 'event_notification', 'Event Notification', $message, $createdBy, $eventId);
    }

    public static function sendScheduleNotification($userId, $message, $createdBy = null)
    {
        self::sendNotification([$userId], 'schedule_update', 'Schedule Update', $message, $createdBy);
    }

    public static function sendScheduleUpdate($userIds, $message, $createdBy = null)
    {
        self::sendNotification($userIds, 'schedule_update', 'Schedule Updated', $message, $createdBy);
    }

    public static function sendLeaveRequestUpdate($userId, $status, $employeeName = null, $createdBy = null)
    {
        $message = $employeeName 
            ? "{$employeeName}'s leave request has been {$status}"
            : "Your leave request has been {$status}";
        
        self::sendNotification([$userId], 'leave_request_update', 'Leave Request Update', $message, $createdBy);
    }

    public static function sendNewLeaveRequest($adminIds, $employeeName, $createdBy = null)
    {
        $message = "{$employeeName} has submitted a new leave request";
        self::sendNotification($adminIds, 'new_leave_request', 'New Leave Request', $message, $createdBy);
    }

    public static function sendTrainingRequestUpdate($userId, $status, $trainingTitle = null, $createdBy = null)
    {
        $message = $trainingTitle 
            ? "Your training request for '{$trainingTitle}' has been {$status}"
            : "Your training request has been {$status}";
        
        self::sendNotification([$userId], 'training_request_update', 'Training Request Update', $message, $createdBy);
    }

    public static function sendNewTrainingRequest($adminIds, $employeeName, $trainingTitle, $createdBy = null)
    {
        $message = "{$employeeName} has submitted a new training request for '{$trainingTitle}'";
        self::sendNotification($adminIds, 'new_training_request', 'New Training Request', $message, $createdBy);
    }

    public static function sendOvertimeRequest($userId, $message, $createdBy = null)
    {
        self::sendNotification([$userId], 'overtime_request', 'Overtime Request', $message, $createdBy);
    }

    public static function sendOvertimeResponse($adminIds, $employeeName, $status, $overtimeDate, $createdBy = null)
    {
        $message = "{$employeeName} has {$status} overtime request for {$overtimeDate}";
        self::sendNotification($adminIds, 'overtime_response', 'Overtime Response', $message, $createdBy);
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