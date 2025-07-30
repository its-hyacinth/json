<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\TrainingRequestController;
use App\Http\Controllers\OvertimeRequestController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CourtRequestController;
use App\Http\Middleware\AdminMiddleware;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Schedule routes
    Route::get('/schedules', [ScheduleController::class, 'index']);
    Route::get('/schedules/current-month', [ScheduleController::class, 'currentMonth']);
    Route::put('/schedules/{schedule}', [ScheduleController::class, 'update']);

    // Leave request routes
    Route::get('/leave-requests', [LeaveController::class, 'index']);
    Route::post('/leave-requests', [LeaveController::class, 'store']);
    Route::get('/leave-requests/{leaveRequest}', [LeaveController::class, 'show']);
    Route::put('/leave-requests/{leaveRequest}', [LeaveController::class, 'update']);
    Route::delete('/leave-requests/{leaveRequest}', [LeaveController::class, 'destroy']);

    // Employee routes
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::get('/employees/{employee}', [EmployeeController::class, 'show']);

    // Event routes
    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::get('/events/{event}', [EventController::class, 'show']);
    Route::put('/events/{event}', [EventController::class, 'update']);
    Route::delete('/events/{event}', [EventController::class, 'destroy']);

    // Training request routes
    Route::get('/training-requests', [TrainingRequestController::class, 'index']);
    Route::post('/training-requests', [TrainingRequestController::class, 'store']);
    Route::get('/training-requests/{trainingRequest}', [TrainingRequestController::class, 'show']);
    Route::put('/training-requests/{trainingRequest}', [TrainingRequestController::class, 'update']);
    Route::delete('/training-requests/{trainingRequest}', [TrainingRequestController::class, 'destroy']);

    // Overtime request routes (employee)
    Route::get('/overtime-requests', [OvertimeRequestController::class, 'index']);
    Route::get('/overtime-requests/{overtimeRequest}', [OvertimeRequestController::class, 'show']);
    Route::post('/overtime-requests/{overtimeRequest}/accept', [OvertimeRequestController::class, 'accept']);
    Route::post('/overtime-requests/{overtimeRequest}/decline', [OvertimeRequestController::class, 'decline']);

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);

    Route::apiResource('court-requests', CourtRequestController::class);
    Route::patch('/court-requests/{id}/response', [CourtRequestController::class, 'updateResponse']);
    Route::get('/court-requests/statistics', [CourtRequestController::class, 'statistics']);
    Route::get('/court-requests/upcoming', [CourtRequestController::class, 'upcoming']);
    Route::patch('/court-requests/{courtRequest}/accept', [CourtRequestController::class, 'accept']);
    Route::patch('/court-requests/{courtRequest}/decline', [CourtRequestController::class, 'decline']);

    // Admin routes
    Route::middleware(AdminMiddleware::class)->group(function () {
        // Admin schedule routes
        Route::post('/schedules/generate', [ScheduleController::class, 'generateForMonth']);
        Route::post('/schedules/bulk-update-future', [ScheduleController::class, 'bulkUpdateFuture']);
        Route::post('/schedules/copy-week-pattern', [ScheduleController::class, 'copyWeekPattern']);
        Route::post('/schedules/generate-with-template', [ScheduleController::class, 'generateWithTemplate']);
        Route::get('/admin/schedules', [ScheduleController::class, 'adminIndex']);

        // Admin leave request routes
        Route::get('/admin/leave-requests', [LeaveController::class, 'adminIndex']);
        Route::post('/leave-requests/{leaveRequest}/approve', [LeaveController::class, 'approve']);
        Route::post('/leave-requests/{leaveRequest}/decline', [LeaveController::class, 'decline']);

        // Admin employee routes
        Route::post('/admin/employees', [EmployeeController::class, 'store']);
        Route::put('/admin/employees/{employee}', [EmployeeController::class, 'update']);
        Route::delete('/admin/employees/{employee}', [EmployeeController::class, 'destroy']);

        // Admin training request routes
        Route::get('/admin/training-requests', [TrainingRequestController::class, 'adminIndex']);
        Route::post('/training-requests/{trainingRequest}/approve', [TrainingRequestController::class, 'approve']);
        Route::post('/training-requests/{trainingRequest}/decline', [TrainingRequestController::class, 'decline']);
        Route::post('/training-requests/{trainingRequest}/complete', [TrainingRequestController::class, 'markCompleted']);

        // Admin overtime request routes
        Route::get('/admin/overtime-requests', [OvertimeRequestController::class, 'adminIndex']);
        Route::post('/overtime-requests', [OvertimeRequestController::class, 'store']);
        Route::put('/overtime-requests/{overtimeRequest}', [OvertimeRequestController::class, 'update']);
        Route::delete('/overtime-requests/{overtimeRequest}', [OvertimeRequestController::class, 'destroy']);
        Route::post('/overtime-requests/auto-create-leave', [OvertimeRequestController::class, 'autoCreateForLeave']);

        // Account management routes
        Route::get('/admin/accounts', [AccountController::class, 'index']);
        Route::post('/admin/accounts', [AccountController::class, 'store']);
        Route::get('/admin/accounts/{user}', [AccountController::class, 'show']);
        Route::put('/admin/accounts/{user}', [AccountController::class, 'update']);
        Route::delete('/admin/accounts/{user}', [AccountController::class, 'destroy']);
        Route::put('/admin/accounts/{user}/reset-password', [AccountController::class, 'resetPassword']);

        // Admin notification routes
        Route::post('/admin/notifications/send', [NotificationController::class, 'sendNotification']);

        Route::apiResource('accounts', AccountController::class);
        Route::post('/accounts/{id}/reset-password', [AccountController::class, 'resetPassword']);
    });
});
