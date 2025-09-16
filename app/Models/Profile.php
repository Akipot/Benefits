<?php

namespace App\Models;

use App\Helpers\MyHelper;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class Profile extends Model
{
    public static function insertUpdateProfile($data)
    {
        $result = DB::select('[sp_Profile_InsertUpdate] ' . MyHelper::generateQM($data), $data);
        return $result;
    }

    public static function getProfile($data)
    {
        $result = DB::select('[sp_Profile_Get] ' . MyHelper::generateQM($data), $data);
        return $result;
    }

    public static function updateEmployeeDp($data)
    {
        $result = DB::select('[sp_EmployeeDP_Update] ' . MyHelper::generateQM($data), $data);
        return $result;
    }

    public static function updateEmployeeCoverPhoto($data)
    {
        $result = DB::select('[sp_EmployeeCoverPhoto_Update] ' . MyHelper::generateQM($data), $data);
        return $result;
    }

    public static function getProfileCompletion($data)
    {
        $result = DB::select('[sp_ProfileCompletion_Get] ' . MyHelper::generateQM($data), $data);
        return $result;
    }
}
