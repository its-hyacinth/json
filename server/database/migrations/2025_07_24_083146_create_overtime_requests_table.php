<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('overtime_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade'); // Admin who requested
            $table->foreignId('covering_for')->nullable()->constrained('users')->onDelete('set null'); // Employee being covered
            $table->date('overtime_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('overtime_type', ['leave_coverage', 'event_coverage']);
            $table->enum('status', ['pending', 'accepted', 'declined'])->default('pending');
            $table->text('employee_notes')->nullable();
            $table->decimal('overtime_hours', 5, 2)->nullable();
            $table->decimal('overtime_rate', 8, 2)->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->integer('employees_required')->default(1);
            $table->integer('employees_applied')->default(0);
            $table->integer('employees_approved')->default(0);
            $table->boolean('is_closed')->default(false);
            $table->timestamp('closed_at')->nullable();
            $table->string('event_location')->nullable();
            $table->timestamps();

            $table->index(['overtime_date', 'is_closed']);
            $table->index(['status', 'is_closed']);
            $table->index('requested_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('overtime_requests');
    }
};
