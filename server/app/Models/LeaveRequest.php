<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    protected $fillable = [
        'user_id', 'start_date', 'end_date', 'type', 
        'reason', 'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}