import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import SignaturePad, { SignaturePadRef } from "@/components/ui/signature-pad";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { Location, User, type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowCounterClockwise, BuildingIcon, Check, PaperPlaneTilt, PencilSimple, UserCheckIcon, X } from '@phosphor-icons/react';
import axios from 'axios';
import * as React from 'react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useForm, useWatch, Controller, Control } from 'react-hook-form';
import { toast, Toaster } from 'sonner';
import Swal from 'sweetalert2';
import useSWR, { mutate } from 'swr';
import { z } from 'zod';
import { CalendarIcon, Save } from "lucide-react";
import {
    LucideIcon,
    AlertTriangle,
    CircleAlert,
    OctagonX,
    LaptopMinimalCheck,
    Hourglass,
    FileCheck2
} from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Confirm } from "@/components/dialogs/confirm-dialog";
import { Loading } from "@/components/dialogs/loading-dialog";
import { Alert } from "@/components/dialogs/alert-dialog";
import { Guidelines } from "@/components/dialogs/ecard-guidelines";
import countries from "world-countries";

import { SearchableSelect } from '@/components/others/searchable-select';
import StatusCard from '@/components/others/status-card';

const breadcrumbs: BreadcrumbItemType[] = [
    {
        title: 'E-Card Form',
        href: '/index',
    },
];

interface Provinces {
    Province_ID: number;
    Province: string;
}

interface Municipalities {
    Municipal_ID: number;
    Municipal: string;
}


const formSchema = z
    .object({

        /**----------------- ECard Form -------------------------- */
        lastName: z.string().min(1, "Last Name is required."),
        firstName: z.string().min(1, "First name is required."),
        middleInitial: z.string().optional(),
        employeeNo: z.string().min(1, "Employee number is required."),
        company: z.string().min(1, "Company is required."),
        companyCode: z.string().min(1, "Company Code is required."),
        position: z.string().min(1, "Position is required."),
        branch: z.string().min(1, "Branch is required."),
        branchCode: z.string().min(1, "Branch Code is required."),

        /**----------------- BDO Form -------------------------- */
        bdoLastName: z.string().min(1, "Last Name is required."),
        bdoFirstName: z.string().min(1, "First Name is required."),
        bdoMiddleName: z.string().optional(),
        bdoSuffix: z.string().optional(),

        bdoDateOfBirth: z
            .string()
            .nonempty("Date of birth is required")
            .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Invalid date format."),

        bdoMobileNumber: z
            .string()
            .regex(/^\(\+63\) \d{2} \d{4}-\d{4}$/, "Mobile number is incomplete."),

        bdoEmailAddress: z
            .string()
            .min(1, "Email address is required.")
            .email("Invalid email address."),

        bdoPlaceOfBirth: z.string().min(1, "Place of Birth is required."),
        bdoCountryOfBirth: z.string().min(1, "Country of Birth is required."),
        bdoNationality: z.string().min(1, "Nationality is required."),
        bdoUbs: z.string().min(1, "Unit No./Building/Block No./Street is required."),
        bdoVillage: z.string().min(1, "Subdivision/Village is required."),
        bdoCity: z.string().optional(),
        bdoCity_ID: z.string().min(1, "City is required."),
        bdoProvince: z.string().optional(),
        bdoProvince_ID: z.string().min(1, "Provice/State is required."),
        bdoCountry: z.string().min(1, "Country is required."),
        bdoZip: z.string().min(1, "Zip Code is required."),
        bdoEmployeeNo: z.string().min(1, "Employee No. is required."),
        bdoCompany: z.string().min(1, "Company Name is required."),
        bdoBranch: z.string().optional(),
        bdoDepartment: z.string().min(1, "Department is required."),
        bdoPosition: z.string().min(1, "Position is required."),

        signature: z.string().min(1, "Signature is required."),
        // bdoSignature1: z.string().min(1, "Signature is required."),
        // bdoSignature2: z.string().min(1, "Signature is required."),

        q1: z
            .string()
            .nullable()
            .refine((val) => val !== null && val.trim() !== "", {
                message: "Provide an answer.",
            }),
        q2: z
            .string()
            .nullable()
            .refine((val) => val !== null && val.trim() !== "", {
                message: "Provide an answer.",
            }),
        q3: z
            .string()
            .nullable()
            .refine((val) => val !== null && val.trim() !== "", {
                message: "Provide an answer.",
            }),
        q4: z
            .string()
            .nullable()
            .refine((val) => val !== null && val.trim() !== "", {
                message: "Provide an answer.",
            }),
        q5: z
            .string()
            .nullable()
            .refine((val) => val !== null && val.trim() !== "", {
                message: "Provide an answer.",
            }),

        q6: z
            .string()
            .nullable()
            .refine((val) => val !== null && val.trim() !== "", {
                message: "Provide an answer.",
            }),

        agreement1: z.literal(true, {
            errorMap: () => ({ message: "You must accept the Credit Agreement." }),
        }),

        agreement2: z.literal(true, {
            errorMap: () => ({ message: "You must agree to the Undertaking and authority for salary deduction." }),
        }),

        agreement3: z.literal(true, {
            errorMap: () => ({ message: "You must agree to the Privacy Consent." }),
        }),

        agreement4: z.literal(true, {
            errorMap: () => ({ message: "You must agree to the Data Privacy Consent." }),
        }),

        agreement5: z.literal(true, {
            errorMap: () => ({ message: "You must agree to the Customer Undertaking." }),
        }),

    })

type FormData = z.infer<typeof formSchema>;



export default function Show() {

    /**--------------------------------User Info -------------------------------*/
    const { auth } = usePage().props;
    const { user } = auth as { user: User; location: Location };

    /**---------------------------------- Web URL ------------------------------- */
    // const WebUrl = import.meta.env.VITE_WEBURL;
    const WebUrl = "";

    /**--------------------------------------- Variables --------------------- */
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSubmit, setisLoadingSubmit] = useState(false);
    const [loading, setLoading] = useState(true);

    /**----------------------------------- Alert Dialog --------------------*/
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertDescription, setAlertDescription] = useState("");
    const [alertIcon, setAlertIcon] = useState<LucideIcon | undefined>(undefined);
    const [alertVariant, setAlertVariant] = useState<"error" | "warning" | "success" | "info">("info");
    const [alertConfirmText, setAlertConfirmText] = useState("");
    const [alertCancelText, setAlertCancelText] = useState("");

    /** ------------------------------- PDF URL ------------------------------- */
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    /** ---------------------------- Check if already submitted ------------------- */
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState("");
    const [statusIcon, setStatusIcon] = useState<LucideIcon | undefined>(undefined);
    const [statusTitle, setStatusTitle] = useState("");
    const [statusDescription, setStatusDescription] = useState("");
    const [statusViewLink, setStatusViewLink] = useState("");
    const [statusClass, setStatusClass] = useState("");

    useEffect(() => {
        const checkStatus = async () => {
            const res = await fetch(`${WebUrl}/api/check-ecard-status/${user.Emp_ID}`);
            const data = await res.json();
            setHasSubmitted(data.hasSubmitted);
            setApplicationStatus(data.status);

            if (data.status === "Submitted") {
                setStatusIcon(Hourglass);
                setStatusTitle("Your application is on-going");
                setStatusDescription("We're processing your application. You can check back later.");
                setStatusClass("text-blue-500 dark:text-blue-400");

                const pdfLink = `${WebUrl}/storage/${data.filepath}/${data.filename}`;
                setStatusViewLink(pdfLink);
            } else if (data.status === "Generated") {
                setStatusIcon(FileCheck2);
                setStatusTitle("Your application has already been generated");
                setStatusDescription("You can view or download it below.");
                setStatusClass("text-green-500 dark:text-green-400");

                const pdfLink = `${WebUrl}/storage/${data.filepath}/${data.filename}`;
                setStatusViewLink(pdfLink);
            }
        };
        checkStatus();
    }, []);

    /** ----------- For Loading ------------------------- */
    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => {
                setLoading(false);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [loading]);

    /**-----------------------------------Confirmation Dialog --------------------*/
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState("Confirm");
    const [confirmDescription, setConfirmDescription] = useState("Are you sure?");

    /**----------------------------------- Guidelines Dialog --------------------*/
    const [guidelineOpen, setGuidelineOpen] = useState(false);

    /** --------------------------------------- Open Generated PDF ---------------------------- */
    const handleAlertClose = () => {
        setAlertOpen(false);

        if (pdfUrl) {
            window.open(pdfUrl);
            setPdfUrl(null);
            window.location.reload();
        }
    };

    /**-------------------------------------- Signature Watchers --------------------------------- */
    const sigRef = useRef<SignaturePadRef>(null);

    /**--------------------------- Form Variables ------------------------------*/
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            lastName: "",
            firstName: "",
            middleInitial: "",
            employeeNo: "",
            company: "",
            companyCode: "",
            position: "",
            branch: "",
            branchCode: "",

            /**----------------- BDO Form -------------------------- */
            bdoLastName: "",
            bdoFirstName: "",
            bdoMiddleName: "",
            bdoSuffix: "",

            bdoDateOfBirth: "",
            bdoMobileNumber: "",
            bdoEmailAddress: "",

            bdoPlaceOfBirth: "",
            bdoCountryOfBirth: "",
            bdoNationality: "",
            bdoUbs: "",
            bdoVillage: "",
            bdoCity: "",
            bdoCity_ID: "",
            bdoProvince: "",
            bdoProvince_ID: "",
            bdoCountry: "",
            bdoZip: "",
            bdoEmployeeNo: "",
            bdoCompany: "",
            bdoBranch: "",
            bdoDepartment: "",
            bdoPosition: "",

            signature: "",

            q1: null,
            q2: null,
            q3: null,
            q4: null,
            q5: null,
            q6: null,
        }
    });

    const { reset, formState: { errors } } = form;

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.Emp_ID) return;
            setLoading(true);

            try {
                const res = await fetch(`${WebUrl}/api/get-profile/${user.Emp_ID}`);
                const data = await res.json();

                // 🔹 Map API response fields to form fields
                reset({
                    lastName: data.LastName || "",
                    firstName: data.FirstName || "",
                    middleInitial: data.MiddleName ? data.MiddleName.charAt(0) : "",
                    employeeNo: data.EmployeeNo || "",
                    company: data.Company || "",
                    companyCode: data.CompanyCode || "",
                    position: data.Position || "",
                    branch: data.Branch || "",
                    branchCode: data.BranchCode || "",

                    /** ----------------- BDO Form -------------------------- */
                    bdoLastName: data.LastName || "",
                    bdoFirstName: data.FirstName || "",
                    bdoMiddleName: data.MiddleName || "",
                    bdoSuffix: "",

                    bdoDateOfBirth: data.Birthdate
                        ? format(new Date(data.Birthdate), "MM/dd/yyyy")
                        : "",
                    bdoMobileNumber: data.MobileNumber || "",
                    bdoEmailAddress: data.Email || "",

                    bdoPlaceOfBirth: "",
                    bdoCountryOfBirth: "",
                    bdoNationality: "Filipino",
                    bdoUbs: "",
                    bdoVillage: "",
                    bdoCity: "",
                    bdoProvince: "",
                    bdoCountry: "",
                    bdoZip: "",
                    bdoEmployeeNo: data.EmployeeNo || "",
                    bdoCompany: data.Company || "",
                    bdoBranch: data.Branch || "",
                    bdoDepartment: data.Department || "",
                    bdoPosition: data.Position || "",


                    signature: "",
                    q1: "",
                    q2: "",
                    q3: "",
                    q4: "",
                    q5: "",
                    q6: "",
                });

            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [reset, user?.Emp_ID]);


    useEffect(() => {
        const firstErrorField = Object.keys(errors)[0] as keyof typeof errors;
        if (firstErrorField) {
            const el = document.querySelector<HTMLInputElement>(
                `[name="${firstErrorField}"]`
            );
            el?.focus();
        }
    }, [errors]);


    const { watch, setValue } = form;

    const sortedCountries = [
        ...countries.filter((c) => c.name.common === "Philippines"),
        ...countries
            .filter((c) => c.name.common !== "Philippines")
            .sort((a, b) => a.name.common.localeCompare(b.name.common)),
    ];

    /** --------------------------------- Fetch Address Options --------------------------- */
    const [provinces, setProvinces] = useState<Provinces[]>([]);
    const [municipalities, setMunicipalities] = useState<Municipalities[]>([]);


    useEffect(() => {
        const fetchProvinces = async () => {
            const res = await fetch(`${WebUrl}/api/get-address-options`);
            const data: Provinces[] = await res.json();

            const uniqueProvinces = [...new Map(data.map(d => [d.Province_ID, d])).values()];
            setProvinces(uniqueProvinces);
        };

        fetchProvinces();
    }, []);

    useEffect(() => {
        const provinceId = form.watch("bdoProvince_ID");
        if (!provinceId) {
            setMunicipalities([]);
            return;
        }

        const fetchMunicipalities = async () => {
            const res = await fetch(`${WebUrl}/api/get-address-options?provinceId=${provinceId}`);
            const data: Municipalities[] = await res.json();

            const uniqueMunicipalities = [...new Map(data.map(d => [d.Municipal_ID, d])).values()];
            setMunicipalities(uniqueMunicipalities);
        };

        fetchMunicipalities();
    }, [form.watch("bdoProvince_ID")]);

    /**------------------------------------- Handle Submit / Save ---------------------------------*/
    const handleSave = async () => {
        const isValid = await form.trigger();
        const signatureEmpty = sigRef.current?.isEmpty?.();

        const otherErrors = Object.keys(form.formState.errors).filter(
            (key) => key !== "signature"
        );

        if (!isValid) {
            if (signatureEmpty && otherErrors.length === 0) {
                toast.error("Please provide your signature before submitting.");
                form.setError("signature", {
                    type: "manual",
                    message: "Signature is required",
                });
            }
            return;
        }

        if (signatureEmpty) {
            toast.error("Please provide your signature before submitting.");
            form.setError("signature", {
                type: "manual",
                message: "Signature is required",
            });
            return;
        }

        setConfirmTitle("Submit Form?");
        setConfirmDescription("Do you want to submit this form?");
        setConfirmOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="E-Card Form" />
            <Toaster position="top-right" />
            {loading ? (
                <div className="space-y-4 p-8">
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-full animate-pulse mt-6"></div>
                </div>
            ) : (
                <>
                    {' '}
                    <div className="w-full space-y-6 px-4 py-6 md:px-8 lg:px-16">
                        {/* Breadcrumbs */}
                        <div className="flex flex-col gap-y-2 text-xs font-medium text-gray-700 md:flex-row md:items-center md:justify-between">
                            <Breadcrumb className="text-[0.70rem]">
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <UserCheckIcon></UserCheckIcon>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <BreadcrumbLink>{user.info?.EmployeeNo}</BreadcrumbLink>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Employee Number</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <BreadcrumbPage className="text-[0.75rem]">{user.info?.FullName}</BreadcrumbPage>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Employee Name</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>

                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink className="text-[0.75rem]">
                                            <BuildingIcon></BuildingIcon>
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <BreadcrumbLink className="text-[0.75rem]">{user.info?.location?.LocationCode}</BreadcrumbLink>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Location Code</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <BreadcrumbPage className="text-[0.75rem]">{user.info?.location?.Location}</BreadcrumbPage>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Location</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </div>

                    {hasSubmitted && (
                        <StatusCard
                            icon={statusIcon || Hourglass}
                            title={statusTitle}
                            message={statusDescription}
                            buttonLink={statusViewLink}
                            colorClass={statusClass}
                        />
                    )}

                    {!hasSubmitted && (
                        <div className="w-full space-y-2 px-2 py-6 md:px-1 lg:px-4">
                            <div className="w-full px-4 py-4">
                                <Card className="w-full p-4 mb-4">
                                    <CardHeader className="text-lg font-semibold">New E-Card Application</CardHeader>
                                    <CardContent>
                                        <Form {...form}>
                                            <form className="space-y-6">
                                                <div className="col-span-full mt-4 text-sm font-bold bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100">
                                                    APPLICANT'S INFORMATION
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="lastName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Last Name</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Last Name" maxLength={50} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="firstName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>First Name</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter First Name" maxLength={50} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="middleInitial"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Middle Initial</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Middle Initial" maxLength={3} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="employeeNo"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Employee No.</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Employee Number" maxLength={20} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="company"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Company</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Company" maxLength={100} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="companyCode"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Company Code</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Company Code" maxLength={20} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="position"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Position</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Position" maxLength={100} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="branch"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Branch</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Branch" maxLength={100} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="branchCode"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Branch Code</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Branch Code" maxLength={20} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="col-span-full mt-4 text-sm font-bold bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100">
                                                    CREDIT AGREEMENT
                                                </div>
                                                <div className="flex-1">
                                                    <label className="flex items-start space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            {...form.register("agreement1")}
                                                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <div className="text-xs text-gray-600 dark:text-gray-300">
                                                            <p className="text-justify">
                                                                I, {user.info?.FullName} with personal circumstances set forth in the Credit Card Application, hereby apply for an SM E-Card and, upon approval, agree to be bound by the Policies and Guidelines as printed at the back hereof, which I have fully understood. I further agree to be bound by the following terms and conditions:
                                                            </p>

                                                            <ol className="list-decimal list-inside mt-2 space-y-1">
                                                                <li>
                                                                    The use of the SM E-Card is not a right but a mere privilege. By virtue of this privilege, all employees are prohibited from:
                                                                    <ul className="list-none ml-4 space-y-1">
                                                                        <li>a. Holding another SM Credit Card issued by SM Credit Partner/Guarantor.</li>
                                                                        <li>b. Acting as a Co-Maker/Sub-Guarantor for SM Guarantor Cards.</li>
                                                                    </ul>
                                                                </li>
                                                                <li>
                                                                    Purchase periods shall be twice (2) a month: 1st–15th and 16th–last day of the month. Purchases made through the SM E-Card shall be paid in four (4) semi-monthly installments starting on the first (1st) pay date right after the purchase period through salary deduction.
                                                                </li>
                                                                <li>
                                                                    Without prior notice to the employee, SM may, at any time and for any cause, suspend the SM E-Card.
                                                                </li>
                                                                <li>
                                                                    The employee shall be liable for all purchases made through the use of the SM E-Card.
                                                                </li>
                                                            </ol>
                                                        </div>
                                                    </label>
                                                    {form.formState.errors.agreement1 && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {form.formState.errors.agreement1.message}
                                                        </p>
                                                    )}
                                                </div>



                                                <div className="col-span-full mt-4 text-sm font-bold bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100">
                                                    UNDERTAKING AND AUTHORITY FOR SALARY DEDUCTION
                                                </div>
                                                <div className="flex-1">
                                                    <label className="flex items-start space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            {...form.register("agreement2")}
                                                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <div className="text-xs text-gray-600 dark:text-gray-300">
                                                            I, {user.info?.FullName} as a Credit Applicant, bind myself and am liable to SM for all purchases made through the
                                                            use of the SM E-Card as may be issued to the applicant. I further irrevocably authorize SM or my employer to deduct from my
                                                            salary and other financial benefits I may receive as employee, all unpaid credit purchases made through the use of the card.
                                                        </div>
                                                    </label>
                                                    {form.formState.errors.agreement2 && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {form.formState.errors.agreement2.message}
                                                        </p>
                                                    )}
                                                </div>


                                                <div className="col-span-full mt-4 text-sm font-bold bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100">
                                                    PRIVACY CONSENT CLAUSE
                                                </div>

                                                <div className="flex flex-col md:flex-row items-start gap-4">
                                                    <div className="flex-1">
                                                        <label className="flex items-start space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                {...form.register("agreement3")}
                                                                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <div className="text-xs text-gray-600 dark:text-gray-300">
                                                                By signing this application form and providing my personal information, I expressly give consent to SM RETAIL INC. (SMRI) and its
                                                                service group to collect, use, store, share or otherwise process my personal information in line with my application for
                                                                membership with the SM E-Card. I authorize SMRI to use and process my personal information in line with the legitimate business
                                                                purposes of the SM E-Card Program.
                                                            </div>
                                                        </label>
                                                        {form.formState.errors.agreement3 && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {form.formState.errors.agreement3.message}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* <div className="flex flex-col md:w-[600px] w-full">
                                                    <Controller
                                                        control={form.control}
                                                        name="signature1"
                                                        render={({ field, fieldState }) => (
                                                            <>
                                                                <SignaturePad
                                                                    ref={sigRef}
                                                                    className="border border-gray-300 rounded"
                                                                    onEnd={async () => {
                                                                        if (sigRef.current && !sigRef.current.isEmpty()) {
                                                                            const dataForPDF = await sigRef.current.getDataForPDF();
                                                                            setValue("signature1", dataForPDF, { shouldValidate: true });
                                                                        }
                                                                    }}
                                                                />
                                                                {fieldState.error && (
                                                                    <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                                                                )}
                                                            </>
                                                        )}
                                                    />


                                                    <div className="mt-2 flex justify-end">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => {
                                                                sigRef.current?.clear();
                                                                form.setValue("signature1", "");
                                                            }}
                                                            className="bg-red-500 text-white hover:bg-red-600 border-none dark:bg-red-400 dark:text-black dark:hover:bg-red-500 cursor-pointer"
                                                        >
                                                            Clear
                                                        </Button>
                                                    </div>
                                                </div> */}
                                                </div>
                                            </form>
                                        </Form>
                                    </CardContent>
                                </Card>

                                <Card className="w-full p-4 mb-4">
                                    <CardHeader className="text-lg font-semibold">SM Privilege Card Application Form</CardHeader>
                                    <CardContent>
                                        <Form {...form}>
                                            <form className="space-y-6">
                                                <div className="col-span-full mt-4 text-sm font-bold bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100">
                                                    I. CARDHOLDER INFORMATION
                                                </div>
                                                <div className="col-span-full mt-4 text-xs font-medium mb-1">
                                                    Full Name
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="bdoLastName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Last Name</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Last Name" maxLength={50} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="bdoFirstName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>First Name</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter First Name" maxLength={50} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="bdoMiddleName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Middle Name</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Middle Name" maxLength={50} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="bdoSuffix"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Suffix</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="Enter Suffix"
                                                                        maxLength={5}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value.replace(/[0-9]/g, "");
                                                                            field.onChange(value);
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />


                                                    <FormField
                                                        control={form.control}
                                                        name="bdoDateOfBirth"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Date of Birth</FormLabel>
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <Input
                                                                            {...field}
                                                                            placeholder="mm/dd/yyyy"
                                                                            maxLength={10}
                                                                            onChange={(e) => {
                                                                                let value = e.target.value.replace(/[^\d/]/g, "");
                                                                                if (value.length > 2 && value[2] !== "/") {
                                                                                    value = value.slice(0, 2) + "/" + value.slice(2);
                                                                                }
                                                                                if (value.length > 5 && value[5] !== "/") {
                                                                                    value = value.slice(0, 5) + "/" + value.slice(5);
                                                                                }
                                                                                field.onChange(value);
                                                                            }}
                                                                            className={`pr-10 ${form.formState.errors.bdoDateOfBirth ? "border-red-500" : ""}`}
                                                                        />
                                                                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="bdoMobileNumber"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Mobile Number</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="(+63) XX XXXX-XXXX"
                                                                        maxLength={18}
                                                                        value={field.value || "(+63) "}
                                                                        onChange={(e) => {
                                                                            let digits = e.target.value.replace(/\D/g, "");

                                                                            if (digits.startsWith("63")) digits = digits.slice(2);
                                                                            digits = digits.slice(0, 10);

                                                                            let formatted = "";

                                                                            if (digits.length === 0) {
                                                                                formatted = "(+63) ";
                                                                            } else {
                                                                                formatted = "(+63) " + digits.slice(0, 2);
                                                                                if (digits.length > 2) formatted += " " + digits.slice(2, 6);
                                                                                if (digits.length > 6) formatted += "-" + digits.slice(6, 10);
                                                                            }

                                                                            field.onChange(formatted);
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="bdoEmailAddress"
                                                        render={({ field, fieldState }) => (
                                                            <FormItem>
                                                                <FormLabel>Email Address</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Email Address" maxLength={100} />
                                                                </FormControl>
                                                                <FormMessage>{fieldState.error?.message}</FormMessage>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="bdoPlaceOfBirth"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Place of Birth</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Place of Birth" maxLength={100} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="bdoCountryOfBirth"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Country of Birth</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select Country of Birth" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                    <SelectContent>
                                                                        {sortedCountries.map((country) => (
                                                                            <SelectItem key={country.cca2} value={country.name.common}>
                                                                                {country.name.common}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="bdoNationality"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Nationality</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Nationality" maxLength={100} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="col-span-full mt-4 text-xs font-medium mb-1">
                                                    Home Address
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="bdoUbs"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Unit No./Building/Block No./ Street</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Unit No./Building/Block No./Street" maxLength={100} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="bdoVillage"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Subdivision/Village</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Subdivision/Village" maxLength={100} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    {/* <FormField
                                                    control={form.control}
                                                    name="bdoCity"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>City</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} placeholder="Enter City" maxLength={100} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="bdoProvince"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Province/State</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} placeholder="Enter Province/State" maxLength={100} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                /> */}

                                                    {/* Province */}
                                                    <FormField
                                                        control={form.control}
                                                        name="bdoProvince_ID"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Province</FormLabel>
                                                                <FormControl>
                                                                    <SearchableSelect
                                                                        form={form}
                                                                        name="bdoProvince_ID"
                                                                        labelField="bdoProvince"
                                                                        options={provinces.map((r) => ({
                                                                            id: r.Province_ID,
                                                                            label: r.Province,
                                                                        }))}
                                                                        dependencies={["bdoCity_ID"]}
                                                                        placeholder="Select Province"
                                                                        // className={sameAsPermanent ? "pointer-events-none opacity-70" : ""}
                                                                        hasError={!!form.formState.errors[field.name]}

                                                                    />
                                                                </FormControl>
                                                                {form.formState.errors[field.name]?.message && (
                                                                    <span
                                                                        className="text-sm mt-1"
                                                                        style={{ color: "#E8001B" }}
                                                                    >
                                                                        Province is required.
                                                                    </span>
                                                                )}
                                                            </FormItem>

                                                        )}
                                                    />



                                                    {/* City */}
                                                    <FormField
                                                        control={form.control}
                                                        name="bdoCity_ID"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>City</FormLabel>
                                                                <FormControl>
                                                                    <SearchableSelect
                                                                        form={form}
                                                                        name="bdoCity_ID"
                                                                        labelField="bdoCity"
                                                                        options={municipalities.map((r) => ({
                                                                            id: r.Municipal_ID,
                                                                            label: r.Municipal,
                                                                        }))}
                                                                        dependencies={[""]}
                                                                        placeholder="Select City"

                                                                        hasError={!!form.formState.errors[field.name]}
                                                                    />
                                                                </FormControl>
                                                                {form.formState.errors[field.name]?.message && (
                                                                    <span
                                                                        className="text-sm mt-1"
                                                                        style={{ color: "#E8001B" }}
                                                                    >
                                                                        City is required.
                                                                    </span>
                                                                )}
                                                            </FormItem>

                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="bdoCountry"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Country </FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select Country " />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                    <SelectContent>
                                                                        {sortedCountries.map((country) => (
                                                                            <SelectItem key={country.cca2} value={country.name.common}>
                                                                                {country.name.common}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="bdoZip"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Zip Code</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="Enter Zip Code"
                                                                        maxLength={4}
                                                                        onKeyDown={(e) => {
                                                                            const allowedKeys = [
                                                                                "Backspace",
                                                                                "Tab",
                                                                                "ArrowLeft",
                                                                                "ArrowRight",
                                                                                "Delete",
                                                                                "Home",
                                                                                "End",
                                                                            ];

                                                                            if ((e.ctrlKey || e.metaKey) && ["a", "c", "x"].includes(e.key.toLowerCase())) {
                                                                                return;
                                                                            }

                                                                            if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                                                                                e.preventDefault();
                                                                            }
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="col-span-full mt-4 text-sm font-bold bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100">
                                                    II. EMPLOYMENT INFORMATION
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="bdoEmployeeNo"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Employee No.</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Employee Number" maxLength={20} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="bdoCompany"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Company Name</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Company Name" maxLength={100} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="bdoBranch"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Branch (if applicable)</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Branch" maxLength={100} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="bdoDepartment"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Department</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Department" maxLength={100} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="bdoPosition"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Position</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Position" maxLength={100} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="col-span-full mt-4 text-sm font-bold bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100">
                                                    III. REGULATORY REQUIREMENTS
                                                </div>
                                                <div className="col-span-full mt-4 text-xs font-medium mb-1">
                                                    Related Party Questionnaire
                                                </div>

                                                <div className="space-y-6 mt-4">

                                                    {/* Q1 */}
                                                    <div className="grid grid-cols-1 md:grid-cols-[80%_20%] gap-4 items-start">
                                                        <div className="font-medium text-sm">
                                                            1. Are you a director, officer, or stockholder of BDO or BDO-affiliated company?
                                                        </div>
                                                        <FormField
                                                            control={form.control}
                                                            name="q1"
                                                            render={({ field, formState }) => (
                                                                <FormItem className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                                                                    <div className="flex space-x-6 items-center">
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="radio"
                                                                                value="1"
                                                                                checked={field.value === "1"}
                                                                                onChange={() => field.onChange("1")}
                                                                                className="accent-gray-500 w-4 h-4"
                                                                            />
                                                                            <span>Yes</span>
                                                                        </label>
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="radio"
                                                                                value="0"
                                                                                checked={field.value === "0"}
                                                                                onChange={() => field.onChange("0")}
                                                                                className="accent-gray-500 w-4 h-4"
                                                                            />
                                                                            <span>No</span>
                                                                        </label>
                                                                    </div>
                                                                    {formState.errors.q1 && (
                                                                        <span className="text-xs text-red-600">{formState.errors.q1.message}</span>
                                                                    )}
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Q2 */}
                                                    <div className="grid grid-cols-1 md:grid-cols-[80%_20%] gap-4 items-start">
                                                        <div className="font-medium text-sm">
                                                            2. Are you a spouse or relative up to second degree, i.e. parent, child, grandparent, grandchild, brother, sister
                                                            (biologically, legally adopted, or in-law) of a Director, Officer, Stockholder of BDO and/or BDO-affiliated companies?
                                                            <span className="ml-1 font-normal text-[10px]">(If 'Yes', accomplish 'Form B10')</span>
                                                        </div>
                                                        <FormField
                                                            control={form.control}
                                                            name="q2"
                                                            render={({ field, formState }) => (
                                                                <FormItem className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                                                                    <div className="flex space-x-6 items-center">
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="radio"
                                                                                value="1"
                                                                                checked={field.value === "1"}
                                                                                onChange={() => field.onChange("1")}
                                                                                className="accent-gray-500 w-4 h-4"
                                                                            />
                                                                            <span>Yes</span>
                                                                        </label>
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="radio"
                                                                                value="0"
                                                                                checked={field.value === "0"}
                                                                                onChange={() => field.onChange("0")}
                                                                                className="accent-gray-500 w-4 h-4"
                                                                            />
                                                                            <span>No</span>
                                                                        </label>
                                                                    </div>
                                                                    {formState.errors.q2 && (
                                                                        <span className="text-xs text-red-600">{formState.errors.q2.message}</span>
                                                                    )}
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Q3 */}
                                                    <div className="grid grid-cols-1 md:grid-cols-[80%_20%] gap-4 items-start">
                                                        <div className="text-sm font-medium space-y-1">
                                                            <div className="text-xs font-medium mb-1">
                                                                Political Relations and Affiliations Questionnaire
                                                            </div>
                                                            <div>
                                                                3. Do you have previous and current affiliation/dealings with the Government and/or relations to any government official in the Philippines or another country?
                                                                <span className="ml-1 font-normal text-[10px]">(If 'YES', accomplish 'Form A6')</span>
                                                            </div>
                                                        </div>
                                                        <FormField
                                                            control={form.control}
                                                            name="q3"
                                                            render={({ field, formState }) => (
                                                                <FormItem className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                                                                    <div className="flex space-x-6 items-center">
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="radio"
                                                                                value="1"
                                                                                checked={field.value === "1"}
                                                                                onChange={() => field.onChange("1")}
                                                                                className="accent-gray-500 w-4 h-4"
                                                                            />
                                                                            <span>Yes</span>
                                                                        </label>
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="radio"
                                                                                value="0"
                                                                                checked={field.value === "0"}
                                                                                onChange={() => field.onChange("0")}
                                                                                className="accent-gray-500 w-4 h-4"
                                                                            />
                                                                            <span>No</span>
                                                                        </label>
                                                                    </div>
                                                                    {formState.errors.q3 && (
                                                                        <span className="text-xs text-red-600">{formState.errors.q3.message}</span>
                                                                    )}
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Q4 */}
                                                    <div className="grid grid-cols-1 md:grid-cols-[80%_20%] gap-4 items-start">
                                                        <div className="text-sm font-medium space-y-1">
                                                            <div className="text-xs font-medium mb-1">
                                                                Foreign Account Tax Compliance Act (FATCA) Questionnaire (Refer to 'Instructions' for details on the 'Substantial Presence Test')
                                                            </div>
                                                            <div>
                                                                4. Are you obligated to pay taxes to the U.S. IRS because of your citizenship, residency, or other reasons such as meeting
                                                                the Substantial Presence Test?
                                                                <span className="ml-1 font-normal text-[10px]">(If 'YES', accomplish 'Form A7')</span>
                                                            </div>
                                                        </div>
                                                        <FormField
                                                            control={form.control}
                                                            name="q4"
                                                            render={({ field, formState }) => (
                                                                <FormItem className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                                                                    <div className="flex space-x-6 items-center">
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="radio"
                                                                                value="1"
                                                                                checked={field.value === "1"}
                                                                                onChange={() => field.onChange("1")}
                                                                                className="accent-gray-500 w-4 h-4"
                                                                            />
                                                                            <span>Yes</span>
                                                                        </label>
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="radio"
                                                                                value="0"
                                                                                checked={field.value === "0"}
                                                                                onChange={() => field.onChange("0")}
                                                                                className="accent-gray-500 w-4 h-4"
                                                                            />
                                                                            <span>No</span>
                                                                        </label>
                                                                    </div>
                                                                    {formState.errors.q4 && (
                                                                        <span className="text-xs text-red-600">{formState.errors.q4.message}</span>
                                                                    )}
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Q5 */}
                                                    <div className="grid grid-cols-1 md:grid-cols-[80%_20%] gap-4 items-start">
                                                        <div className="text-sm font-medium space-y-1">
                                                            <div className="text-xs font-medium mb-1">Online Gaming Questionnaire (Refer to 'Instructions' for details on 'Online Gaming Business')</div>
                                                            <div>
                                                                5. Does your work / business provide service, process transactions, have transactions or related interests / relationships with any
                                                                business or service provider in the online gaming industry?
                                                                <span className="ml-1 font-normal text-[10px]">(If 'YES', accomplish 'Form A8')</span>
                                                            </div>
                                                        </div>
                                                        <FormField
                                                            control={form.control}
                                                            name="q5"
                                                            render={({ field, formState }) => (
                                                                <FormItem className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                                                                    <div className="flex space-x-6 items-center">
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="radio"
                                                                                value="1"
                                                                                checked={field.value === "1"}
                                                                                onChange={() => field.onChange("1")}
                                                                                className="accent-gray-500 w-4 h-4"
                                                                            />
                                                                            <span>Yes</span>
                                                                        </label>
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="radio"
                                                                                value="0"
                                                                                checked={field.value === "0"}
                                                                                onChange={() => field.onChange("0")}
                                                                                className="accent-gray-500 w-4 h-4"
                                                                            />
                                                                            <span>No</span>
                                                                        </label>
                                                                    </div>
                                                                    {formState.errors.q5 && (
                                                                        <span className="text-xs text-red-600">{formState.errors.q5.message}</span>
                                                                    )}
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Q6 */}
                                                    <div className="grid grid-cols-1 md:grid-cols-[80%_20%] gap-4 items-start">
                                                        <div className="text-sm font-medium space-y-1">
                                                            <div className="text-xs font-medium mb-1">Beneficial Ownership</div>
                                                            <div>
                                                                6. Are you opening this account on behalf of someone else?
                                                            </div>
                                                        </div>
                                                        <FormField
                                                            control={form.control}
                                                            name="q6"
                                                            render={({ field, formState }) => (
                                                                <FormItem className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                                                                    <div className="flex space-x-6 items-center">
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="radio"
                                                                                value="1"
                                                                                checked={field.value === "1"}
                                                                                onChange={() => field.onChange("1")}
                                                                                className="accent-gray-500 w-4 h-4"
                                                                            />
                                                                            <span>Yes</span>
                                                                        </label>
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="radio"
                                                                                value="0"
                                                                                checked={field.value === "0"}
                                                                                onChange={() => field.onChange("0")}
                                                                                className="accent-gray-500 w-4 h-4"
                                                                            />
                                                                            <span>No</span>
                                                                        </label>
                                                                    </div>
                                                                    {formState.errors.q5 && (
                                                                        <span className="text-xs text-red-600">{formState.errors.q5.message}</span>
                                                                    )}
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                </div>


                                                <div className="col-span-full mt-4 text-sm font-bold bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100">
                                                    IV. DATA PRIVACY CONSENT
                                                </div>

                                                <div className="flex flex-col md:flex-row items-start gap-4">
                                                    <div className="flex-1">
                                                        <label className="flex items-start space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                {...form.register("agreement4", {
                                                                    required: "You must agree to the Data Privacy Consent.",
                                                                })}
                                                                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <div className="text-xs text-gray-600 dark:text-gray-300">
                                                                <p className="mb-2">
                                                                    In compliance with the requirements of the Data Privacy Act, I hereby give my consent to the BDO Group, consisting of BDO Unibank, Inc. and its subsidiaries [the members of the BDO Group may be accessed at
                                                                    [<a
                                                                        href="https://www.bdo.com.ph/privacy-statement"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
                                                                    >
                                                                        https://www.bdo.com.ph/privacy-statement
                                                                    </a>], to process, collect, store, my personal information or sensitive personal information obtained from me in the course of my transaction/s with the BDO Group. I understand
                                                                    and agree that these information may be disclosed or shared by BDO Group to its members for know-your-client, cross-selling, marketing, or profiling (manual or automatic) purposes to offer and provide new or related
                                                                    products and services of the BDO Group. Further, I hereby give my consent to any member of the BDO Group to process, collect, use, store, share or disclose my personal information or sensitive personal information to
                                                                    third parties for legitimate purposes, or to provide services to me or implement transactions which I may request, allow, or authorize.
                                                                </p>
                                                                <p className="mb-2">
                                                                    I confirm that I understand and agree that my information may continue to be processed, collected, used, stored, or disclosed for ten (10) years from my last
                                                                    transaction date with any member of the BDO Group or until the expiration of the retention limits set by applicable laws, whichever comes later.
                                                                </p>
                                                                <p>
                                                                    I hereby acknowledge and understand that should I wish to withdraw my consent to receive information about new or related products and services
                                                                    of the BDO Group, or to access, update, or correct certain personal data as set out in this form, I may communicate directly with the relevant member
                                                                    of the BDO Group's Data Protection Officer through the email address found at
                                                                    [<a
                                                                        href="https://www.bdo.com.ph/privacy-statement"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
                                                                    >
                                                                        https://www.bdo.com.ph/privacy-statement
                                                                    </a>]. I further acknowledge
                                                                    and understand that I may access and view the BDO Group's Data Privacy Statement at
                                                                    [<a
                                                                        href="https://www.bdo.com.ph/privacy-statement"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
                                                                    >
                                                                        https://www.bdo.com.ph/privacy-statement
                                                                    </a>] or obtain a copy
                                                                    thereof from the office or branch of the relevant member of the BDO Group.
                                                                </p>
                                                            </div>
                                                        </label>
                                                        {form.formState.errors.agreement4 && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {form.formState.errors.agreement4.message}
                                                            </p>
                                                        )}
                                                    </div>

                                                </div>

                                                <div className="col-span-full mt-4 text-sm font-bold bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100">
                                                    V. CUSTOMER UNDERTAKING
                                                </div>
                                                <div className="flex flex-col md:flex-row items-start gap-4">
                                                    {/* Consent Text */}
                                                    <div className="flex-1">
                                                        <label className="flex items-start space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                {...form.register("agreement5", {
                                                                    required: "You must agree to the Customer Undertaking.",
                                                                })}
                                                                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <div className="text-xs text-gray-600 dark:text-gray-300">
                                                                <p className="mb-2">
                                                                    I hereby certify that all information and documents given in this application are true and correct. I understand that non-disclosure and/or falsification of information and documents herein required shall be grounds for the
                                                                    disapproval of my application, immediate termination of my credit card privileges once approved, and/or legal action against me.
                                                                </p>
                                                                <p className="mb-2">
                                                                    I authorize BDO to obtain relevant information as it may require concerning my application under this application form from other institutions and/or persons. All information obtained by or provided to BDO pursuant to this
                                                                    application shall be BDO's property whether or not the SM Privilege Card is approved. In case of disapproval of my application, I understand that BDO is under no obligation to disclose the reason for such disapproval.
                                                                </p>
                                                                <p className="mb-2">
                                                                    I agree that my application shall be subject to applicable laws (including BSP circulars, rules, and regulations), and policies of BDO and undertake to comply with/submit all the requirements. I recognize that BDO is committed
                                                                    to ensuring that confidentiality of my information under R.A. No. 1405 (Bank Secrecy Law of 1955) as amended, R.A. No. 8791 (General Banking Law of 2000) as amended, R.A. No. 6426 (The Foreign Currency Deposit Act)
                                                                    subject to applicable law, and will exert reasonable effort to protect against unauthorized use or disclosure. However, I understand that information regarding my deposit account/s with BDO may be inquired to, or disclosed,
                                                                    in relation to the evaluation of my application, as may be required by applicable rules and laws. I further authorize BDO to: (a) pursuant to BSP Circular No. 472 Series of 2005 as implemented by BIR Revenue Regulation RR-4
                                                                    2005, conduct random verification with the BIR, to establish authenticity of the ITR, accompanying financial statements and such other documents/information/data submitted by me; (b) conduct checking with other
                                                                    governmental entities and third parties including banks and financial institutions to verify documents/information/data submitted by me; and (c) to request information regarding the status of any court case to which I may
                                                                    be a party. I further authorize BDO to disclose to any entity including the company named below, any and all information as may be stated herein or obtained by BDO in relation to my application as may be required to
                                                                    process my application.
                                                                </p>
                                                                <p className="mb-2">
                                                                    If my application is approved, I acknowledge that by signing below and/or at the back of the credit card and/or by using the credit card, I agree to
                                                                    abide by the Terms and Conditions of my approved SM Privilege Card including all future amendments thereto.
                                                                </p>
                                                                <p>
                                                                    I hold myself liable for all obligations and liabilities incurred with the use of the SM Privilege Card, I authorize SM Retail, Inc to deduct payment for
                                                                    the amounts due from my salary and other financial benefits to which I may be entitled to, and immediately remit the payment to BDO. For this
                                                                    purpose, I irrevocably authorize BDO to furnish SM Retail, Inc. my monthly statements of account with information regarding the transactions,
                                                                    amounts due, fees and charges imposed on my SM Privilege Card, and waive confidentiality of these information. Further, I agree that BDO may
                                                                    inquire from SM Retail, Inc. information concerning my employment, salary and other financial benefits to which I may be entitled to and such other
                                                                    information necessary for the settlement of the amounts due to BDO.
                                                                </p>
                                                            </div>
                                                        </label>
                                                        {form.formState.errors.agreement5 && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {form.formState.errors.agreement5.message}
                                                            </p>
                                                        )}
                                                    </div>

                                                </div>


                                            </form>
                                        </Form>
                                    </CardContent>
                                </Card>

                                <Card className="w-full p-4 mb-4">
                                    <CardHeader className="text-lg font-semibold">Signature</CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col md:flex-row items-start gap-4">

                                            <div className="flex flex-col md:w-[600px] w-full">
                                                <Controller
                                                    control={form.control}
                                                    name="signature"
                                                    render={({ field, fieldState }) => (
                                                        <>
                                                            <SignaturePad
                                                                ref={sigRef}
                                                                className="border border-gray-300 rounded"
                                                                onEnd={async () => {
                                                                    if (sigRef.current && !sigRef.current.isEmpty()) {
                                                                        const dataForPDF = await sigRef.current.getDataForPDF();
                                                                        setValue("signature", dataForPDF, { shouldValidate: true });
                                                                    }
                                                                }}
                                                            />
                                                            {fieldState.error && (
                                                                <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                                                            )}
                                                        </>
                                                    )}
                                                />


                                                <div className="mt-2 flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            sigRef.current?.clear();
                                                            form.setValue("signature", "");
                                                        }}
                                                        className="bg-red-500 text-white hover:bg-red-600 border-none dark:bg-red-400 dark:text-black dark:hover:bg-red-500 cursor-pointer"
                                                    >
                                                        Clear
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                            </div>
                        </div>
                    )}

                    {!hasSubmitted && (
                        <div className="flex justify-end p-4">
                            <Button
                                onClick={handleSave}
                                className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 cursor-pointer
                                                   dark:bg-green-400 dark:hover:bg-green-500 dark:text-black"
                            >
                                <Save size={18} />
                                Submit
                            </Button>
                        </div>
                    )}

                    <Confirm
                        open={confirmOpen}
                        onOpenChange={setConfirmOpen}
                        title={confirmTitle}
                        description={confirmDescription}
                        headerIcon={CircleAlert}
                        variant="info"
                        onConfirm={async () => {
                            setConfirmOpen(false);
                            setGuidelineOpen(true);
                        }}
                        onCancel={() => setConfirmOpen(false)}
                    />

                    <Guidelines
                        open={guidelineOpen}
                        onOpenChange={setGuidelineOpen}
                        onConfirm={async () => {
                            setGuidelineOpen(false);
                            setisLoadingSubmit(true);

                            const finalData = form.getValues();

                            console.log("finalData:", finalData);
                            try {
                                //     const response = await axios.post(WebUrl + "/api/generate-ecard", finalData, {
                                //         responseType: "blob",
                                //     });

                                //     const file = new Blob([response.data], { type: "application/pdf" });
                                //     const fileURL = URL.createObjectURL(file);
                                //     window.open(fileURL);
                                // } catch (error) {
                                const response = await axios.post(WebUrl + "/api/generate-ecard", finalData);

                                if (response.data.success) {

                                    setPdfUrl(`${response.data.filePath}`);

                                    setAlertTitle("Success!");
                                    setAlertDescription(response.data.message);
                                    setAlertIcon(LaptopMinimalCheck);
                                    setAlertVariant("success");
                                    setAlertOpen(true);
                                }
                            } catch (error: any) {
                                const errorMessage = error?.response?.data?.message || "Server error, kindly report to IT.";

                                setAlertTitle("Error!");
                                setAlertDescription(errorMessage);
                                setAlertIcon(CircleAlert);
                                setAlertVariant("error");
                                setAlertOpen(true);
                            } finally {
                                setisLoadingSubmit(false);
                            }
                        }}
                        onCancel={() => setGuidelineOpen(false)}
                    />

                    <Alert
                        open={alertOpen}
                        onOpenChange={setAlertOpen}
                        title={alertTitle}
                        description={alertDescription}
                        headerIcon={alertIcon}
                        variant={alertVariant}
                        onConfirm={handleAlertClose}
                    />

                    <Loading open={isLoadingSubmit} description="Generating PDF..." />

                </>
            )
            }
        </AppLayout >
    );
}
