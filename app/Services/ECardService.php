<?php

namespace App\Services;

use App\Models\ECard;
use App\Models\Common;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ECardService
{
    /**
     * Insert SLA application into database
     *
     * @param Request $request
     * @return array ['success' => bool, 'message' => string]
     */
    public function insertApplication(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return ['success' => false, 'message' => 'User not authenticated'];
        }

        $Employee_ID = $user->Emp_ID;

        $today = date('Y-m-d');
        $Cutoff = Common::getCutoff([0, $today]);
        $CutFrom = $Cutoff[0]->CutoffFrom;
        $CutTo = $Cutoff[0]->CutoffTo;

        $param = [
            $Employee_ID,
            $request->input('bdoDateOfBirth'),
            $request->input('bdoMobileNumber'),
            $request->input('bdoEmailAddress'),
            $request->input('bdoPlaceOfBirth'),
            $request->input('bdoCountryOfBirth'),
            $request->input('bdoNationality'),
            $request->input('bdoUbs'),
            $request->input('bdoVillage'),
            $request->input('bdoCity_ID'),
            $request->input('bdoProvince_ID'),
            $request->input('bdoCountry'),
            $request->input('bdoZip'),
            $request->input('bdoBranch'),
            $request->input('q1'),
            $request->input('q2'),
            $request->input('q3'),
            $request->input('q4'),
            $request->input('q5'),
            $request->input('q6'),
            $request->input('employeeNo') . '_ECard_Form.pdf',
            'ApplicationForms/ECard/' . $CutFrom . '_To_' . $CutTo,
        ];

        try {
            $save = ECard::insertApplicationEcard($param);

            $num = $save[0]->RETURN ?? null;
            $msg = $save[0]->MESSAGE ?? null;

            if ($num != 2) {
                return [
                    'success' => false,
                    'num' => $num,
                    'msg' => $msg ?? 'Database insert failed'
                ];
            }

            return [
                'success' => true,
                'num' => $num,
                'msg' => $msg ?? 'Inserted successfully'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'num' => null,
                'msg' => $e->getMessage()
            ];
        }

    }
}
