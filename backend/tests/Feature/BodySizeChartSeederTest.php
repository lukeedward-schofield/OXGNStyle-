<?php

namespace Tests\Feature;

use App\Models\BodySizeChart;
use Database\Seeders\BodySizeChartSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BodySizeChartSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_eight_sizes_for_each_chart(): void
    {
        $this->seed(BodySizeChartSeeder::class);

        $this->assertDatabaseCount('body_size_charts', 16);
        $this->assertSame(8, BodySizeChart::where('sizing', 'mens')->count());
        $this->assertSame(8, BodySizeChart::where('sizing', 'ladies')->count());
    }

    public function test_seeding_twice_does_not_duplicate_rows(): void
    {
        $this->seed(BodySizeChartSeeder::class);
        $this->seed(BodySizeChartSeeder::class);

        $this->assertDatabaseCount('body_size_charts', 16);
    }

    public function test_mens_medium_matches_the_client_chart(): void
    {
        $this->seed(BodySizeChartSeeder::class);

        $m = BodySizeChart::where('sizing', 'mens')->where('size', 'M')->first();

        $this->assertEquals(97, $m->chest_min_cm);
        $this->assertEquals(99, $m->chest_max_cm);
    }
}