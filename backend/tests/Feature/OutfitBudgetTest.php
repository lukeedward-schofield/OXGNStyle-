<?php

namespace Tests\Feature;

use App\Models\BodyProfile;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OutfitBudgetTest extends TestCase
{
    use RefreshDatabase;

    private function product(string $category, int $price, ?string $sizing): Product
    {
        return Product::factory()->create(['category' => $category, 'price' => $price, 'sizing' => $sizing]);
    }

    public function test_it_requires_authentication(): void
    {
        $this->getJson('/api/v1/outfits/budget?budget=1000')->assertUnauthorized();
    }

    public function test_budget_is_required_and_must_be_a_positive_number(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/outfits/budget')->assertUnprocessable()->assertJsonValidationErrors(['budget']);
        $this->getJson('/api/v1/outfits/budget?budget=-5')->assertUnprocessable()->assertJsonValidationErrors(['budget']);
    }

    public function test_it_returns_outfits_within_the_budget_using_the_profile_sizing(): void
    {
        $user = User::factory()->create();
        BodyProfile::factory()->create(['user_id' => $user->id, 'sizing' => 'ladies']);
        Sanctum::actingAs($user);

        $this->product('top', 500, 'ladies');
        $this->product('top', 100, 'mens');
        $this->product('bottom', 700, 'ladies');

        $response = $this->getJson('/api/v1/outfits/budget?budget=1200')->assertOk();

        $response->assertJsonCount(1, 'data')->assertJsonCount(2, 'data.0.products');
        $this->assertEquals(1200, $response->json('data.0.total'));
        $this->assertNotNull($response->json('data.0.products.0.slug'));
    }

    public function test_an_explicit_sizing_overrides_the_profile(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->product('top', 500, 'mens');
        $this->product('bottom', 700, 'mens');
        $this->product('top', 100, 'ladies');
        $this->product('bottom', 100, 'ladies');

        $response = $this->getJson('/api/v1/outfits/budget?budget=5000&sizing=ladies')->assertOk();

        $response->assertJsonCount(1, 'data');
        $this->assertEquals(200, $response->json('data.0.total'));
    }
}