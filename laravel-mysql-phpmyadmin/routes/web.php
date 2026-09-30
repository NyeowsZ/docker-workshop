<?php

use App\Http\Controllers\QuizController;
use Illuminate\Support\Facades\Route;

Route::get('/', [QuizController::class, 'index']);

// API endpoints for Interactive Identification Quiz & CRUD
Route::prefix('api')->group(function () {
    Route::get('/ping', [QuizController::class, 'ping']);
    Route::get('/questions', [QuizController::class, 'getQuestions']);
    Route::post('/questions/check', [QuizController::class, 'checkAnswer']);
    Route::post('/questions', [QuizController::class, 'store']);
    Route::patch('/questions/{id}', [QuizController::class, 'update']);
    Route::delete('/questions/{id}', [QuizController::class, 'destroy']);
    Route::post('/questions/reset', [QuizController::class, 'reset']);
});
