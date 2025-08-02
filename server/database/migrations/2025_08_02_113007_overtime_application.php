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
        Schema::create('overtime_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('overtime_request_id')->constrained()->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'declined'])->default('pending');
            $table->text('employee_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamp('applied_at');
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->unique(['overtime_request_id', 'employee_id']);
            $table->index(['employee_id', 'status']);
            $table->index(['overtime_request_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('overtime_applications');
    }
};
