<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BudgetOutfitsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'budget' => ['required', 'numeric', 'min:0'],
            'sizing' => ['sometimes', 'nullable', Rule::in(['mens', 'ladies'])],
        ];
    }
}