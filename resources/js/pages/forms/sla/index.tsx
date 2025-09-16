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
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { Location, User, type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Head, router, usePage } from '@inertiajs/react';
// import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Save } from "lucide-react";

// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { ArrowCounterClockwise, BuildingIcon, PaperPlaneTilt, PencilSimple, UserCheckIcon, X } from '@phosphor-icons/react';
import axios from 'axios';
import * as React from 'react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useForm, useWatch, Controller, Control } from 'react-hook-form';
import { toast, Toaster } from 'sonner';
import { Check } from "lucide-react";
import Swal from 'sweetalert2';
import useSWR, { mutate } from 'swr';
import { flushSync } from 'react-dom';

import { motion } from "framer-motion";
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

import { Confirm } from "@/components/dialogs/confirm-dialog";
import { Loading } from "@/components/dialogs/loading-dialog";
import { Alert } from "@/components/dialogs/alert-dialog";

import { SearchableSelect } from '@/components/others/searchable-select';
import StatusCard from '@/components/others/status-card';


const breadcrumbs: BreadcrumbItemType[] = [
    {
        title: 'SLA Form',
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

interface Barangays {
    Barangay_ID: number;
    Barangay: string;
}

const dateValidator = z
    .string()
    .optional()
    .refine((val) => {
        if (!val) return true;
        const [month, day, year] = val.split("/").map(Number);
        const d = new Date(year, month - 1, day);
        return (
            d.getFullYear() === year &&
            d.getMonth() === month - 1 &&
            d.getDate() === day
        );
    }, "Invalid date (MM/DD/YYYY).");


const formSchema = z
    .object({
        employeeNo: z.string().min(1, "Employee number is required."),
        surname: z.string().min(1, "Surname is required."),
        firstName: z.string().min(1, "First name is required."),
        middleName: z.string().optional(),
        sameAsPermanent: z.boolean(),

        permanentHouseNo: z.string().optional(),
        permanentStreet: z.string().optional(),
        permanentSubdivision: z.string().optional(),
        permanentBarangay: z.string().optional(),
        permanentBarangay_ID: z.string().min(1, "Barangay is required."),
        permanentCity: z.string().optional(),
        permanentCity_ID: z.string().min(1, "City is required."),
        permanentProvince: z.string().optional(),
        permanentProvince_ID: z.string().min(1, "Province is required."),
        permanentZip: z.string().min(1, "ZIP Code is required."),

        presentHouseNo: z.string().optional(),
        presentStreet: z.string().optional(),
        presentSubdivision: z.string().optional(),
        // presentBarangay: z.string().optional(),
        presentBarangay_ID: z.string().min(1, "Barangay is required."),
        // presentCity: z.string().optional(),
        presentCity_ID: z.string().min(1, "City is required."),
        // presentProvince: z.string().optional(),
        presentProvince_ID: z.string().min(1, "Province is required."),
        presentZip: z.string().min(1, "ZIP Code is required."),

        dateOfBirth: z
            .string()
            .nonempty("Date of birth is required.")
            .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Invalid date format."),

        placeOfBirth: z.string().min(1, "Place of birth is required."),

        gender: z.string().min(1, "Gender is required."),

        civilStatus_ID: z.string().optional(),
        civilStatus: z.enum(["single", "married", "widowed", "separated"], {
            required_error: "Civil status is required.",
        }),

        nationality: z.string().min(1, "Nationality is required."),

        contribution: z
            .string()
            .nullable()
            .refine((val) => val !== null && val.trim() !== "", {
                message: "Contribution is required.",
            }),


        otherAmount: z.string().optional(),

        savingsAmount: z
            .number({
                invalid_type_error: "Savings amount is required.",
            })
            .min(100, "Savings amount must be at least ₱100.")
            .multipleOf(100, "Savings amount must be in multiples of ₱100."),

        benFullName1: z.string().optional(),
        benFullName2: z.string().optional(),
        benFullName3: z.string().optional(),
        benFullName4: z.string().optional(),
        benFullName5: z.string().optional(),

        benRelationship1: z.string().optional(),
        benRelationship2: z.string().optional(),
        benRelationship3: z.string().optional(),
        benRelationship4: z.string().optional(),
        benRelationship5: z.string().optional(),

        benDateOfBirth1: dateValidator,
        benDateOfBirth2: dateValidator,
        benDateOfBirth3: dateValidator,
        benDateOfBirth4: dateValidator,
        benDateOfBirth5: dateValidator,

        company: z.string().min(1, "Company is required."),
        branch: z.string().min(1, "Branch is required."),
        department: z.string().min(1, "Department is required."),
        dateHired: z
            .string()
            .nonempty("Date hired is required.")
            .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Invalid date format."),

        positionTitle: z.string().min(1, "Position Title is required."),
        rankLevel: z.string().min(1, "Rank/Level is required."),
        tin: z
            .string()
            .min(11, "TIN must be at least 9 digits.")
            .regex(/^[0-9]/, "TIN must start with a digit."),

        sss: z
            .string()
            .min(1, "SSS number is required.")
            .regex(/^[0-9]/, "SSS must start with a digit.")
            .regex(/^\d{2}-\d{7}-\d{1}$/, "SSS must be in the format XX-XXXXXXX-X."),

        // maidenName: z.string().min(1, "Mother's maiden name is required."),
        maidenName: z.string().optional(),

        mobileNumber: z
            .string()
            .regex(/^\(\+63\) \d{2} \d{4}-\d{4}$/, "Mobile number is incomplete."),


        emailAddress: z
            .string()
            .min(1, "Email address is required.")
            .email("Invalid email address."),

        agreement1: z.literal(true, {
            errorMap: () => ({ message: "You must agree to the Data Consent." }),
        }),


        signature: z.string().min(1, "Signature is required."),

    })
    .refine(
        (data) =>
            data.contribution !== "Others" ||
            (data.otherAmount && data.otherAmount.trim() !== ""),
        {
            message: "Please enter an amount.",
            path: ["otherAmount"],
        }
    );


const civilStatusMap: Record<number, "single" | "married" | "separated" | "widowed"> = {
    1: "single",
    2: "married",
    3: "separated",
    4: "widowed",
};

type FormData = z.infer<typeof formSchema>;

export default function Show() {

    /**--------------------------------User Info -------------------------------*/
    const { auth } = usePage().props;
    const { user } = auth as { user: User; location: Location };

    /**---------------------------------- Web URL ------------------------------- */
    // const WebUrl = import.meta.env.VITE_WEBURL;
    const WebUrl = "";


    /**--------------------------------------- Loading Variables --------------------- */
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSubmit, setisLoadingSubmit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isCopying, setIsCopying] = useState(false);

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
            const res = await fetch(`${WebUrl}/api/checkApplicationStatus/${user.Emp_ID}`);
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

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employeeNo: "",
            surname: "",
            firstName: "",
            middleName: "",
            dateOfBirth: "",

            permanentHouseNo: "",
            permanentBarangay: "",
            permanentStreet: "",
            permanentCity: "",
            permanentProvince: "",
            permanentProvince_ID: "",
            permanentSubdivision: "",
            permanentZip: "",

            sameAsPermanent: false,

            presentHouseNo: "",
            // presentBarangay: "",
            presentBarangay_ID: undefined,
            presentStreet: "",
            // presentCity: "",
            presentCity_ID: undefined,
            // presentProvince: "",
            presentProvince_ID: undefined,
            presentSubdivision: "",
            presentZip: "",

            gender: "",
            civilStatus_ID: "",
            civilStatus: "single",

            placeOfBirth: "",
            nationality: "",

            benFullName1: "",
            benFullName2: "",
            benFullName3: "",
            benFullName4: "",
            benFullName5: "",

            benRelationship1: "",
            benRelationship2: "",
            benRelationship3: "",
            benRelationship4: "",
            benRelationship5: "",

            benDateOfBirth1: "",
            benDateOfBirth2: "",
            benDateOfBirth3: "",
            benDateOfBirth4: "",
            benDateOfBirth5: "",

            company: "",
            branch: "",
            department: "",
            dateHired: "",
            positionTitle: "",
            rankLevel: "",
            tin: "",
            sss: "",
            maidenName: "",
            mobileNumber: "",
            emailAddress: "",

            contribution: "",
            otherAmount: "",

            savingsAmount: 0,

            signature: "",
        },
    });

    const { reset, formState: { errors } } = form;

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.Emp_ID) return;
            setLoading(true);

            try {
                const res = await fetch(`${WebUrl}/api/get-profile/${user.Emp_ID}`);
                const data = await res.json();

                reset({
                    employeeNo: data.EmployeeNo || "",
                    surname: data.LastName || "",
                    firstName: data.FirstName || "",
                    middleName: data.MiddleName || "",
                    dateOfBirth: data.Birthdate
                        ? format(new Date(data.Birthdate), "MM/dd/yyyy")
                        : "",

                    permanentHouseNo: data.HouseNo || "",
                    permanentBarangay: data.Barangay || "",
                    permanentBarangay_ID: data.Barangay_ID || "",
                    permanentStreet: data.Street || "",
                    permanentCity: data.Municipal || "",
                    permanentCity_ID: data.Municipal_ID || "",
                    permanentProvince: data.Province || "",
                    permanentProvince_ID: data.Province_ID || "",
                    permanentSubdivision: data.Subdivision || "",
                    permanentZip: data.ZipCode || "",

                    sameAsPermanent: false,

                    presentHouseNo: data.PresentHouseNo || "",
                    // presentBarangay: data.PresentBarangay || "",
                    presentStreet: data.PresentStreet || "",
                    // presentCity: data.PresentCity || "",
                    // presentProvince: data.PresentProvince || "",
                    presentSubdivision: data.PresentSubdivision || "",
                    presentZip: data.PresentZip || "",

                    gender: data.Gender?.toLowerCase() === "male" ? "male" : "female",
                    civilStatus_ID: data.CivilStatus_ID || "",
                    civilStatus: data.CivilStatus_ID
                        ? civilStatusMap[data.CivilStatus_ID]
                        : "single",

                    placeOfBirth: data.PlaceOfBirth || "",
                    nationality: data.Nationality || "Filipino",

                    benFullName1: "",
                    benFullName2: "",
                    benFullName3: "",
                    benFullName4: "",
                    benFullName5: "",

                    benRelationship1: "",
                    benRelationship2: "",
                    benRelationship3: "",
                    benRelationship4: "",
                    benRelationship5: "",

                    benDateOfBirth1: "",
                    benDateOfBirth2: "",
                    benDateOfBirth3: "",
                    benDateOfBirth4: "",
                    benDateOfBirth5: "",

                    company: data.Company || "",
                    branch: data.Branch || "",
                    department: data.Department || "",
                    dateHired: data.DateHired
                        ? format(new Date(data.DateHired), "MM/dd/yyyy")
                        : "",
                    positionTitle: data.Position || "",
                    rankLevel: data.PositionLevel || "",
                    tin: data.TIN || "",
                    sss: data.SSS || "",
                    maidenName: data.MaidenName || "",
                    mobileNumber: data.MobileNumber || "",
                    emailAddress: data.Email || "",

                    contribution: "",
                    otherAmount: "",

                    savingsAmount: 0,

                    signature: data.Signature || "",
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

    /** --------------------------------- Fetch Address Options --------------------------- */
    const [provinces, setProvinces] = useState<Provinces[]>([]);
    const [municipalities, setMunicipalities] = useState<Municipalities[]>([]);
    const [barangays, setBarangays] = useState<Barangays[]>([]);


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
        const provinceId = form.watch("presentProvince_ID");
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
    }, [form.watch("presentProvince_ID")]);

    useEffect(() => {
        const municipalId = form.watch("presentCity_ID");
        if (!municipalId) {
            setBarangays([]);
            return;
        }

        const fetchBarangays = async () => {
            const res = await fetch(`${WebUrl}/api/get-address-options?municipalId=${municipalId}`);
            const data: Barangays[] = await res.json();

            const uniqueBarangays = [...new Map(data.map(d => [d.Barangay_ID, d])).values()];
            setBarangays(uniqueBarangays);
        };

        fetchBarangays();
    }, [form.watch("presentCity_ID")]);

    const fetchProvinces = async () => {
        const res = await fetch(`${WebUrl}/api/get-address-options`);
        const data: Provinces[] = await res.json();
        const uniqueProvinces = [...new Map(data.map(d => [d.Province_ID, d])).values()];
        setProvinces(uniqueProvinces);
    };

    const fetchMunicipalities = async (provinceId: string | number) => {
        if (!provinceId) {
            setMunicipalities([]);
            return;
        }

        const res = await fetch(`${WebUrl}/api/get-address-options?provinceId=${provinceId}`);
        const data: Municipalities[] = await res.json();
        const uniqueMunicipalities = [...new Map(data.map(d => [d.Municipal_ID, d])).values()];
        setMunicipalities(uniqueMunicipalities);
    };

    const fetchBarangays = async (municipalId: string | number) => {
        if (!municipalId) {
            setBarangays([]);
            return;
        }

        const res = await fetch(`${WebUrl}/api/get-address-options?municipalId=${municipalId}`);
        const data: Barangays[] = await res.json();
        const uniqueBarangays = [...new Map(data.map(d => [d.Barangay_ID, d])).values()];
        setBarangays(uniqueBarangays);
    };


    const { watch, setValue } = form;
    const sameAsPermanent = watch("sameAsPermanent");
    const permFields = ["houseNo", "street", "subdivision", "barangay", "city", "province", "zip"];
    const permValues = watch(permFields.map((f) => `permanent${f[0].toUpperCase()}${f.slice(1)}` as keyof FormData));

    useEffect(() => {
        if (sameAsPermanent) {
            permFields.forEach((field, idx) => {
                const target = `present${field[0].toUpperCase()}${field.slice(1)}` as keyof FormData;
                setValue(target, permValues[idx] ?? "");
            });
        }
    }, [sameAsPermanent, permValues, setValue]);

    useEffect(() => {
        if (!sameAsPermanent) {
            setIsCopying(false);
            return;
        }

        const copyAddress = async () => {
            setIsCopying(true);

            const [
                permanentProvince_ID,
                permanentCity_ID,
                permanentBarangay_ID,
            ] = form.getValues([
                "permanentProvince_ID",
                "permanentCity_ID",
                "permanentBarangay_ID",
            ]);

            form.reset({
                ...form.getValues(),
                presentProvince_ID: permanentProvince_ID?.toString() ?? undefined,
                presentCity_ID: permanentCity_ID?.toString() ?? undefined,
                presentBarangay_ID: permanentBarangay_ID?.toString() ?? "",
            });

            await fetchMunicipalities(permanentProvince_ID);
            await fetchBarangays(permanentCity_ID);

            setIsCopying(false);
        };

        copyAddress();
    }, [sameAsPermanent, form]);

    const [otherAmount, setOtherAmount] = useState("");

    /**------------------------------------- Contribution Watchers-------------------------------- */
    const contribution = form.watch("contribution");

    /**-------------------------------------- Signature Watchers --------------------------------- */
    const sigRef = useRef<SignaturePadRef>(null);


    const handleClear = () => {
        sigRef.current?.clear();
    };

    /**-----------------------------------Confirmation Dialog --------------------*/
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState("Confirm");
    const [confirmDescription, setConfirmDescription] = useState("Are you sure?");

    /** --------------------------------------- Open Generated PDF ---------------------------- */
    const handleAlertClose = () => {
        setAlertOpen(false);

        if (pdfUrl) {
            window.open(pdfUrl);
            setPdfUrl(null);
            window.location.reload();
        }
    };


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
            <Head title="SLA" />
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
                                    <CardHeader className="text-lg font-semibold">Application For Membership</CardHeader>
                                    <CardContent>
                                        <Form {...form}>
                                            <form className="space-y-6">
                                                <div className="col-span-full mt-4 text-sm font-bold bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100">
                                                    PERSONAL INFORMATION
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="employeeNo"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Employee No.</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} maxLength={20} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="surname"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Surname</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        maxLength={50}
                                                                        {...field}
                                                                        value={field.value ?? ""}
                                                                        readOnly
                                                                    />
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
                                                                    <Input {...field}
                                                                        maxLength={50}
                                                                        readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="middleName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Middle Name</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field}
                                                                        maxLength={50}
                                                                        readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="col-span-full mt-4 text-sm font-bold">
                                                    Permanent Address
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="permanentHouseNo"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>House No.</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter House No."
                                                                        maxLength={100} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="permanentStreet"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Street</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="Enter Street"
                                                                        maxLength={100}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="permanentSubdivision"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Subdivision</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Subdivison"
                                                                        maxLength={100} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="permanentProvince"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Province</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Province"
                                                                        maxLength={100} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="permanentCity"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>City</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter City"
                                                                        maxLength={100} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="permanentBarangay"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Barangay</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Barangay"
                                                                        maxLength={100} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="permanentZip"
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
                                                                        readOnly
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                </div>

                                                <div className="col-span-full mt-4 text-sm font-bold">
                                                    Present Address
                                                </div>


                                                <div className="col-span-full mt-4 flex items-center space-x-2">
                                                    <FormField
                                                        control={form.control}
                                                        name="sameAsPermanent"
                                                        render={({ field }) => (
                                                            <FormItem className="flex items-center space-x-2">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value ?? false}
                                                                        onCheckedChange={(checked) => field.onChange(!!checked)}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="text-sm">
                                                                    Same as Permanent address in Present address
                                                                </FormLabel>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                {isCopying ? (
                                                    <div className="col-span-full flex items-center justify-center py-8">
                                                        <div className="text-gray-500 text-sm animate-pulse">
                                                            Hold on… copying your present address
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="col-span-full mt-4 text-sm font-bold">
                                                            Present Address
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <FormField
                                                                control={form.control}
                                                                name="presentHouseNo"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>House No.</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                {...field}
                                                                                placeholder="Enter House No."
                                                                                disabled={sameAsPermanent}
                                                                                maxLength={100}
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <FormField
                                                                control={form.control}
                                                                name="presentStreet"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Street</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                {...field}
                                                                                placeholder="Enter Street"
                                                                                disabled={sameAsPermanent}
                                                                                maxLength={100}
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <FormField
                                                                control={form.control}
                                                                name="presentSubdivision"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Subdivision</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                {...field}
                                                                                placeholder="Enter Subdivision"
                                                                                disabled={sameAsPermanent}
                                                                                maxLength={100}
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            {/* Province */}
                                                            <FormField
                                                                control={form.control}
                                                                name="presentProvince_ID"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Province</FormLabel>
                                                                        <FormControl>
                                                                            <SearchableSelect
                                                                                form={form}
                                                                                name="presentProvince_ID"
                                                                                options={provinces.map((r) => ({
                                                                                    id: r.Province_ID,
                                                                                    label: r.Province,
                                                                                }))}
                                                                                dependencies={["presentCity_ID", "presentBarangay_ID"]}
                                                                                placeholder="Select Province"
                                                                                className={sameAsPermanent ? "pointer-events-none opacity-70" : ""}
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
                                                                name="presentCity_ID"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>City</FormLabel>
                                                                        <FormControl>
                                                                            <SearchableSelect
                                                                                form={form}
                                                                                name="presentCity_ID"
                                                                                options={municipalities.map((r) => ({
                                                                                    id: r.Municipal_ID,
                                                                                    label: r.Municipal,
                                                                                }))}
                                                                                dependencies={["presentBarangay_ID"]}
                                                                                placeholder="Select City"
                                                                                className={sameAsPermanent ? "pointer-events-none opacity-70" : ""}
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

                                                            {/* Barangay */}
                                                            <FormField
                                                                control={form.control}
                                                                name="presentBarangay_ID"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Barangay</FormLabel>
                                                                        <FormControl>
                                                                            <SearchableSelect
                                                                                form={form}
                                                                                name="presentBarangay_ID"
                                                                                options={barangays.map((r) => ({
                                                                                    id: r.Barangay_ID,
                                                                                    label: r.Barangay,
                                                                                }))}
                                                                                dependencies={[""]}
                                                                                placeholder="Select Barangay"
                                                                                className={sameAsPermanent ? "pointer-events-none opacity-70" : ""}
                                                                                hasError={!!form.formState.errors[field.name]}
                                                                            />
                                                                        </FormControl>
                                                                        {form.formState.errors[field.name]?.message && (
                                                                            <span
                                                                                className="text-sm mt-1"
                                                                                style={{ color: "#E8001B" }}
                                                                            >
                                                                                Barangay is required.
                                                                            </span>
                                                                        )}
                                                                    </FormItem>

                                                                )}
                                                            />

                                                            {/* Zip */}
                                                            <FormField
                                                                control={form.control}
                                                                name="presentZip"
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
                                                                                    if (
                                                                                        (e.ctrlKey || e.metaKey) &&
                                                                                        ["a", "c", "x"].includes(e.key.toLowerCase())
                                                                                    ) {
                                                                                        return;
                                                                                    }
                                                                                    if (
                                                                                        !/[0-9]/.test(e.key) &&
                                                                                        !allowedKeys.includes(e.key)
                                                                                    ) {
                                                                                        e.preventDefault();
                                                                                    }
                                                                                }}
                                                                                disabled={sameAsPermanent}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                    </>
                                                )}




                                                <div className="col-span-full mt-4 text-sm font-medium">
                                                    Other Details
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

                                                    <FormField
                                                        control={form.control}
                                                        name="dateOfBirth"
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
                                                                            className={`pr-10 ${form.formState.errors.dateOfBirth ? "border-red-500" : ""}`}
                                                                        />
                                                                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="placeOfBirth"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Place of Birth</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Place of Birth"
                                                                        maxLength={100} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="gender"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Gender</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select civil status" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="male">Male</SelectItem>
                                                                        <SelectItem value="female">Female</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="civilStatus"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Civil Status</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select status" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="single">Single</SelectItem>
                                                                        <SelectItem value="married">Married</SelectItem>
                                                                        <SelectItem value="separated">Separated</SelectItem>
                                                                        <SelectItem value="widowed">Widowed</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="nationality"
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
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="company"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Company</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Company" maxLength={100} />
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
                                                                    <Input {...field} placeholder="Enter Branch" maxLength={100} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="department"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Department</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field}
                                                                        placeholder="Enter Department"
                                                                        maxLength={100}
                                                                        readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="dateHired"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Date Hired</FormLabel>
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
                                                                            className={`pr-10 ${form.formState.errors.dateHired ? "border-red-500" : ""}`}
                                                                            readOnly
                                                                        />
                                                                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="positionTitle"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Position Title</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Position Title" maxLength={100} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="rankLevel"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Rank/Level</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Rank/Level" maxLength={100} readOnly />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="tin"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Taxpayer Identification No. (TIN)</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="XXX-XXX-XXX"
                                                                        maxLength={12}
                                                                        onChange={(e) => {
                                                                            let value = e.target.value.replace(/\D/g, "");
                                                                            if (value.length > 9) value = value.slice(0, 9);

                                                                            const parts = [];
                                                                            if (value.length > 0) parts.push(value.slice(0, 3));
                                                                            if (value.length > 3) parts.push(value.slice(3, 6));
                                                                            if (value.length > 6) parts.push(value.slice(6, 9));

                                                                            field.onChange(parts.join("-"));
                                                                        }}
                                                                        readOnly
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />


                                                    <FormField
                                                        control={form.control}
                                                        name="sss"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Social Security System (SSS) No.</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="XX-XXXXXXX-X"
                                                                        maxLength={12}
                                                                        value={field.value || ""}
                                                                        onChange={(e) => {
                                                                            let value = e.target.value.replace(/\D/g, "");
                                                                            if (value.length > 10) value = value.slice(0, 10);

                                                                            const parts: string[] = [];
                                                                            if (value.length > 0) parts.push(value.slice(0, 2));
                                                                            if (value.length > 2) parts.push(value.slice(2, 9));
                                                                            if (value.length > 9) parts.push(value.slice(9, 10));

                                                                            field.onChange(parts.join("-"));
                                                                        }}
                                                                        readOnly
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />


                                                </div>



                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="maidenName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Mother's Maiden Name (First, Middle and Last Name)</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Mother's Maiden Name" maxLength={100} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="mobileNumber"
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
                                                        name="emailAddress"
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
                                                </div>

                                                <div className="col-span-full mt-4 text-sm font-bold bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100">
                                                    BENEFICIARIES
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`benFullName1`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Full Name</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Full Name" maxLength={100} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`benRelationship1`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Relationship</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Relationship" maxLength={100} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="benDateOfBirth1"
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
                                                                            className="pr-10"
                                                                        />
                                                                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`benFullName2`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Full Name</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Full Name" maxLength={100} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`benRelationship2`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Relationship</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Relationship" maxLength={100} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="benDateOfBirth2"
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
                                                                            className="pr-10"
                                                                        />
                                                                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`benFullName3`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Full Name</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Full Name" maxLength={100} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`benRelationship3`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Relationship</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Relationship" maxLength={100} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="benDateOfBirth3"
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
                                                                            className="pr-10"
                                                                        />
                                                                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`benFullName4`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Full Name</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Full Name" maxLength={100} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`benRelationship4`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Relationship</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Relationship" maxLength={100} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="benDateOfBirth4"
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
                                                                            className="pr-10"
                                                                        />
                                                                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`benFullName5`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Full Name</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Full Name" maxLength={100} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`benRelationship5`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Relationship</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Enter Relationship" maxLength={100} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="benDateOfBirth5"
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
                                                                            className="pr-10"
                                                                        />
                                                                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="col-span-full mt-4 text-sm font-bold bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100">
                                                    CONTRIBUTION
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 text-justify">
                                                            I hereby apply for membership in this Association. Membership fee of TWO HUNDRED PESOS (P 200.00) will be added to my first contribution. Should this
                                                            application be approved, I hereby promise to abide by the by-laws and regulations of SMSLAI.
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 text-justify">
                                                            Likewise, I authorize my employer to deduct from my salary and remit the following amounts to SMSLAI starting on the nearest payday following the
                                                            Board of Trustees' approval:
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 text-justify font-semibold">
                                                            a. For my Capital Contribution per pay day (In Philippine Peso). Minimum required amount per rank/level shall apply
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                                                        {["300", "400", "500", "600", "800", "1000", "1500", "2000", "3000", "4000", "5000"].map((amount) => (
                                                            <label key={amount} className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    value={amount}
                                                                    {...form.register("contribution", { required: "Contribution is required" })}
                                                                    className="accent-gray-500 w-4 h-4"
                                                                    onChange={() => setOtherAmount("")}
                                                                />
                                                                <span className="text-gray-700 dark:text-gray-200">₱{amount}</span>
                                                            </label>
                                                        ))}

                                                        <label className="flex items-center gap-2 cursor-pointer flex-wrap">
                                                            <input
                                                                type="radio"
                                                                value="Others"
                                                                {...form.register("contribution")}
                                                                className="accent-gray-500 w-4 h-4"
                                                            />
                                                            <span className="text-gray-700 dark:text-gray-200">Others</span>
                                                            {form.watch("contribution") === "Others" && (
                                                                <div className="flex items-center gap-1 mt-2 sm:mt-0 w-full sm:w-auto">
                                                                    <span className="text-gray-700 dark:text-gray-200">₱</span>
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="Enter Amount"
                                                                        {...form.register("otherAmount", {
                                                                            required: "Amount is required when selecting Others",
                                                                        })}
                                                                        onKeyDown={(e) => {
                                                                            const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"];
                                                                            if ((e.ctrlKey || e.metaKey) && ["a", "c", "x"].includes(e.key.toLowerCase())) return;
                                                                            if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) e.preventDefault();
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </label>

                                                    </div>

                                                    {form.formState.errors.contribution && (
                                                        <p className="text-red-500 text-sm mt-2">
                                                            {form.formState.errors.contribution.message}
                                                        </p>
                                                    )}

                                                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-wrap">
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                                                            b. For my Savings Account the amount of
                                                        </p>
                                                        <div className="flex items-center gap-1 w-full sm:w-auto">
                                                            <span className="text-gray-700 dark:text-gray-200">₱</span>
                                                            <Input
                                                                type="text"
                                                                placeholder="Enter Amount"
                                                                className="flex-1 min-w-0"
                                                                {...form.register("savingsAmount", {
                                                                    setValueAs: (v: string) => (v ? Number(v) : 0),
                                                                    validate: (val) => {
                                                                        if (!val) return "Savings amount is required";
                                                                        if (isNaN(val)) return "Invalid amount";
                                                                        if (val % 100 !== 0) return "Amount must be in multiples of ₱100";
                                                                        return true;
                                                                    },
                                                                })}
                                                                onKeyDown={(e) => {
                                                                    const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"];
                                                                    if ((e.ctrlKey || e.metaKey) && ["a", "c", "x"].includes(e.key.toLowerCase())) return;
                                                                    if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) e.preventDefault();
                                                                }}
                                                            />
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                                                            per pay day. (Amount should be in multiples of ₱100)
                                                        </p>
                                                    </div>

                                                    {form.formState.errors.savingsAmount && (
                                                        <p className="text-red-500 text-sm mt-2">
                                                            {form.formState.errors.savingsAmount.message}
                                                        </p>
                                                    )}

                                                </div>

                                                <div className="col-span-full mt-4 text-sm font-bold bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-gray-100">
                                                    SIGNATURE AND CONSENT
                                                </div>
                                                <div className="flex flex-col md:flex-row items-start gap-4">
                                                    {/* Consent Text */}
                                                    <div className="flex-1">
                                                        <label className="flex items-start space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                {...form.register("agreement1")}
                                                                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <div className="text-sm text-gray-600 dark:text-gray-300 text-justify">
                                                                I hereby give my full consent to the Association and its authorized representatives or agents to collect, use, verify, process and dispose in a secure manner,
                                                                whether through manual or electronic means, for the period allowed under the applicable laws and regulations, any personal data I provide for the purposes of my
                                                                membership and any related applications or requests. I acknowledge that the collection and processing of my personal data is necessary for such purposes. I am
                                                                aware of my right to be informed, to access, to object, to file a complaint, to rectify and to data portability, and I understand that there are procedures, conditions
                                                                and exceptions to be complied with in order to exercise or invoke such rights.
                                                            </div>
                                                        </label>
                                                        {form.formState.errors.agreement1 && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {form.formState.errors.agreement1.message}
                                                            </p>
                                                        )}
                                                    </div>


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
                                            </form>
                                        </Form>
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
                            setisLoadingSubmit(true);

                            const formData = form.getValues();

                            const civilStatusMap: Record<string, number> = {
                                single: 1,
                                married: 2,
                                separated: 3,
                                widowed: 4,
                            };

                            const finalData = {
                                ...formData,
                                civilStatus_ID: civilStatusMap[formData.civilStatus],
                            };

                            try {
                                const response = await axios.post(WebUrl + "/api/generate-sla", finalData);


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
                            }
                            finally {
                                setisLoadingSubmit(false);
                            }
                        }}
                        onCancel={() => setConfirmOpen(false)}
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
