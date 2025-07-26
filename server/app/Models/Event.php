<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'event_type',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'location',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'is_active' => 'boolean',
    ];

    public const EVENT_TYPES = [
        '1' => 'Ferguson/Arts Event',
        '2' => 'Freeman Center Event',
        '3' => 'Dance/Concert',
        '4' => 'CNU Athletics Event',
        '5' => 'Commencement',
        '6' => 'Meeting',
        '7' => 'Special Event',
        '8' => 'Yoder Barn',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getEventTypeNameAttribute(): string
    {
        return self::EVENT_TYPES[$this->event_type] ?? 'Unknown';
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_date', [$startDate, $endDate])
              ->orWhereBetween('end_date', [$startDate, $endDate])
              ->orWhere(function ($q2) use ($startDate, $endDate) {
                  $q2->where('start_date', '<=', $startDate)
                     ->where('end_date', '>=', $endDate);
              });
        });
    }
}
