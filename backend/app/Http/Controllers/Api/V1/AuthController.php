<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\LoginRequest;
use App\Http\Requests\Api\V1\RegisterRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $user->createToken('spa')->plainTextToken,
            ],
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse{
        $user = User::where("email", $request->validated("email"))->first();

        if(! $user || ! Hash::check($request->validated("password"), $user->password)){
            throw ValidationException::withMessages([
                "email" => ["The provided credentials are incorrect"]
            ]);
        }

        return response()->json([
            "data" => [
                "user" => new UserResource($user),
                "token" => $user->createToken("spa")->plainTextToken,
            ]
        ]);
    }

    public function logout(Request $request): JsonResponse{
        $request->user()->currentAccessToken()->delete();

        return response()->json(["message" => "Logged out."]);
    }
}