<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sizing' => ['required', Rule::in(['mens', 'ladies'])],
            'height_cm' => ['required', 'numeric', 'between:100,250'],
            'weight_kg' => ['nullable', 'numeric', 'between:30,300'],
            'chest_cm' => ['required', 'numeric', 'between:60,160'],
            'waist_cm' => ['required', 'numeric', 'between:40,160'],
            'hips_cm' => ['required', 'numeric', 'between:60,170'],
        ];
    }
}