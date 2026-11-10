<?php

namespace Database\Factories;

use App\Enums\ProductCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'category' => fake()->randomElement(ProductCategory::cases())->value,
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 299, 2999),
            'sizing' => 'mens',
            'is_sample_data' => true,
            'is_active' => true,
        ];
    }
}