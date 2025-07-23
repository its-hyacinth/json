<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\EmployeeController;
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
        
        // Employee management routes
        Route::get('/employees', [EmployeeController::class, 'index']);
        Route::post('/employees', [EmployeeController::class, 'store']);
        Route::get('/employees/statistics', [EmployeeController::class, 'statistics']);
        Route::get('/employees/search', [EmployeeController::class, 'search']);
        Route::get('/employees/{user}', [EmployeeController::class, 'show']);
        Route::put('/employees/{user}', [EmployeeController::class, 'update']);
        Route::delete('/employees/{user}', [ScheduleController::class, 'destroy']);
    });
});
