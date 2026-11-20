<?php

namespace Database\Seeders;

use App\Enums\ProductCategory;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SampleCatalogSeeder extends Seeder
{
    // Garment dimensions in cm, copied from the two sample "Product Dimension"
    // tables the client sent (model 173 cm wearing S, and model 183 cm wearing XL).
    private const LADIES_TEE = [
        'XS' => ['body_width' => 34.3, 'body_length' => 47.0, 'sleeve_length' => 19.1],
        'S' => ['body_width' => 36.8, 'body_length' => 48.3, 'sleeve_length' => 20.3],
        'M' => ['body_width' => 39.4, 'body_length' => 49.5, 'sleeve_length' => 21.6],
        'L' => ['body_width' => 41.9, 'body_length' => 50.8, 'sleeve_length' => 22.9],
        'XL' => ['body_width' => 44.5, 'body_length' => 52.1, 'sleeve_length' => 24.1],
        'XXL' => ['body_width' => 47.0, 'body_length' => 53.3, 'sleeve_length' => 25.4],
    ];

    private const MENS_TEE = [
        'XS' => ['body_width' => 48.3, 'shoulder_width' => 43.2, 'body_length' => 66.0, 'sleeve_length' => 19.1],
        'S' => ['body_width' => 50.8, 'shoulder_width' => 45.7, 'body_length' => 68.6, 'sleeve_length' => 19.7],
        'M' => ['body_width' => 53.3, 'shoulder_width' => 48.3, 'body_length' => 71.1, 'sleeve_length' => 20.3],
        'L' => ['body_width' => 55.9, 'shoulder_width' => 50.8, 'body_length' => 73.7, 'sleeve_length' => 21.0],
        'XL' => ['body_width' => 58.4, 'shoulder_width' => 53.3, 'body_length' => 76.2, 'sleeve_length' => 21.6],
        'XXL' => ['body_width' => 62.2, 'shoulder_width' => 57.2, 'body_length' => 78.7, 'sleeve_length' => 22.2],
    ];

    private const NO_DIMENSIONS_NOTE = 'Garment measurements not available (sample data).';

    public function run(): void
    {
        foreach ($this->products() as $data) {
            $product = Product::updateOrCreate(
                ['slug' => Str::slug($data['name'])],
                [
                    'name' => $data['name'],
                    'category' => $data['category'],
                    'sizing' => $data['sizing'],
                    'price' => $data['price'],
                    'description' => 'Sample product for the prototype. Not an official OXGN listing.',
                    'fit_note' => $data['fit_note'],
                    'is_sample_data' => true,
                    'is_active' => true,
                    'avatar_color' => $data['avatar_color'] ?? null,
                    'avatar_shape' => $data['avatar_shape'] ?? null,
                ],
            );

            foreach ($data['sizes'] as $size => $measurements) {
                $product->sizes()->updateOrCreate(
                    ['size' => (string) $size],
                    ['measurements' => $measurements, 'in_stock' => true],
                );
            }
        }
    }

    /** @return list<array<string, mixed>> */
    private function products(): array
    {
        $letters = array_fill_keys(['XS', 'S', 'M', 'L', 'XL'], null);
        $shoes = array_fill_keys(['US 6', 'US 7', 'US 8', 'US 9', 'US 10'], null);
        $oneSize = ['One Size' => null];

        return [
           ['name' => 'Sample Fitted Tee', 'category' => ProductCategory::Top, 'sizing' => 'ladies', 'price' => 699, 'fit_note' => 'Sample data. Measurements from a client sample table.', 'sizes' => self::LADIES_TEE, 'avatar_shape' => 'tee', 'avatar_color' => '#e5e7eb'],
            ['name' => 'Sample Ribbed Tank', 'category' => ProductCategory::Top, 'sizing' => 'ladies', 'price' => 549, 'fit_note' => 'Sample data. Measurements from a client sample table.', 'sizes' => self::LADIES_TEE, 'avatar_shape' => 'tank', 'avatar_color' => '#e8b4b8'],
            ['name' => 'Sample Boxy Tee', 'category' => ProductCategory::Top, 'sizing' => 'mens', 'price' => 749, 'fit_note' => 'Sample data. Measurements from a client sample table.', 'sizes' => self::MENS_TEE, 'avatar_shape' => 'tee', 'avatar_color' => '#c0392b'],
            ['name' => 'Sample Graphic Tee', 'category' => ProductCategory::Top, 'sizing' => 'mens', 'price' => 799, 'fit_note' => 'Sample data. Measurements from a client sample table.', 'sizes' => self::MENS_TEE, 'avatar_shape' => 'tee', 'avatar_color' => '#3b6ea5'],
            ['name' => 'Sample Straight Jeans', 'category' => ProductCategory::Bottom, 'sizing' => 'mens', 'price' => 1499, 'fit_note' => self::NO_DIMENSIONS_NOTE, 'sizes' => $letters, 'avatar_shape' => 'pants', 'avatar_color' => '#1f3a5f'],
            ['name' => 'Sample Wide-Leg Pants', 'category' => ProductCategory::Bottom, 'sizing' => 'ladies', 'price' => 1399, 'fit_note' => self::NO_DIMENSIONS_NOTE, 'sizes' => $letters, 'avatar_shape' => 'pants', 'avatar_color' => '#57534e'],
            ['name' => 'Sample Cargo Shorts', 'category' => ProductCategory::Bottom, 'sizing' => 'mens', 'price' => 999, 'fit_note' => self::NO_DIMENSIONS_NOTE, 'sizes' => $letters, 'avatar_shape' => 'shorts', 'avatar_color' => '#6b705c'], ['name' => 'Sample Zip Hoodie', 'category' => ProductCategory::Outerwear, 'sizing' => 'mens', 'price' => 1899, 'fit_note' => self::NO_DIMENSIONS_NOTE, 'sizes' => $letters],
            ['name' => 'Sample Denim Jacket', 'category' => ProductCategory::Outerwear, 'sizing' => 'ladies', 'price' => 2199, 'fit_note' => self::NO_DIMENSIONS_NOTE, 'sizes' => $letters],
            ['name' => 'Sample Low-Top Sneakers', 'category' => ProductCategory::Footwear, 'sizing' => null, 'price' => 2499, 'fit_note' => self::NO_DIMENSIONS_NOTE, 'sizes' => $shoes],
            ['name' => 'Sample Dad Cap', 'category' => ProductCategory::Accessory, 'sizing' => null, 'price' => 499, 'fit_note' => null, 'sizes' => $oneSize],
            ['name' => 'Sample Crossbody Bag', 'category' => ProductCategory::Accessory, 'sizing' => null, 'price' => 899, 'fit_note' => null, 'sizes' => $oneSize],
        ];
    }
}