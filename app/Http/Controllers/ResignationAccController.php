<?php

namespace App\Http\Controllers;

use App\Models\EmpRes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ResignationAccController extends Controller
{
     public function getEmpResDTJson(Request $request)
    {
        if (Session::get('Employee_ID') == '') {
            return response()->json([
                'success' => false,
                'message' => 'No Employee_ID in session.'
            ], 401);
        }
    
        $user = Auth::user();
        $EmpResParam = [
            0,
            $user->Usr_ID,
        ];

        $EmpResult = EmpRes::getMyResignationAcc($EmpResParam);
        return response()->json($EmpResult);
    }
    public function viewHistory($EmpRes_ID)
    {
        $user = Auth::user();
        $EmpResParam = [
            $EmpRes_ID,
            $user->Usr_ID,
        ];
        // dd($EmpResParam);

        $EmpResult = EmpRes::getMyResignationAcc($EmpResParam);
        return response()->json($EmpResult);
    }
    public function updateResignationAccept (Request $request)
    {
        // dd($request->all());
        $user = Auth::user();
        $EmpResParam = [
            $request->EmpRes_ID,
            $request->ResCategory_ID,
            $user->Usr_ID,
        ];

        $resEmpRes = EmpRes::updateEmpResAccept($EmpResParam);
        $num = $resEmpRes[0]->RETURN;
        $msg = $resEmpRes[0]->MESSAGE;
        
         if (count($resEmpRes) > 0):
            if ($resEmpRes[0]->RETURN > 0):
                $email = new EmailController;
                $email->emailComponent($request->EmpRes_ID, 'accepted');
            endif;
        else:
            return response()->json(array('RETURN' => -1, 'MESSAGE' => 'Failed to Accept.'), 200);
        endif;


        $result = array('num' => $num, 'msg' => $msg);
        return response()->json($result, 200);
    }

    public function updateResignationReject(Request $request)
    {
        $user = Auth::user();
        $EmpResParam = [
            $request->EmpRes_ID,
            $request->Remarks,
            $user->Usr_ID,
        ];

        $resEmpRes = EmpRes::updateEmpResReject($EmpResParam);
        $num = $resEmpRes[0]->RETURN;
        $msg = $resEmpRes[0]->MESSAGE;
        if (count($resEmpRes) > 0):
            if ($resEmpRes[0]->RETURN > 0):
            $email = new EmailController;
            $email->emailComponent($request->EmpRes_ID, 'reject');
            endif;
        else:
            return response()->json(array('RETURN' => -1, 'MESSAGE' => 'Failed to Reject.'), 200);
        endif;


        $result = array('num' => $num, 'msg' => $msg);
        return response()->json($result, 200);
    }

    public function getCategoryList()
    {
        $EmpResult = EmpRes::getCategoryList();
        return response()->json($EmpResult);
    }
}
