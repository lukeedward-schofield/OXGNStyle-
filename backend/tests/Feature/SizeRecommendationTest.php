<?php

namespace Tests\Feature;

use App\Models\BodyProfile;
use App\Models\BodySizeChart;
use App\Models\User;
use Database\Seeders\BodySizeChartSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SizeRecommendationTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_requires_authentication(): void
    {
        $this->getJson('/api/v1/size-recommendation')->assertUnauthorized();
    }

    public function test_it_returns_null_without_a_profile(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/size-recommendation')
            ->assertOk()
            ->assertJson(['data' => null]);
    }

    public function test_it_recommends_from_the_client_chart(): void
    {
        $this->seed(BodySizeChartSeeder::class);
        $medium = BodySizeChart::where('sizing', 'mens')->where('size', 'M')->firstOrFail();

        $user = User::factory()->create();
        BodyProfile::factory()->create([
            'user_id' => $user->id,
            'sizing' => 'mens',
            'chest_cm' => round(($medium->chest_min_cm + $medium->chest_max_cm) / 2, 1),
            'waist_cm' => round(($medium->waist_min_cm + $medium->waist_max_cm) / 2, 1),
            'hips_cm' => round(($medium->hips_min_cm + $medium->hips_max_cm) / 2, 1),
        ]);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/size-recommendation')
            ->assertOk()
            ->assertJsonPath('data.top.size', 'M')
            ->assertJsonPath('data.bottom.size', 'M')
            ->assertJsonPath('data.top.out_of_range', false);
    }
}