<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\SizeRecommender;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SizeRecommendationController extends Controller
{
    public function __invoke(Request $request, SizeRecommender $recommender): JsonResponse
    {
        $profile = $request->user()->bodyProfile;

        return response()->json([
            'data' => $profile ? $recommender->recommend($profile) : null,
        ]);
    }
}