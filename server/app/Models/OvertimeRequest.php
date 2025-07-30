<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OvertimeRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'requested_by',
        'assigned_to',
        'covering_for',
        'overtime_date',
        'start_time',
        'end_time',
        'reason',
        'overtime_type',
        'status',
        'employee_notes',
        'overtime_hours',
        'overtime_rate',
        'responded_at',
    ];

    protected $casts = [
        'overtime_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'overtime_hours' => 'decimal:2',
        'overtime_rate' => 'decimal:2',
        'responded_at' => 'datetime',
    ];

    public const OVERTIME_TYPES = [
        'leave_coverage' => 'Leave Coverage',
        'event_coverage' => 'Event Coverage',
        'emergency' => 'Emergency Duty',
        'special_duty' => 'Special Duty',
    ];

    public const STATUSES = [
        'pending' => 'Pending Response',
        'accepted' => 'Accepted',
        'declined' => 'Declined',
    ];

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function assignedEmployee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function coveringForEmployee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'covering_for');
    }

    public function getOvertimeTypeLabelAttribute(): string
    {
        return self::OVERTIME_TYPES[$this->overtime_type] ?? 'Unknown';
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? 'Unknown';
    }

    public function getCalculatedHoursAttribute(): float
    {
        if ($this->start_time && $this->end_time) {
            $start = \Carbon\Carbon::parse($this->start_time);
            $end = \Carbon\Carbon::parse($this->end_time);
            return $end->diffInHours($start, true);
        }
        return 0;
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function scopeForEmployee($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('overtime_date', $date);
    }
}
