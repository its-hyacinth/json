<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\CourtRequestRequest;
use App\Models\CourtRequest;
use App\Services\CourtRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourtRequestController extends Controller
{
    public function __construct(
        private CourtRequestService $courtRequestService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'status', 'employee_id', 'court_type', 'date_from', 'date_to', 'search'
        ]);

        if ($request->user()->role === 'employee') {
            $courtRequests = $this->courtRequestService->getEmployeeCourtRequests(
                $request->user()->id,
                $filters
            );
            return response()->json($courtRequests);
        }

        $courtRequests = $this->courtRequestService->getAllCourtRequests($request->user()->id ,$filters);
        return response()->json($courtRequests);
    }

    public function store(CourtRequestRequest $request): JsonResponse
    {
        $attachment = $request->hasFile('attachment') ? $request->file('attachment') : null;
        
        $courtRequest = $this->courtRequestService->createCourtRequest(
            $request->validated(),
            $request->user(),
            $attachment
        );

        return response()->json([
            'message' => 'Court request created successfully',
            'court_request' => $courtRequest
        ], 201);
    }

    public function show(CourtRequest $courtRequest): JsonResponse
    {
        $courtRequest->load(['employee', 'creator']);
        return response()->json($courtRequest);
    }

    public function update(CourtRequestRequest $request, CourtRequest $courtRequest): JsonResponse
    {
        $attachment = $request->hasFile('attachment') ? $request->file('attachment') : null;
        
        $updatedCourtRequest = $this->courtRequestService->updateCourtRequest(
            $courtRequest, 
            $request->validated(),
            $attachment
        );

        return response()->json([
            'message' => 'Court request updated successfully',
            'court_request' => $updatedCourtRequest
        ]);
    }

    public function destroy(CourtRequest $courtRequest): JsonResponse
    {
        $this->courtRequestService->deleteCourtRequest($courtRequest);

        return response()->json([
            'message' => 'Court request deleted successfully'
        ]);
    }

    /**
     * Download attachment for a court request.
     */
    public function downloadAttachment(CourtRequest $courtRequest)
    {
        try {
            return $this->courtRequestService->downloadAttachment($courtRequest);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to download attachment',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function updateResponse(CourtRequestRequest $request, CourtRequest $courtRequest, int $id): JsonResponse
    {
        $courtRequest = $this->courtRequestService->updateCourtRequestResponse(
            $courtRequest,
            $request->validated()
        );

        return response()->json([
            'message' => 'Response updated successfully',
            'court_request' => $courtRequest
        ]);
    }

    public function statistics(): JsonResponse
    {
        $statistics = $this->courtRequestService->getCourtStatistics();
        return response()->json($statistics);
    }

    public function upcoming(Request $request): JsonResponse
    {
        $days = $request->get('days', 7);
        $courtRequests = $this->courtRequestService->getUpcomingCourtRequests($days);
        return response()->json($courtRequests);
    }

    /**
     * Accept a court request
     */
    public function accept(Request $request, CourtRequest $courtRequest): JsonResponse
    {
        $validated = $request->validate([
            'employee_notes' => 'nullable|string'
        ]);

        $courtRequest = $this->courtRequestService->acceptCourtRequest(
            $courtRequest,
            $validated['employee_notes'] ?? null
        );

        return response()->json([
            'message' => 'Court request accepted successfully',
            'data' => $courtRequest
        ]);
    }

    /**
     * Decline a court request
     */
    public function decline(Request $request, CourtRequest $courtRequest): JsonResponse
    {
        $validated = $request->validate([
            'employee_notes' => 'required|string'
        ]);

        $courtRequest = $this->courtRequestService->declineCourtRequest(
            $courtRequest,
            $validated['employee_notes']
        );

        return response()->json([
            'message' => 'Court request declined successfully',
            'data' => $courtRequest
        ]);
    }
}
