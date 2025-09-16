<?php

namespace App\Http\Controllers;

use App\Models\Contracts;
use App\Models\Common;
use App\Helpers\MyHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CommonController extends Controller
{
    public function getStores()
    {
        $data = Common::getStores([0]);
        
        return response()->json($data);
    }
    
    public function searchEmployee(Request $request)
    {
        $user = Auth::user();
        $Employee_ID = $user->Emp_ID;

        $SearchKey = $request->query('key', '');

        $param = [
            $SearchKey,
            $Employee_ID
        ];

        $data = Common::SearchEmployee($param);
        return response()->json($data);
    }

    public function getAddressOptions(Request $request)
    {
        $param = [
            $request->query('regionId') ?: null,
            $request->query('provinceId') ?: null,
            $request->query('municipalId') ?: null,
            $request->query('barangayId') ?: null,
        ];

        $data = Common::getAddressOptions($param);
        return response()->json($data);
    }

}
