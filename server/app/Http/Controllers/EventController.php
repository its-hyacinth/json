<?php

namespace App\Http\Controllers;

use App\Http\Requests\EventRequest;
use App\Models\Event;
use App\Services\EventService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    protected EventService $eventService;

    public function __construct(EventService $eventService)
    {
        $this->eventService = $eventService;
    }

    /**
     * Display a listing of events.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $events = $this->eventService->getEvents($request->all());
            return response()->json($events);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch events',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created event.
     */
    public function store(EventRequest $request): JsonResponse
    {
        try {
            $event = $this->eventService->createEvent($request->validated(), $request->user());
            return response()->json([
                'message' => 'Event created successfully',
                'event' => $event->load('creator')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified event.
     */
    public function show(Event $event): JsonResponse
    {
        try {
            return response()->json($event->load('creator'));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Event not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified event.
     */
    public function update(EventRequest $request, Event $event): JsonResponse
    {
        try {
            $updatedEvent = $this->eventService->updateEvent($event, $request->validated());
            return response()->json([
                'message' => 'Event updated successfully',
                'event' => $updatedEvent->load('creator')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified event.
     */
    public function destroy(Event $event): JsonResponse
    {
        try {
            $this->eventService->deleteEvent($event);
            return response()->json([
                'message' => 'Event deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get events for a specific date range.
     */
    public function getEventsForDateRange(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        try {
            $events = $this->eventService->getEventsForDateRange(
                $request->start_date,
                $request->end_date
            );
            return response()->json($events);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch events for date range',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get event types.
     */
    public function getEventTypes(): JsonResponse
    {
        return response()->json(Event::EVENT_TYPES);
    }
}
