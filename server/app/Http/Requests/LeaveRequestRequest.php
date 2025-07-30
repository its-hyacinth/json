<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LeaveRequestRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' => 'required|in:C,SD',
            'reason' => 'nullable|string|max:500'
        ];
    }

    public function messages()
    {
        return [
            'start_date.after_or_equal' => 'Start date must be today or later',
            'end_date.after_or_equal' => 'End date must be after or equal to start date',
            'type.in' => 'Leave type must be either C (Ordinary Leave) or SD (Sick Leave)'
        ];
    }
}