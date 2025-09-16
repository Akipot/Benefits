<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Exports\ResignationReportExport;

class ResignationReportController extends Controller
{
    public function exportWithinAllowableDate(Request $request)
    {
        // dd($request->all());
        $params = [
            $request->CutoffPeriodFrom,
            $request->CutoffPeriodTo,
            $request->EffectiveDateFrom,
            $request->EffectiveDateTo,
        ];
        $export = new ResignationReportExport($params);
        $export->download();
    }
}
