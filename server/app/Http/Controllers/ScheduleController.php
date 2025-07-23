<?php
namespace App\Http\Controllers;

use App\Http\Requests\ScheduleRequest;
use App\Models\Schedule;
use App\Models\User;
use App\Services\ScheduleService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    protected $scheduleService;
    
    public function __construct(ScheduleService $scheduleService)
    {
        $this->scheduleService = $scheduleService;
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
        
        $user = $request->user();
        $month = $request->input('month', date('m'));
        $year = $request->input('year', date('Y'));
        
        // If user_id is provided, check if current user is admin
        if ($request->has('user_id')) {
            if (!$user->isAdmin()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            $targetUser = User::find($request->user_id);
        } else {
            $targetUser = $user;
        }
        
        $schedules = Schedule::where('user_id', $targetUser->id)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->orderBy('date')
            ->get();
            
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
        
        $schedule->update($request->validated());
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
     * Copy week schedule pattern (Admin only)
     */
    public function copyWeekPattern(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'target_weeks' => 'required|array|min:1',
            'target_weeks.*' => 'date'
        ]);
        
        $user = User::find($request->user_id);
        $result = $this->scheduleService->copyWeekPattern(
            $user,
            $request->start_date,
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
}
