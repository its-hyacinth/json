<?php

namespace App\Http\Controllers;

use App\Http\Requests\TrainingRequestRequest;
use App\Models\TrainingRequest;
use App\Services\TrainingRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TrainingRequestController extends Controller
{
    protected TrainingRequestService $trainingRequestService;

    public function __construct(TrainingRequestService $trainingRequestService)
    {
        $this->trainingRequestService = $trainingRequestService;
    }

    /**
     * Display a listing of training requests.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $trainingRequests = $this->trainingRequestService->getTrainingRequests($request->user(), $request->all());
            return response()->json($trainingRequests);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch training requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created training request.
     */
    public function store(TrainingRequestRequest $request): JsonResponse
    {
        try {
            $trainingRequest = $this->trainingRequestService->createTrainingRequest($request->validated(), $request->user());
            return response()->json([
                'message' => 'Training request submitted successfully',
                'training_request' => $trainingRequest->load(['user', 'approver'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create training request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified training request.
     */
    public function show(TrainingRequest $trainingRequest): JsonResponse
    {
        try {
            // Check if user can view this training request
            $user = Auth::user();
            if (!$this->trainingRequestService->canViewTrainingRequest($trainingRequest, $user)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            return response()->json($trainingRequest->load(['user', 'approver']));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Training request not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified training request.
     */
    public function update(TrainingRequestRequest $request, TrainingRequest $trainingRequest): JsonResponse
    {
        try {
            // Check if user can update this training request
            if (!$this->trainingRequestService->canUpdateTrainingRequest($trainingRequest, $request->user())) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $updatedTrainingRequest = $this->trainingRequestService->updateTrainingRequest($trainingRequest, $request->validated());
            return response()->json([
                'message' => 'Training request updated successfully',
                'training_request' => $updatedTrainingRequest->load(['user', 'approver'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update training request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified training request.
     */
    public function destroy(TrainingRequest $trainingRequest): JsonResponse
    {
        try {
            // Check if user can delete this training request
            $user = Auth::user();
            if (!$this->trainingRequestService->canDeleteTrainingRequest($trainingRequest, $user)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $this->trainingRequestService->deleteTrainingRequest($trainingRequest);
            return response()->json([
                'message' => 'Training request deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete training request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all training requests for admin review.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        try {
            $trainingRequests = $this->trainingRequestService->getAdminTrainingRequests($request->all());
            return response()->json($trainingRequests);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch admin training requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve a training request.
     */
    public function approve(Request $request, TrainingRequest $trainingRequest): JsonResponse
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        try {
            $approvedRequest = $this->trainingRequestService->approveTrainingRequest(
                $trainingRequest, 
                $request->user(), 
                $request->admin_notes
            );
            
            return response()->json([
                'message' => 'Training request approved successfully',
                'training_request' => $approvedRequest->load(['user', 'approver'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to approve training request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Decline a training request.
     */
    public function decline(Request $request, TrainingRequest $trainingRequest): JsonResponse
    {
        $request->validate([
            'admin_notes' => 'required|string|max:1000',
        ]);

        try {
            $declinedRequest = $this->trainingRequestService->declineTrainingRequest(
                $trainingRequest, 
                $request->user(), 
                $request->admin_notes
            );
            
            return response()->json([
                'message' => 'Training request declined',
                'training_request' => $declinedRequest->load(['user', 'approver'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to decline training request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark training request as completed.
     */
    public function markCompleted(TrainingRequest $trainingRequest): JsonResponse
    {
        try {
            $user = Auth::user();
            $completedRequest = $this->trainingRequestService->markTrainingCompleted($trainingRequest, $user);
            
            return response()->json([
                'message' => 'Training request marked as completed',
                'training_request' => $completedRequest->load(['user', 'approver'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to mark training as completed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
