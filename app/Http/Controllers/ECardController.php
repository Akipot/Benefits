<?php

namespace App\Http\Controllers;

use App\Models\Contracts;
use App\Models\Common;
use App\Models\ECard;
use App\Helpers\MyHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use ZipArchive;
use Response;

use Illuminate\Support\Facades\DB;

class ECardController extends Controller
{
    public function getApplicationECard()
    {
        $param = [
            0
        ];

        $data = ECard::getApplicationECard($param);

        return response()->json($data);
    }


    public function checkApplicationStatus($id)
    {
        $param = [0, $id];
        $data = ECard::getApplicationECard($param); 

        if ($data) {
            return response()->json([
                'hasSubmitted' => true,
                'status' => $data[0]->Status,
                'filepath' => $data[0]->FilePath,
                'filename' => $data[0]->FileName
            ]);
        } else {
            return response()->json([
                'hasSubmitted' => false,
                'status' => null,
                'filepath' => null,
                'filename' => null
            ]);
        }
    }


    public function downloadZip(Request $request)
    {
        $idsParam = $request->query('ids');
        if (!$idsParam) {
            return response()->json(['error' => 'No IDs provided'], 400);
        }

        $user = Auth::user();
        $Employee_ID = $user->Emp_ID;

        $param = [
            $Employee_ID,
            $idsParam
        ];

        $files = ECard::generateECard($param);

        if (empty($files)) {
            return response()->json(['error' => 'No files found'], 404);
        }

        $From = $files[0]->CutoffFrom;
        $To = $files[0]->CutoffTo;
        $zipName = $From . '_To_' . $To . '.zip';
        $zipPath = storage_path('ECARD_' . $zipName);

        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {
            foreach ($files as $file) {
                $filepath = $file->CutoffFrom . '_To_' . $file->CutoffTo;
                $filename = $file->FileName;
                $fullPath = storage_path("app/public/ApplicationForms/ECard/{$filepath}/{$filename}");

                if (file_exists($fullPath)) {
                    $zip->addFile($fullPath, $filename);
                } else {
                    \Log::warning("File not found: {$fullPath}");
                }
            }
            $zip->close();
        }

        return response()->download($zipPath);
    }


}
