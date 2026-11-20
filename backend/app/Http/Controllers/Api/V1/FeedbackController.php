<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreFeedbackRequest;
use App\Models\Feedback;
use Illuminate\Http\JsonResponse;

class FeedbackController extends Controller
{
    public function store(StoreFeedbackRequest $request): JsonResponse
    {
        $feedback = Feedback::create($request->validated() + ['user_id' => $request->user()->id]);

        return response()->json([
            'data' => ['id' => $feedback->id, 'rating' => $feedback->rating],
        ], 201);
    }
}