<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Services\OutfitBuilder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OutfitBuilderTest extends TestCase
{
    use RefreshDatabase;

    private function product(string $category, int $price, ?string $sizing = 'mens', bool $active = true): Product
    {
        return Product::factory()->create([
            'category' => $category,
            'price' => $price,
            'sizing' => $sizing,
            'is_active' => $active,
        ]);
    }

    private function build(float $budget, ?string $sizing = 'mens'): array
    {
        return app(OutfitBuilder::class)->withinBudget($budget, $sizing);
    }

    public function test_it_only_returns_outfits_that_fit_the_budget(): void
    {
        $this->product('top', 500);
        $this->product('bottom', 700);
        $this->product('accessory', 300);

        $roomy = $this->build(1500);
        $this->assertSame([1500.0, 1200.0], array_column($roomy, 'total'));

        $tight = $this->build(1300);
        $this->assertSame([1200.0], array_column($tight, 'total'));
    }

    public function test_every_outfit_has_a_top_and_a_bottom(): void
    {
        $this->product('top', 500);
        $this->product('bottom', 700);
        $this->product('footwear', 900);

        $outfits = $this->build(5000);

        $this->assertNotEmpty($outfits);
        foreach ($outfits as $outfit) {
            $categories = array_map(fn ($p) => $p->category->value, $outfit['products']);
            $this->assertContains('top', $categories);
            $this->assertContains('bottom', $categories);
        }
    }

    public function test_it_returns_nothing_when_the_budget_is_too_low(): void
    {
        $this->product('top', 500);
        $this->product('bottom', 700);

        $this->assertSame([], $this->build(1000));
    }

    public function test_it_returns_nothing_without_a_top_or_a_bottom(): void
    {
        $this->product('top', 500);

        $this->assertSame([], $this->build(5000));
    }

    public function test_it_respects_sizing_but_keeps_unsized_items(): void
    {
        $this->product('top', 500, 'ladies');
        $this->product('top', 100, 'mens');
        $this->product('bottom', 700, 'ladies');
        $this->product('accessory', 200, null);

        $outfits = $this->build(10000, 'ladies');

        $this->assertCount(2, $outfits); // top + bottom, and the same with the accessory
        foreach ($outfits as $outfit) {
            foreach ($outfit['products'] as $product) {
                $this->assertNotSame('mens', $product->sizing);
            }
        }
    }

    public function test_it_ignores_inactive_products(): void
    {
        $this->product('top', 500);
        $this->product('bottom', 700, 'mens', false);

        $this->assertSame([], $this->build(5000));
    }

    public function test_it_caps_the_number_of_results(): void
    {
        foreach (range(1, 4) as $i) {
            $this->product('top', 100 * $i);
            $this->product('bottom', 100 * $i);
        }

        $this->assertCount(OutfitBuilder::MAX_RESULTS, $this->build(100000));
    }
}