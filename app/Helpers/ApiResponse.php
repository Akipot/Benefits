<?php

namespace App\Helpers;

class ApiResponse
{
    public static function success($data, $message = null)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
    }

    public static function error($message, ?int $statusCode = 400, $info = null)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'info' => $info
        ], $statusCode);
    }

    public static function validationError($errors)
    {
        return response()->json([
            'success' => false,
            'message' => 'Validation errors',
            'errors' => $errors
        ], 422);
    }
}
