<?php

namespace App\Services;

use App\Models\BodyProfile;
use App\Models\Product;

class FitCalculator
{
    // Assumed thresholds for chest ease (garment chest minus body chest), in cm.
    // Not client data: confirm with OXGN before relying on the labels.
    public const SNUG_BELOW_CM = 6;
    public const LOOSE_FROM_CM = 16;

    /**
     * @return list<array{size: string, chest_ease_cm: float|null, fit: string|null}>
     */
    public function forProduct(Product $product, BodyProfile $profile): array
    {
        $chest = (float) $profile->chest_cm;

        return $product->sizes
            ->map(fn ($size) => ['size' => $size->size] + $this->forMeasurements($size->measurements, $chest))
            ->values()
            ->all();
    }

    /**
     * @param  array<string, float|int>|null  $measurements
     * @return array{chest_ease_cm: float|null, fit: string|null}
     */
    public function forMeasurements(?array $measurements, float $bodyChestCm): array
    {
        if (! isset($measurements['body_width'])) {
            return ['chest_ease_cm' => null, 'fit' => null];
        }

        // body_width is the flat width, so the full chest circumference is double.
        $ease = round(2 * (float) $measurements['body_width'] - $bodyChestCm, 1);

        $fit = match (true) {
            $ease < self::SNUG_BELOW_CM => 'snug',
            $ease < self::LOOSE_FROM_CM => 'regular',
            default => 'loose',
        };

        return ['chest_ease_cm' => $ease, 'fit' => $fit];
    }
}