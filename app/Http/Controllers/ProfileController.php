<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Models\Common;
use App\Helpers\MyHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;


class ProfileController extends Controller
{
    public function insertUpdateProfile(Request $request)
    {
        $userId = MyHelper::decrypt(Session::get('Employee_ID'));
        $param = [
            $userId,
            $request->tin,
            $request->hdmf,
            $request->sss,
            $request->philhealth,
            $request->region_id,
            $request->province_id,
            $request->city_id,
            $request->barangay_id,
            $request->houseNo,
            $request->street,
            $request->subdivision,
            $request->zipCode,
        ];
        $update = Profile::insertUpdateProfile($param);

        $num = $update[0]->RETURN;
        $msg = $update[0]->MESSAGE;

        $result = array('num' => $num, 'msg' => $msg);
        return $result;
    }


    public function getEmployeeDetails($id)
    {        
        $data = Common::getEmployeeDetails([$id]);

        if (empty($data)) {
            return response()->json([]); 
        }

        $row = (array) $data[0];

        return response()->json($row);
    }

    public function insertUpdateDp(Request $request)
    {
        // Validate the uploaded file
        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = Auth::user();
        $Employee_ID = $user->Emp_ID;

        $file = $request->file('profile_picture');
        $fileName = $file->getClientOriginalName(); 
        $folder = "ProfilePictures/{$Employee_ID}";

        $path = $file->storeAs($folder, $fileName, 'public');

        $url = Storage::url($path);

        $param = [
            $Employee_ID,
            $fileName,
            $url,
        ];

        $update = Profile::updateEmployeeDp($param);

        $response = $update[0] ?? null;
    
        return response()->json([
            'success' => true,
            'employee_id' => $Employee_ID,
            'path' => $url, 
            'picture' => $response->FILENAME,
            'message' => $response->MESSAGE,
        ]);
    }

    public function insertUpdateCoverPhoto(Request $request)
    {
        // Validate the uploaded file
        $request->validate([
            'cover_photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = Auth::user();
        $Employee_ID = $user->Emp_ID;

        $file = $request->file('cover_photo');
        $fileName = $file->getClientOriginalName(); 
        $folder = "CoverPhotos/{$Employee_ID}";

        $path = $file->storeAs($folder, $fileName, 'public');

        $url = Storage::url($path);

        $param = [
            $Employee_ID,
            $fileName,
            $url,
        ];

        $update = Profile::updateEmployeeCoverPhoto($param);

        $response = $update[0] ?? null;
    
        return response()->json([
            'success' => true,
            'employee_id' => $Employee_ID,
            'path' => $url, 
            'picture' => $response->FILENAME,
            'message' => $response->MESSAGE,
        ]);
    }

    public function checkProfileCompletion($id)
    {
        $result = Profile::getProfileCompletion([$id]); 

        $isComplete = (is_array($result) && isset($result[0]->isComplete))
            ? (bool)$result[0]->isComplete 
            : false;

        return response()->json([
            'complete' => $isComplete,
        ]);
    }

}