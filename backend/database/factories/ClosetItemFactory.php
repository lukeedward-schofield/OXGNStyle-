<?php

namespace Database\Factories;

use App\Enums\ProductCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClosetItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => ucfirst(fake()->words(2, true)),
            'category' => fake()->randomElement(ProductCategory::cases())->value,
            'color' => fake()->safeColorName(),
            'size' => fake()->randomElement(['S', 'M', 'L']),
            'image_path' => null,
        ];
    }
}