<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\BodyProfileResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): BodyProfileResource|JsonResponse
    {
        $profile = $request->user()->bodyProfile;

        return $profile
            ? new BodyProfileResource($profile)
            : response()->json(['data' => null]);
    }

    public function update(UpdateProfileRequest $request): BodyProfileResource
    {
        $profile = $request->user()->bodyProfile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $request->validated(),
        );

        return new BodyProfileResource($profile);
    }
}