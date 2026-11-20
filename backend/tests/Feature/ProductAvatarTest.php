<?php

namespace Tests\Feature;

use App\Models\Product;
use Database\Seeders\SampleCatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductAvatarTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SampleCatalogSeeder::class);
    }

    public function test_every_top_and_bottom_can_be_drawn(): void
    {
        $products = Product::whereIn('category', ['top', 'bottom'])->get();

        $this->assertCount(7, $products);

        foreach ($products as $product) {
            $this->assertMatchesRegularExpression('/^#[0-9a-f]{6}$/i', (string) $product->avatar_color, $product->name);

            $allowed = $product->category->value === 'top' ? ['tee', 'tank'] : ['pants', 'shorts'];
            $this->assertContains($product->avatar_shape, $allowed, $product->name);
        }
    }

    public function test_other_categories_are_not_drawn_yet(): void
    {
        $others = Product::whereNotIn('category', ['top', 'bottom'])->get();

        $this->assertCount(5, $others);

        foreach ($others as $product) {
            $this->assertNull($product->avatar_shape, $product->name);
        }
    }

    public function test_the_api_exposes_the_avatar_fields(): void
    {
        $slug = Product::where('name', 'Sample Boxy Tee')->firstOrFail()->slug;

        $this->getJson("/api/v1/products/{$slug}")
            ->assertOk()
            ->assertJsonPath('data.avatar_shape', 'tee')
            ->assertJsonPath('data.avatar_color', '#c0392b');
    }
}