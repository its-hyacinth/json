<?php

namespace App\Notifications;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class LeaveRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $leaveRequest;

    public function __construct(LeaveRequest $leaveRequest)
    {
        $this->leaveRequest = $leaveRequest;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('New Leave Request')
            ->line($this->leaveRequest->user->full_name . ' has submitted a leave request.')
            ->action('Review Request', url('/leave-requests/' . $this->leaveRequest->id));
    }

    public function toArray($notifiable)
    {
        return [
            'leave_request_id' => $this->leaveRequest->id,
            'user_id' => $this->leaveRequest->user_id,
            'type' => $this->leaveRequest->type,
            'message' => $this->leaveRequest->user->full_name . ' has requested leave.',
        ];
    }
}