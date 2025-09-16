<?php

namespace App\Models;

use App\Helpers\MyHelper;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class ECard extends Model
{
    public static function getApplicationECard($data)
    {
        $result = DB::select('[sp_ApplicationECard_Get] ' . MyHelper::generateQM($data), $data);
        return $result;
    }

    public static function insertApplicationEcard($data)
    {
        $result = DB::select('[sp_ApplicationECard_Insert] ' . MyHelper::generateQM($data), $data);
        return $result;
    }

    public static function generateECard($data)
    {
        $result = DB::select('[sp_GenerateECard_UpdateGet] ' . MyHelper::generateQM($data), $data);
        return $result;
    }
}
