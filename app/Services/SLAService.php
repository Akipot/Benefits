<?php

namespace App\Services;

use App\Models\SLA;
use App\Models\Common;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SLAService
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
            $request->input('permanentHouseNo'),
            $request->input('permanentStreet'),
            $request->input('permanentSubdivision'),
            $request->input('presentHouseNo'),
            $request->input('presentStreet'),
            $request->input('presentSubdivision'),
            $request->input('permanentBarangay_ID'),
            $request->input('permanentCity_ID'),
            $request->input('permanentProvince_ID'),
            $request->input('permanentZip'),
            $request->input('dateOfBirth'),
            $request->input('placeOfBirth'),
            $request->input('civilStatus'),
            $request->input('gender'),
            $request->input('nationality'),
            $request->input('benFullName1'),
            $request->input('benRelationship1'),
            $request->input('benDateOfBirth1'),
            $request->input('benFullName2'),
            $request->input('benRelationship2'),
            $request->input('benDateOfBirth2'),
            $request->input('benFullName3'),
            $request->input('benRelationship3'),
            $request->input('benDateOfBirth3'),
            $request->input('benFullName4'),
            $request->input('benRelationship4'),
            $request->input('benDateOfBirth4'),
            $request->input('benFullName5'),
            $request->input('benRelationship5'),
            $request->input('benDateOfBirth5'),
            $request->input('benFullName6'),
            $request->input('benRelationship6'),
            $request->input('benDateOfBirth6'),
            $request->input('contribution'),
            $request->input('savingsAmount'),
            $request->input('employeeNo') . '_SLA_Form.pdf',
            'ApplicationForms/SLA/' . $CutFrom . '_To_' . $CutTo,
        ];

        try {
            $save = SLA::insertApplicationSLA($param);

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
