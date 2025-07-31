<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TrainingRequestRequest extends FormRequest
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
        return [
            'training_title' => 'required|string|max:255',
            'training_description' => 'nullable|string|max:1000',
            'training_provider' => 'nullable|string|max:255',
            'training_location' => 'nullable|string|max:255',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'justification' => 'required|string|max:1000',
            'attachment_name' => 'nullable|string|max:255',
            'attachment_path' => 'nullable|string|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'training_title.required' => 'Training title is required.',
            'start_date.required' => 'Start date is required.',
            'start_date.after_or_equal' => 'Start date must be today or later.',
            'end_date.required' => 'End date is required.',
            'end_date.after_or_equal' => 'End date must be on or after the start date.',
            'end_time.after' => 'End time must be after start time.',
            'justification.required' => 'Justification for training is required.',
            'attachment_name.max' => 'Attachment name cannot exceed 255 characters.',
            'attachment_path.max' => 'Attachment path cannot exceed 255 characters.',
        ];
    }
}
