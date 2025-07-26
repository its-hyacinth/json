<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScheduleRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'time_in' => 'nullable|date_format:H:i',
            'status' => 'required|in:working,C,SD,S,M'
        ];
    }

    public function messages()
    {
        return [
            'time_in.date_format' => 'Time in must be in HH:MM format',
            'status.in' => 'Status must be working, C (Leave), SD (Sick Leave), S (School/Training), or M (Military Attachment)'
        ];
    }
}
