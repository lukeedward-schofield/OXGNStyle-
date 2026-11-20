<?php

namespace App\Services;

use App\Models\BodyProfile;
use App\Models\BodySizeChart;
use Illuminate\Support\Collection;

class SizeRecommender
{
    /**
     * @return array{sizing: string, top: array, bottom: array, by_measurement: array}|null
     */
    public function recommend(BodyProfile $profile): ?array
    {
        $rows = BodySizeChart::where('sizing', $profile->sizing)->orderBy('sort_order')->get();

        if ($rows->isEmpty()) {
            return null;
        }

        $chest = $this->match($rows, 'chest', (float) $profile->chest_cm);
        $waist = $this->match($rows, 'waist', (float) $profile->waist_cm);
        $hips = $this->match($rows, 'hips', (float) $profile->hips_cm);

        // For bottoms, the bigger of waist and hips wins.
        $bottom = $waist['row']->sort_order >= $hips['row']->sort_order ? $waist : $hips;

        return [
            'sizing' => $profile->sizing,
            'top' => [
                'size' => $chest['row']->size,
                'out_of_range' => $chest['out_of_range'],
            ],
            'bottom' => [
                'size' => $bottom['row']->size,
                'out_of_range' => $waist['out_of_range'] || $hips['out_of_range'],
            ],
            'by_measurement' => [
                'chest' => $chest['row']->size,
                'waist' => $waist['row']->size,
                'hips' => $hips['row']->size,
            ],
        ];
    }

    /**
     * Find the first size whose maximum covers the value. A value in a gap
     * between two sizes therefore lands on the larger one.
     *
     * @return array{row: BodySizeChart, out_of_range: bool}
     */
    private function match(Collection $rows, string $field, float $value): array
    {
        $min = "{$field}_min_cm";
        $max = "{$field}_max_cm";

        $outOfRange = $value < (float) $rows->first()->$min
            || $value > (float) $rows->last()->$max;

        foreach ($rows as $row) {
            if ($value <= (float) $row->$max) {
                return ['row' => $row, 'out_of_range' => $outOfRange];
            }
        }

        return ['row' => $rows->last(), 'out_of_range' => true];
    }
}