<?php

namespace Tests\Feature;

use App\Models\Product;
use Database\Seeders\SampleCatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SampleCatalogSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_twelve_products_all_flagged_as_sample(): void
    {
        $this->seed(SampleCatalogSeeder::class);

        $this->assertDatabaseCount('products', 12);
        $this->assertSame(0, Product::where('is_sample_data', false)->count());
    }

    public function test_tops_have_measurements_and_other_items_do_not(): void
    {
        $this->seed(SampleCatalogSeeder::class);

        $tee = Product::where('slug', 'sample-boxy-tee')->firstOrFail();
        $this->assertSame(58.4, $tee->sizes()->where('size', 'XL')->first()->measurements['body_width']);

        $jeans = Product::where('slug', 'sample-straight-jeans')->firstOrFail();
        $this->assertNull($jeans->sizes()->first()->measurements);
    }

    public function test_seeding_twice_does_not_duplicate_anything(): void
    {
        $this->seed(SampleCatalogSeeder::class);
        $this->seed(SampleCatalogSeeder::class);

        $this->assertDatabaseCount('products', 12);
        $this->assertSame(6, Product::where('slug', 'sample-boxy-tee')->firstOrFail()->sizes()->count());
    }
}