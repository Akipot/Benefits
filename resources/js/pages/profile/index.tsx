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

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { Location, User, type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { BuildingIcon, UserCheckIcon, X } from '@phosphor-icons/react';
import axios from 'axios';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast, Toaster } from 'sonner';
import Swal from 'sweetalert2';
import useSWR, { mutate } from 'swr';
import { z } from 'zod';
import {
    LucideIcon,
    UserRound,
    BriefcaseBusiness,
    Landmark,
    Save,
    AlertTriangle,
    CircleAlert,
    OctagonX,
    LaptopMinimalCheck,
    ChevronLeft,
    ChevronRight,
    MapPinHouse,
    Check
} from 'lucide-react';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { findLastMatch, PDFDocument } from "pdf-lib";

import {
    Command,
    CommandInput,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";

import { cn } from "@/lib/utils"; // shadcn helper


import ModeToggle from '@/components/others/edit-toggle';

import SSSIcon from '@/assets/SSS.svg';
import PagibigIcon from '@/assets/Pag-IBIG.svg';
import BIRIcon from '@/assets/BIR.png';
import PhilhealthIcon from '@/assets/philhealth.png';

import { Confirm } from "@/components/dialogs/confirm-dialog";
import { Loading } from "@/components/dialogs/loading-dialog";
import { Alert } from "@/components/dialogs/alert-dialog";
import { OverallProgress } from '@/components/others/profile-progress';
import { SearchableSelect } from '@/components/others/searchable-select';
import ProfileCard from '@/components/others/profile-card';
import { MiniProfileCard } from '@/components/others/mini-profile-card';

import DefaultAvatar from "@/assets/default-avatar.jpg";
import DefaultCover from "@/assets/default-cover.jpg";

const breadcrumbs: BreadcrumbItemType[] = [
    {
        title: 'Profile',
        href: '/index',
    },
];

interface Region {
    Region_ID: number;
    Region: string;
}

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



const formSchema = z.object({
    tin: z
        .string()
        .optional()
        .refine(
            (val) => !val || val.replace(/\D/g, "").length === 9,
            { message: "TIN must be 9 digits" }
        ),
    sss: z
        .string()
        .optional()
        .refine(
            (val) => !val || val.replace(/\D/g, "").length === 10,
            { message: "SSS must be 10 digits" }
        ),
    hdmf: z
        .string()
        .optional()
        .refine(
            (val) => !val || val.replace(/\D/g, "").length === 12,
            { message: "HDMF must be 12 digits" }
        ),
    philhealth: z
        .string()
        .optional()
        .refine(
            (val) => !val || val.replace(/\D/g, "").length === 12,
            { message: "PhilHealth must be 12 digits" }
        ),

    region_id: z.string().optional(),
    region: z.string().optional(),
    province_id: z.string().optional(),
    province: z.string().optional(),
    city_id: z.string().optional(),
    city: z.string().optional(),
    barangay_id: z.string().optional(),
    barangay: z.string().optional(),
    houseNo: z.string().optional(),
    street: z.string().optional(),
    subdivision: z.string().optional(),
    zipCode: z
        .string()
        .regex(/^\d{4}$/, "Zip Code must be 4 digits"),
});



type FormData = z.infer<typeof formSchema>;

export default function Profile() {
    const { auth } = usePage().props;
    const { user } = auth as { user: User; location: Location };
    // console.log(user);
    // const WebUrl = import.meta.env.VITE_WEBURL;
    const WebUrl = "";

    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isLoadingSubmit, setisLoadingSubmit] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const [avatar, setAvatar] = useState(DefaultAvatar);

    /**----------------------------------- Confirmation Dialog --------------------*/
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState("");
    const [confirmDescription, setConfirmDescription] = useState("");
    const [confirmText, setConfirmText] = useState("");
    const [cancelText, setCancelText] = useState("");

    /**----------------------------------- Alert Dialog --------------------*/
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertDescription, setAlertDescription] = useState("");
    const [alertIcon, setAlertIcon] = useState<LucideIcon | undefined>(undefined);
    const [alertVariant, setAlertVariant] = useState<"error" | "warning" | "success" | "info">("info");
    const [alertConfirmText, setAlertConfirmText] = useState("");
    const [alertCancelText, setAlertCancelText] = useState("");

    /**----------------------- Progress Variables ----------------------- */
    const [progress, setProgress] = useState(50);
    const [isProgressShowing, setIsProgressShowing] = useState(true);


    /**---------------------- Varibales for Form --------------------- */
    const [savedTin, setSavedTin] = useState("");
    const [savedSSS, setSavedSSS] = useState("");
    const [savedHDMF, setSavedHDMF] = useState("");
    const [savedPhilhealth, setSavedPhilhealth] = useState("");

    const [savedRegionId, setSavedRegionId] = useState("");
    const [savedProvinceId, setSavedProvinceId] = useState("");
    const [savedCityId, setSavedCityId] = useState("");
    const [savedBarangayId, setSavedBarangayId] = useState("");

    const [savedRegion, setSavedRegion] = useState("");
    const [savedProvince, setSavedProvince] = useState("");
    const [savedCity, setSavedCity] = useState("");
    const [savedBarangay, setSavedBarangay] = useState("");

    const [savedHouseNo, setSavedHouseNo] = useState("");
    const [savedStreet, setSavedStreet] = useState("");
    const [savedSubdvision, setSavedSubdivision] = useState("");
    const [savedZipCode, setSavedZipCode] = useState("");

    /** ---------------------- Manager Info --------------------- */
    const [manager, setManager] = useState<any>(null)

    /** ---------------------------- Form ---------------------- */
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tin: "",
            sss: "",
            hdmf: "",
            philhealth: "",
            region_id: "",
            region: "",
            province_id: "",
            province: "",
            city_id: "",
            city: "",
            barangay_id: "",
            barangay: "",
            houseNo: "",
            street: "",
            subdivision: "",
            zipCode: "",
        },
    });

    /** --------------------- Address Variables ------------------- */
    const [regions, setRegions] = useState<Region[]>([]);
    const [provinces, setProvinces] = useState<Provinces[]>([]);
    const [municipalities, setMunicipalities] = useState<Municipalities[]>([]);
    const [barangays, setBarangays] = useState<Barangays[]>([]);

    useEffect(() => {
        const fetchRegions = async () => {
            const res = await fetch(`${WebUrl}/api/get-address-options`);
            const data: Region[] = await res.json();

            const uniqueRegions = [...new Map(data.map(d => [d.Region_ID, d])).values()];
            setRegions(uniqueRegions);
        };

        fetchRegions();
    }, []);

    useEffect(() => {
        const regionId = form.watch("region_id");

        if (!regionId) {
            setProvinces([]);
            return;
        }

        const fetchProvinces = async () => {
            const res = await fetch(`${WebUrl}/api/get-address-options?regionId=${regionId}`);
            const data: Provinces[] = await res.json();

            const uniqueProvinces = [...new Map(data.map(d => [d.Province_ID, d])).values()];
            setProvinces(uniqueProvinces);
        };

        fetchProvinces();
    }, [form.watch("region_id")]);

    useEffect(() => {
        const provinceId = form.watch("province_id");
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
    }, [form.watch("province_id")]);

    useEffect(() => {
        const municipalId = form.watch("city_id");
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
    }, [form.watch("city_id")]);


    /**------------------------ Get Profile Info ------------------------*/
    const [profileData, setProfileData] = useState({
        employeeId: "",
        fullName: "",
        position: "",
        department: "",
        email: "",
        mobileNumber: "",
        province: "",
        dateHired: "",
        employeeNumber: "",
        avatar: DefaultAvatar,
        coverPhoto: DefaultCover,
        isActive: "",
        progress: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.Emp_ID) return;
            setLoading(true);

            try {
                const res = await fetch(`${WebUrl}/api/get-profile/${user.Emp_ID}`);
                const data = await res.json();

                // Update saved state if you need to display them outside form
                setSavedTin(data.TIN || "");
                setSavedSSS(data.SSS || "");
                setSavedHDMF(data.HDMF || "");
                setSavedPhilhealth(data.Philhealth || "");
                setSavedRegionId(data.Region_ID || "");
                setSavedRegion(data.Region || "");
                setSavedProvinceId(data.Province_ID || "");
                setSavedProvince(data.Province || "");
                setSavedCityId(data.Municipal_ID || "");
                setSavedCity(data.Municipal || "");
                setSavedBarangayId(data.Barangay_ID || "");
                setSavedBarangay(data.Barangay || "");
                setSavedHouseNo(data.HouseNo || "");
                setSavedStreet(data.Street || "");
                setSavedSubdivision(data.Subdivision || "");
                setSavedZipCode(data.ZipCode || "");


                form.reset({
                    tin: data.TIN || "",
                    sss: data.SSS || "",
                    hdmf: data.HDMF || "",
                    philhealth: data.Philhealth || "",
                    region_id: data.Region_ID || "",
                    region: data.Region || "",
                    province_id: data.Province_ID || "",
                    province: data.Province || "",
                    city_id: data.Municipal_ID || "",
                    city: data.Municipal || "",
                    barangay_id: data.Barangay_ID || "",
                    barangay: data.Barangay || "",
                    houseNo: data.HouseNo || "",
                    street: data.Street || "",
                    subdivision: data.Subdivision || "",
                    zipCode: data.ZipCode || "",
                });


                setProfileData({
                    employeeId: data.Employee_ID,
                    fullName: data.FullName || "-----",
                    position: data.PositionLevel || "-----",
                    department: data.Department || "-----",
                    email: data.Email || "-----",
                    mobileNumber: data.MobileNumber || "-----",
                    province: data.Province || "-----",
                    dateHired: data.DateHired || "",
                    employeeNumber: data.EmployeeNo || "-----",
                    avatar: data.ProfilePicturePath
                        ? `${data.ProfilePicturePath}?t=${new Date().getTime()}`
                        : DefaultAvatar,
                    coverPhoto: data.CoverPhotoPath
                        ? `${data.CoverPhotoPath}?t=${new Date().getTime()}`
                        : DefaultCover,
                    isActive: data.isActive,
                    progress: data.Progress,
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [form, user?.Emp_ID]);


    /** ----------- For Loading ------------------------- */
    // useEffect(() => {
    //     if (loading) {
    //         const timer = setTimeout(() => {
    //             setLoading(false);
    //         }, 1000);

    //         return () => clearTimeout(timer);
    //     }
    // }, [loading]);

    /** ------------------------------------ Get Info in hover ----------------------------------- */
    const handleManagerInfo = async () => {
        if (!user.info?.SuperiorEmp_ID) return

        try {
            const res = await fetch(`${WebUrl}/api/get-profile/${user.info.SuperiorEmp_ID}`)
            if (!res.ok) throw new Error("Failed to fetch profile")

            const data = await res.json()
            setManager(data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleVisitManager = () => {
        if (user.info?.SuperiorEmp_ID) {
            router.visit(`${WebUrl}/user/${user.info.SuperiorEmp_ID}`)
        }
    }

    /**------------------------------------- Handle Submit / Save ---------------------------------*/
    const handleSave = async () => {
        const isValid = await form.trigger();
        if (!isValid) return;

        const currentValues = form.getValues();
        const defaultValues = form.formState.defaultValues;

        const hasChanges = Object.keys(currentValues).some(
            (key) => currentValues[key as keyof typeof currentValues] !== defaultValues?.[key as keyof typeof defaultValues]
        );

        if (!hasChanges) {
            setAlertTitle("No changes made");
            setAlertDescription("Make sure to update the fields before saving.");
            setAlertConfirmText("Ok")
            setAlertCancelText("");
            setAlertIcon(CircleAlert);
            setAlertVariant("info");
            setAlertOpen(true);
            return;
        }

        setConfirmTitle("Submit Form?");
        setConfirmDescription("Do you want to submit this form?");
        setConfirmText("Submit");
        setCancelText("Cancel");
        setConfirmOpen(true);
    };


    /**-------------------------- Page Layout ----------------------*/
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile" />
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
                    <div className="w-full space-y-0 px-2 py-1 md:px-1 lg:px-4">
                        <div className="w-full flex flex-wrap gap-4 px-0 py-1">
                            {/* Personal Information Card */}
                            <Card className="flex-1 min-w-[300px] p-4 mb-2">
                                <ProfileCard
                                    fullName={profileData.fullName}
                                    position={profileData.position}
                                    department={profileData.department}
                                    email={profileData.email}
                                    mobileNumber={profileData.mobileNumber}
                                    province={profileData.province}
                                    dateHired={profileData.dateHired}
                                    employeeNumber={profileData.employeeNumber}
                                    avatar={profileData.avatar}
                                    coverPhoto={profileData.coverPhoto}
                                    isOwnProfile={user.Emp_ID === profileData.employeeId}
                                    isActive={profileData.isActive}
                                />
                            </Card>
                        </div>
                    </div>

                    <div className="w-full flex items-center px-2 py-1 md:px-1 lg:px-4 space-x-2">
                        <ModeToggle
                            isEdit={isEdit}
                            onChange={(mode) => setIsEdit(mode === "edit")}
                        />

                        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>

                        <div className="flex items-center h-16 w-full md:w-auto ml-auto">

                            <button
                                onClick={() => setIsProgressShowing(!isProgressShowing)}
                                className="hidden md:flex items-center justify-center w-8 h-8 bg-gray-700 text-white text-xs rounded-l transition duration-300 ease-in-out hover:-translate-x-1 hover:animate-beat hover:shadow-lg hover:shadow-gray-400/50 cursor-pointer"
                                title={isProgressShowing ? "Hide profile completion" : "Show profile completion"}
                            >
                                {isProgressShowing ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                            </button>


                            <div
                                className={`ml-4 mt-6 overflow-hidden flex-1 min-w-0 transition-all duration-700 ease-in-out ${isProgressShowing ? 'md:w-[600px]' : 'md:w-0'} w-full`}
                            >
                                <OverallProgress progress={profileData.progress} />
                            </div>
                        </div>



                    </div>



                    <div className="w-full space-y-0 px-2 py-1 md:px-1 lg:px-4">
                        <div className="w-full flex flex-wrap gap-4 px-0 py-1">
                            {/* Personal Information Card */}
                            <Card className="flex-1 min-w-[300px] p-4 mb-2">
                                <CardHeader className="flex flex-row justify-between items-center w-full p-2 !flex-nowrap">
                                    <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                                        Personal Information
                                    </span>
                                    <div className="bg-red-100 dark:bg-red-900 rounded-full p-1 flex items-center justify-center">
                                        <UserRound className="text-red-500 dark:text-red-400 w-5 h-5" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Form {...form}>
                                        <form className="space-y-3">
                                            {/* First Name */}
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">First Name:</span>
                                                <span className="text-xs text-gray-900 dark:text-gray-100">
                                                    {user.info?.location?.FirstName ?? '-----'}
                                                </span>
                                            </div>

                                            {/* Middle Name */}
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Middle Name:</span>
                                                <span className="text-xs text-gray-900 dark:text-gray-100">
                                                    {user.info?.location?.MiddleName ?? '-----'}
                                                </span>
                                            </div>

                                            {/* Last Name */}
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Last Name:</span>
                                                <span className="text-xs text-gray-900 dark:text-gray-100">
                                                    {user.info?.location?.LastName ?? '-----'}
                                                </span>
                                            </div>

                                            {/* Date of Birth */}
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Date of Birth:</span>
                                                <span className="text-xs text-gray-900 dark:text-gray-100">
                                                    {user.info?.Birthdate
                                                        ? format(parseISO(user.info.Birthdate), 'MMMM dd, yyyy')
                                                        : '-----'}
                                                </span>
                                            </div>

                                            {/* Gender */}
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Gender:</span>
                                                <span className="text-xs text-gray-900 dark:text-gray-100">
                                                    {user.info?.Gender ?? '-----'}
                                                </span>
                                            </div>

                                            {/* Marital Status */}
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Marital Status:</span>
                                                <span className="text-xs text-gray-900 dark:text-gray-100">
                                                    {(() => {
                                                        const statusMap: Record<number, string> = {
                                                            1: 'Single',
                                                            2: 'Married',
                                                            3: 'Separated',
                                                            4: 'Widowed',
                                                        };
                                                        const id = Number(user.info?.location?.CivilStatus_ID);
                                                        return statusMap[id] ?? '-----';
                                                    })()}
                                                </span>
                                            </div>

                                            {/* Emergency Contact */}
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Emergency Contact:</span>
                                                <span className="text-xs text-gray-900 dark:text-gray-100">
                                                    {user.info?.location?.Emergency ?? '-----'}
                                                </span>
                                            </div>

                                            {/* Emergency Phone */}
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Emergency Phone:</span>
                                                <span className="text-xs text-gray-900 dark:text-gray-100">
                                                    {user.info?.location?.ContactNumberICE ?? '-----'}
                                                </span>
                                            </div>
                                        </form>

                                    </Form>
                                </CardContent>
                            </Card>

                            <Card className="flex-1 min-w-[300px] p-4 mb-2">
                                <CardHeader className="flex flex-row justify-between items-center w-full p-2 !flex-nowrap">
                                    <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                                        Permanent Address
                                    </span>
                                    <div className="bg-red-100 dark:bg-red-900 rounded-full p-1 flex items-center justify-center">
                                        <MapPinHouse className="text-red-500 dark:text-red-400 w-5 h-5" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Form {...form}>
                                        <form className="space-y-3">
                                            {/* Region */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200 mr-2">
                                                    Region:
                                                </span>

                                                {isEdit ? (
                                                    <SearchableSelect
                                                        form={form}
                                                        name="region_id"
                                                        labelField="region"
                                                        options={regions.map((r) => ({
                                                            id: r.Region_ID,
                                                            label: r.Region,
                                                        }))}
                                                        dependencies={["province_id", "city_id", "barangay_id"]}
                                                        placeholder="Select Region"
                                                        className="w-full sm:w-66"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-900 dark:text-gray-100">
                                                        {savedRegion || "-----"}
                                                    </span>
                                                )}
                                            </div>


                                            {/* Province */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Province:</span>

                                                {isEdit ? (
                                                    <SearchableSelect
                                                        form={form}
                                                        name="province_id"
                                                        labelField="province"
                                                        options={provinces.map((r) => ({
                                                            id: r.Province_ID,
                                                            label: r.Province,
                                                        }))}
                                                        dependencies={["city_id", "barangay_id"]}
                                                        placeholder="Select Province"
                                                        className="w-full sm:w-66"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-900 dark:text-gray-100">
                                                        {savedProvince || "-----"}
                                                    </span>
                                                )}

                                            </div>

                                            {/* City */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">City:</span>
                                                {isEdit ? (
                                                    <SearchableSelect
                                                        form={form}
                                                        name="city_id"
                                                        labelField="city"
                                                        options={municipalities.map((r) => ({
                                                            id: r.Municipal_ID,
                                                            label: r.Municipal,
                                                        }))}
                                                        dependencies={["barangay_id"]}
                                                        placeholder="Select City"
                                                        className="w-full sm:w-66"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-900 dark:text-gray-100">
                                                        {savedCity || "-----"}
                                                    </span>
                                                )}

                                            </div>

                                            {/* Barangay */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Barangay:</span>
                                                {isEdit ? (
                                                    <SearchableSelect
                                                        form={form}
                                                        name="barangay_id"
                                                        labelField="barangay"
                                                        options={barangays.map((r) => ({
                                                            id: r.Barangay_ID,
                                                            label: r.Barangay,
                                                        }))}
                                                        dependencies={[""]}
                                                        placeholder="Select Barangay"
                                                        className="w-full sm:w-66"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-900 dark:text-gray-100">
                                                        {savedBarangay || "-----"}
                                                    </span>
                                                )}
                                            </div>

                                            {/* House No. */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">House No.:</span>
                                                {isEdit ? (
                                                    <FormField
                                                        control={form.control}
                                                        name="houseNo"
                                                        render={({ field }) => (
                                                            <FormItem className="w-full sm:w-66">
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="Enter House No."
                                                                        className="w-full rounded-md border border-[#D0D5DB] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] px-2 py-0.5 text-xs text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-cyan-400 focus:outline-none placeholder-[#989898]"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-[12px]" />
                                                            </FormItem>
                                                        )}
                                                    />



                                                ) : (
                                                    <span className="text-xs text-gray-900 dark:text-gray-100">
                                                        {savedHouseNo || "-----"}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Street. */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Street:</span>
                                                {isEdit ? (
                                                    <FormField
                                                        control={form.control}
                                                        name="street"
                                                        render={({ field }) => (
                                                            <FormItem className="w-full sm:w-66">
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder={"Enter Street"}
                                                                        className="w-full rounded-md border border-[#D0D5DB] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] px-2 py-0.5 text-xs text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-cyan-400 focus:outline-none placeholder-[#989898]"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-[12px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-900 dark:text-gray-100">
                                                        {savedStreet || "-----"}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Subdivision */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Subdivision:</span>
                                                {isEdit ? (
                                                    <FormField
                                                        control={form.control}
                                                        name="subdivision"
                                                        render={({ field }) => (
                                                            <FormItem className="w-full sm:w-66">
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder={"Enter Subdivision"}
                                                                        className="w-full rounded-md border border-[#D0D5DB] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] px-2 py-0.5 text-xs text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-cyan-400 focus:outline-none placeholder-[#989898]"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-[12px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-900 dark:text-gray-100">
                                                        {savedSubdvision || "-----"}
                                                    </span>
                                                )}
                                            </div>

                                            {/* ZIP */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">ZIP Code:</span>
                                                {isEdit ? (
                                                    <FormField
                                                        control={form.control}
                                                        name="zipCode"
                                                        render={({ field }) => (
                                                            <FormItem className="w-full sm:w-66">
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        pattern="\d{4}"
                                                                        maxLength={4}
                                                                        onChange={(e) => {
                                                                            // Only allow digits
                                                                            const val = e.target.value.replace(/\D/g, "");
                                                                            field.onChange(val);
                                                                        }}
                                                                        placeholder="Enter Zip Code"
                                                                        className="w-full rounded-md border border-[#D0D5DB] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] px-2 py-0.5 text-xs text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-cyan-400 focus:outline-none placeholder-[#989898]"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-[12px]" />
                                                            </FormItem>
                                                        )}
                                                    />

                                                ) : (
                                                    <span className="text-xs text-gray-900 dark:text-gray-100">
                                                        {savedZipCode || "-----"}
                                                    </span>
                                                )}
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>



                            {/* Employment Details Card */}
                            <Card className="flex-1 min-w-[300px] p-4 mb-2">
                                <CardHeader className="flex flex-row justify-between items-center w-full p-2 !flex-nowrap">
                                    <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                                        Employment Details
                                    </span>
                                    <div className="bg-red-100 dark:bg-red-900 rounded-full p-1 flex items-center justify-center">
                                        <BriefcaseBusiness className="text-red-500 dark:text-red-400 w-5 h-5" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Form {...form}>
                                        <form className="space-y-3">
                                            {/* Division */}
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Division:</span>
                                                <span className="text-xs text-gray-900 dark:text-gray-100">
                                                    {user.info?.Division ?? '-----'}
                                                </span>
                                            </div>

                                            {/* Department */}
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Department:</span>
                                                <span className="text-xs text-gray-900 dark:text-gray-100">
                                                    {user.info?.Department ?? '-----'}
                                                </span>
                                            </div>

                                            {/* Section */}
                                            {/* <div className="flex justify-between">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Section:</span>
                                                <span className="text-xs text-gray-900 dark:text-gray-100">
                                                    {(() => {
                                                        const sectionMap: Record<number, string> = {
                                                            1: 'Store Support',
                                                            2: 'Office Support',
                                                            3: 'App Support',
                                                            4: 'Data Management',
                                                            5: 'Infra',
                                                            6: 'Dev',
                                                            7: 'PM',
                                                            8: 'HR Talent Acquisition',
                                                            9: 'HR Compensation & Benefits',
                                                            10: 'HR Timekeeping',
                                                            11: 'HR Labor Relations',
                                                            12: 'HR Learning and Organizational',
                                                            13: 'Sat Support',
                                                            14: 'HR Operations',
                                                            15: 'HR Wellness',
                                                        };
                                                        const id = Number(user.info?.team_ID);
                                                        return sectionMap[id] ?? '-----';
                                                    })()}
                                                </span>
                                            </div> */}



                                            {/* Manager */}
                                            <div className="flex justify-between relative group">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">
                                                    Manager:
                                                </span>

                                                <span
                                                    className="text-xs text-gray-900 dark:text-gray-100 cursor-pointer relative"
                                                    onMouseEnter={handleManagerInfo}
                                                    onClick={handleVisitManager}
                                                >
                                                    {user.info?.SuperiorFullName ?? "-----"}

                                                    {manager && (
                                                        <MiniProfileCard
                                                            profilePic={manager.ProfilePicturePath}
                                                            fullName={manager.FullName}
                                                            positionLevel={manager.PositionLevel}
                                                            department={manager.Department}
                                                        />
                                                    )}

                                                </span>
                                            </div>


                                            {/* Start Date */}
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Start Date:</span>
                                                <span className="text-xs text-gray-900 dark:text-gray-100">
                                                    {user.info?.Birthdate
                                                        ? format(parseISO(user.info.DateHired), 'MMMM dd, yyyy')
                                                        : '-----'}
                                                </span>
                                            </div>

                                            {/* Work Location */}
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Work Location:</span>
                                                <span className="text-xs text-gray-900 dark:text-gray-100">
                                                    {user.info?.location?.LocationCode ?? '-----'} - {user.info?.location?.Location ?? '-----'}
                                                </span>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Government Identification Section */}
                    <div className="w-full space-y-0 px-2 py-1 md:px-1 lg:px-4">
                        <Card className="flex-1 min-w-[300px] p-4 mb-2">
                            <CardHeader className="flex flex-row justify-between items-center w-full p-2 !flex-nowrap">
                                <span className="font-semibold text-base text-gray-900 dark:text-gray-100">
                                    Government Identification
                                </span>
                                <div className="bg-red-100 dark:bg-red-900 rounded-full p-1 flex items-center justify-center">
                                    <Landmark className="text-red-500 dark:text-red-400 w-5 h-5" />
                                </div>
                            </CardHeader>

                            <CardContent>
                                <Form {...form}>
                                    <form className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                            {/* TIN */}
                                            <div className="p-3 rounded-lg bg-gradient-to-r from-white to-red-100 dark:from-gray-800 dark:to-red-900 text-xs shadow-sm flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                                                <div className="flex items-center gap-1 w-full sm:w-auto">
                                                    <img src={BIRIcon} alt="BIR" className="w-5 h-5" />
                                                    <span className="font-semibold">TIN</span>
                                                </div>
                                                {isEdit ? (
                                                    <FormField
                                                        control={form.control}
                                                        name="tin"
                                                        render={({ field }) => (
                                                            <FormItem className="w-full sm:w-52">
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder={savedTin || "xxx-xxx-xxx"}
                                                                        maxLength={12}
                                                                        className="w-full rounded-md border border-[#D0D5DB] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] px-2 py-0.5 text-xs text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-cyan-400 focus:outline-none placeholder-[#989898]"
                                                                        onChange={(e) => {
                                                                            let value = e.target.value.replace(/\D/g, "");
                                                                            if (value.length > 9) value = value.slice(0, 9);
                                                                            const parts: string[] = [];
                                                                            if (value.length > 0) parts.push(value.slice(0, 3));
                                                                            if (value.length > 3) parts.push(value.slice(3, 6));
                                                                            if (value.length > 6) parts.push(value.slice(6, 9));
                                                                            field.onChange(parts.join("-"));
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-[12px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                ) : (
                                                    <span className="font-semibold">{savedTin || "xxx-xxx-xxx"}</span>
                                                )}
                                            </div>

                                            {/* HDMF */}
                                            <div className="p-3 rounded-lg bg-gradient-to-r from-white to-yellow-100 dark:from-gray-800 dark:to-yellow-900 text-xs shadow-sm flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                                                <div className="flex items-center gap-1 w-full sm:w-auto">
                                                    <img src={PagibigIcon} alt="HDMF" className="w-5 h-5" />
                                                    <span className="font-semibold">HDMF Number</span>
                                                </div>
                                                {isEdit ? (
                                                    <FormField
                                                        control={form.control}
                                                        name="hdmf"
                                                        render={({ field }) => (
                                                            <FormItem className="w-full sm:w-52">
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder={savedHDMF || "xxxx-xxxx-xxxx"}
                                                                        maxLength={14}
                                                                        className="w-full rounded-md border border-[#D0D5DB] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] px-2 py-0.5 text-xs text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-cyan-400 focus:outline-none placeholder-[#989898]"
                                                                        onChange={(e) => {
                                                                            let value = e.target.value.replace(/\D/g, "");
                                                                            if (value.length > 12) value = value.slice(0, 12);
                                                                            const parts: string[] = [];
                                                                            if (value.length > 0) parts.push(value.slice(0, 4));
                                                                            if (value.length > 4) parts.push(value.slice(4, 8));
                                                                            if (value.length > 8) parts.push(value.slice(8, 12));
                                                                            field.onChange(parts.join("-"));
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-[12px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                ) : (
                                                    <span className="font-semibold">{savedHDMF || "xxxx-xxxx-xxxx"}</span>
                                                )}
                                            </div>

                                            {/* SSS */}
                                            <div className="p-3 rounded-lg bg-gradient-to-r from-white to-blue-100 dark:from-gray-800 dark:to-blue-900 text-xs shadow-sm flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                                                <div className="flex items-center gap-1 w-full sm:w-auto">
                                                    <img src={SSSIcon} alt="SSS" className="w-5 h-5" />
                                                    <span className="font-semibold">SSS Number</span>
                                                </div>
                                                {isEdit ? (
                                                    <FormField
                                                        control={form.control}
                                                        name="sss"
                                                        render={({ field }) => (
                                                            <FormItem className="w-full sm:w-52">
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder={savedSSS || "xx-xxxxxxx-x"}
                                                                        maxLength={11}
                                                                        className="w-full rounded-md border border-[#D0D5DB] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] px-2 py-0.5 text-xs text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-cyan-400 focus:outline-none placeholder-[#989898]"
                                                                        onChange={(e) => {
                                                                            let value = e.target.value.replace(/\D/g, "");
                                                                            if (value.length > 10) value = value.slice(0, 10);
                                                                            const parts: string[] = [];
                                                                            if (value.length > 0) parts.push(value.slice(0, 2));
                                                                            if (value.length > 2) parts.push(value.slice(2, 9));
                                                                            if (value.length > 9) parts.push(value.slice(9, 10));
                                                                            field.onChange(parts.join("-"));
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-[12px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                ) : (
                                                    <span className="font-semibold">{savedSSS || "xx-xxxxxxx-x"}</span>
                                                )}
                                            </div>

                                            {/* Philhealth */}
                                            <div className="p-3 rounded-lg bg-gradient-to-r from-white to-green-100 dark:from-gray-800 dark:to-green-900 text-xs shadow-sm flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                                                <div className="flex items-center gap-1 w-full sm:w-auto">
                                                    <img src={PhilhealthIcon} alt="Philhealth" className="w-5 h-5" />
                                                    <span className="font-semibold">Philhealth Number</span>
                                                </div>
                                                {isEdit ? (
                                                    <FormField
                                                        control={form.control}
                                                        name="philhealth"
                                                        render={({ field }) => (
                                                            <FormItem className="w-full sm:w-52">
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder={savedPhilhealth || "xx-xxxxxxxxx-x"}

                                                                        maxLength={14}
                                                                        className="w-full rounded-md border border-[#D0D5DB] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] px-2 py-0.5 text-xs text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-cyan-400 focus:outline-none placeholder-[#989898]"
                                                                        onChange={(e) => {
                                                                            let value = e.target.value.replace(/\D/g, "");
                                                                            if (value.length > 12) value = value.slice(0, 12);
                                                                            const parts: string[] = [];
                                                                            if (value.length > 0) parts.push(value.slice(0, 2));
                                                                            if (value.length > 2) parts.push(value.slice(2, 11));
                                                                            if (value.length > 11) parts.push(value.slice(11, 12));
                                                                            field.onChange(parts.join("-"));
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-[12px]" />
                                                            </FormItem>
                                                        )}
                                                    />
                                                ) : (
                                                    <span className="font-semibold">{savedPhilhealth || "xx-xxxxxxxxx-x"}</span>
                                                )}
                                            </div>

                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>

                    {isEdit && (
                        <div className="flex justify-end p-4">
                            <Button
                                onClick={handleSave}
                                className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 cursor-pointer dark:bg-green-400 dark:hover:bg-green-500 dark:text-black"
                            >
                                <Save size={18} />
                                Save Changes
                            </Button>
                        </div>

                    )}

                    <Confirm
                        open={confirmOpen}
                        onOpenChange={setConfirmOpen}
                        title={confirmTitle}
                        description={confirmDescription}
                        confirmText={confirmText}
                        cancelText={cancelText}
                        headerIcon={CircleAlert}
                        variant="info"
                        onConfirm={async () => {
                            setConfirmOpen(false);
                            setisLoadingSubmit(true);

                            try {
                                const finalData = form.getValues();

                                const response = await axios.post(WebUrl + "/api/insert-update-profile", finalData, {
                                    responseType: "json",
                                });

                                const message = response.data.msg || "Profile updated successfully.";

                                setAlertTitle("Success!");
                                setAlertDescription(message);
                                setAlertIcon(LaptopMinimalCheck);
                                setAlertVariant("success");
                                setAlertOpen(true);

                                setSavedTin(finalData.tin ?? "");
                                setSavedSSS(finalData.sss ?? "");
                                setSavedHDMF(finalData.hdmf ?? "");
                                setSavedPhilhealth(finalData.philhealth ?? "");
                                setSavedRegion(finalData.region ?? "");
                                setSavedProvince(finalData.province ?? "");
                                setSavedCity(finalData.city ?? "");
                                setSavedBarangay(finalData.barangay ?? "");
                                setSavedHouseNo(finalData.houseNo ?? "");
                                setSavedSubdivision(finalData.subdivision ?? "");
                                setSavedZipCode(finalData.zipCode ?? "");

                                setIsEdit(false);

                                setisLoadingSubmit(false);

                                fetch(`${WebUrl}/api/get-profile/${user?.Emp_ID}`)
                                    .then(res => res.json())
                                    .then(data => {
                                        setProfileData(prev => ({
                                            ...prev,
                                            progress: data.Progress,
                                        }));
                                    });
                            } catch (error: any) {
                                const errorMessage = error?.response?.data?.msg || "Server error, kindly report to IT.";

                                setAlertTitle("Error!");
                                setAlertDescription(errorMessage);
                                setAlertIcon(CircleAlert);
                                setAlertVariant("error");
                                setAlertOpen(true);

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
                    />

                    <Loading open={isLoadingSubmit} description="Saving changes..." />


                </>
            )
            }
        </AppLayout >
    );

}
