<?php

namespace App\Http\Controllers;

use App\Http\Requests\OvertimeRequestRequest;
use App\Models\OvertimeRequest;
use App\Models\OvertimeApplication;
use App\Services\OvertimeRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OvertimeRequestController extends Controller
{
    protected OvertimeRequestService $overtimeRequestService;

    public function __construct(OvertimeRequestService $overtimeRequestService)
    {
        $this->overtimeRequestService = $overtimeRequestService;
    }

    /**
     * Display available overtime requests for employees to apply.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $overtimeRequests = $this->overtimeRequestService->getAvailableOvertimeRequests($request->user(), $request->all());
            return response()->json($overtimeRequests);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch overtime requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get employee's overtime applications.
     */
    public function myApplications(Request $request): JsonResponse
    {
        try {
            $applications = $this->overtimeRequestService->getEmployeeApplications($request->user(), $request->all());
            return response()->json($applications);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch applications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Apply for overtime request.
     */
    public function apply(Request $request, OvertimeRequest $overtimeRequest): JsonResponse
    {
        $request->validate([
            'employee_notes' => 'nullable|string|max:1000',
        ]);

        try {
            $application = $this->overtimeRequestService->applyForOvertime(
                $overtimeRequest, 
                $request->user(), 
                $request->employee_notes
            );
            
            return response()->json([
                'message' => 'Application submitted successfully',
                'application' => $application
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to apply for overtime',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Store a newly created overtime request (Admin only).
     */
    public function store(OvertimeRequestRequest $request): JsonResponse
    {
        try {
            $overtimeRequest = $this->overtimeRequestService->createOvertimeRequest($request->validated(), $request->user());
            return response()->json([
                'message' => 'Overtime request created successfully',
                'overtime_request' => $overtimeRequest->load(['requester', 'applications.employee'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create overtime request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified overtime request (Admin only).
     */
    public function update(OvertimeRequestRequest $request, OvertimeRequest $overtimeRequest): JsonResponse
    {
        try {
            $updatedOvertimeRequest = $this->overtimeRequestService->updateOvertimeRequest($overtimeRequest, $request->validated());
            return response()->json([
                'message' => 'Overtime request updated successfully',
                'overtime_request' => $updatedOvertimeRequest->load(['requester', 'applications.employee'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update overtime request',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Remove the specified overtime request (Admin only).
     */
    public function destroy(OvertimeRequest $overtimeRequest): JsonResponse
    {
        try {
            $this->overtimeRequestService->deleteOvertimeRequest($overtimeRequest);
            return response()->json([
                'message' => 'Overtime request deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete overtime request',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get all overtime requests for admin management.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        try {
            $overtimeRequests = $this->overtimeRequestService->getAdminOvertimeRequests($request->all());
            return response()->json($overtimeRequests);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch admin overtime requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve overtime application (Admin only).
     */
    public function approveApplication(Request $request, OvertimeApplication $application): JsonResponse
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        try {
            $approvedApplication = $this->overtimeRequestService->approveApplication(
                $application, 
                $request->admin_notes
            );
            
            return response()->json([
                'message' => 'Application approved successfully',
                'application' => $approvedApplication->load(['overtimeRequest', 'employee'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to approve application',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Decline overtime application (Admin only).
     */
    public function declineApplication(Request $request, OvertimeApplication $application): JsonResponse
    {
        $request->validate([
            'admin_notes' => 'required|string|max:1000',
        ]);

        try {
            $declinedApplication = $this->overtimeRequestService->declineApplication(
                $application, 
                $request->admin_notes
            );
            
            return response()->json([
                'message' => 'Application declined successfully',
                'application' => $declinedApplication->load(['overtimeRequest', 'employee'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to decline application',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Close overtime request manually (Admin only).
     */
    public function close(OvertimeRequest $overtimeRequest): JsonResponse
    {
        try {
            $closedRequest = $this->overtimeRequestService->closeOvertimeRequest($overtimeRequest);
            return response()->json([
                'message' => 'Overtime request closed successfully',
                'overtime_request' => $closedRequest->load(['requester', 'applications.employee'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to close overtime request',
                'error' => $e->getMessage()
            ], 400);
        }
    }
}
