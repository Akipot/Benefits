@php
$approvers = [];


$approvers[$empRes[0]->DepartmentHead_AppNo]['Emp_ID'] = $empRes[0]->DepartmentHead_ID;
$approvers[$empRes[0]->DepartmentHead_AppNo]['Name'] = $empRes[0]->DepartmentHeadName;
$approvers[$empRes[0]->DepartmentHead_AppNo]['Date'] = $empRes[0]->DepartmentHead_AppDate;
$approvers[$empRes[0]->DepartmentHead_AppNo]['AppNo'] = $empRes[0]->DepartmentHead_AppNo;
$approvers[$empRes[0]->DepartmentHead_AppNo]['AppLabel'] = 'Department Head';

$approvers[$empRes[0]->HR_AppNo]['Emp_ID'] = $empRes[0]->HR_ID;
$approvers[$empRes[0]->HR_AppNo]['Name'] = $empRes[0]->HRName;
$approvers[$empRes[0]->HR_AppNo]['Date'] = $empRes[0]->HR_AppDate;
$approvers[$empRes[0]->HR_AppNo]['AppNo'] = $empRes[0]->HR_AppNo;
$approvers[$empRes[0]->HR_AppNo]['AppLabel'] = 'Branch HR';


@endphp

<!DOCTYPE html>
<html>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        .email-container {
            max-width: 100%;
            margin: 0 auto;
            padding: 10px;
            font-family: Arial, sans-serif;
        }

        .status-box {
            width: 200px;
            float: right;
            margin-bottom: 10px;
            background: #f8f9fa;
            border-radius: 2px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .status-box .title {
            text-align: center;
            padding: 10px;
            background: #e9ecef;
            border-radius: 2px 2px 0 0;
            font-weight: bold;
        }

        .status-box .status {
            padding: 5px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #dee2e6;
            border-radius: 0 0 2px 2px;
        }

        .table-title {
            width: 100%;
            margin-bottom: 5px;
            background: #F8F9FA;
            border-radius: 2px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 6px 15px
        }

        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .details-table th,
        .details-table td {
            padding: 6px 15px;
            border: 1px solid #dee2e6;
        }

        .details-table th {
            background: #f8f9fa;
            font-weight: bold;
            text-align: left;
            width: 30%;
        }

        .progress-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }

        .progress-table th {
            width: 40px;
            text-align: center;
            border: none;
            padding: 5px;
        }

        .progress-table td {
            border: none;
            padding: 3px;
        }

        .progress-box {
            padding: 7px;
            border: 1px solid #dee2e6;
            border-radius: 1px;
            background: #f8f9fa;
            margin-bottom: 1px;
        }

        .progress-item {
            display: inline-block;
            padding-right: 20px;
            margin-bottom: 2px;
        }

        .progress-item strong {
            color: #495057;
        }

        .progress-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
        }

        .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 2px;
            font-weight: bold;
            font-size: 0.9em;
        }

        .status-cancelled {
            background: #F41127;
            color: white;
        }

        .status-declined {
            background: #d97706;
            color: white;
        }

        .status-rejected {
            background: #003C9C;
            color: white;
        }

        .status-pending {
            background: #FFC107;
            color: white;
        }

        .status-approved {
            background: #16a34a;
            color: white;
        }

        .status-accepted {
            background: #3b82f6;
            color: white;
        }

        .border-reject {
            border: 2px solid #003C9C;
        }

        .border-choco {
            border: 2px solid #8B4513;
        }

        .border-warning {
            border: 2px solid #FFC107;
        }

        .border-success {
            border: 2px solid #17A00E;
        }

        .border-accepted {
            border: 2px solid #3b82f6;
        }


        .border-danger {
            border: 2px solid #F41127;
        }

        .border-dark {
            border: 2px solid #6C757D;
        }


        @media screen and (max-width: 768px) {
            .email-container {
                padding: 10px;
            }

            .status-box {
                width: 100%;
                float: none;
                margin-bottom: 20px;
            }

            .details-table,
            .progress-table {
                display: block;
                overflow-x: auto;
            }

            .progress-item {
                display: block;
                padding-right: 0;
                margin-bottom: 10px;
            }
        }
    </style>
</head>

<body>
    <a href="#"> <img src="https://myhub.atp.ph/resource/style1/img/myhublogo.png" width="280" /> </a>
    <div class="email-container">
        {!! $content !!}
        <br>
        @if (isset($empRes[0]))
        <div class="status-box">
            <div class="title">Approval Status</div>
            <div class="status">
                @if (isset($empRes[0]))
                @if ($empRes[0]->CancelledDate != null)
                <span class="status-badge status-cancelled">Rejected</span>
                @elseif($empRes[0]->DeclinedDate != null)
                <span class="status-badge status-declined">Subject for Revision</span>
                @elseif($empRes[0]->ApprovedDate != null && $empRes[0]->AcceptedDate == null)
                <span class="status-badge status-approved">Acknowledge</span>
                @elseif($empRes[0]->AcceptedDate != null && $empRes[0]->ApprovedDate != null)
                <span class="status-badge status-accepted">Accepted</span>
                @elseif($empRes[0]->TotalApproved < $empRes[0]->TotalApprover)
                    <span class="status-badge status-pending">Pending</span>
                    @else
                    <span class="status-badge status-approved">Unknown</span>
                    @endif
                    @endif
            </div>
        </div>
        <table class="details-table">
            <tr>
                <th colspan="4" style="color: #F41127">Employee Resignation Details</th>
            </tr>
            <tr>
                <th colspan="2">Resignation No.</th>
                <td colspan="2">{{ $empRes[0]->EmpResRef }}</td>
            </tr>
            <tr>
                <th colspan="2">Employee</th>
                <td colspan="2">{{ $empRes[0]->ResignationName }}</td>
            </tr>
            <tr>
                <th colspan="2">File Date</th>
                <td colspan="2">{{ $empRes[0]->InsertDate }}</td>
            </tr>
            <tr>
                <th colspan="2">Effectivity Date</th>
                <td colspan="2">{{ $empRes[0]->EffectiveDate }}</td>
            </tr>
            <tr>
                <th colspan="2">Last Day of Duty</th>
                <td colspan="2">{{ $empRes[0]->LastDayofResignation }}</td>
            </tr>
            <tr>
                <th colspan="2">Active Personal Email</th>
                <td colspan="2">{{ $empRes[0]->PersonalEmail }}</td>
            </tr>
            <tr>
                <th colspan="4">Resignation Reason</th>
            </tr>
            <tr>
                <td colspan="4">{{ $empRes[0]->Reason }}</td>
            </tr>
        </table>
    </div>
    @if(isset($email_type) && $email_type === 'filer')
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 12px;">
            Please be advised of the following information relative to your separation with the Company:
        </div>

        <ol style="padding-left: 18px; margin-top: 0;">
            <li style="margin-bottom: 12px;">
                If you are qualified for gratuity pay in accordance with the provisions of the SM MERP, you are
                required to render at least <strong>15 working days</strong> as notice period from
                <strong>[17 days prior the effectivity date]</strong> to <strong>[Last day of Duty]</strong>, without incurring
                any absences, tardiness, undertime, leaves and/or any filed TK Forms during the period.
                <em>Failure to comply with this requirement without justifiable reason will result in your
                    non-entitlement to gratuity pay.</em>
            </li>
            <li style="margin-bottom: 12px;">
                Please surrender the following items to the Human Resources Department for clearance purposes:
                <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse; margin-top: 8px; width: 100%; font-size: 14px;">
                    <thead style="background-color: #f2f2f2;">
                        <tr>
                            <th style="text-align: left;">Item</th>
                            <th style="text-align: left;">Schedule / Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>SM E-Card (if applicable)</td>
                            <td rowspan="3">Upon receipt of this acceptance letter</td>
                        </tr>
                        <tr>
                            <td>Company-issued laptop (if applicable) Please coordinate with ITSS</td>
                        </tr>
                        <tr>
                            <td>SLA Cash Card & SLA Resignation Letter (If SLA member)</td>
                        </tr>
                        <tr>
                            <td>Health Maintenance Organization (HMO) Card</td>
                            <td rowspan="6">On effective date of resignation</td>
                        </tr>
                        <tr>
                            <td>Company ID</td>
                        </tr>
                        <tr>
                            <td>Cashier Barcode (if applicable)</td>
                        </tr>
                        <tr>
                            <td>BDO Corporate Card (for Executives only)</td>
                        </tr>
                        <tr>
                            <td>Car Pass (if applicable)Please coordinate with Corporate Administration</td>
                        </tr>
                        <tr>
                            <td>Employee Handbook, Code of Business Ethics, and other company-issued handbook as applicable</td>
                        </tr>
                    </tbody>
                </table>
                <p style="margin-top: 8px;"><strong>Note:</strong> Please return all company property prior to the date of resignation.</p>
            </li>
            <li>
                Vacation Leave and Sick Leave Filing in MyHub will be disabled effective
                <strong>[submitted date]</strong>.
            </li>
        </ol>

        <p style="margin-top: 12px;">
            Further, to facilitate clearance from accountabilities, please ensure that all your pending work and
            tasks are accomplished and/or properly turned over prior to your last day. Your final pay including
            payment for all unused sick and/or vacation leaves, proportionate 13th month pay, and gratuity pay
            will be released only upon full clearance.
        </p>
    </div>
    @endif

    <div class="table-title">
        <strong style="color: #F41127">Approval Status and Progress</strong>
    </div>
    <table class="progress-table">
        <tr>
            <th>0</th>
            <div
                class="progress-box {{ $empRes[0]->CancelledByEmp_ID == $empRes[0]->InsertBy ? 'bg-danger text-white border border-danger' : 'bg-success text-secondary border border-secondary' }}">
                <div class="progress-grid">
                    <div class="progress-item">
                        <strong>Created By:</strong>
                        <span>{{ $empRes[0]->ResignationName }}</span>
                    </div>
                    <div class="progress-item">
                        <strong>Created Date:</strong>
                        <span>{{ $empRes[0]->InsertDate }}</span>
                    </div>
                    <div class="progress-item">
                        <strong>Reason:</strong>
                        <span>{{ $empRes[0]->Reason }}</span>
                    </div>
                    @if ($empRes[0]->isWithdraw == 1)
                    <div class="progress-item">
                        <strong>Withdraw Date:</strong>
                        <span>{{ $empRes[0]->LastUpdate }}</span>
                    </div>
                    <div class="progress-item">
                        <strong>Cancelled Reason:</strong>
                        <span></span>
                    </div>
                    @endif
                </div>
            </div>
        </tr>
        @for ($c = 1; $c <= $empRes[0]->TotalApprover; $c++)
            @php
            $approver = $approvers[$c] ?? null;

            $isCancelled = isset($approver['Emp_ID']) && $empRes[0]->CancelledByEmp_ID == $approver['Emp_ID'];
            $isDeclined = isset($approver['Emp_ID']) && $empRes[0]->DeclinedByEmp_ID == $approver['Emp_ID'];
            $isAcknowledge = $c == 1 && isset($approver['Date']) && $approver['Date'] != null;
            $isApproved = $c > 1 && !empty($approver['Date']);

            $isPending = isset($approver['AppNo']) && $empRes[0]->TotalApproved + 1 == $approver['AppNo'] && $empRes[0]->CancelledDate == null && $empRes[0]->DeclinedDate == null;
            $isExpired = $empRes[0]->isExpired == 1 && $c == $empRes[0]->TotalApproved + 1;

            $bgClass = 'bg-white text-secondary border border-secondary';
            if ($isCancelled || $isDeclined) {
            $bgClass = 'bg-danger text-white border border-danger';
            } elseif ($isAcknowledge) {
            $bgClass = 'bg-success text-white border border-success';
            } elseif ($isApproved) {
            $bgClass = 'bg-success text-white border border-accepted';
            } elseif ($isPending) {
            $bgClass = 'bg-warning text-white border border-warning';
            } elseif ($isExpired) {
            $bgClass = 'bg-choco text-white border border-choco';
            }
            @endphp

            <tr>
                <th>{{ $c }}</th>
                <td>
                    <div class="progress-box {{ $bgClass }}">
                        <div class="progress-grid">
                            <div class="progress-item">
                                <strong>{{ $approver['AppLabel'] ?? '' }}:</strong>
                                <span>{{ $approver['Name'] ?? '' }}</span>
                            </div>

                            <div class="progress-item">
                                <strong>Approval Status:</strong>
                                <span>
                                    @if ($isCancelled)
                                    Cancelled
                                    @elseif ($isDeclined)
                                    Subject for Revision
                                    @elseif ($isAcknowledge)
                                    Acknowledge
                                    @elseif ($isApproved)
                                    Accepted
                                    @elseif ($isPending)
                                    Pending
                                    @elseif ($isExpired)
                                    Expired
                                    @else
                                    -
                                    @endif
                                </span>
                            </div>
                            {{-- For Acknowledge Status --}}
                            @if ($isAcknowledge)
                            <div class="progress-item">
                                <strong>Acknowledge Date:</strong>
                                <span>{{ $approvers[$c]['Date'] }}</span>
                            </div>
                            @endif
                            {{-- For Accepted Status --}}
                            @if ($isApproved)
                            <div class="progress-item">
                                <strong>Accepted Date:</strong>
                                <span>{{ $approvers[$c]['Date'] }}</span>
                            </div>
                            <div class="progress-item">
                                <strong>Category:</strong>
                                <span>{{ $empRes[0]->ResCategory }}</span>
                            </div>
                            @endif


                            @if ($isCancelled)
                            <div class="progress-item">
                                <strong>Subject for Revision Date:</strong>
                                <span>{{ $empRes[0]->CancelledDate }}</span>
                            </div>
                            <div class="progress-item">
                                <strong>Revision Reason:</strong>
                                <span>{{ $empRes[0]->CancelledRemarks }}</span>
                            </div>
                            @elseif ($isDeclined)
                            <div class="progress-item">
                                <strong>Revision Date:</strong>
                                <span>{{ $empRes[0]->DeclinedDate }}</span>
                            </div>
                            <div class="progress-item">
                                <strong>Revised Reason:</strong>
                                <span>{{ $empRes[0]->DeclinedRemarks }}</span>
                            </div>
                            @endif
                        </div>
                    </div>
                </td>
            </tr>
            @endfor
    </table><br />
    @endif
    @php
    $redirect = base64_encode(env('APP_URL'));
    $subredirect = base64_encode(env('APP_URL') . '/OnlineResignation/resignation/home');

    @endphp
    Visit MyHub : <a
        href="{{ env('MYHUB_URL') }}/?redirect={{ $redirect }}&&sub-redirect={{ $subredirect }}">Employee
        Resignation Form</a> for more details.
    <br />
</body>

</html>