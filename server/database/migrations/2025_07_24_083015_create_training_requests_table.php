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
        Schema::create('training_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('training_title');
            $table->text('training_description')->nullable();
            $table->string('training_provider')->nullable();
            $table->string('training_location')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->text('justification');
            $table->enum('status', ['pending', 'approved', 'declined', 'completed'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->string('attachment_name')->nullable()->after('justification');
            $table->string('attachment_path')->nullable()->after('attachment_name');
            $table->string('attachment_mime_type')->nullable()->after('attachment_path');
            $table->unsignedBigInteger('attachment_size')->nullable()->after('attachment_mime_type');
            $table->timestamps();

            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['user_id', 'status']);
            $table->index('start_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_requests');
    }
};
