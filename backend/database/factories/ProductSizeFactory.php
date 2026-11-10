<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductSizeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'size' => fake()->randomElement(['XS', 'S', 'M', 'L', 'XL']),
            'measurements' => ['body_width' => 40.0, 'body_length' => 50.0, 'sleeve_length' => 20.0],
            'in_stock' => true,
        ];
    }
}