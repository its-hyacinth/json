<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class CourtRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'created_by',
        'court_date',
        'court_time',
        'court_type',
        'description',
        'status',
        'employee_notes',
        'attachment_name',
        'attachment_path',
        'attachment_mime_type',
        'attachment_size',
        'responded_at',
    ];

    protected $casts = [
        'court_date' => 'date',
        'court_time' => 'datetime:H:i',
        'responded_at' => 'datetime',
        'attachment_size' => 'integer',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getAttachmentUrlAttribute(): ?string
    {
        if (!$this->attachment_path) {
            return null;
        }

        return Storage::url($this->attachment_path);
    }

    public function getAttachmentSizeFormattedAttribute(): ?string
    {
        if (!$this->attachment_size) {
            return null;
        }

        $bytes = $this->attachment_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function scopeDeclined($query)
    {
        return $query->where('status', 'declined');
    }

    public function scopeForEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeForDate($query, $date)
    {
        return $query->whereDate('court_date', $date);
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($courtRequest) {
            // Delete attachment file when court request is deleted
            if ($courtRequest->attachment_path && Storage::exists($courtRequest->attachment_path)) {
                Storage::delete($courtRequest->attachment_path);
            }
        });
    }
}
