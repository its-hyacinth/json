<?php
namespace App\Http\Controllers;

use App\Http\Requests\ScheduleRequest;
use App\Models\Schedule;
use App\Models\User;
use App\Services\ScheduleService;
use Illuminate\Http\Request;
use App\Services\NotificationService;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    protected $scheduleService;
    
    public function __construct(ScheduleService $scheduleService)
    {
        $this->scheduleService = $scheduleService;
    }
    /**
     * Get schedules for multiple users in batch (optimized for admin view)
     */
    public function batchIndex(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2020',
            'user_ids' => 'sometimes|array',
            'user_ids.*' => 'exists:users,id'
        ]);
        
        $month = $request->input('month');
        $year = $request->input('year');
        
        $query = Schedule::with('user')
            ->whereYear('date', $year)
            ->whereMonth('date', $month);
            
        if ($request->has('user_ids')) {
            $query->whereIn('user_id', $request->user_ids);
        }
        
        // Optimized query with eager loading and proper indexing
        $schedules = $query->orderBy('user_id')
            ->orderBy('date')
            ->get()
            ->groupBy('user_id');
        
        return response()->json($schedules);
    }
    /**
     * Get schedules for current user or specific user (admin only)
     */
    public function index(Request $request)
    {
        $request->validate([
            'month' => 'sometimes|integer|between:1,12',
            'year' => 'sometimes|integer|min:2020',
            'user_id' => 'sometimes|exists:users,id'
        ]);
        
        $month = $request->input('month', date('m'));
        $year = $request->input('year', date('Y'));
        
        $query = Schedule::with('user')
            ->whereYear('date', $year)
            ->whereMonth('date', $month);
            
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        $schedules = $query->orderBy('date')->get();
        
        return response()->json($schedules);
    }
    
    /**
     * Admin-only: Get schedules for any user
     */
    public function adminIndex(Request $request)
    {
        $request->validate([
            'month' => 'sometimes|integer|between:1,12',
            'year' => 'sometimes|integer|min:2020',
            'user_id' => 'sometimes|exists:users,id'
        ]);
        
        $month = $request->input('month', date('m'));
        $year = $request->input('year', date('Y'));
        
        $query = Schedule::with('user')
            ->whereYear('date', $year)
            ->whereMonth('date', $month);
            
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        $schedules = $query->orderBy('date')->get();
        
        return response()->json($schedules);
    }
    
    /**
     * Generate schedules for a month (Admin only)
     */
    public function generateForMonth(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'month' => 'sometimes|integer|between:1,12',
            'year' => 'sometimes|integer|min:2020'
        ]);
        
        $user = User::find($request->user_id);
        $this->scheduleService->generateSchedulesForMonth(
            $user, 
            $request->month, 
            $request->year
        );
        
        return response()->json([
            'message' => 'Schedules generated successfully',
            'month' => $request->month ?? date('m'),
            'year' => $request->year ?? date('Y')
        ]);
    }
    
    /**
     * Update a specific schedule
     */
    public function update(ScheduleRequest $request, Schedule $schedule)
    {
        $user = $request->user();
        
        // Check if user owns the schedule or is admin
        if ($schedule->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Get the original data before update
        $originalData = $schedule->getOriginal();
        
        // Perform the update
        $schedule->update($request->validated());
        
        // Get the changed fields
        $changes = [];
        foreach ($request->validated() as $key => $value) {
            if ($originalData[$key] != $value) {
                $changes[$key] = $value;
            }
        }
        
        // Send notification if there are changes
        if (!empty($changes)) {
            $message = "Your schedule has been updated: ";
            $details = [];
            
            if (isset($changes['time_in'])) {
                $details[] = "start time to {$changes['time_in']}";
            }
            if (isset($changes['time_out'])) {
                $details[] = "end time to {$changes['time_out']}";
            }
            if (isset($changes['status'])) {
                $details[] = "status to {$changes['status']}";
            }
            if (isset($changes['date'])) {
                $details[] = "date to {$changes['date']}";
            }
            
            $message .= implode(', ', $details);
            
            // Send notification to the schedule owner
            NotificationService::sendScheduleNotification(
                $schedule->user_id,
                $message,
                $user->id
            );
        }
        
        return response()->json($schedule);
    }
    
    /**
     * Bulk update future schedules (Admin only)
     */
    public function bulkUpdateFuture(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'changes' => 'required|array',
            'changes.time_in' => 'sometimes|date_format:H:i',
            'changes.status' => 'sometimes|in:working,C,SD',
            'changes.recurring_pattern' => 'sometimes|in:daily,weekly,monthly',
            'changes.start_date' => 'sometimes|date|required_with:changes.end_date',
            'changes.end_date' => 'sometimes|date|after_or_equal:changes.start_date'
        ]);
        
        $user = User::find($request->user_id);
        $this->scheduleService->updateFutureSchedules($user, $request->changes);
        
        return response()->json([
            'message' => 'Future schedules updated successfully',
            'changes_applied' => $request->changes
        ]);
    }
    
    /**
     * Copy week schedule pattern (Admin only) - Fixed validation
     */
    public function copyWeekPattern(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'source_week_start' => 'required|date',
            'target_weeks' => 'required|array|min:1',
            'target_weeks.*' => 'date'
        ]);
        
        $user = User::find($request->user_id);
        $result = $this->scheduleService->copyWeekPattern(
            $user,
            $request->source_week_start,
            $request->target_weeks
        );
        
        return response()->json([
            'message' => 'Week pattern copied successfully',
            'copied_schedules' => $result['copied_count'],
            'target_weeks' => count($request->target_weeks)
        ]);
    }
    
    /**
     * Get current month schedules with auto-generation
     */
    public function currentMonth(Request $request)
    {
        $user = $request->user();
        
        // Auto-generate if not exists
        $this->scheduleService->generateSchedulesForMonth($user);
        
        return $this->index($request);
    }
    
    /**
     * Generate schedules with template (Admin only)
     */
    public function generateWithTemplate(Request $request)
    {
        $request->validate([
            'template_week_start' => 'required|date',
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2020',
            'employee_ids' => 'required|array|min:1',
            'employee_ids.*' => 'exists:users,id'
        ]);
        
        $result = $this->scheduleService->generateSchedulesWithTemplate(
            $request->template_week_start,
            $request->month,
            $request->year,
            $request->employee_ids
        );
        
        return response()->json([
            'message' => 'Schedules generated with template successfully',
            'generated_count' => $result['generated_count']
        ]);
    }
}
