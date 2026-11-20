<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\BudgetOutfitsRequest;
use App\Http\Resources\Api\V1\ProductResource;
use App\Services\OutfitBuilder;
use Illuminate\Http\JsonResponse;

class OutfitBudgetController extends Controller
{
    public function __invoke(BudgetOutfitsRequest $request, OutfitBuilder $builder): JsonResponse
    {
        $sizing = $request->validated('sizing') ?? $request->user()->bodyProfile?->sizing;

        $outfits = $builder->withinBudget((float) $request->validated('budget'), $sizing);

        return response()->json([
            'data' => array_map(fn (array $outfit) => [
                'total' => $outfit['total'],
                'products' => ProductResource::collection($outfit['products']),
            ], $outfits),
        ]);
    }
}