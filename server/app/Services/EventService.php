<?php

namespace App\Services;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EventService
{
    /**
     * Get events with optional filters.
     */
    public function getEvents(array $filters = []): Collection|LengthAwarePaginator
    {
        $query = Event::with('creator')
            ->orderBy('start_date', 'asc')
            ->orderBy('start_time', 'asc');

        // Apply filters
        if (isset($filters['event_type'])) {
            $query->where('event_type', $filters['event_type']);
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->inDateRange($filters['start_date'], $filters['end_date']);
        }

        if (isset($filters['month']) && isset($filters['year'])) {
            $startDate = "{$filters['year']}-{$filters['month']}-01";
            $endDate = date('Y-m-t', strtotime($startDate));
            $query->inDateRange($startDate, $endDate);
        }

        if (isset($filters['location'])) {
            $query->where('location', 'like', '%' . $filters['location'] . '%');
        }

        // Pagination
        if (isset($filters['per_page'])) {
            return $query->paginate($filters['per_page']);
        }

        return $query->get();
    }

    /**
     * Create a new event.
     */
    public function createEvent(array $data, User $user): Event
    {
        $data['created_by'] = $user->id;
        
        $event = Event::create($data);
        
        // Send notifications to all users
        NotificationService::sendNewEventNotificationToAll($event, $user->id);

        return $event;
    }

    /**
     * Update an existing event.
     */
    public function updateEvent(Event $event, array $data): Event
    {
        $changes = $event->getDirty();
        $event->update($data);
        
        // Send update notification to all users if there are changes
        if (!empty($changes)) {
            NotificationService::sendEventUpdateNotificationToAll($event, $changes);
        }
        
        return $event->fresh();
    }

    /**
     * Delete an event (soft delete by setting is_active to false).
     */
    public function deleteEvent(Event $event): bool
    {
        NotificationService::sendEventCancellationNotificationToAll($event);
        return $event->update(['is_active' => false]);
    }

    /**
     * Get events for a specific date range.
     */
    public function getEventsForDateRange(string $startDate, string $endDate): Collection
    {
        return Event::with('creator')
            ->inDateRange($startDate, $endDate)
            ->orderBy('start_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();
    }

    /**
     * Get events for a specific date.
     */
    public function getEventsForDate(string $date): Collection
    {
        return Event::with('creator')
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->orderBy('start_time', 'asc')
            ->get();
    }

    /**
     * Check if there are any events on a specific date.
     */
    public function hasEventsOnDate(string $date): bool
    {
        return Event::where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->exists();
    }
}
