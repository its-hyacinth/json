<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OvertimeRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->is_admin;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'assigned_to' => 'required|exists:users,id',
            'covering_for' => 'nullable|exists:users,id',
            'overtime_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'reason' => 'required|string|max:1000',
            'overtime_type' => 'required|in:leave_coverage,event_coverage,emergency,special_duty',
            'overtime_hours' => 'nullable|numeric|min:0|max:24',
            'overtime_rate' => 'nullable|numeric|min:0|max:999.99',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'assigned_to.required' => 'Employee assignment is required.',
            'assigned_to.exists' => 'Selected employee does not exist.',
            'overtime_date.required' => 'Overtime date is required.',
            'start_time.required' => 'Start time is required.',
            'end_time.required' => 'End time is required.',
            'end_time.after' => 'End time must be after start time.',
            'reason.required' => 'Reason for overtime is required.',
            'overtime_type.required' => 'Overtime type is required.',
        ];
    }
}
