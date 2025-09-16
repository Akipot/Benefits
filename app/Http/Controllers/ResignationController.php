<?php

namespace App\Http\Controllers;

use App\Models\EmpRes;
use App\Helpers\MyHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ResignationController extends Controller
{
    public function getEmpResDTJson(Request $request)
    {
        if (Myhelper::decrypt(Session::get('Employee_ID')) == ''):
            return  redirect(env('MYHUB_URL'));
        endif;
        $user = Auth::user();

        $EmpResParam = [
            $user->Usr_ID,
            0,
        ];
        return response()->json(EmpRes::getMyResignation($EmpResParam));
    }
    public function insertResignation(Request $request)
    {
     
        $user = Auth::user();
       
        if (Myhelper::decrypt(Session::get('Employee_ID')) == ''):
            return response()->json(['num' => -1, 'msg' => 'Session Expired.']);
            return redirect(env('MYHUB_URL'));
        endif;

            /** ------------ Checking for Resignation File Name | File Size ----------- */
        if ($request->hasFile('ResignationFileName') == '' || $request->hasFile('ResignationFileName') == null) 
        {
            return response()->json(array(['num' => -1, 'msg' => 'Failed to upload image.']), 200);
        }
        if (!$request->hasFile('ResignationFileName') || $request->file('ResignationFileName')->getSize() <= 0) 
        {
            return response()->json(array(['num' => -1, 'msg' => 'Failed to upload image.']), 200);
        }


        $ResignationFileName = $request->file('ResignationFileName');
        $filenameWithExt = $ResignationFileName->getClientOriginalName();


        $EmpResParam = [
            $user->Usr_ID,
            $filenameWithExt,
            $request->EffectiveDate,
            $request->MyHubEffectiveDate,
            $request->PersonalEmail,
            $request->Reason,
            Myhelper::decrypt(Session::get('Location_ID')),
            $user->Usr_ID,
        ];

        $resEmpRes = EmpRes::insertEmpRest($EmpResParam);
        $num = $resEmpRes[0]->RETURN;
        $msg = $resEmpRes[0]->MESSAGE;
        if (count($resEmpRes) > 0):
            if ($resEmpRes[0]->RETURN > 0):
                $filenameWithExt = '';
                $ResignationFileName = $request->file('ResignationFileName');
                $filenameWithExt = $ResignationFileName->getClientOriginalName();


                $folderPath = "uploads/resignationfile/{$resEmpRes[0]->EmpRes_ID}";
                $fullPath = $folderPath . '/' . $filenameWithExt;

                if (!Storage::disk('private')->exists($folderPath)) {
                    Storage::disk('private')->makeDirectory($folderPath);
                }

                $attachment = file_get_contents($ResignationFileName->getRealPath());

                if ($attachment !== false) {
                    Storage::disk('private')->put($fullPath, $attachment);
                }

            $email = new EmailController;
            $email->emailComponent($resEmpRes[0]->RETURN, 'insert');
            endif;
        else:
            return response()->json(array('RETURN' => -1, 'MESSAGE' => 'Failed to save.'), 200);
        endif;
        $result = array('num' => $num, 'msg' => $msg);
        return response()->json($result, 200);

        // return response()->json($resEmpRes[0], 200);
    }
    public function updateResignation(Request $request)
    {
        $user = Auth::user();
        if (Myhelper::decrypt(Session::get('Employee_ID')) == ''):
            return response()->json(['num' => -1, 'msg' => 'Session Expired.']);
            return redirect(env('MYHUB_URL'));
        endif;
        $filenameWithExt = null;
        /** ------------ Checking for Resignation File Name | File Size ----------- */
        if ($request->isChange > 0) {
            if (!$request->hasFile('ResignationFileName') || $request->file('ResignationFileName')->getSize() <= 0) {
                return response()->json(['RETURN' => -1, 'MESSAGE' => 'Failed to save.'], 200);
            }

            $ResignationFileName = $request->file('ResignationFileName');
            $filenameWithExt = $ResignationFileName->getClientOriginalName();
        }



        $EmpResParam = [
            $request->EmpRes_ID,
            $user->Usr_ID,
            $filenameWithExt,
            $request->EffectiveDate,
            $request->MyHubEffectiveDate,
            $request->PersonalEmail,
            $request->Reason,
            $request->isChange,
            $user->Usr_ID,
        ];
        // dd($EmpResParam);
        $resEmpRes = EmpRes::updateEmpRest($EmpResParam);
        $num = $resEmpRes[0]->RETURN;
        $msg = $resEmpRes[0]->MESSAGE;

        if (count($resEmpRes) > 0):
            if ($resEmpRes[0]->RETURN > 0):
                /** ------------------- If ResignationFileName is being Changed Upload to Storage --------------- */
                if ($request->isChange > 0):
                    $filenameWithExt = '';
                    $ResignationFileName = $request->file('ResignationFileName');
                    $filenameWithExt = $ResignationFileName->getClientOriginalName();


                    $folderPath = "uploads/resignationfile/{$request->EmpRes_ID}";
                    $fullPath = $folderPath . '/' . $filenameWithExt;

                    if (!Storage::disk('private')->exists($folderPath)) {
                        Storage::disk('private')->makeDirectory($folderPath);
                    }

                    $attachment = file_get_contents($ResignationFileName->getRealPath());

                    if ($attachment !== false) {
                        Storage::disk('private')->put($fullPath, $attachment);
                    }
                endif;


            $email = new EmailController;
            $email->emailComponent($request->EmpRes_ID, 'update');


            endif;
        else:
            return response()->json(array('RETURN' => -1, 'MESSAGE' => 'Failed to save.'), 200);
        endif;
        $result = array('num' => $num, 'msg' => $msg);
        return response()->json($result, 200);
    }

    public function withdrawResignation(Request $request)
    {
        $user = Auth::user();
        if (Myhelper::decrypt(Session::get('Employee_ID')) == ''):
            return response()->json(['num' => -1, 'msg' => 'Session Expired.']);
            return redirect(env('MYHUB_URL'));
        endif;
        $EmpResParam = [
            $request->EmpRes_ID,
            $request->WithdrawReason,
            $user->Usr_ID,
        ];

        $resEmpRes = EmpRes::withdrawRest($EmpResParam);
        $num = $resEmpRes[0]->RETURN;
        $msg = $resEmpRes[0]->MESSAGE;
        // $email = new EmailController;
        // $email->emailComponent($request->EmpRes_ID 'withdraw');
        $result = array('num' => $num, 'msg' => $msg);
        return response()->json($result, 200);
    }
    public function viewResignationLetter($EmpRes_ID, $ResignationFileName)
    {
        try {
            $decodedFilename = urldecode($ResignationFileName);
            $basePath = "uploads/resignationfile/{$EmpRes_ID}";
            $fullPath = "{$basePath}/{$decodedFilename}";

            $files = Storage::disk('private')->files($basePath);

            if (!Storage::disk('private')->exists($fullPath)) {
                return response()->json([
                    'error' => 'File not found',
                    'requested_file' => $decodedFilename,
                    'available_files' => $files,
                    'note' => 'Please ensure the file has been uploaded correctly and the filename matches exactly.'
                ], 404);
            }

            return response()->download(Storage::disk('private')->path($fullPath));
        } catch (\Exception $e) {
            Log::error('File download error', [
                'error' => $e->getMessage(),
                'ResignationFileName' => $ResignationFileName,
                'EmpRes_ID' => $EmpRes_ID
            ]);

            return response()->json([
                'error' => 'An error occurred while fetching the file',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    /** Get the File size */
    public function getResignationFileSize($EmpRes_ID, $ResignationFileName)
    {
        $decodedFilename = urldecode($ResignationFileName);
        $basePath = "uploads/resignationfile/{$EmpRes_ID}";
        $fullPath = "{$basePath}/{$decodedFilename}";

        if (!Storage::disk('private')->exists($fullPath)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        $size = Storage::disk('private')->size($fullPath);

        return response()->json([
            'size' => $size,
            'name' => $decodedFilename,
            'uri' => route('resignation.viewResignationLetter', [$EmpRes_ID, $ResignationFileName]),
        ]);
    }

    public function getEffectivityDate($EffectiveDate)
    {
        // dd($EffectiveDate);

        $user = Auth::user();
        if (Myhelper::decrypt(Session::get('Employee_ID')) == ''):
            return response()->json(['num' => -1, 'msg' => 'Session Expired.']);
            return redirect(env('MYHUB_URL'));
        endif;
        $params = [
            $EffectiveDate,
            $user->Usr_ID,
        ];

         $result = EmpRes::getTransEffectiveDate($params);

        return response()->json($result, 200);
    }
}
