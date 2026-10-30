<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\HealthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::prefix("v1")->group(function () {
    Route::get("/health", HealthController::class);
    Route::post("/register", [AuthController::class, "register"]);
});

