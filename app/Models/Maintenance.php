<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Helpers\MyHelper;
use Illuminate\Support\Facades\DB;


class Maintenance extends Model
{
    public static function getEquipmentType($data)
    {
        return DB::select('[sp_MtnceEqpType_Get] ' . MyHelper::generateQM($data), $data);
    }

    public static function insertEquipmentType($data)
    {
        $result = DB::select('[sp_MtnceEqpType_Insert] ' . MyHelper::generateQM($data), $data);
        return $result;
    }

    public static function updateEquipmentType($data)
    {
        $result = DB::select('[sp_MtnceEqpType_Update] ' . MyHelper::generateQM($data), $data);
        return $result;
    }

    public static function getEquipmentBrand($data)
    {
        return DB::select('[sp_MtnceEqpBrand_Get] ' . MyHelper::generateQM($data), $data);
    }

    public static function insertBrand($data)
    {
        return DB::select('[sp_MtnceEqpBrand_Insert] ' . MyHelper::generateQM($data), $data);
    }

    public static function updateBrand($data)
    {
        return DB::select('[sp_MtnceEqpBrand_Update] ' . MyHelper::generateQM($data), $data);
    }
    
    public static function getMasterEquipment($data)
    {
        return DB::select('[sp_MtnceMasterEquipment_Get] ' . MyHelper::generateQM($data), $data);
    }

    public static function getEquipmentTypeOptions($data)
    {
        return DB::select('[sp_OptionsEquipmentType_Get] ' . MyHelper::generateQM($data), $data);
    }

    public static function getEquipmentBrandOptions($data)
    {
        return DB::select('[sp_OptionsEquipmentBrand_Get] ' . MyHelper::generateQM($data), $data);
    }

    public static function insertMasterEquipment($data)
    {
        return DB::select('[sp_MtnceMasterEquipment_Insert] ' . MyHelper::generateQM($data), $data);
    }

    public static function updateMasterEquipment($data)
    {
        return DB::select('[sp_MtnceMasterEquipment_Update] ' . MyHelper::generateQM($data), $data);
    }

}
