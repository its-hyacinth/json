<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

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
        'justification',
        'attachment_name',
        'attachment_path',
        'attachment_mime_type',
        'attachment_size',
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
        'approved_at' => 'datetime',
        'attachment_size' => 'integer',
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

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? 'Unknown';
    }

    public function getDurationInDaysAttribute(): int
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
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

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($trainingRequest) {
            if ($trainingRequest->attachment_path && Storage::exists($trainingRequest->attachment_path)) {
                Storage::delete($trainingRequest->attachment_path);
            }
        });
    }
}
