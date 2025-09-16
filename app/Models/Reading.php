<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Helpers\MyHelper;
use Illuminate\Support\Facades\DB;


class Reading extends Model
{
    public static function getInitialReading($data)
    {
        return DB::select('[sp_ReadingIntial_Get] ' . MyHelper::generateQM($data), $data);
    }

    public static function insertReading($data)
    {
        return DB::select('[sp_ReadingEnding_Insert] ' . MyHelper::generateQM($data), $data);
    }

    public static function getReading($data)
    {
        return DB::select('[sp_Readings_Get] ' . MyHelper::generateQM($data), $data);
    }
    
}
