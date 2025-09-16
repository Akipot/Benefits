<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Helpers\MyHelper;
use Illuminate\Support\Facades\DB;


class EmpRes extends Model
{
    public static function getMyResignation($data)
    {
        return DB::select('[sp_MyResignation_Get] ' . MyHelper::generateQM($data), $data);
    }
    public static function insertEmpRest($data)
    {
        return DB::select('[sp_MyResignation_Insert] ' . MyHelper::generateQM($data), $data);
    }
    public static function updateEmpRest($data)
    {
        return DB::select('[sp_MyResignation_Update] ' . MyHelper::generateQM($data), $data);
    }
    public static function withdrawRest($data)
    {
        return DB::select('[sp_MyResignation_Withdraw] ' . MyHelper::generateQM($data), $data);
    }

    public static function getTransEffectiveDate($data)
    {
         return DB::select('[sp_Res_EffectiveDate_Get] ' . MyHelper::generateQM($data), $data);
    }

    /** -------------------- Resignation Approval  */
    public static function getMyResignationApp($data)
    {
        return DB::select('[sp_ResignationApp_Get] ' . MyHelper::generateQM($data), $data);
    }
    public static function updateEmpResApprove($data)
    {
        return DB::select('[sp_ResignationApp_Approve] ' . MyHelper::generateQM($data), $data);
    }
    public static function updateEmpResDecline($data)
    {
        return DB::select('[sp_ResignationApp_Decline] ' . MyHelper::generateQM($data), $data);
    }

    /** -------------------- Resignation Acceptance  */
    public static function getMyResignationAcc($data)
    {
        return DB::select('[sp_ResignationAcc_Get] ' . MyHelper::generateQM($data), $data);
    }
    public static function updateEmpResAccept($data)
    {
        return DB::select('[sp_ResignationApp_Accepted] ' . MyHelper::generateQM($data), $data);
    }
    public static function updateEmpResReject($data)
    {
         return DB::select('[sp_ResignationApp_Reject] ' . MyHelper::generateQM($data), $data);
    }
    public static function getCategoryList()
    {
        return DB::select('[sp_CategoryList_Get]');
    }

    public static function getMyResignationReport($data)
    {
         return DB::select('[sp_ResignationReport_Get] ' . MyHelper::generateQM($data), $data);
    }
    
}
