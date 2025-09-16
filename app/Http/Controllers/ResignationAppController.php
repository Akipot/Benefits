<?php

namespace App\Http\Controllers;

use App\Helpers\MyHelper;
use App\Models\EmpRes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ResignationAppController extends Controller
{
    public function getEmpResDTJson(Request $request)
    {
        if (MyHelper::decrypt(Session::get('Employee_ID')) == '') {
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

        $EmpResult = EmpRes::getMyResignationApp($EmpResParam);
        return response()->json($EmpResult);
    }
   public function viewHistory($EmpRes_ID)
    {
        $user = Auth::user();
        $EmpResParam = [
           $EmpRes_ID,
            $user->Usr_ID,
        ];

        $EmpResult = EmpRes::getMyResignationApp($EmpResParam);
        return response()->json($EmpResult);
    }

    public function updateResignationApprove(Request $request)
    {
        $user = Auth::user();
        $EmpResParam = [
            $request->EmpRes_ID,
            $user->Usr_ID,
        ];
        $resEmpRes = EmpRes::updateEmpResApprove($EmpResParam);
        $num = $resEmpRes[0]->RETURN;
        $msg = $resEmpRes[0]->MESSAGE;
       

         if (count($resEmpRes) > 0):
            if ($resEmpRes[0]->RETURN > 0):
                $email = new EmailController;
                $email->emailComponent($request->EmpRes_ID, 'acknowledge');
            endif;
        else:
            return response()->json(array('RETURN' => -1, 'MESSAGE' => 'Failed to acknowledge.'), 200);
        endif;
        $result = array('num' => $num, 'msg' => $msg);
        return response()->json($result, 200);
    }

    public function updateResignationDecline(Request $request)
    {
        $user = Auth::user();
        $EmpResParam = [
            $request->EmpRes_ID,
            $request->Remarks,
            $user->Usr_ID,
        ];

         $resEmpRes = EmpRes::updateEmpResDecline($EmpResParam);
        $num = $resEmpRes[0]->RETURN;
        $msg = $resEmpRes[0]->MESSAGE;

         if (count($resEmpRes) > 0):
            if ($resEmpRes[0]->RETURN > 0):
                $email = new EmailController;
                $email->emailComponent($request->EmpRes_ID, 'revision');
            endif;
        else:
            return response()->json(array('RETURN' => -1, 'MESSAGE' => 'Failed to acknowledge.'), 200);
        endif;

        
        $result = array('num' => $num, 'msg' => $msg);
        return response()->json($result, 200);

    }
}
