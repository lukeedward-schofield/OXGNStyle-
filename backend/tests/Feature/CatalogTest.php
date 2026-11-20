<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_only_active_products_with_their_sizes(): void
    {
        $active = Product::factory()->create();
        $active->sizes()->create(['size' => 'M']);
        Product::factory()->create(['is_active' => false]);

        $this->getJson('/api/v1/products')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $active->slug)
            ->assertJsonPath('data.0.sizes.0.size', 'M');
    }

    public function test_it_filters_by_max_price_for_the_budget_view(): void
    {
        Product::factory()->create(['slug' => 'cheap-tee', 'price' => 500]);
        Product::factory()->create(['slug' => 'pricey-jacket', 'price' => 2500]);

        $this->getJson('/api/v1/products?max_price=1000')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'cheap-tee');
    }

    public function test_it_filters_by_category(): void
    {
        Product::factory()->create(['category' => 'top']);
        Product::factory()->create(['category' => 'footwear']);

        $this->getJson('/api/v1/products?category=top')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.category', 'top');
    }

    public function test_sizing_filter_keeps_items_that_have_no_sizing(): void
    {
        Product::factory()->create(['sizing' => 'ladies']);
        Product::factory()->create(['sizing' => 'mens']);
        Product::factory()->create(['sizing' => null, 'category' => 'accessory']);

        $this->getJson('/api/v1/products?sizing=ladies')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_empty_filter_values_are_ignored(): void
    {
        Product::factory()->count(2)->create();

        $this->getJson('/api/v1/products?max_price=&category=')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_it_rejects_invalid_filters(): void
    {
        $this->getJson('/api/v1/products?category=hats&max_price=-5')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category', 'max_price']);
    }

    public function test_it_shows_one_product_by_slug_with_garment_measurements(): void
    {
        $product = Product::factory()->create(['slug' => 'sample-boxy-tee']);
        $product->sizes()->create(['size' => 'M', 'measurements' => ['body_width' => 53.3]]);

        $this->getJson('/api/v1/products/sample-boxy-tee')
            ->assertOk()
            ->assertJsonPath('data.slug', 'sample-boxy-tee')
            ->assertJsonPath('data.sizes.0.measurements.body_width', 53.3);
    }

    public function test_inactive_and_unknown_products_return_404(): void
    {
        Product::factory()->create(['slug' => 'hidden', 'is_active' => false]);

        $this->getJson('/api/v1/products/hidden')->assertNotFound();
        $this->getJson('/api/v1/products/does-not-exist')->assertNotFound();
    }
}