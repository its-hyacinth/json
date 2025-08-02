<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OvertimeApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'overtime_request_id',
        'employee_id',
        'status',
        'employee_notes',
        'admin_notes',
        'applied_at',
        'responded_at',
    ];

    protected $casts = [
        'applied_at' => 'datetime',
        'responded_at' => 'datetime',
    ];

    public const STATUSES = [
        'pending' => 'Pending Review',
        'approved' => 'Approved',
        'declined' => 'Declined',
    ];

    public function overtimeRequest(): BelongsTo
    {
        return $this->belongsTo(OvertimeRequest::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? 'Unknown';
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeForEmployee($query, $userId)
    {
        return $query->where('employee_id', $userId);
    }
}
