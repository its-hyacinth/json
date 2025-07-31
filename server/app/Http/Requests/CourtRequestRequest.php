<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CourtRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'employee_id' => 'nullable|exists:users,id',
            'court_date' => 'nullable|date|after_or_equal:today',
            'court_time' => 'nullable|date_format:H:i',
            'court_type' => 'nullable|in:criminal,civil,traffic,family,juvenile,administrative',
            'description' => 'nullable|string|max:1000',
            'status' => 'nullable|in:accepted,declined',
            'employee_notes' => 'nullable|string|max:500',
            'attachment_name' => 'nullable|string|max:255',
            'attachment_path' => 'nullable|string|max:255',
        ];

        return $rules;
    }

    public function messages(): array
    {
        return [
            'employee_id.required' => 'Please select an employee.',
            'employee_id.exists' => 'Selected employee does not exist.',
            'court_date.required' => 'Court date is required.',
            'court_date.after_or_equal' => 'Court date cannot be in the past.',
            'court_time.date_format' => 'Court time must be in HH:MM format.',
            'court_type.required' => 'Court type is required.',
            'court_type.in' => 'Invalid court type selected.',
            'description.max' => 'Description cannot exceed 1000 characters.',
            'status.in' => 'Status must be either accepted or declined.',
            'employee_notes.max' => 'Employee notes cannot exceed 500 characters.',
            'attachment_name.max' => 'Attachment name cannot exceed 255 characters.',
            'attachment_path.max' => 'Attachment path cannot exceed 255 characters.',
        ];
    }
}
