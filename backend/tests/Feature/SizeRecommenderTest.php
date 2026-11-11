<?php

namespace Tests\Feature;

use App\Models\BodyProfile;
use App\Models\BodySizeChart;
use App\Services\SizeRecommender;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SizeRecommenderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $chart = [
            ['S', 1, 85, 90, 70, 75, 90, 95],
            ['M', 2, 91, 95, 76, 80, 96, 100],
            ['L', 3, 97, 101, 82, 86, 102, 106],
        ];

        foreach ($chart as [$size, $order, $cMin, $cMax, $wMin, $wMax, $hMin, $hMax]) {
            BodySizeChart::create([
                'sizing' => 'mens',
                'size' => $size,
                'sort_order' => $order,
                'chest_min_cm' => $cMin,
                'chest_max_cm' => $cMax,
                'waist_min_cm' => $wMin,
                'waist_max_cm' => $wMax,
                'hips_min_cm' => $hMin,
                'hips_max_cm' => $hMax,
            ]);
        }
    }

    private function recommend(array $measurements, string $sizing = 'mens'): ?array
    {
        $profile = new BodyProfile(array_merge(
            ['sizing' => $sizing, 'chest_cm' => 93, 'waist_cm' => 78, 'hips_cm' => 98],
            $measurements,
        ));

        return app(SizeRecommender::class)->recommend($profile);
    }

    public function test_it_matches_a_size_inside_a_range(): void
    {
        $result = $this->recommend([]);

        $this->assertSame('M', $result['top']['size']);
        $this->assertSame('M', $result['bottom']['size']);
        $this->assertFalse($result['top']['out_of_range']);
    }

    public function test_a_gap_between_sizes_goes_up(): void
    {
        $this->assertSame('L', $this->recommend(['chest_cm' => 96])['top']['size']);
    }

    public function test_below_the_smallest_size_is_flagged(): void
    {
        $top = $this->recommend(['chest_cm' => 80])['top'];

        $this->assertSame('S', $top['size']);
        $this->assertTrue($top['out_of_range']);
    }

    public function test_above_the_largest_size_is_flagged(): void
    {
        $top = $this->recommend(['chest_cm' => 120])['top'];

        $this->assertSame('L', $top['size']);
        $this->assertTrue($top['out_of_range']);
    }

    public function test_bottoms_use_the_larger_of_waist_and_hips(): void
    {
        $result = $this->recommend(['waist_cm' => 72, 'hips_cm' => 98]);

        $this->assertSame('S', $result['by_measurement']['waist']);
        $this->assertSame('M', $result['by_measurement']['hips']);
        $this->assertSame('M', $result['bottom']['size']);
    }

    public function test_it_returns_null_when_there_is_no_chart_for_the_sizing(): void
    {
        $this->assertNull($this->recommend([], 'ladies'));
    }
}