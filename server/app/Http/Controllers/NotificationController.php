<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\User;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($notifications);
    }

    public function markAsRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notification->markAsRead();

        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()
            ->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function getUnreadCount(Request $request)
    {
        $count = $request->user()
            ->notifications()
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $count]);
    }

    // Admin method to send notifications
    public function sendNotification(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'type' => 'required|string',
            'title' => 'required|string',
            'message' => 'required|string',
        ]);

        $notifications = [];
        foreach ($request->user_ids as $userId) {
            $notifications[] = [
                'user_id' => $userId,
                'type' => $request->type,
                'data' => json_encode([
                    'title' => $request->title,
                    'message' => $request->message,
                    'created_by' => $request->user()->name
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        Notification::insert($notifications);

        return response()->json(['message' => 'Notifications sent successfully']);
    }
}
