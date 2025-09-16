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
        @if(isset($email_type) && $email_type === 'filer')
        @if(isset($empRes[0]))
        <div class="header" style="margin-bottom: 24px;">
            <p><strong>{{ now()->format('F d, Y') }}</strong></p>
            <p><strong>{{ $empRes[0]->ResignationName ?? '[Employee Name]' }}</strong></p>
            <p><strong>{{ $empRes[0]->Position ?? '[Position]' }}</strong></p>
            <p><strong>{{ $empRes[0]->Company ?? '[Company Name]' }}</strong></p>
        </div>

        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
            <div style="margin-bottom: 12px;">
                Dear
                <strong>Ms./Mr. {{ $empRes[0]->LastName ?? '[Employee Last Name]:' }}</strong>
            </div>
            <div style="margin-bottom: 12px;">
                We confirm our receipt and acceptance of your resignation letter dated
                <strong>{{ $empRes[0]->InsertDate ?? '[Resignation Date]' }}</strong> with effective date of
                <strong>{{ $empRes[0]->EffectiveDate ?? '[Effective Date]' }}</strong>
            </div>
            <div style="margin-bottom: 12px;">
                Please be advised of the following information relative to your separation from the Company:
            </div>

            <ol style="padding-left: 18px; margin-top: 0;">
                <li style="margin-bottom: 12px;">
                    If you are qualified for gratuity pay in accordance with the provisions of the SM MERP, you are
                    required to render at least <strong>15 working days</strong> as your notice period from
                    <strong>[17 days prior to the effectivity date]</strong> to <strong>[Last day of duty]</strong>, without incurring
                    any absences, tardiness, undertime, leaves, and/or filed TK Forms during the said period.
                    <em>Failure to comply with this requirement without a justifiable reason will result in your
                        non-entitlement to gratuity pay.</em>
                </li>

                <li style="margin-bottom: 12px;">
                    Please surrender the following items to the Human Resources Department for clearance purposes:
                    <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse; margin-top: 8px; width: 100%; font-size: 14px;">
                        <thead style="background-color: #f2f2f2;">
                            <tr>
                                <th style="text-align: left;">Item</th>
                                <th style="text-align: left;">Schedule</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>SM E-Card (if applicable)</td>
                                <td rowspan="3">Upon receipt of this acceptance letter</td>
                            </tr>
                            <tr>
                                <td>Company-issued laptop (if applicable). Please coordinate with ITSS</td>
                            </tr>
                            <tr>
                                <td>SLA Cash Card & SLA Resignation Letter (if SLA member)</td>
                            </tr>
                            <tr>
                                <td>Health Maintenance Organization (HMO) Card</td>
                                <td rowspan="6">On the effective date of resignation</td>
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
                                <td>Car Pass (if applicable). Please coordinate with Corporate Administration</td>
                            </tr>
                            <tr>
                                <td>Employee Handbook, Code of Business Ethics, and other company-issued handbooks as applicable</td>
                            </tr>
                        </tbody>
                    </table>
                    <p style="margin-top: 8px;"><i><strong>Note:</strong> Please return all company property prior to your date of resignation.</i></p>
                </li>

                <li>
                    Vacation Leave and Sick Leave filing in MyHub will be disabled effective
                    <strong>{{ $empRes[0]->InsertDate ?? '[Submitted Date]' }}</strong>.
                </li>
            </ol>

            <p style="margin-top: 12px;">
                Further, to facilitate clearance from accountabilities, please ensure that all your pending work and
                tasks are accomplished and/or properly turned over prior to your last day. Your final pay including
                payment for all unused sick and/or vacation leaves, proportionate 13th month pay, and gratuity pay
                <strong> will be released only upon full clearance</strong>.
            </p>

            <p style="margin-top: 12px;">
                We wish you all the best in your future endeavors.
            </p>

            <p style="margin-top: 12px;">
                {{ $empRes[0]->HRName ?? '[HR Manager Name]' }}<br>
                <strong>HUMAN RESOURCES MANAGER</strong>
            </p>

            <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse; margin-top: 16px; width: 100%; font-size: 14px;">
                <tbody>
                    <tr>
                        <td style="width: 30%;">Acknowledged by:</td>
                        <td>{{ $empRes[0]->ResignationName ?? '[Resigning Employee Name]' }}</td>
                    </tr>
                    <tr>
                        <td>Date:</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
        @endif
        @endif


        <br />
</body>

</html>