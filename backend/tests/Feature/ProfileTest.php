<?php

namespace Tests\Feature;

use App\Models\BodyProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'sizing' => 'mens',
            'height_cm' => 175,
            'weight_kg' => 70,
            'chest_cm' => 96.5,
            'waist_cm' => 80,
            'hips_cm' => 98,
        ], $overrides);
    }

    public function test_profile_requires_authentication(): void
    {
        $this->getJson('/api/v1/profile')->assertUnauthorized();
        $this->putJson('/api/v1/profile', $this->payload())->assertUnauthorized();
    }

    public function test_profile_is_null_before_it_is_filled_in(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/profile')->assertOk()->assertJson(['data' => null]);
    }

    public function test_user_can_create_a_profile(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/profile', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.chest_cm', 96.5)
            ->assertJsonPath('data.sizing', 'mens');

        $this->assertDatabaseCount('body_profiles', 1);
    }

    public function test_updating_changes_the_same_profile(): void
    {
        $user = User::factory()->create();
        BodyProfile::factory()->create(['user_id' => $user->id]);
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/profile', $this->payload(['chest_cm' => 101]))->assertOk();

        $this->assertDatabaseCount('body_profiles', 1);
        $this->getJson('/api/v1/profile')->assertJsonPath('data.chest_cm', 101);
    }

    public function test_weight_is_optional(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->putJson('/api/v1/profile', $this->payload(['weight_kg' => null]))
            ->assertCreated()
            ->assertJsonPath('data.weight_kg', null);
    }

    public function test_it_rejects_invalid_measurements(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->putJson('/api/v1/profile', $this->payload(['sizing' => 'kids', 'chest_cm' => 5]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['sizing', 'chest_cm']);
    }

    public function test_a_user_only_sees_their_own_profile(): void
    {
        BodyProfile::factory()->create(['chest_cm' => 120]);
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/profile')->assertJson(['data' => null]);
    }
}