<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EmpRes;
use App\Helpers\MyHelper;
use Redirect;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailController extends Controller
{

    public static function emailComponent($EmpRes_ID, $action)
    {
        $user = Auth::user();

        $EmpResParam = [
            0,
            $EmpRes_ID,
        ];
        $empRes = EmpRes::getMyResignation($EmpResParam);

        $data['empRes'] = $empRes;
        ini_set('max_execution_time', 360);

        $refNo       = $empRes[0]->EmpResRef;
        $filerName    = $empRes[0]->ResignationName;
        $filerEmail   = $empRes[0]->FilerEmail;
        $filerPersonalEmail = $empRes[0]->PersonalEmail;

        $approverName = '';
        $approverEmail = '';

        $nextApproverName = '';
        $nextApproverEmail = '';

        $userAppNo = 0;

        $approvers = [];

        $approvers[$empRes[0]->DepartmentHead_AppNo]['Emp_ID']     = $empRes[0]->DepartmentHead_ID;
        $approvers[$empRes[0]->DepartmentHead_AppNo]['Name']       = $empRes[0]->DepartmentHeadName;
        $approvers[$empRes[0]->DepartmentHead_AppNo]['Date']       = $empRes[0]->DepartmentHead_AppDate;
        $approvers[$empRes[0]->DepartmentHead_AppNo]['AppNo']      = $empRes[0]->DepartmentHead_AppNo;
        $approvers[$empRes[0]->DepartmentHead_AppNo]['AppLabel']   = 'Department Head';
        $approvers[$empRes[0]->DepartmentHead_AppNo]['Email']      = $empRes[0]->DepartmentHeadEmail;
        $approvers[$empRes[0]->DepartmentHead_AppNo]['Category']    = '';

        $approvers[$empRes[0]->HR_AppNo]['Emp_ID']     = $empRes[0]->HR_ID;
        $approvers[$empRes[0]->HR_AppNo]['Name']       = $empRes[0]->HRName;
        // $approvers[$empRes[0]->HR_AppNo]['AcceptDate']       = $empRes[0]->HR_AppDate;
        $approvers[$empRes[0]->HR_AppNo]['Date']      = $empRes[0]->HR_AppDate;
        $approvers[$empRes[0]->HR_AppNo]['AppNo']      = $empRes[0]->HR_AppNo;
        $approvers[$empRes[0]->HR_AppNo]['AppLabel']   = 'Branch HR';
        $approvers[$empRes[0]->HR_AppNo]['Email']      = $empRes[0]->HREmail;
        $approvers[$empRes[0]->HR_AppNo]['Category']    = $empRes[0]->ResCategory;


        if ($empRes[0]->InsertBy != $user->Usr_ID):
            switch ($user->Usr_ID):
                case $empRes[0]->DepartmentHead_ID:
                    $userAppNo = $empRes[0]->DepartmentHead_AppNo;
                    break;
                case $empRes[0]->HR_ID:
                    $userAppNo = $empRes[0]->HR_AppNo;
                    break;

            endswitch;

            switch ($userAppNo):
                case $empRes[0]->DepartmentHead_AppNo:
                    $approverName  = $empRes[0]->DepartmentHeadName;
                    $approverEmail = $empRes[0]->DepartmentHeadEmail;
                    break;
                case $empRes[0]->HR_AppNo:
                    $approverName  = $empRes[0]->HRName;
                    $approverEmail = $empRes[0]->HREmail;
                    break;
            endswitch;
        endif;
        /** ------------- userAppNo + 1 -------------------------- */
        switch ($userAppNo + 1):
            case $empRes[0]->DepartmentHead_AppNo:
                $nextApproverName   = $empRes[0]->DepartmentHeadName;
                $nextApproverEmail  = $empRes[0]->DepartmentHeadEmail;
                break;
            case $empRes[0]->HR_AppNo:
                $nextApproverName   = $empRes[0]->HRName;
                $nextApproverEmail  = $empRes[0]->HREmail;
                break;
        endswitch;

        /** ------------- Action: insert | update | approve | accepted | reject | decine -------------- */
        if ($action == 'insert'):
            //to filer
            $data['email_type']   = 'filer';
            $data['email']   = $filerEmail;
            $data['subject'] = "[HRIS] Employee Resignation Form: Created Details - $refNo";
            $data['content'] = "<p>Hi $filerName,</p><p>Your Employee Resignation Form has been successfully submitted with the following details:</p>";
            if ($data['email'] != ''):
                self::sendEmail($data);
            endif;

            //to approver
            $data['email_type']   = 'approver';
            $data['email']   = $nextApproverEmail;
            $data['subject'] = "[HRIS] Employee Resignation Form: For Approval - $refNo";
            $data['content'] = "<p>Hi $nextApproverName,</p><p>$filerName has submitted an resignation and it is awaiting your review and acknowledge. The details are as follows:</p>";
            if ($data['email'] != ''):
                self::sendEmail($data);
            endif;

        elseif ($action == 'update'):
            //to filer
            $data['email_type']   = 'filer';
            $data['email']   = $filerEmail;
            $data['subject'] = "[HRIS] Employee Resignation Form: Updated Details - $refNo";
            $data['content'] = "<p>Hi $filerName,</p><p>You have successfully updated your resignation request with the following details:</p>";
            if ($data['email'] != ''):
                self::sendEmail($data);
            endif;

            //to next approver
            $data['email_type']   = 'approver';
            $data['email']   = $nextApproverEmail;
            $data['subject'] = "[HRIS] Employee Resignation Form: Updated For Approval - $refNo";
            $data['content'] = "<p>Hi $nextApproverName,</p><p>$filerName has updated a request in resignation letter form for your review and approval. The details are as follows:</p>";
            if ($data['email'] != ''):
                self::sendEmail($data);
            endif;


        elseif ($action == 'acknowledge'):
            //to filer
            $data['email_type']   = 'filer';
            $data['email']   = $filerEmail;
            $data['subject'] = "[HRIS] Employee Resignation Form: Updated Approval Status - $refNo";
            $data['content'] = "<p>Hi $filerName,</p><p>Please see below the status of your filed request in Employee Resignation forms:</p>";
            if ($data['email'] != ''):
                self::sendEmail($data);
            endif;

            //to current approver
            $data['email_type']   = 'approver';
            $data['email']   = $approverEmail;
            $data['subject'] = "[HRIS] Employee Resignation Form: Acknowledge - $refNo";
            $data['content'] = "<p>Hi $approverName,</p><p>You Acknowledge the Employee Resignation request $refNo with the following details:</p>";
            if ($data['email'] != ''):
                self::sendEmail($data);
            endif;

            //to next approver
            $data['email_type']   = 'approver';
            $data['email']   = $nextApproverEmail;
            $data['subject'] = "[HRIS] Employee Resignation Form: For Approval - $refNo";
            $data['content'] = "<p>Hi $nextApproverName,</p><p>$filerName has submitted a request in Employee Resignation form for your review and approval. The details are as follows:</p>";
            if ($data['email'] != ''):
                self::sendEmail($data);
            endif;

        elseif ($action == 'revision'):
            //to filer
            $data['email_type']   = 'filer';
            $data['email']   = $filerEmail;
            $data['subject'] = "[HRIS] Employee Resignation Form: Updated Approval Status - $refNo";
            $data['content'] = "<p>Hi $filerName,</p><p>Please see below the status of your filed request in Employee Resignation forms:</p>";
            if ($data['email'] != ''):
                self::sendEmail($data);
            endif;

            //to current approver
            $data['email_type']   = 'approver';
            $data['email']   = $approverEmail;
            $data['subject'] = "[HRIS] Employee Resignation Form: Subject for Revision - $refNo";
            $data['content'] = "<p>Hi $approverName,</p><p>You declined the Employee Resignation request $refNo with the following details:</p>";
            if ($data['email'] != ''):
                self::sendEmail($data);
            endif;

        elseif ($action == 'accepted'):
            //to filer
            $data['email_type']   = 'filer';
            $data['subject'] = "[HRIS] Employee Resignation Form: Updated Approval Status - $refNo";
            $data['content'] = "<p>Hi $filerName,</p><p>Please see below the status of your filed request in Employee Resignation forms:</p>";

            if (!empty($filerEmail)) {
                $data['email'] = $filerEmail;
                self::sendEmail($data);
            }

            // Send to secondary (personal) email
            if (!empty($filerPersonalEmail)) {
                $data['email'] = $filerPersonalEmail;
                self::sendPersonamEmail($data);
            }

            //to current approver
            $data['email_type']   = 'approver';
            $data['email']   = $approverEmail;
            $data['subject'] = "[HRIS] Employee Resignation Form: Updated Approval Status  - $refNo";
            $data['content'] = "<p>Hi $approverName,</p><p>You accept the Employee Resignation request $refNo with the following details:</p>";
            if ($data['email'] != ''):
                self::sendEmail($data);
            endif;

        elseif ($action == 'reject'):
            //to filer
            $data['email_type']   = 'filer';
            $data['email']   = $filerEmail;
            $data['subject'] = "[HRIS] Employee Resignation Form: Updated Approval Status - $refNo";
            $data['content'] = "<p>Hi $filerName,</p><p>Please see below the status of your filed request in Employee Resignation forms:</p>";
            if ($data['email'] != ''):
                self::sendEmail($data);
            endif;

            //to current approver
            $data['email_type']   = 'approver';
            $data['email']   = $approverEmail;
            $data['subject'] = "[HRIS] Employee Resignation Form: Rejected  - $refNo";
            $data['content'] = "<p>Hi $approverName,</p><p>You rejected the Employee Resignation request $refNo with the following details:</p>";
            if ($data['email'] != ''):
                self::sendEmail($data);
            endif;

        endif;


        return 1;
    }
    public static function sendEmail($data)
    {
        if (empty($data['email'])) {
            Log::warning("Email address is missing", [
                'email' => 'not set',
                'type' => $data['email_type'] ?? 'not set'
            ]);
            return -1;
        }

        if (env('ALLOW_EMAIL') == 0) {
            Log::info("Email sending is disabled by configuration", [
                'email' => $data['email'],
                'type' => $data['email_type'] ?? 'not set'
            ]);
            return -1;
        }
        Log::info("ALLOW_EMAIL is: " . env('ALLOW_EMAIL'));
        try {
            Mail::send(['html' => 'emails.mail'], $data, function ($message) use ($data) {
                $message->to($data['email'])
                    ->subject($data['subject'])
                    ->from(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
            });
            return 1;
        } catch (\Exception $e) {
            Log::error("Email sending failed: " . $e->getMessage());
            return -1;
        }
    }
    public static function sendPersonamEmail($data)
    {
        if (empty($data['email'])) {
            Log::warning("Email address is missing", [
                'email' => 'not set',
                'type' => $data['email_type'] ?? 'not set'
            ]);
            return -1;
        }

        if (env('ALLOW_EMAIL') == 0) {
            Log::info("Email sending is disabled by configuration", [
                'email' => $data['email'],
                'type' => $data['email_type'] ?? 'not set'
            ]);
            return -1;
        }
        Log::info("ALLOW_EMAIL is: " . env('ALLOW_EMAIL'));
        try {
            Mail::send(['html' => 'emails.Personalmail'], $data, function ($message) use ($data) {
                $message->to($data['email'])
                    ->subject($data['subject'])
                    ->from(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
            });
            return 1;
        } catch (\Exception $e) {
            Log::error("Email sending failed: " . $e->getMessage());
            return -1;
        }
    }
}
