<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = ['user_id', 'date', 'time_in', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}