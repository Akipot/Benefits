<?php

namespace App\Http\Requests\Auth;

use App\Helpers\MyHelper;
use App\Models\User;
use App\Models\UserDetails;
use App\Models\Common;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // 'email' => ['required', 'string', 'email'],
            // 'password' => ['required', 'string'],
            'id' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (app()->environment('production')) {
            $decryptedId = MyHelper::decrypt($this->input('id'));
        } elseif (MyHelper::decrypt($this->input('id'))) {
            $decryptedId = MyHelper::decrypt($this->input('id'));
        } else {
            $decryptedId = $this->input('id');
        }
        $userId = User::where('Emp_ID', $decryptedId)->first()->Usr_ID;

        if (!Auth::loginUsingId($userId)) {
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'id' => trans('auth.failed'),
            ]);
        }

        // $userDetails = UserService::getUserDetails($decryptedId);
       // $userDetails = UserDetails::getUserDetails($decryptedId);
        $userDetailsArr = UserDetails::getUserDetails([0, '', 0, $decryptedId]);


        $userDetails = $userDetailsArr[0] ?? null;

        if (!$userDetails) {
            // Handle the error, e.g. throw exception or return
            throw ValidationException::withMessages([
                'id' => 'User details not found.',
            ]);
        }
        // dd($userDetails);

        // Get user access
        $data = [
            'moduleRoleID' => 0,
            'appID' => env('APP_ID'),
            'moduleID' => 0,
            'roleID' => $userDetails->Role_ID
        ];

        $userAccess = Common::getUserModuleRole($data);
        $sessionAccess = [];
        foreach ($userAccess as $access) {
            $sessionAccess[] = [
                'Module_ID' => $access->Module_ID,
                'Action_ID' => $access->Action_ID,
                'ActionName' => $access->ActionName
            ];
        }


        // Store all session data
        Session::put([
            'UserAccess' => $sessionAccess,
            // 'Employee_ID' => MyHelper::encrypt($userDetails->Usr_ID),
            'Employee_ID' => MyHelper::encrypt($userDetails->Emp_ID),
            'EmployeeNo' => MyHelper::encrypt($userDetails->EmployeeNo),
            'FullName' => MyHelper::encrypt($userDetails->empl_name),
            'LastName' => MyHelper::encrypt($userDetails->LastName),
            'FirstName' => MyHelper::encrypt($userDetails->FirstName),
            'MiddleName' => MyHelper::encrypt($userDetails->MiddleName),
            'Role_ID' => MyHelper::encrypt($userDetails->Role_ID),
            'Department_ID' => MyHelper::encrypt($userDetails->Department_ID),
            'Department' => MyHelper::encrypt($userDetails->Department),
            'Email' => MyHelper::encrypt($userDetails->Email),
            'Location_ID' => MyHelper::encrypt($userDetails->Location_ID),
            'Location' => MyHelper::encrypt($userDetails->Location),
            'LocationCode' => MyHelper::encrypt($userDetails->LocationCode),
            'Position' => MyHelper::encrypt($userDetails->Position),
            'MobileNumber' => MyHelper::encrypt($userDetails->MobileNumber),
            'PositionLevel_ID' => MyHelper::encrypt($userDetails->PositionLevel_ID),
            // 'PositionLevel' => MyHelper::encrypt($userDetails->PositionLevel),
            // 'PositionCode' => MyHelper::encrypt($userDetails->PositionCode),
            // 'PositionLevelCode' => MyHelper::encrypt($userDetails->PositionLevelCode),
            // 'Applicant_ID' => MyHelper::encrypt($userDetails->Applicant_ID),
            // 'EmpStatus_ID' => MyHelper::encrypt($userDetails->EmpStatus_ID),
            // 'Company_ID' => MyHelper::encrypt($userDetails->Company_ID),
            'CivilStatus_ID' => MyHelper::encrypt($userDetails->CivilStatus_ID),
            // 'Birthdate' => MyHelper::encrypt($userDetails->Birthdate),
            'Email' => MyHelper::encrypt($userDetails->Email),
            'isVerifiedEmail' => MyHelper::encrypt($userDetails->isVerifiedEmail),
            'SuperiorEmp_ID' => MyHelper::encrypt($userDetails->SuperiorEmp_ID),
            'SuperiorFullName' => MyHelper::encrypt($userDetails->SuperiorFullName),
            'SuperiorEmail' => MyHelper::encrypt($userDetails->SuperiorEmail),
            'FullName' => MyHelper::encrypt($userDetails->empl_name),
            // 'ScheduleType_ID' => MyHelper::encrypt($userDetails->ScheduleType_ID),
        ]);
        // dd(Session::get('FullName'));
        // dd(session()->all());
        // dd(MyHelper::decrypt(Session::get('FullName')));
        Session::save();
        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')) . '|' . $this->ip());
    }
}
