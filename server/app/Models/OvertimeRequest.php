<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OvertimeRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'requested_by',
        'overtime_date',
        'start_time',
        'end_time',
        'overtime_type',
        'covering_for',
        'event_location',
        'employees_required',
        'employees_applied',
        'employees_approved',
        'is_closed',
        'closed_at',
    ];

    protected $casts = [
        'overtime_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'is_closed' => 'boolean',
        'closed_at' => 'datetime',
    ];

    public const OVERTIME_TYPES = [
        'leave_coverage' => 'Leave Coverage (Patrol)',
        'event_coverage' => 'Event Coverage',
    ];

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function coveringForEmployee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'covering_for');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(OvertimeApplication::class);
    }

    public function pendingApplications(): HasMany
    {
        return $this->hasMany(OvertimeApplication::class)->where('status', 'pending');
    }

    public function approvedApplications(): HasMany
    {
        return $this->hasMany(OvertimeApplication::class)->where('status', 'approved');
    }

    public function getOvertimeTypeLabelAttribute(): string
    {
        return self::OVERTIME_TYPES[$this->overtime_type] ?? 'Unknown';
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

    public function getIsFullAttribute(): bool
    {
        return $this->employees_approved >= $this->employees_required;
    }

    public function getDescriptionAttribute(): string
    {
        if ($this->overtime_type === 'leave_coverage') {
            $coveringFor = $this->coveringForEmployee;
            return $coveringFor 
                ? "Coverage for {$coveringFor->first_name} {$coveringFor->last_name}"
                : 'Leave Coverage';
        } else {
            return $this->event_location ? "Event at {$this->event_location}" : 'Event Coverage';
        }
    }

    public function scopeOpen($query)
    {
        return $query->where('is_closed', false);
    }

    public function scopeClosed($query)
    {
        return $query->where('is_closed', true);
    }

    public function scopeLeaveType($query)
    {
        return $query->where('overtime_type', 'leave_coverage');
    }

    public function scopeEventType($query)
    {
        return $query->where('overtime_type', 'event_coverage');
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('overtime_date', $date);
    }
}
