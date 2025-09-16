<?php

namespace App\Http\Controllers;

// use App\Models\Maintenance;
use App\Helpers\MyHelper;
use App\Models\SLA;
use App\Models\Common;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Services\SLAService;

use setasign\Fpdi\Fpdi;

class PdfController extends Controller
{
    public function generateSLA(Request $request)
    {
        
        $slaService = new SLAService();

        $insert = $slaService->insertApplication($request);

        if (!$insert['success']) {
            Log::error('SLA insert failed', [
                'message' => $insert['msg'],
                'request' => $request->all(),
            ]);

            return response()->json([
                'status' => 'error',
                'num' => $insert['num'],
                'message' => $insert['msg']
            ], 500);
        }
        
        $pdf = new Fpdi();
        $pdf->AddPage();
        $pdf->setSourceFile(storage_path('app/public/forms/SLA_MEMBERSHIP_FORM.pdf'));
        $tplIdx = $pdf->importPage(1);
        $pdf->useTemplate($tplIdx, 0, 0, 210);

        $pdf->SetFont('Helvetica', '', 8);

        $today = now()->format('m/d/Y');

        $fields = [
            [167, 23, $today],
            [15, 34, $request->input('employeeNo')],
            [50, 34, $request->input('surname')],
            [102, 34, $request->input('firstName')],
            [152, 34, $request->input('middleName')],
            [15, 40, $request->input('permanentHouseNo')],
            [40, 40, $request->input('permanentStreet')],
            [67, 40, $request->input('permanentSubdivision')],
            [95, 40, $request->input('permanentBarangay')],
            [121, 40, $request->input('permanentCity')],
            [153, 40, $request->input('permanentProvince')],
            [170, 40, $request->input('permanentZip')],
            [15, 49, $request->input('presentHouseNo')],
            [40, 49, $request->input('presentStreet')],
            [67, 49, $request->input('presentSubdivision')],
            [95, 49, $request->input('presentBarangay')],
            [121, 49, $request->input('presentCity')],
            [153, 49, $request->input('presentProvince')],
            [170, 49, $request->input('presentZip')],
            [15, 59, $request->input('dateOfBirth')],
            [57, 59, $request->input('placeOfBirth')],
            [150, 59, $request->input('civilStatus')],
            [170, 59, $request->input('nationality')],
            [15, 66, $request->input('company')],
            [57, 66, $request->input('branch')],
            [100, 66, $request->input('department')],
            [151, 66, $request->input('dateHired')],
            [15, 73, $request->input('positionTitle')],
            [57, 73, $request->input('rankLevel')],
            [100, 73, $request->input('tin')],
            [151, 73, $request->input('sss')],
            [15, 80, $request->input('maidenName')],
            [100, 80, $request->input('mobileNumber')],
            [151, 80, $request->input('emailAddress')],
            [15, 94, $request->input('benFullName1')],
            [100, 94, $request->input('benRelationship1')],
            [151, 94, $request->input('benDateOfBirth1')],
            [15, 99, $request->input('benFullName2')],
            [100, 99, $request->input('benRelationship2')],
            [151, 99, $request->input('benDateOfBirth2')],
            [15, 104, $request->input('benFullName3')],
            [100, 104, $request->input('benRelationship3')],
            [151, 104, $request->input('benDateOfBirth3')],
            [15, 109, $request->input('benFullName4')],
            [100, 109, $request->input('benRelationship4')],
            [151, 109, $request->input('benDateOfBirth4')],
            [15, 114, $request->input('benFullName5')],
            [100, 114, $request->input('benRelationship5')],
            [151, 114, $request->input('benDateOfBirth5')],
            [158, 160, $request->input('otherAmount')],
            [73, 167, $request->input('savingsAmount')],
        ];

        foreach ($fields as [$x, $y, $text]) {
            if (!empty($text)) {
                $pdf->SetXY($x, $y);
                $pdf->Write(10, $text);
            }
        }

        // Gender checkbox
        $gender = strtolower($request->input('gender'));

        if ($gender === 'female') {
            $pdf->Line(106, 62, 107, 63);  
            $pdf->Line(107, 63, 109, 60.5);
        } else {
            $pdf->Line(128, 62, 129, 63);  
            $pdf->Line(129, 63, 131, 60.5); 
        }

        // Contribution checkboxes 
        $contribution = $request->input('contribution');
        $coords = [
            300 => [31, 155],
            400 => [31, 160],
            500 => [31, 165],
            600 => [69, 155],
            800 => [69, 160],
            1000 => [69, 165],
            1500 => [105, 155],
            2000 => [105, 160],
            3000 => [105, 165],
            4000 => [142, 155],
            5000 => [142, 160],
            "Others" => [142, 165],
        ];
        if (isset($coords[$contribution])) {
            [$x, $y] = $coords[$contribution];
            $pdf->Line($x, $y+1, $x+1, $y+2);
            $pdf->Line($x+1, $y+2, $x+4, $y-0.5);
        }

        // Signature (x - 1, y - 2)
        $signatureDataUrl = $request->input('signature');
        if ($signatureDataUrl) {
            $signatureBase64 = preg_replace('#^data:image/\w+;base64,#i', '', $signatureDataUrl);
            $signatureData = base64_decode($signatureBase64);
            $tmpFile = tempnam(sys_get_temp_dir(), 'sig') . '.png';
            file_put_contents($tmpFile, $signatureData);

            $pdf->Image($tmpFile, 20, 193, 60, 20);
            $pdf->Image($tmpFile, 80, 193, 60, 20);
            $pdf->Image($tmpFile, 140, 193, 60, 20);

            unlink($tmpFile);
        }
    
        $today = date('Y-m-d');

        $Cutoff = Common::getCutoff([0, $today]);

        $CutFrom = date('Y-m-d', strtotime($Cutoff[0]->CutoffFrom));
        $CutTo   = date('Y-m-d', strtotime($Cutoff[0]->CutoffTo));

        $storagePath = storage_path("app/public/ApplicationForms/SLA/{$CutFrom}_To_{$CutTo}");

        if (!file_exists($storagePath)) {
            mkdir($storagePath, 0777, true);        }

        $fileName = $request->input('employeeNo') . '_SLA_Form.pdf';
        $filePath = $storagePath . '/' . $fileName;

        $pdf->Output('F', $filePath);
    
        return response()->json([
            'success' => true,
            'num' => $insert['num'],
            'message' => $insert['msg'],
            'filePath' => asset("storage/ApplicationForms/SLA/{$CutFrom}_To_{$CutTo}/$fileName")
        ]);

    }

    private function drawCheck($pdf, $x, $y, $size = 1.5, $thickness = 0.4) {
        $pdf->SetLineWidth($thickness);
        $pdf->SetDrawColor(0, 0, 0);

        $downLength = $size;       
        $upLengthX = $size * 1.5;  
        $upLengthY = $size;        

        $pdf->Line($x, $y, $x + $downLength, $y + $downLength / 2);

        $pdf->Line($x + $downLength, $y + $downLength / 2, $x + $downLength + $upLengthX, $y - $upLengthY);
    }


    public function generateEcard(Request $request)
    {
        $pdf = new Fpdi();
        $today = now()->format('m/d/Y');
        $fullName = MyHelper::decrypt(Session::get('FullName'));

        // ECARD FORM
        $ecard = storage_path('app/public/forms/ECARD_MEMBERSHIP_FORM.pdf');
        $pageCount = $pdf->setSourceFile($ecard);

        for ($pageNo = 1; $pageNo <= min(2, $pageCount); $pageNo++) {
            $tplIdx = $pdf->importPage($pageNo);
            $size = $pdf->getTemplateSize($tplIdx);
            $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
            $pdf->useTemplate($tplIdx, 0, 0, $size['width'], $size['height']);

            if ($pageNo === 1) {
                $pdf->SetFont('Helvetica', '', 10);

                $fields = [
                    [21, 45, $request->input('lastName')],
                    [95, 45, $request->input('firstName')],
                    [165, 45, $request->input('middleInitial')],
                    [21, 55, $request->input('employeeNo')],
                    [95, 55, $request->input('company')],
                    [165, 55, $request->input('companyCode')],
                    [21, 64, $request->input('position')],
                    [95, 64, $request->input('branch')],
                    [165, 64, $request->input('branchCode')],
                    [31, 146, $fullName],
                    [143, 206, $fullName],
                    [143, 240, $fullName],
                    [31, 224, $fullName],
                    [32, 289, $fullName],
                    [147, 288, $today],
                ];

                foreach ($fields as [$x, $y, $text]) {
                    if (!empty($text)) {
                        $pdf->SetXY($x, $y);
                        $pdf->Write(10, $text);
                    }
                }

                // Signature
                $signatureDataUrl = $request->input('signature');
                if ($signatureDataUrl) {
                    $signatureBase64 = preg_replace('#^data:image/\w+;base64,#i', '', $signatureDataUrl);
                    $signatureData = base64_decode($signatureBase64);
                    $tmpFile = tempnam(sys_get_temp_dir(), 'sig') . '.png';
                    file_put_contents($tmpFile, $signatureData);

                    $pdf->Image($tmpFile, 127, 198, 60, 20);
                    $pdf->Image($tmpFile, 127, 233, 60, 20);
                    $pdf->Image($tmpFile, 20, 280, 60, 20);

                    unlink($tmpFile);
                }
            }
        }

        // BDO FORM
        $bdoPDF = storage_path('app/public/forms/BDO_FORM.pdf');
        $pageCount2 = $pdf->setSourceFile($bdoPDF);

        $bdoMobile = $request->input('bdoMobileNumber');

        // Mobile Number
        if (preg_match('/^\(([^)]+)\)\s*(.+)$/', $bdoMobile, $matches)) {
            $countryCode = $matches[1];
            $phoneNumber = $matches[2];
        } else {
            $countryCode = '';
            $phoneNumber = $bdoMobile;
        }

        // Date of Birth
        $bdoDOB = $request->bdoDateOfBirth; 
        $dobDigits = str_split(str_replace('/', '', $bdoDOB)); 

        $todayDigits = str_split(str_replace('/', '', $today));


        for ($pageNo = 1; $pageNo <= $pageCount2; $pageNo++) {
            $tplIdx2 = $pdf->importPage($pageNo);
            $size2 = $pdf->getTemplateSize($tplIdx2);
            $pdf->AddPage($size2['orientation'], [$size2['width'], $size2['height']]);
            $pdf->useTemplate($tplIdx2, 0, 0, $size2['width'], $size2['height']);

            if ($pageNo === 1) {
                $pdf->SetFont('Helvetica', '', 10);

                $dobFields = [
                    [$dobDigits[0], 157, 38],
                    [$dobDigits[1], 162, 38],
                    [$dobDigits[2], 170, 38],
                    [$dobDigits[3], 175, 38],
                    [$dobDigits[4], 182, 38],
                    [$dobDigits[5], 187, 38],
                    [$dobDigits[6], 192, 38],
                    [$dobDigits[7], 196, 38],
                ];

                foreach ($dobFields as [$digit, $x, $y]) {
                    $pdf->SetXY($x, $y);
                    $pdf->Write(10, $digit);
                }

                $todayFields = [
                    [$todayDigits[0], 163, 252],
                    [$todayDigits[1], 167, 252],
                    [$todayDigits[2], 174, 252],
                    [$todayDigits[3], 178, 252],
                    [$todayDigits[4], 184, 252],
                    [$todayDigits[5], 189, 252],
                    [$todayDigits[6], 193, 252],
                    [$todayDigits[7], 196, 252],
                ];

                foreach ($todayFields as [$digit, $x, $y]) {
                    $pdf->SetXY($x, $y);
                    $pdf->Write(10, $digit);
                }

                $fields = [
                    [10, 38, $request->input('bdoLastName')],
                    [44, 38, $request->input('bdoFirstName')],
                    [107, 38, $request->input('bdoMiddleName')],
                    [143, 38, $request->input('bdoSuffix')],

                    [10, 53, $countryCode],  
                    [24, 53, $phoneNumber],
                    [73, 53, $request->input('bdoEmailAddress')],
                    [124, 53, $request->input('bdoPlaceOfBirth')],
                    [163, 53, $request->input('bdoCountryOfBirth')],

                    [163, 68, $request->input('bdoNationality')],

                    [10, 77, $request->input('bdoUbs')],
                    [92, 77, $request->input('bdoVillage')],
                    
                    [10, 89, $request->input('bdoCity')],
                    [73, 89, $request->input('bdoProvince')],
                    [139, 89, $request->input('bdoCountry')],
                    [187, 89, $request->input('bdoZip')],

                    [10, 109, $request->input('bdoEmployeeNo')],
                    [75, 109, $request->input('bdoCompany')],
                    [141, 109, $request->input('bdoBranch')],

                    [10, 123, $request->input('bdoDepartment')],
                    [75, 123, $request->input('bdoPosition')],

                ];

                
                foreach ($fields as [$x, $y, $text]) {
                    if (!empty($text)) {
                        $pdf->SetXY($x, $y);
                        $pdf->Write(10, $text);
                    }
                }

                $q1 = $request->input('q1');
                if ($q1 == 1) {
                    $this->drawCheck($pdf, 173, 152);
                } elseif ($q1 == 0) {
                    $this->drawCheck($pdf, 189, 152);
                }

                $q2 = $request->input('q2');
                if ($q2 == 1) {
                    $this->drawCheck($pdf, 173, 158);
                } elseif ($q2 == 0) {
                    $this->drawCheck($pdf, 189, 158);
                }

                $q3 = $request->input('q3');
                if ($q3 == 1) {
                    $this->drawCheck($pdf, 173, 172);
                } elseif ($q3 == 0) {
                    $this->drawCheck($pdf, 189, 172);
                }

                $q4 = $request->input('q4');
                if ($q4 == 1) {
                    $this->drawCheck($pdf, 173, 181);
                } elseif ($q4 == 0) {
                    $this->drawCheck($pdf, 189, 181);
                }

                $q5 = $request->input('q5');
                if ($q5 == 1) {
                    $this->drawCheck($pdf, 173, 191);
                } elseif ($q5 == 0) {
                    $this->drawCheck($pdf, 189, 191);
                }

                $q6 = $request->input('q6');
                if ($q6 == 1) {
                    $this->drawCheck($pdf, 173, 200);
                } elseif ($q6 == 0) {
                    $this->drawCheck($pdf, 189, 200);
                }
                // Signature
                $signatureDataUrl = $request->input('signature');
                if ($signatureDataUrl) {
                    $signatureBase64 = preg_replace('#^data:image/\w+;base64,#i', '', $signatureDataUrl);
                    $signatureData = base64_decode($signatureBase64);
                    $tmpFile = tempnam(sys_get_temp_dir(), 'sig') . '.png';
                    file_put_contents($tmpFile, $signatureData);

                    $pdf->Image($tmpFile, 141, 232, 60, 20);

                    unlink($tmpFile);
                }
            }

            if ($pageNo === 2) {
    
                $todayFields = [
                    [$todayDigits[0], 163, 77],
                    [$todayDigits[1], 167, 77],
                    [$todayDigits[2], 174, 77],
                    [$todayDigits[3], 178, 77],
                    [$todayDigits[4], 184, 77],
                    [$todayDigits[5], 189, 77],
                    [$todayDigits[6], 193, 77],
                    [$todayDigits[7], 196, 77],
                ];

                foreach ($todayFields as [$digit, $x, $y]) {
                    $pdf->SetXY($x, $y);
                    $pdf->Write(10, $digit);
                }

                // Signature
                $signatureDataUrl = $request->input('signature');
                if ($signatureDataUrl) {
                    $signatureBase64 = preg_replace('#^data:image/\w+;base64,#i', '', $signatureDataUrl);
                    $signatureData = base64_decode($signatureBase64);
                    $tmpFile = tempnam(sys_get_temp_dir(), 'sig') . '.png';
                    file_put_contents($tmpFile, $signatureData);

                    $pdf->Image($tmpFile, 141, 58, 60, 20);

                    unlink($tmpFile);
                }
            }
        }

        return response($pdf->Output('S'), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="filled.pdf"',
        ]);
    }


}