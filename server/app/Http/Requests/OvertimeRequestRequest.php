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
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = [
            'overtime_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'overtime_type' => 'required|in:leave_coverage,event_coverage,emergency,special_duty',
            'employees_required' => 'required|integer|min:1|max:50',
        ];

        // Add conditional validation based on overtime type
        if ($this->overtime_type === 'leave_coverage') {
            $rules['covering_for'] = 'required|exists:users,id';
        } elseif ($this->overtime_type === 'event_coverage') {
            $rules['event_location'] = 'required|string|max:255';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'overtime_date.required' => 'Overtime date is required.',
            'overtime_date.after_or_equal' => 'Overtime date must be today or in the future.',
            'start_time.required' => 'Start time is required.',
            'end_time.required' => 'End time is required.',
            'end_time.after' => 'End time must be after start time.',
            'overtime_type.required' => 'Overtime type is required.',
            'employees_required.required' => 'Number of employees required is required.',
            'employees_required.min' => 'At least 1 employee is required.',
            'employees_required.max' => 'Maximum 50 employees can be required.',
            'covering_for.required' => 'Please select the employee to be covered.',
            'covering_for.exists' => 'Selected employee does not exist.',
            'event_location.required' => 'Event location is required.',
        ];
    }
}
