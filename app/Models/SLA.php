<?php

namespace App\Models;

use App\Helpers\MyHelper;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class SLA extends Model
{
    public static function getApplicationSLA($data)
    {
        $result = DB::select('[sp_ApplicationSLA_Get] ' . MyHelper::generateQM($data), $data);
        return $result;
    }

    public static function insertApplicationSLA($data)
    {
        $result = DB::select('[sp_ApplicationSLA_Insert] ' . MyHelper::generateQM($data), $data);
        return $result;
    }

    public static function generateSLA($data)
    {
        $result = DB::select('[sp_GenerateSLA_UpdateGet] ' . MyHelper::generateQM($data), $data);
        return $result;
    }
}
