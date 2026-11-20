<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BodyProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'sizing' => 'mens',
            'height_cm' => 175,
            'weight_kg' => 70,
            'chest_cm' => 96,
            'waist_cm' => 80,
            'hips_cm' => 98,
        ];
    }
}