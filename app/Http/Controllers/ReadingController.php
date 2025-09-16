<?php

namespace App\Http\Controllers;

use App\Models\Reading;
use App\Helpers\MyHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ReadingController extends Controller
{
    public function getInitialReading($id)
    {
        $data = Reading::getInitialReading([$id]);
        return response()->json($data);
    }

    public function insertReading(Request $request)
    {
        $user = Auth::user();
        
        if (Myhelper::decrypt(Session::get('Employee_ID')) == ''):
            return response()->json(['num' => -1, 'msg' => 'Session Expired.']);
            return redirect(env('MYHUB_URL'));
        endif;
        
        $readingDate = $request->input('readingDate');
        $readingLocation = $request->input('readingLocation');
        $initial = $request->input('initial');
        $ending = $request->input('ending');

        $params = [
            $readingDate,
            $readingLocation,
            $initial,
            $ending,
            $user->Usr_ID,
        ];

        $insert = Reading::insertReading($params);
        $num = $insert[0]->RETURN;
        $msg = $insert[0]->MESSAGE;


        $result = array('num' => $num, 'msg' => $msg);
        return response()->json($result, 200);
    }

    public function getReading()
    {
        $locationId = Myhelper::decrypt(Session::get('Location_ID'));

        $param = [
            0,
            $locationId
        ];

        $data = Reading::getReading($param);
        return response()->json($data);
    }

    public function getReadingFilter(Request $request)
    {
        $locationId = Myhelper::decrypt(Session::get('Location_ID'));
        $readingFrom = $request->input('ReadingFrom');
        $readingTo = $request->input('ReadingTo');

        $param = [
            0,
            $locationId,
            $readingFrom,
            $readingTo
        ];

        $data = Reading::getReading($param);
        return response()->json($data);
    }
}
