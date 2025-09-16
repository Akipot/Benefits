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
import { ArrowCounterClockwise, BuildingIcon, Check, PaperPlaneTilt, PencilSimple, UserCheckIcon, X } from '@phosphor-icons/react';
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
    CreditCard,
    PiggyBank,
    MapPinHouse
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
import { PDFDocument } from "pdf-lib";

import ModeToggle from '@/components/others/edit-toggle';

import SSSIcon from '@/assets/SSS.svg';
import PagibigIcon from '@/assets/Pag-IBIG.svg';
import BIRIcon from '@/assets/BIR.png';
import PhilhealthIcon from '@/assets/philhealth.png';
import ProfileCard from '@/components/others/profile-card';
import DefaultAvatar from "@/assets/default-avatar.jpg";
import DefaultCover from "@/assets/default-cover.jpg";

import { Confirm } from "@/components/dialogs/confirm-dialog";
import { Loading } from "@/components/dialogs/loading-dialog";
import { Alert } from "@/components/dialogs/alert-dialog";
import { OverallProgress } from '@/components/others/profile-progress';



export default function Profile() {
    const { auth } = usePage().props;
    const { user } = auth as { user: User; location: Location };
    const { employee } = usePage().props as any
    // console.log(employee);
    const breadcrumbs: BreadcrumbItemType[] = [
        {
            title: employee ? `${employee.FullName}'s Profile` : "Profile",
            href: "/employees/" + (employee?.Employee_ID),
        },
    ]

    const [avatar, setAvatar] = useState(
        employee?.ProfilePicturePath
            ? `${employee.ProfilePicturePath}?t=${new Date().getTime()}`
            : DefaultAvatar
    );

    // const WebUrl = import.meta.env.VITE_WEBURL;
    const WebUrl = "";

    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    /**----------------------- Progress Variables ----------------------- */
    const [isProgressShowing, setIsProgressShowing] = useState(false);


    /** ----------- For Loading ------------------------- */
    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => {
                setLoading(false);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [loading]);

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
                                    fullName={employee.FullName}
                                    position={employee.Position}
                                    department={employee.Department}
                                    email={employee.Email}
                                    mobileNumber={employee.MobileNumber}
                                    province={employee.Province}
                                    dateHired={employee.DateHired}
                                    employeeNumber={employee.EmployeeNo}
                                    avatar={employee.ProfilePicturePath || DefaultAvatar}
                                    coverPhoto={employee.CoverPhotoPath || DefaultCover}
                                    isOwnProfile={user.Emp_ID === employee.Employee_ID}
                                    isActive={employee.isActive}
                                />

                            </Card>
                        </div>
                    </div>

                    {/* <div className="w-full flex items-center justify-between px-2 py-1 md:px-1 lg:px-4 space-x-4">

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
                                className="ml-4 mt-6 overflow-hidden flex-1 min-w-0 transition-all duration-700 ease-in-out"
                                style={{
                                    width: isProgressShowing ? 600 : 0,
                                    maxWidth: "100%",
                                }}
                            >
                                <OverallProgress progress={employee.Progress} />
                            </div>
                        </div>
                    </div> */}


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

                                    <form className="space-y-3">
                                        {/* First Name */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">First Name:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.FirstName ?? '-----'}
                                            </span>
                                        </div>

                                        {/* Middle Name */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Middle Name:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.MiddleName ?? '-----'}
                                            </span>
                                        </div>

                                        {/* Last Name */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Last Name:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.LastName ?? '-----'}
                                            </span>
                                        </div>

                                        {/* Date of Birth */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Date of Birth:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {user.info?.Birthdate
                                                    ? format(parseISO(employee.Birthdate), 'MMMM dd, yyyy')
                                                    : '-----'}
                                            </span>
                                        </div>

                                        {/* Gender */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Gender:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.Gender ?? '-----'}
                                            </span>
                                        </div>

                                        {/* Marital Status */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Marital Status:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.CivilStatus ?? '-----'}
                                            </span>
                                        </div>



                                        {/* Emergency Contact */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Emergency Contact:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.PersonICE ?? '-----'}
                                            </span>
                                        </div>

                                        {/* Emergency Phone */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Emergency Phone:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.ContactNumberICE ?? '-----'}
                                            </span>
                                        </div>

                                    </form>


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

                                    <form className="space-y-3">
                                        {/* Region */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Region:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.Region ?? '-----'}
                                            </span>
                                        </div>

                                        {/* Province */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Province:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.Province ?? '-----'}
                                            </span>
                                        </div>

                                        {/* City */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">City:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.Municipal ?? '-----'}
                                            </span>
                                        </div>

                                        {/* Barangay */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Barangay:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.Barangay ?? '-----'}
                                            </span>
                                        </div>

                                        {/* House Number */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">House No.:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.HouseNo ?? '-----'}
                                            </span>
                                        </div>

                                        {/* Street */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Street:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.Street ?? '-----'}
                                            </span>
                                        </div>

                                        {/* Subdivision */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Subdivision:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.Subdivision ?? '-----'}
                                            </span>
                                        </div>

                                        {/* Zip Code */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Zip Code:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.ZipCode ?? '-----'}
                                            </span>
                                        </div>
                                    </form>

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

                                    <form className="space-y-3">
                                        {/* Division */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Division:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.Division ?? '-----'}
                                            </span>
                                        </div>

                                        {/* Department */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Department:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.Department ?? '-----'}
                                            </span>
                                        </div>

                                        {/* Section */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Section:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.Team ?? '-----'}
                                            </span>
                                        </div>



                                        {/* Manager */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Manager:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.SupName ?? '-----'}
                                            </span>
                                        </div>

                                        {/* Employment Type */}
                                        {/* <div className="flex justify-between">
                                                <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Employment Type:</span>
                                                <span className="text-xs text-gray-900 dark:text-gray-100">
                                                    {employee.EmployementType ?? '-----'}
                                                </span>
                                            </div> */}

                                        {/* Start Date */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Start Date:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {user.info?.Birthdate
                                                    ? format(parseISO(employee.DateHired), 'MMMM dd, yyyy')
                                                    : '-----'}
                                            </span>
                                        </div>

                                        {/* Work Location */}
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-xs text-gray-700 dark:text-gray-200">Work Location:</span>
                                            <span className="text-xs text-gray-900 dark:text-gray-100">
                                                {employee.LocationCode ?? '-----'} - {employee.Location ?? '-----'}
                                            </span>
                                        </div>
                                    </form>

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

                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        {/* TIN */}
                                        <div className="p-3 rounded-lg bg-gradient-to-r from-white to-red-100 dark:from-gray-800 dark:to-red-900 text-xs shadow-sm flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                                            <div className="flex items-center gap-1 w-full sm:w-auto">
                                                <img src={BIRIcon} alt="BIR" className="w-5 h-5" />
                                                <span className="font-semibold">TIN</span>
                                            </div>
                                            <span className="font-semibold">{employee.TIN || "xxx-xxx-xxx"}</span>
                                        </div>

                                        {/* HDMF */}
                                        <div className="p-3 rounded-lg bg-gradient-to-r from-white to-yellow-100 dark:from-gray-800 dark:to-yellow-900 text-xs shadow-sm flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                                            <div className="flex items-center gap-1 w-full sm:w-auto">
                                                <img src={PagibigIcon} alt="HDMF" className="w-5 h-5" />
                                                <span className="font-semibold">HDMF Number</span>
                                            </div>
                                            <span className="font-semibold">{employee.HDMF || "xxxx-xxxx-xxxx"}</span>
                                        </div>

                                        {/* SSS */}
                                        <div className="p-3 rounded-lg bg-gradient-to-r from-white to-blue-100 dark:from-gray-800 dark:to-blue-900 text-xs shadow-sm flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                                            <div className="flex items-center gap-1 w-full sm:w-auto">
                                                <img src={SSSIcon} alt="SSS" className="w-5 h-5" />
                                                <span className="font-semibold">SSS Number</span>
                                            </div>
                                            <span className="font-semibold">{employee.SSS || "xx-xxxxxxx-x"}</span>
                                        </div>

                                        {/* Philhealth */}
                                        <div className="p-3 rounded-lg bg-gradient-to-r from-white to-green-100 dark:from-gray-800 dark:to-green-900 text-xs shadow-sm flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                                            <div className="flex items-center gap-1 w-full sm:w-auto">
                                                <img src={PhilhealthIcon} alt="Philhealth" className="w-5 h-5" />
                                                <span className="font-semibold">Philhealth Number</span>
                                            </div>
                                            <span className="font-semibold">{employee.Philhealth || "xx-xxxxxxxxx-x"}</span>
                                        </div>

                                    </div>
                                </form>

                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end p-4">
                        <Button
                            // onClick={handleSave}
                            className="bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-2 cursor-pointer dark:bg-teal-400 dark:hover:bg-teal-500 dark:text-black mr-2"
                        >
                            <PiggyBank size={18} />
                            Create SLA Form
                        </Button>

                        <Button
                            // onClick={handleSave}
                            className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2 cursor-pointer dark:bg-amber-400 dark:hover:bg-amber-500 dark:text-black"
                        >
                            <CreditCard size={18} />
                            Create E-Card Form
                        </Button>
                    </div>

                </>
            )
            }
        </AppLayout >
    );

}
