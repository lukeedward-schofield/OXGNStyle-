<?php

namespace Database\Seeders;

use App\Models\BodySizeChart;
use Illuminate\Database\Seeder;

class BodySizeChartSeeder extends Seeder
{
    public function run(): void
    {
        // size => [chest_min, chest_max, waist_min, waist_max, hips_min, hips_max] in cm
        $this->seedChart('mens', [
            'XXS' => [81, 84, 69, 71, 86, 89],
            'XS'  => [86, 89, 71, 74, 89, 91],
            'S'   => [91, 94, 76, 79, 94, 97],
            'M'   => [97, 99, 81, 84, 99, 102],
            'L'   => [102, 104, 86, 89, 104, 107],
            'XL'  => [107, 109, 91, 94, 109, 112],
            '2XL' => [112, 114, 97, 99, 114, 117],
            '3XL' => [119, 122, 104, 107, 122, 124],
        ]);

        // The ladies' chart lists single chest and waist values, so min equals max.
        $this->seedChart('ladies', [
            'XXS' => [74, 74, 58, 58, 81, 84],
            'XS'  => [76, 76, 61, 61, 84, 86],
            'S'   => [81, 81, 66, 66, 89, 91],
            'M'   => [86, 86, 71, 71, 94, 97],
            'L'   => [91, 91, 76, 76, 99, 102],
            'XL'  => [97, 97, 81, 81, 104, 107],
            '2XL' => [102, 102, 86, 86, 109, 112],
            '3XL' => [107, 107, 91, 91, 114, 117],
        ]);
    }

    private function seedChart(string $sizing, array $rows): void
    {
        $order = 0;

        foreach ($rows as $size => [$chestMin, $chestMax, $waistMin, $waistMax, $hipsMin, $hipsMax]) {
            BodySizeChart::updateOrCreate(
                ['sizing' => $sizing, 'size' => $size],
                [
                    'sort_order' => $order++,
                    'chest_min_cm' => $chestMin,
                    'chest_max_cm' => $chestMax,
                    'waist_min_cm' => $waistMin,
                    'waist_max_cm' => $waistMax,
                    'hips_min_cm' => $hipsMin,
                    'hips_max_cm' => $hipsMax,
                ],
            );
        }
    }
}