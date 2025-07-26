<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\TrainingRequestController;
use App\Http\Controllers\OvertimeRequestController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Schedule routes (available to all authenticated users)
    Route::get('/schedules', [ScheduleController::class, 'index']);
    Route::get('/schedules/current-month', [ScheduleController::class, 'currentMonth']);
    Route::put('/schedules/{schedule}', [ScheduleController::class, 'update']);
    
    // Leave request routes (available to all authenticated users)
    Route::get('/leave-requests', [LeaveController::class, 'index']);
    Route::post('/leave-requests', [LeaveController::class, 'store']);
    
    // Training request routes (available to all authenticated users)
    Route::get('/training-requests', [TrainingRequestController::class, 'index']);
    Route::post('/training-requests', [TrainingRequestController::class, 'store']);
    Route::get('/training-requests/{trainingRequest}', [TrainingRequestController::class, 'show']);
    Route::put('/training-requests/{trainingRequest}', [TrainingRequestController::class, 'update']);
    Route::delete('/training-requests/{trainingRequest}', [TrainingRequestController::class, 'destroy']);
    
    // Overtime request routes (available to all authenticated users)
    Route::get('/overtime-requests', [OvertimeRequestController::class, 'index']);
    Route::get('/overtime-requests/{overtimeRequest}', [OvertimeRequestController::class, 'show']);
    Route::post('/overtime-requests/{overtimeRequest}/accept', [OvertimeRequestController::class, 'accept']);
    Route::post('/overtime-requests/{overtimeRequest}/decline', [OvertimeRequestController::class, 'decline']);
    
    // Event routes (read-only for all authenticated users)
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/events/types', [EventController::class, 'getEventTypes']);
    Route::get('/events/date-range', [EventController::class, 'getEventsForDateRange']);
    Route::get('/events/{event}', [EventController::class, 'show']);
    
    // Admin-only routes
    Route::middleware(AdminMiddleware::class)->group(function () {
        // Admin schedule management
        Route::post('/schedules/generate', [ScheduleController::class, 'generateForMonth']);
        Route::post('/schedules/bulk-update-future', [ScheduleController::class, 'bulkUpdateFuture']);
        Route::post('/schedules/copy-week-pattern', [ScheduleController::class, 'copyWeekPattern']);
        Route::post('/schedules/generate-with-template', [ScheduleController::class, 'generateWithTemplate']);
        Route::get('/admin/schedules', [ScheduleController::class, 'adminIndex']);
        
        // Admin leave request management
        Route::get('/admin/leave-requests', [LeaveController::class, 'adminIndex']);
        Route::post('/leave-requests/{leaveRequest}/approve', [LeaveController::class, 'approve']);
        Route::post('/leave-requests/{leaveRequest}/decline', [LeaveController::class, 'decline']);
        
        // Admin training request management
        Route::get('/admin/training-requests', [TrainingRequestController::class, 'adminIndex']);
        Route::post('/training-requests/{trainingRequest}/approve', [TrainingRequestController::class, 'approve']);
        Route::post('/training-requests/{trainingRequest}/decline', [TrainingRequestController::class, 'decline']);
        Route::post('/training-requests/{trainingRequest}/complete', [TrainingRequestController::class, 'markCompleted']);
        
        // Admin overtime request management
        Route::get('/admin/overtime-requests', [OvertimeRequestController::class, 'adminIndex']);
        Route::post('/overtime-requests', [OvertimeRequestController::class, 'store']);
        Route::put('/overtime-requests/{overtimeRequest}', [OvertimeRequestController::class, 'update']);
        Route::delete('/overtime-requests/{overtimeRequest}', [OvertimeRequestController::class, 'destroy']);
        Route::post('/overtime-requests/auto-create-leave', [OvertimeRequestController::class, 'autoCreateForLeave']);
        
        // Employee management routes
        Route::get('/employees', [EmployeeController::class, 'index']);
        Route::post('/employees', [EmployeeController::class, 'store']);
        Route::get('/employees/statistics', [EmployeeController::class, 'statistics']);
        Route::get('/employees/search', [EmployeeController::class, 'search']);
        Route::get('/employees/{user}', [EmployeeController::class, 'show']);
        Route::put('/employees/{user}', [EmployeeController::class, 'update']);
        Route::delete('/employees/{user}', [EmployeeController::class, 'destroy']);
        
        // Admin event management
        Route::post('/events', [EventController::class, 'store']);
        Route::put('/events/{event}', [EventController::class, 'update']);
        Route::delete('/events/{event}', [EventController::class, 'destroy']);
    });
});
