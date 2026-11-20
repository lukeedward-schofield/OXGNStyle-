<?php

namespace Tests\Feature;

use App\Models\BodyProfile;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\SampleCatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductFitTest extends TestCase
{
    use RefreshDatabase;

    private function slugOf(string $name): string
    {
        return Product::where('name', $name)->firstOrFail()->slug;
    }

    private function loginWithProfile(float $chest = 96): void
    {
        $user = User::factory()->create();
        BodyProfile::factory()->create(['user_id' => $user->id, 'chest_cm' => $chest]);
        Sanctum::actingAs($user);
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SampleCatalogSeeder::class);
    }

    public function test_it_requires_authentication(): void
    {
        $this->getJson('/api/v1/products/'.$this->slugOf('Sample Boxy Tee').'/fit')->assertUnauthorized();
    }

    public function test_it_returns_null_without_a_profile(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/products/'.$this->slugOf('Sample Boxy Tee').'/fit')
            ->assertOk()
            ->assertJson(['data' => null]);
    }

    public function test_tops_get_a_fit_label_for_each_size(): void
    {
        $this->loginWithProfile(96);

        $sizes = $this->getJson('/api/v1/products/'.$this->slugOf('Sample Boxy Tee').'/fit')
            ->assertOk()
            ->json('data.sizes');

        $xl = collect($sizes)->firstWhere('size', 'XL');

        $this->assertEquals(20.8, $xl['chest_ease_cm']);
        $this->assertSame('loose', $xl['fit']);
    }

    public function test_products_without_garment_measurements_have_no_fit(): void
    {
        $this->loginWithProfile();

        $sizes = $this->getJson('/api/v1/products/'.$this->slugOf('Sample Straight Jeans').'/fit')
            ->assertOk()
            ->json('data.sizes');

        $this->assertNotEmpty($sizes);
        foreach ($sizes as $size) {
            $this->assertNull($size['fit']);
            $this->assertNull($size['chest_ease_cm']);
        }
    }

    public function test_inactive_products_return_404(): void
    {
        $this->loginWithProfile();
        $slug = $this->slugOf('Sample Boxy Tee');
        Product::where('slug', $slug)->update(['is_active' => false]);

        $this->getJson("/api/v1/products/{$slug}/fit")->assertNotFound();
    }
}