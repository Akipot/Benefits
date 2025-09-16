import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface GuidelineProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: React.ReactNode;
    onConfirm: () => Promise<void> | void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export function Guidelines({
    open,
    onOpenChange,
    title = "POLICY AND GUIDELINES FOR SM E-CARD",
    onConfirm,
    onCancel,
    confirmText = "Continue",
    cancelText = "Cancel",
}: GuidelineProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                className="rounded-2xl p-8 bg-white dark:bg-gray-900 shadow-xl overflow-y-auto"
                style={{
                    width: "90vw",
                    maxWidth: "800px",
                    maxHeight: "90vh",
                    scrollbarColor: "#9ca3af #e5e7eb",
                    scrollbarWidth: "thin",
                }}
            >
                <DialogHeader>
                    <DialogTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 dark:text-gray-300 mt-1 space-y-4 text-justify">


                    </DialogDescription>
                </DialogHeader>

                {/* I. POLICY */}
                <div className="space-y-2">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">I. POLICY</div>
                    <div className="ml-4 text-xs text-gray-700 dark:text-gray-300">
                        It is the policy of SM to extend a credit line to qualified employees in the purchase of
                        goods at SM Department Store and/or other affiliated stores through the use of the SM E-CARD,
                        subject to such rules and control procedures as the Credit Management Division of SM may wish
                        to impose.
                    </div>
                </div>

                {/* II. ELIGIBILITY */}
                <div className="space-y-2 mt-4">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">II. ELIGIBILITY</div>
                    <div className="ml-4 text-xs text-gray-700 dark:text-gray-300">
                        All employees who have completed the probationary employment period and have been extended
                        regular appointment are eligible, subject to the requirements discussed below:
                    </div>

                    <div className="ml-8 space-y-2 mt-2 text-xs text-gray-700 dark:text-gray-300">
                        <div>
                            <strong className="text-gray-900 dark:text-gray-100">2.1. SM E-CARD APPLICATION FORM</strong>
                            <div className="ml-4 mt-1 text-xs text-gray-700 dark:text-gray-300">
                                To facilitate the processing of the Credit Line Application, the employee must accomplish
                                and submit an SM E-Card Application Form duly endorsed by the Personnel Department
                                (hereinafter known as Personnel) to the SM Credit Management Division (hereinafter known
                                as SM Credit). The same application form must likewise be accomplished and signed by the
                                applicant.
                            </div>
                        </div>

                        <div>
                            <strong className="text-gray-900 dark:text-gray-100">2.2. MONTHLY LIMIT</strong>
                            <div className="ml-4 mt-1 text-xs text-gray-700 dark:text-gray-300">
                                A credit limit shall be assigned to each employee as determined by SM Credit, to be
                                implemented by Personnel based on the employee’s position/rank. It shall be the
                                responsibility of the cardholder to ensure that total purchases do not exceed the
                                assigned credit limit.
                            </div>
                        </div>
                    </div>
                </div>

                {/* III. TERMS AND CONDITIONS */}
                <div className="space-y-2 mt-4">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        III. TERMS AND CONDITIONS ON THE USE OF THE SM E-CARD (SMEC)
                    </div>

                    <div className="ml-8 space-y-2 mt-2 text-xs text-gray-700 dark:text-gray-300">
                        <div>
                            <strong className="text-gray-900 dark:text-gray-100">3.1. PAYMENT TERMS</strong>
                            <div className="ml-4 mt-1 text-xs text-gray-700 dark:text-gray-300">
                                Credit purchases made thru the SMEC shall be paid in four (4) semi-monthly installments
                                starting on the first pay date right after the purchase period thru salary deduction.
                            </div>
                        </div>

                        <div>
                            <strong className="text-gray-900 dark:text-gray-100">3.2. SUSPENSION / CANCELLATION OF THE SM E-CARD (SMEC)</strong>
                            <div className="ml-8 space-y-1 mt-1 text-xs text-gray-700 dark:text-gray-300">
                                <div>
                                    <strong className="text-gray-800 dark:text-gray-200">3.2.1.</strong> If an employee goes on maternity leave/ prolonged absence / absence without leave, the
                                    SMEC of the employee shall be suspended on the first/actual day the employee goes on
                                    such leave or upon receipt of an advice from Personnel. The SMEC shall only be reinstated
                                    after full payment of the unpaid credit balance.
                                </div>
                                <div>
                                    <strong className="text-gray-800 dark:text-gray-200">3.2.2.</strong> If the net pay of an employee is less than 30% of his gross pay for one (1) pay date.
                                </div>
                                <div>
                                    <strong className="text-gray-800 dark:text-gray-200">3.2.3.</strong> If an employee incurs a past due in his credit balance. The SMEC shall be suspended
                                    immediately after the past due amount was incurred. The SMEC shall be reinstated after
                                    full payment/ settlement of the unpaid balance.
                                </div>
                            </div>
                        </div>

                        <div>
                            <strong className="text-gray-900 dark:text-gray-100">3.3. SEPARATION FROM SERVICE</strong>
                            <div className="ml-4 mt-1 text-xs text-gray-700 dark:text-gray-300">
                                No clearance shall be issued by Personnel to any employee upon the latter's resignation from
                                the service until the SM E-CARD has been surrendered to Personnel and all credit purchases
                                are fully settled.
                            </div>
                        </div>

                        <div>
                            <strong className="text-gray-900 dark:text-gray-100">3.3. USE OF PERSONAL INFORMATION</strong>
                            <div className="ml-4 mt-1 text-xs text-gray-700 dark:text-gray-300">
                                The personal information of the member shall be used or processed pursuant to any or all of the
                                following purposes:
                            </div>

                            <div className="ml-8 space-y-1 mt-1 text-xs text-gray-700 dark:text-gray-300">
                                <div>
                                    <strong className="text-gray-800 dark:text-gray-200">3.4.1.</strong> For administration of SME-Card program, including registration, maintenance of the
                                    member's account and such services necessarily related to the program;
                                </div>
                                <div>
                                    <strong className="text-gray-800 dark:text-gray-200">3.4.2.</strong> For direct marketing, market research and analysis aimed to improve the services
                                    and/or the program;
                                </div>
                                <div>
                                    <strong className="text-gray-800 dark:text-gray-200">3.4.3.</strong> To send you information on marketing and promotions and such commercial
                                    communications related to your account or membership;
                                </div>
                                <div>
                                    <strong className="text-gray-800 dark:text-gray-200">3.4.4.</strong> To serve the Company's legitimate business purposes, such as but not limited to
                                    monitoring your compliance with the terms of use.
                                </div>
                            </div>

                            <div className="ml-4 mt-1 text-xs text-gray-700 dark:text-gray-300">
                                In certain circumstances, we may need to provide or disclose the member's information with
                                our SM affiliates and/or your employer on record in order to enforce the terms of use of the
                                SM E-card; with the government or local authorities, as the case may be, in order to comply
                                with legal or regulatory requirements, such as criminal, civil or administrative investigations,
                                among others.
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={() => {
                            onCancel?.();
                            onOpenChange(false);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 transition cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={async () => {
                            onOpenChange(false);
                            await onConfirm();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition cursor-pointer"
                    >
                        {confirmText}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
