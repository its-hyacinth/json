<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Models\Schedule;
use App\Models\User;
use Carbon\Carbon;

class LeaveService
{
    public function requestLeave(User $user, $data)
    {
        $leaveRequest = LeaveRequest::create([
            'user_id' => $user->id,
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'type' => $data['type'],
            'reason' => $data['reason'] ?? null,
            'status' => 'pending'
        ]);
        
        return $leaveRequest;
    }
    
    public function processLeaveRequest(LeaveRequest $leaveRequest, $status)
    {
        $leaveRequest->update(['status' => $status]);
        
        if ($status === 'approved') {
            $this->updateSchedulesForLeave($leaveRequest);
        }
        
        return $leaveRequest;
    }
    
    protected function updateSchedulesForLeave(LeaveRequest $leaveRequest)
    {
        $startDate = Carbon::parse($leaveRequest->start_date);
        $endDate = Carbon::parse($leaveRequest->end_date);
        
        while ($startDate <= $endDate) {
            Schedule::updateOrCreate([
                'user_id' => $leaveRequest->user_id,
                'date' => $startDate->toDateString()
            ], [
                'time_in' => null,
                'status' => $leaveRequest->type
            ]);
            
            $startDate->addDay();
        }
    }
}