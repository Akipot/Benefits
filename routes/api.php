<?php

use App\Http\Controllers\PdfController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SLAController;
use App\Http\Controllers\ECardController;
use App\Http\Controllers\CommonController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {

    /** ------------------------------- Common ---------------------------------------- */
    Route::get('/employees/search', [CommonController::class, 'searchEmployee']);
    Route::get('/get-address-options', [CommonController::class, 'getAddressOptions']);
    
    /** ----------------------------- PROFILE -------------------------------------------*/
        /** --------------------------- Insert/Update Profile ---------------------------------- */
        Route::post('/insert-update-profile', [ProfileController::class, 'insertUpdateProfile']);
        Route::post('/insert-update-dp', [ProfileController::class, 'insertUpdateDp']);
        Route::post('/insert-update-cover-photo', [ProfileController::class, 'insertUpdateCoverPhoto']);
        /** --------------------------- Get Profile ---------------------------------- */
        Route::get('/get-profile/{id}', [ProfileController::class, 'getEmployeeDetails']);
        Route::get('/check-profile-completion/{id}', [ProfileController::class, 'checkProfileCompletion']);

    /** ----------------------------- APPLICATIONS -------------------------------------------*/
        /** --------------------------- Get SLA ---------------------------------- */
        Route::get('/get-sla-applications', [SLAController::class, 'getApplicationSLA']);
        Route::get('/download-sla-zip', [SLAController::class, 'downloadZip']);
        Route::get('/check-sla-status/{id}', [SLAController::class, 'checkApplicationStatus']);

        /** --------------------------- Get ECard ---------------------------------- */
        Route::get('/get-ecard-applications', [ECardController::class, 'getApplicationECard']);
        Route::get('/download-ecard-zip', [ECardController::class, 'downloadZip']);
        Route::get('/check-ecard-status/{id}', [ECardController::class, 'checkApplicationStatus']);

    /** --------------------------- Generate SLA ---------------------------------- */
    Route::post('/generate-sla', [PdfController::class, 'generateSLA']);
    /** --------------------------- Generate ECARD ---------------------------------- */
    Route::post('/generate-ecard', [PdfController::class, 'generateECard']);
});
