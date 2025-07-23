<?php
namespace App\Services;

use App\Models\Schedule;
use App\Models\User;
use Carbon\Carbon;

class ScheduleService
{
    public function generateSchedulesForMonth(User $user, $month = null, $year = null)
    {
        $now = Carbon::now();
        $month = $month ?? $now->month;
        $year = $year ?? $now->year;
        
        $startDate = Carbon::create($year, $month, 1);
        $endDate = $startDate->copy()->endOfMonth();
        
        $defaultTimeIn = '08:00:00'; // Default schedule
        
        while ($startDate <= $endDate) {
            Schedule::firstOrCreate([
                'user_id' => $user->id,
                'date' => $startDate->toDateString()
            ], [
                'time_in' => $defaultTimeIn,
                'status' => 'working'
            ]);
            
            $startDate->addDay();
        }
    }
    
    public function updateFutureSchedules(User $user, array $changes)
    {
        // Get the current date and time
        $today = Carbon::now();
        
        // Find all future schedules for this user
        $futureSchedules = Schedule::where('user_id', $user->id)
            ->whereDate('date', '>=', $today->toDateString())
            ->orderBy('date')
            ->get();

        // Apply changes to each future schedule
        foreach ($futureSchedules as $schedule) {
            $scheduleDate = Carbon::parse($schedule->date);
            
            // Check if this is a recurring pattern (e.g., every Monday)
            if (isset($changes['recurring_pattern'])) {
                switch ($changes['recurring_pattern']) {
                    case 'weekly':
                        if ($scheduleDate->dayOfWeek === $today->dayOfWeek) {
                            $this->applyChangesToSchedule($schedule, $changes);
                        }
                        break;
                        
                    case 'monthly':
                        if ($scheduleDate->day === $today->day) {
                            $this->applyChangesToSchedule($schedule, $changes);
                        }
                        break;
                        
                    case 'daily':
                        $this->applyChangesToSchedule($schedule, $changes);
                        break;
                }
            } 
            // For specific date ranges
            elseif (isset($changes['start_date']) && isset($changes['end_date'])) {
                if ($scheduleDate->between(
                    Carbon::parse($changes['start_date']), 
                    Carbon::parse($changes['end_date'])
                )) {
                    $this->applyChangesToSchedule($schedule, $changes);
                }
            }
            // For all future schedules without conditions
            else {
                $this->applyChangesToSchedule($schedule, $changes);
            }
        }
        
        return true;
    }

    /**
     * Copy a week pattern to multiple target weeks
     */
    public function copyWeekPattern(User $user, string $sourceStartDate, array $targetWeekStarts)
    {
        $sourceStart = Carbon::parse($sourceStartDate)->startOfWeek();
        $sourceEnd = $sourceStart->copy()->endOfWeek();
        
        // Get source week schedules (only working days, no leave)
        $sourceSchedules = Schedule::where('user_id', $user->id)
            ->whereBetween('date', [$sourceStart->toDateString(), $sourceEnd->toDateString()])
            ->where('status', 'working')
            ->whereNotNull('time_in')
            ->get()
            ->keyBy(function ($schedule) {
                return Carbon::parse($schedule->date)->dayOfWeek;
            });

        if ($sourceSchedules->isEmpty()) {
            throw new \Exception('No working schedules found in source week');
        }

        $copiedCount = 0;

        foreach ($targetWeekStarts as $targetWeekStart) {
            $targetStart = Carbon::parse($targetWeekStart)->startOfWeek();
            
            // Copy each day of the week
            for ($dayOfWeek = 0; $dayOfWeek < 7; $dayOfWeek++) {
                $targetDate = $targetStart->copy()->addDays($dayOfWeek);
                
                // Skip if source doesn't have this day or if it's a leave day
                if (!$sourceSchedules->has($dayOfWeek)) {
                    continue;
                }
                
                $sourceSchedule = $sourceSchedules->get($dayOfWeek);
                
                // Update or create target schedule
                Schedule::updateOrCreate([
                    'user_id' => $user->id,
                    'date' => $targetDate->toDateString()
                ], [
                    'time_in' => $sourceSchedule->time_in,
                    'status' => 'working'
                ]);
                
                $copiedCount++;
            }
        }

        return [
            'copied_count' => $copiedCount,
            'source_schedules' => $sourceSchedules->count()
        ];
    }

    /**
     * Helper method to apply changes to a single schedule
     */
    protected function applyChangesToSchedule(Schedule &$schedule, array $changes)
    {
        if (isset($changes['time_in'])) {
            $schedule->time_in = $changes['time_in'];
        }
        
        if (isset($changes['status'])) {
            $schedule->status = $changes['status'];
        }
        
        $schedule->save();
    }
}
