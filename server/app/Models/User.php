<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use Notifiable;
    use HasApiTokens;

    protected $fillable = [
        'first_name', 'last_name', 'badge_number', 'division',
        'email', 'phone', 'address', 'password', 'role'
    ];

    protected $hidden = ['password', 'remember_token'];

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }
}
