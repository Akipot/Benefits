<?php

namespace App\Models;

use App\Helpers\MyHelper;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class Common extends Model
{
    public static function getUserModuleRole($data)
    {
        $moduleRoleID     = $data['moduleRoleID'];
        $appID            = $data['appID'];
        $moduleID         = $data['moduleID'];
        $roleID           = $data['roleID'];

        $result = DB::select('UserMgt.dbo.sp_User_ModuleRole_Get ?,?,?,?', [$moduleRoleID, $appID, $moduleID, $roleID]);
        return $result;
    }

    public static function getStores($data)
    {
        $result = DB::select('[sp_allStores_Get] ' . MyHelper::generateQM($data), $data);
        return $result;
    }

    public static function searchEmployee($data)
    {
        $result = DB::select('[sp_SearchEmployee_Get] ' . MyHelper::generateQM($data), $data);
        return $result;
    }

    public static function getEmployeeDetails($data)
    {
        $result = DB::select('[sp_EmployeeDetails_Get] ' . MyHelper::generateQM($data), $data);
        return $result;
    }

    public static function getAddressOptions($data)
    {
        $result = DB::select('[sp_AddressOptions_Get] ' . MyHelper::generateQM($data), $data);
        return $result;
    }

    public static function getCutoff($data)
    {
        $result = DB::select('[sp_Cutoff_Get] ' . MyHelper::generateQM($data), $data);
        return $result;
    }

    public static function getPMSignature()
    {
        $result = DB::select('[sp_PMSignature_Get] ');
        return $result;
    }

}
