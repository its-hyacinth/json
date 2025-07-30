<?php

namespace App\Http\Controllers;

use App\Http\Requests\LeaveRequestRequest;
use App\Models\LeaveRequest;
use App\Services\LeaveService;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    protected $leaveService;
    
    public function __construct(LeaveService $leaveService)
    {
        $this->leaveService = $leaveService;
    }
    
    /**
     * Get leave requests for current user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $leaveRequests = LeaveRequest::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($leaveRequests);
    }
    
    /**
     * Admin-only: Get all leave requests
     */
    public function adminIndex(Request $request)
    {
        $leaveRequests = LeaveRequest::with('user')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($leaveRequests);
    }
    
    /**
     * Create a new leave request
     */
    public function store(LeaveRequestRequest $request)
    {
        $leaveRequest = $this->leaveService->requestLeave($request->user(), $request->validated());
        return response()->json($leaveRequest, 201);
    }
    
    /**
     * Approve a leave request (Admin only)
     */
    public function approve(Request $request, LeaveRequest $leaveRequest)
    {
        $this->leaveService->processLeaveRequest($leaveRequest, 'approved');
        return response()->json(['message' => 'Leave request approved successfully']);
    }
    
    /**
     * Decline a leave request (Admin only)
     */
    public function decline(Request $request, LeaveRequest $leaveRequest)
    {
        $this->leaveService->processLeaveRequest($leaveRequest, 'declined');
        return response()->json(['message' => 'Leave request declined']);
    }
}