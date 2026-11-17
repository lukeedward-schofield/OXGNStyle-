<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\HealthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\SizeRecommendationController;
use App\Http\Controllers\Api\V1\ProductFitController;




Route::prefix("v1")->group(function () {
    Route::get("/health", HealthController::class);
    Route::post("/register", [AuthController::class, "register"]);
    Route::post("/login", [AuthController::class, "login"]);

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product:slug}', [ProductController::class, 'show']);

    Route::middleware("auth:sanctum")->group(function  () {
        Route::get("/me", [AuthController::class, "me"]);
        Route::post("/logout", [AuthController::class, "logout"]);

        // inside Route::middleware("auth:sanctum")->group(...)
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
    

        // inside Route::middleware("auth:sanctum")->group(...)
        Route::get('/size-recommendation', SizeRecommendationController::class);
    

        // inside Route::middleware("auth:sanctum")->group(...)
        Route::get('/products/{product:slug}/fit', ProductFitController::class);
    });
});


