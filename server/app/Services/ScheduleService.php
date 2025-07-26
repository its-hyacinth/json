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
     * Generate schedules for multiple employees using a template week
     */
    public function generateSchedulesWithTemplate(string $templateWeekStart, int $month, int $year, array $employeeIds)
    {
        $templateStart = Carbon::parse($templateWeekStart)->startOfWeek(Carbon::MONDAY);
        $templateEnd = $templateStart->copy()->endOfWeek(Carbon::SUNDAY);
        
        $generatedCount = 0;
        $defaultTimeIn = '08:00:00';
        
        // Get all weeks in the target month
        $monthStart = Carbon::create($year, $month, 1);
        $monthEnd = $monthStart->copy()->endOfMonth();
        
        $weeks = [];
        $current = $monthStart->copy()->startOfWeek(Carbon::MONDAY);
        
        while ($current <= $monthEnd) {
            // Only include weeks that have days in the target month
            $weekEnd = $current->copy()->endOfWeek(Carbon::SUNDAY);
            if ($current <= $monthEnd && $weekEnd >= $monthStart) {
                $weeks[] = $current->copy();
            }
            $current->addWeek();
        }
        
        foreach ($employeeIds as $employeeId) {
            // Get template week schedules for this employee
            $templateSchedules = Schedule::where('user_id', $employeeId)
                ->whereBetween('date', [$templateStart->toDateString(), $templateEnd->toDateString()])
                ->get()
                ->keyBy(function ($schedule) {
                    return Carbon::parse($schedule->date)->format('N'); // Use ISO-8601 day of week (1-7, Monday to Sunday)
                });
            
            // Apply template to each week in the month
            foreach ($weeks as $weekStart) {
                for ($isoDay = 1; $isoDay <= 7; $isoDay++) {
                    $targetDate = $weekStart->copy()->addDays($isoDay - 1); // Adjust for ISO day numbering
                    
                    // Skip if date is outside the target month
                    if ($targetDate->month !== $month || $targetDate->year !== $year) {
                        continue;
                    }
                    
                    $templateSchedule = $templateSchedules->get($isoDay);
                    
                    // Determine time and status based on template
                    if ($templateSchedule) {
                        // If template has non-working status (C, SD, S, M), use default working time instead
                        if (in_array($templateSchedule->status, ['C', 'SD', 'S', 'M'])) {
                            $timeIn = $defaultTimeIn;
                            $status = 'working';
                        } else {
                            $timeIn = $templateSchedule->time_in ?: $defaultTimeIn;
                            $status = 'working';
                        }
                    } else {
                        // No template for this day, use default
                        $timeIn = $defaultTimeIn;
                        $status = 'working';
                    }
                    
                    Schedule::updateOrCreate([
                        'user_id' => $employeeId,
                        'date' => $targetDate->toDateString()
                    ], [
                        'time_in' => $timeIn,
                        'status' => $status
                    ]);
                    
                    $generatedCount++;
                }
            }
        }
        
        return [
            'generated_count' => $generatedCount
        ];
    }

    /**
     * Copy a week pattern to multiple target weeks (Fixed parameter name)
     */
    public function copyWeekPattern(User $user, string $sourceWeekStart, array $targetWeekStarts)
    {
        $sourceStart = Carbon::parse($sourceWeekStart)->startOfWeek(Carbon::MONDAY);
        $sourceEnd = $sourceStart->copy()->endOfWeek(Carbon::SUNDAY);
        $defaultTimeIn = '08:00:00';
        
        // Get source week schedules (including all status types) using ISO day format
        $sourceSchedules = Schedule::where('user_id', $user->id)
            ->whereBetween('date', [$sourceStart->toDateString(), $sourceEnd->toDateString()])
            ->get()
            ->keyBy(function ($schedule) {
                return Carbon::parse($schedule->date)->format('N'); // ISO-8601 day (1=Monday, 7=Sunday)
            });

        if ($sourceSchedules->isEmpty()) {
            throw new \Exception('No schedules found in source week');
        }

        $copiedCount = 0;

        foreach ($targetWeekStarts as $targetWeekStart) {
            $targetStart = Carbon::parse($targetWeekStart)->startOfWeek(Carbon::MONDAY);
            
            // Copy each day of the week (1-7, Monday to Sunday)
            for ($isoDay = 1; $isoDay <= 7; $isoDay++) {
                $targetDate = $targetStart->copy()->addDays($isoDay - 1);
                $sourceSchedule = $sourceSchedules->get($isoDay);
                
                if ($sourceSchedule) {
                    // If source has non-working status (C, SD, S, M), use default working time instead
                    if (in_array($sourceSchedule->status, ['C', 'SD', 'S', 'M'])) {
                        $timeIn = $defaultTimeIn;
                        $status = 'working';
                    } else {
                        $timeIn = $sourceSchedule->time_in ?: $defaultTimeIn;
                        $status = 'working';
                    }
                } else {
                    // No source schedule for this day, use default
                    $timeIn = $defaultTimeIn;
                    $status = 'working';
                }
                
                // Update or create target schedule
                Schedule::updateOrCreate([
                    'user_id' => $user->id,
                    'date' => $targetDate->toDateString()
                ], [
                    'time_in' => $timeIn,
                    'status' => $status
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
