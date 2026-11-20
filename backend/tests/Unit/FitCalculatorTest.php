<?php

namespace Tests\Unit;

use App\Services\FitCalculator;
use PHPUnit\Framework\TestCase;

class FitCalculatorTest extends TestCase
{
    private function fit(?array $measurements, float $chest = 90): array
    {
        return (new FitCalculator())->forMeasurements($measurements, $chest);
    }

    public function test_a_small_ease_is_snug(): void
    {
        $this->assertSame('snug', $this->fit(['body_width' => 46])['fit']); // ease 2
    }

    public function test_a_medium_ease_is_regular(): void
    {
        $result = $this->fit(['body_width' => 50]); // garment 100, ease 10

        $this->assertSame('regular', $result['fit']);
        $this->assertSame(10.0, $result['chest_ease_cm']);
    }

    public function test_a_large_ease_is_loose(): void
    {
        $this->assertSame('loose', $this->fit(['body_width' => 55])['fit']); // ease 20
    }

    public function test_boundaries_fall_into_the_larger_band(): void
    {
        $this->assertSame('regular', $this->fit(['body_width' => 48])['fit']); // ease 6
        $this->assertSame('loose', $this->fit(['body_width' => 53])['fit']);   // ease 16
    }

    public function test_a_garment_smaller_than_the_body_is_snug(): void
    {
        $result = $this->fit(['body_width' => 40]); // ease -10

        $this->assertSame('snug', $result['fit']);
        $this->assertSame(-10.0, $result['chest_ease_cm']);
    }

    public function test_missing_measurements_give_null_not_a_guess(): void
    {
        $this->assertSame(['chest_ease_cm' => null, 'fit' => null], $this->fit(null));
        $this->assertSame(['chest_ease_cm' => null, 'fit' => null], $this->fit(['sleeve_length' => 20]));
    }
}