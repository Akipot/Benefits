<?php

namespace App\Exports;

use App\Models\EmpRes;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use Illuminate\Support\Facades\Session;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ResignationReportExport
{
    protected $params;

    function __construct($params)
    {
        $this->params = $params;
    }

    public function download()
    {
        $recordsGroup = EmpRes::getMyResignationReport($this->params);

        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $rCounter = count($recordsGroup);
        // Set document properties
        $spreadsheet->getProperties()
            ->setCreator("MyHub")
            ->setTitle("Resignation Report")
            ->setSubject("Resignation Report")
            ->setDescription("Report of resigned employees within cutoff period.");

        // Titles
        $sheet->setTitle("Within the Allowable Date");
        $sheet->setCellValue("A1", "MYHUB RESIGNED EMPLOYEES REPORT");
        $sheet->setCellValue("A2", "Cutoff Period");
        $sheet->setCellValue("A3", "Resign Employee Count: [ $rCounter ]");
        $sheet->setCellValue("N1", "Run Date");
        $sheet->setCellValue("N2", "Run Time");

        // Headers
        $headers = [
            "A5" => "No.",
            "B5" => "Employee Number",
            "C5" => "Employee Name",
            "D5" => "Date Hired",
            "E5" => "Tenure",
            "F5" => "Reason for Resignation",
            "G5" => "Actual Last Day",
            "H5" => "Effectivity Date",
            "I5" => "Employment Status",
            "J5" => "Gratuity Entitled",
            "K5" => "Assigned Location / Branch",
            "L5" => "Assigned Department",
            "M5" => "Date Submitted",
            "N5" => "Date Acknowledge / Subject for Revision",
            "O5" => "Date Accepted / Rejected",
        ];

        foreach ($headers as $cell => $text) {
            $sheet->setCellValue($cell, $text);
        }

        // Styling for header row (bold, background color, centered)
        $headerStyle = [
            'font' => [
                'bold' => true,
                'color' => ['argb' => 'FFFFFFFF'],
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FF4F81BD'],
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                ],
            ],
        ];
        $sheet->getStyle('A5:O5')->applyFromArray($headerStyle);

        // Styling for title
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

        // Column widths
        $sheet->getColumnDimension('A')->setWidth(5);
        $sheet->getColumnDimension('B')->setWidth(25);
        $sheet->getColumnDimension('C')->setWidth(30);
        $sheet->getColumnDimension('D')->setWidth(25);
        $sheet->getColumnDimension('E')->setWidth(15);
        $sheet->getColumnDimension('F')->setWidth(50);
        $sheet->getColumnDimension('G')->setWidth(25);
        $sheet->getColumnDimension('H')->setWidth(25);
        $sheet->getColumnDimension('I')->setWidth(25);
        $sheet->getColumnDimension('J')->setWidth(20);
        $sheet->getColumnDimension('K')->setWidth(40);
        $sheet->getColumnDimension('L')->setWidth(35);
        $sheet->getColumnDimension('M')->setWidth(20);
        $sheet->getColumnDimension('N')->setWidth(40);
        $sheet->getColumnDimension('O')->setWidth(30);

        // Freeze the header row
        $sheet->freezePane('A6');

        // Fill run date/time

        $sheet->setCellValue("O1", date('Y-m-d'));
        $sheet->setCellValue("O2", date('H:i:s'));

        $row = 6;
        if (!empty($recordsGroup)) {
            $x = 1;
            foreach ($recordsGroup as $data):
                $sheet->setCellValue("A{$row}", $x);
                $sheet->setCellValue("B{$row}", $data->EmployeeNo);
                $sheet->setCellValue("C{$row}", $data->ResignationName);
                $sheet->setCellValue("D{$row}", $data->DateHired);
                $sheet->setCellValue("E{$row}", $data->TenureDetailed);
                $sheet->setCellValue("F{$row}", $data->Reason);
                $sheet->setCellValue("G{$row}", $data->LastDayofResignation);
                $sheet->setCellValue("H{$row}", $data->EffectiveDate);
                $sheet->setCellValue("I{$row}", $data->EmpStatus);
                $sheet->setCellValue("J{$row}", $data->GradtuityEntitled);
                $sheet->setCellValue("K{$row}", $data->Location);
                $sheet->setCellValue("L{$row}", $data->Department);
                $sheet->setCellValue("M{$row}", $data->InsertDate);
                if ($data->DeclinedDate != '') {
                    $columnN = $data->DeclinedDate;
                    $color = 'd97706'; // Subject for Revision
                } else if ($data->ApprovedDate == '' && $data->DeclinedDate == '') {
                    $columnN = 'Pending ';
                    $color = 'FFC107'; // Pending (FFC107)
                } elseif ($data->ApprovedDate != '' && $data->DeclinedDate == '') {
                    $columnN = $data->ApprovedDate;
                    $color = '16a34a';
                }

                $sheet->setCellValue("N{$row}", $columnN);
                $sheet->getStyle("N{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($color);


                if ($data->ApprovedDate == '' && $data->AcceptedDate == '') {
                    $columnO = '';
                    $colorO = '';
                } elseif ($data->AcceptedDate == '' && $data->CancelledDate != '') {
                    $columnO = $data->CancelledDate;
                    $colorO = 'dc2626'; // Red (dc2626)
                } elseif (!empty($data->ApprovedDate) && $data->AcceptedDate == '') {
                    $columnO = 'Pending';
                    $colorO = 'f2f2f2'; // Light grey
                } else {
                    $columnO = $data->AcceptedDate;
                    $colorO = '3b82f6'; // Blue
                }

                $sheet->setCellValue("O{$row}", $columnO);

                if ($colorO != '') {
                    $sheet->getStyle("O{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($colorO);
                }
                $sheet->getStyle("A{$row}:O{$row}")->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                $row++;
                $x++;
            endforeach;
        }


        // Border styling for data rows (optional)
        $lastRow = $row; // Adjust if adding real data dynamically
        $sheet->getStyle("A5:O{$lastRow}")->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);

        // Output to browser
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="Resign_Employee_' . date('Y-m-d_His') . '.xlsx"');

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $writer->save('php://output');
    }
}
