<?php

namespace App\Http\Controllers;

use App\Helpers\MyHelper;
use Illuminate\Http\Request;
use App\Models\Common;
use App\Models\Profile;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PageController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $Employee_ID = $user->Emp_ID;

        $param = [
            $Employee_ID
        ];


        $profile = Profile::getProfileCompletion($param);

        if($profile){
            return Inertia::render('home');
        } else {
            Profile::insertUpdateProfile($param);
            return Inertia::render('home');
        }

    }

    /** ------------------ Profile --------------- */
    public function profile()
    {
        return Inertia::render('profile/index');
    }
    
    /** ------------------ Form > SLA --------------- */
    public function sla()
    {
        return Inertia::render('forms/sla/index');
    }
    /** ------------------ Form > ECard --------------- */
    public function ecard()
    {
        return Inertia::render('forms/ecard/index');
    }

    /** ------------------ User Profile --------------- */
    public function employeeProfile($id)
    {        
        $data = Common::getEmployeeDetails([$id]);

        return Inertia::render('profile/user-profile/index', [
            'employee' => $data[0] ?? null, 
            'id' => $id,
        ]);
    }

    /** ------------------ Applications > SLA --------------- */
    public function slaApplications()
    {
        return Inertia::render('applications/sla/index');
    }
    /** ------------------ Applications > ECard --------------- */
    public function ecardApplications()
    {
        return Inertia::render('applications/ecard/index');
    }


}
