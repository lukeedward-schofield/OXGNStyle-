<?php

namespace Tests\Feature\Auth;

use Database\Seeders\DemoUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeded_demo_user_can_log_in(): void
    {
        $this->seed(DemoUserSeeder::class);

        $this->postJson('/api/v1/login', [
            'email' => 'demo@example.com',
            'password' => 'password123',
        ])->assertOk();
    }
}