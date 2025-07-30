<?php

namespace App\Http\Controllers;

use App\Http\Requests\OvertimeRequestRequest;
use App\Models\OvertimeRequest;
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
     * Display a listing of overtime requests for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $overtimeRequests = $this->overtimeRequestService->getOvertimeRequestsForEmployee($request->user(), $request->all());
            return response()->json($overtimeRequests);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch overtime requests',
                'error' => $e->getMessage()
            ], 500);
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
                'overtime_request' => $overtimeRequest->load(['requester', 'assignedEmployee', 'coveringForEmployee'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create overtime request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified overtime request.
     */
    public function show(OvertimeRequest $overtimeRequest): JsonResponse
    {
        try {
            // Check if user can view this overtime request
            $user = Auth::user();
            if (!$this->overtimeRequestService->canViewOvertimeRequest($overtimeRequest, $user)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            return response()->json($overtimeRequest->load(['requester', 'assignedEmployee', 'coveringForEmployee']));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Overtime request not found',
                'error' => $e->getMessage()
            ], 404);
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
                'overtime_request' => $updatedOvertimeRequest->load(['requester', 'assignedEmployee', 'coveringForEmployee'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update overtime request',
                'error' => $e->getMessage()
            ], 500);
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
            ], 500);
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
     * Accept an overtime request (Employee response).
     */
    public function accept(Request $request, OvertimeRequest $overtimeRequest): JsonResponse
    {
        $request->validate([
            'employee_notes' => 'nullable|string|max:1000',
        ]);

        try {
            // Check if user can respond to this overtime request
            if ($overtimeRequest->assigned_to !== $request->user()->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $acceptedRequest = $this->overtimeRequestService->acceptOvertimeRequest(
                $overtimeRequest, 
                $request->employee_notes
            );
            
            return response()->json([
                'message' => 'Overtime request accepted',
                'overtime_request' => $acceptedRequest->load(['requester', 'assignedEmployee', 'coveringForEmployee'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to accept overtime request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Decline an overtime request (Employee response).
     */
    public function decline(Request $request, OvertimeRequest $overtimeRequest): JsonResponse
    {
        $request->validate([
            'employee_notes' => 'required|string|max:1000',
        ]);

        try {
            // Check if user can respond to this overtime request
            if ($overtimeRequest->assigned_to !== $request->user()->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $declinedRequest = $this->overtimeRequestService->declineOvertimeRequest(
                $overtimeRequest, 
                $request->employee_notes
            );
            
            return response()->json([
                'message' => 'Overtime request declined',
                'overtime_request' => $declinedRequest->load(['requester', 'assignedEmployee', 'coveringForEmployee'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to decline overtime request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Auto-create overtime requests for leave coverage.
     */
    public function autoCreateForLeave(Request $request): JsonResponse
    {
        $request->validate([
            'leave_date' => 'required|date',
            'employee_on_leave' => 'required|exists:users,id',
            'coverage_employees' => 'required|array|min:1',
            'coverage_employees.*' => 'exists:users,id',
        ]);

        try {
            $overtimeRequests = $this->overtimeRequestService->autoCreateOvertimeForLeave(
                $request->leave_date,
                $request->employee_on_leave,
                $request->coverage_employees,
                $request->user()
            );
            
            return response()->json([
                'message' => 'Overtime requests created for leave coverage',
                'overtime_requests' => $overtimeRequests,
                'count' => count($overtimeRequests)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create overtime requests for leave coverage',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
