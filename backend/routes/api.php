<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetStatusController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\SupplierController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('locations', LocationController::class);
    Route::post('/locations/hierarchy', [LocationController::class, 'storeHierarcy']);
    Route::apiResource('asset-status', AssetStatusController::class);
    Route::apiResource('suppliers', SupplierController::class);

    Route::apiResource('assets', AssetController::class);
});
