<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PageController;
use App\Http\Controllers\SLAController;


Route::middleware('auth:sanctum')->group(function () {
    Route::controller(PageController::class)->group(function () {
        Route::get('/', 'index')->name('home');
    
        /** ------------------------------- Profile ----------------------------------------- */
        Route::get('/profile', 'profile')->name('profile');

        Route::get('/user/{id}', 'employeeProfile')->name('employeeProfile');

        /** --------------------------------- Forms  ----------------------------------------- */
        Route::get('/forms/sla', 'sla')->name('sla');
        Route::get('/forms/ecard', 'ecard')->name('ecard');

        /** --------------------------------- Applications  ----------------------------------------- */
        Route::get('/applications/sla', 'slaApplications')->name('slaApplications');
        Route::get('/applications/ecard', 'ecardApplications')->name('ecardApplications');
    });
    Route::post('/insert-update-dp', [ProfileController::class, 'insertUpdateDp'])->middleware('auth');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
