<?php

namespace App\Http\Requests\Api\V1;

use App\Enums\ProductCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClosetItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'category' => ['sometimes', 'required', Rule::enum(ProductCategory::class)],
            'color' => ['sometimes', 'nullable', 'string', 'max:50'],
            'size' => ['sometimes', 'nullable', 'string', 'max:20'],
        ];
    }
}