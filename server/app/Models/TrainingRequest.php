<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'training_title',
        'training_description',
        'training_provider',
        'training_location',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'estimated_cost',
        'justification',
        'priority',
        'status',
        'admin_notes',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'estimated_cost' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    public const PRIORITIES = [
        'low' => 'Low Priority',
        'medium' => 'Medium Priority',
        'high' => 'High Priority',
    ];

    public const STATUSES = [
        'pending' => 'Pending Review',
        'approved' => 'Approved',
        'declined' => 'Declined',
        'completed' => 'Completed',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function getPriorityLabelAttribute(): string
    {
        return self::PRIORITIES[$this->priority] ?? 'Unknown';
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? 'Unknown';
    }

    public function getDurationInDaysAttribute(): int
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }
}
