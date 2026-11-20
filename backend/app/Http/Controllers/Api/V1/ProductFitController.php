<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\FitCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductFitController extends Controller
{
    public function __invoke(Request $request, Product $product, FitCalculator $calculator): JsonResponse
    {
        abort_unless($product->is_active, 404);

        $profile = $request->user()->bodyProfile;

        return response()->json([
            'data' => $profile
                ? ['sizes' => $calculator->forProduct($product->load('sizes'), $profile)]
                : null,
        ]);
    }
}