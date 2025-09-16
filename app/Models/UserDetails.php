<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Helpers\MyHelper;

class UserDetails extends Model
{
    /**
     * Get User Details
     */
    // public static function getUserDetails($data)
    // {
    //     $result = DB::select('UserMgt_prd.dbo.sp_User_Get ' . MyHelper::generateQM($data), $data);
    //     return $result;
    // }

    // public static function getUserDetails(int | string $userId)
    // {
    //     // dd($userId);
    //     // $user = DB::connection('employee_db')->select('UserMgt_prd.dbo.sp_User_Get ?', [$userId])[0];
    //     $user = DB::select('UserMgt_prd.dbo.sp_User_Get ?', [$userId])[0];
    //     // $user = DB::connection('employee_db')->select('sp_Emp_Get ?', [$userId])[0];
    //     // dump($user);
    //     return $user;
    // }

    public static function getUserDetails($data)
    {
        $result = DB::select('UserMgt_prd.dbo.sp_User_Get ' . MyHelper::generateQM($data), $data);
        // dd($result);
        return $result;
    }
}
