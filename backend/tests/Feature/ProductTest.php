<?php

namespace Tests\Feature;

use App\Enums\ProductCategory;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_product_has_sizes_with_json_measurements(): void
    {
        $product = Product::factory()->create();
        $product->sizes()->create([
            'size' => 'M',
            'measurements' => ['body_width' => 39.4, 'body_length' => 49.5],
        ]);

        $size = $product->fresh()->sizes->first();

        $this->assertSame('M', $size->size);
        $this->assertSame(39.4, $size->measurements['body_width']);
    }

    public function test_a_product_cannot_have_the_same_size_twice(): void
    {
        $product = Product::factory()->create();
        $product->sizes()->create(['size' => 'M']);

        $this->expectException(QueryException::class);
        $product->sizes()->create(['size' => 'M']);
    }

    public function test_category_is_cast_to_an_enum(): void
    {
        $product = Product::factory()->create(['category' => 'top']);

        $this->assertSame(ProductCategory::Top, $product->fresh()->category);
    }
}