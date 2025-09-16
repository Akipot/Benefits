<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use App\Helpers\MyHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MaintenanceController extends Controller
{
    public function getEquipmentType()
    {
        $param = [
            0
        ];

        $data = Maintenance::getEquipmentType($param);
        return response()->json($data);
    }

    public function insertEquipmentType(Request $request)
    {
        $user = Auth::user();

        if (Myhelper::decrypt(Session::get('Employee_ID')) == ''):
            return response()->json(['num' => -1, 'msg' => 'Session Expired.']);
            return redirect(env('MYHUB_URL'));
        endif;

        $param = [
            $user->Usr_ID,
            $request->newEquipmentType,
        ];
        $save = Maintenance::insertEquipmentType($param);

        $num = $save[0]->RETURN;
        $msg = $save[0]->MESSAGE;

        $result = array('num' => $num, 'msg' => $msg);
        return $result;
    }

    public function updateEquipmentType(Request $request)
    {
        $user = Auth::user();

        if (Myhelper::decrypt(Session::get('Employee_ID')) == ''):
            return response()->json(['num' => -1, 'msg' => 'Session Expired.']);
            return redirect(env('MYHUB_URL'));
        endif;

        $param = [
            $user->Usr_ID,
            $request->editEquipmentTypeID,
            $request->editEquipmentType,
            $request->editEquipmentTypeStatus,
        ];
        $save = Maintenance::updateEquipmentType($param);

        $num = $save[0]->RETURN;
        $msg = $save[0]->MESSAGE;

        $result = array('num' => $num, 'msg' => $msg);
        return $result;
    }

    public function getEquipmentBrand()
    {
        $param = [
            0
        ];

        $data = Maintenance::getEquipmentBrand($param);
        return response()->json($data);
    }

    public function insertBrand(Request $request)
    {
        $user = Auth::user();

        if (Myhelper::decrypt(Session::get('Employee_ID')) == ''):
            return response()->json(['num' => -1, 'msg' => 'Session Expired.']);
            return redirect(env('MYHUB_URL'));
        endif;

        $param = [
            $user->Usr_ID,
            $request->newBrand,
        ];
        $save = Maintenance::insertBrand($param);

        $num = $save[0]->RETURN;
        $msg = $save[0]->MESSAGE;

        $result = array('num' => $num, 'msg' => $msg);
        return $result;
    }

    public function updateBrand(Request $request)
    {
        $user = Auth::user();

        if (Myhelper::decrypt(Session::get('Employee_ID')) == ''):
            return response()->json(['num' => -1, 'msg' => 'Session Expired.']);
            return redirect(env('MYHUB_URL'));
        endif;

        $param = [
            $user->Usr_ID,
            $request->editBrandID,
            $request->editBrand,
            $request->editBrandStatus,
        ];
        $save = Maintenance::updateBrand($param);

        $num = $save[0]->RETURN;
        $msg = $save[0]->MESSAGE;

        $result = array('num' => $num, 'msg' => $msg);
        return $result;
    }

    public function getMasterEquipment()
    {
        $param = [
            0
        ];

        $data = Maintenance::getMasterEquipment($param);
        return response()->json($data);
    }

    public function getEquipmentTypeOptions()
    {
        $param = [
            0
        ];

        $data = Maintenance::getEquipmentTypeOptions($param);
        
        return response()->json($data);
    }

    
    public function getEquipmentBrandOptions()
    {
        $param = [
            0
        ];

        $data = Maintenance::getEquipmentBrandOptions($param);
        
        return response()->json($data);
    }

    public function insertMasterEquipment(Request $request)
    {
        $user = Auth::user();

        if (Myhelper::decrypt(Session::get('Employee_ID')) == ''):
            return response()->json(['num' => -1, 'msg' => 'Session Expired.']);
            return redirect(env('MYHUB_URL'));
        endif;

        $param = [
            $user->Usr_ID,
            $request->type,
            $request->brand,
            $request->newItemDetail,
            $request->newModel,
            $request->wattage,
            $request->isCooling
        ];
        $save = Maintenance::insertMasterEquipment($param);

        $num = $save[0]->RETURN;
        $msg = $save[0]->MESSAGE;

        $result = array('num' => $num, 'msg' => $msg);
        return $result;
    }

    public function updateMasterEquipment(Request $request)
    {
        $user = Auth::user();

        if (Myhelper::decrypt(Session::get('Employee_ID')) == ''):
            return response()->json(['num' => -1, 'msg' => 'Session Expired.']);
            return redirect(env('MYHUB_URL'));
        endif;

        $param = [
            $user->Usr_ID,
            $request->editEquipmentID,
            $request->editType,
            $request->editBrand,
            $request->editItemDetail,
            $request->editModel,
            $request->editWattage,
            $request->editIsCooling,
            $request->editEquipmentStatus,
        ];
        $save = Maintenance::updateMasterEquipment($param);

        $num = $save[0]->RETURN;
        $msg = $save[0]->MESSAGE;

        $result = array('num' => $num, 'msg' => $msg);
        return $result;
    }

}
