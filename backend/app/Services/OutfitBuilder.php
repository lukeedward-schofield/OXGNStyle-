<?php

namespace App\Services;

use App\Models\Product;

class OutfitBuilder
{
    public const MAX_RESULTS = 12;

    /**
     * Every outfit with a top, a bottom and any mix of optional extras
     * (one outerwear, one footwear, one accessory) that costs no more than
     * the budget. Biggest spend first, so the budget is used well.
     *
     * @return list<array{total: float, products: list<Product>}>
     */
    public function withinBudget(float $budget, ?string $sizing = null): array
    {
        $byCategory = Product::query()
            ->with('sizes')
            ->where('is_active', true)
            ->when($sizing, fn ($query) => $query->where(
                fn ($q) => $q->where('sizing', $sizing)->orWhereNull('sizing')
            ))
            ->orderBy('id')
            ->get()
            ->groupBy(fn (Product $product) => $product->category->value);

        $tops = $byCategory->get('top', collect())->all();
        $bottoms = $byCategory->get('bottom', collect())->all();

        if ($tops === [] || $bottoms === []) {
            return [];
        }

        // null means "skip this optional slot".
        $slots = [
            $tops,
            $bottoms,
            [null, ...$byCategory->get('outerwear', collect())->all()],
            [null, ...$byCategory->get('footwear', collect())->all()],
            [null, ...$byCategory->get('accessory', collect())->all()],
        ];

        $outfits = [];

        foreach ($this->combinations($slots) as $combo) {
            $products = array_values(array_filter($combo));
            $total = round(array_sum(array_map(fn (Product $p) => (float) $p->price, $products)), 2);

            if ($total <= $budget) {
                $outfits[] = ['total' => $total, 'products' => $products];
            }
        }

        usort($outfits, fn ($a, $b) => $b['total'] <=> $a['total']);

        return array_slice($outfits, 0, self::MAX_RESULTS);
    }

    /**
     * Every way to pick one option from each slot.
     *
     * @param  list<list<Product|null>>  $slots
     * @return list<list<Product|null>>
     */
    private function combinations(array $slots): array
    {
        $result = [[]];

        foreach ($slots as $options) {
            $next = [];
            foreach ($result as $partial) {
                foreach ($options as $option) {
                    $next[] = [...$partial, $option];
                }
            }
            $result = $next;
        }

        return $result;
    }
}