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
import { Card, CardContent } from '@/components/ui/card';
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
import { useEffect, useState, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast, Toaster } from 'sonner';
import Swal from 'sweetalert2';
import useSWR, { mutate } from 'swr';
import { z } from 'zod';
import { FilePlus, FileText, Eye, EyeOff } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import Select from 'react-select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Contract {
    Contract_ID: number;
    DocumentName: string;
    DocumentType: string;
    InsertedDate: string;
    FileName: string;
    InsertBy: string;
    LocationID: number;
    LocationCode: string;
    Location: string;
    LocAddress: string;
    DateOpen: Date;
    LeaserName: string;
    LeaseStart: Date;
    RentStart: Date;
    LeaseFrom: Date;
    LeaseTo: Date;
    SDMonths: number;
    SDAmount: number;
    ADRMonths: number;
    ADRAmount: number;
    EBDeposit: string;
    EBAmount: number;
    WBDeposit: string;
    WBAmount: number;
    Remarks: string;
    Status: number;
}

const breadcrumbs: BreadcrumbItemType[] = [
    {
        title: 'Contract of Lease Database',
        href: '/index',
    },
];

type DatePickerProps = {
    date?: Date;
    setDate: (date: Date | undefined) => void;
    placeholder?: string;
    readOnly?: boolean;
};



export default function Show() {
    /**----------------------- Get Contract Initial Data -----------------------*/
    const { contract } = usePage<{ contract: Contract[] }>().props;
    const contractData = contract[0];

    /**--------------------------------User Info -------------------------------*/
    const { auth } = usePage().props;
    const { user } = auth as { user: User; location: Location };

    /**--------------------------------------- Variables --------------------- */
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSubmit, setisLoadingSubmit] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'utilities' | 'remarks'>('details');
    const [showPDF, setShowPDF] = useState(false);
    const [storeOptions, setStoreOptions] = useState<StoreOption[]>([]);
    const [allStores, setAllStores] = useState<Store[]>([]);
    const [selectedOption, setSelectedOption] = useState<StoreOption | null>(null);

    /**------------------------------ Form Values ----------------------------------*/
    const [documentName, setDocumentName] = useState(contractData.DocumentName || '');

    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [securityMonths, setSecurityMonths] = useState<string>('');
    const [advanceMonths, setAdvanceMonths] = useState<string>('');
    const [electricAmount, setElectricAmount] = useState<string>('');
    const [waterAmount, setWaterAmount] = useState<string>('');
    const [securityAmount, setSecurityAmount] = useState<string>('');
    const [advanceAmount, setAdvanceAmount] = useState<string>('');

    const [leaserName, setLeaserName] = useState('');
    const [startLease, setStartLease] = useState('');
    const [rentStart, setRentStart] = useState('');
    const [leaseFrom, setLeaseFrom] = useState('');
    const [leaseTo, setLeaseTo] = useState('');
    const [electricProvider, setElectricProvider] = useState('');
    const [waterProvider, setWaterProvider] = useState('');
    const [remarks, setRemarks] = useState('');



    /**---------------------------- Get Stores ---------------------------------*/
    interface Store {
        Location_ID: number;
        LocationCode: string;
        Location: string;
        LocAddress: string;
        DateOpen: Date;
    }

    interface StoreOption {
        value: number;
        label: string;
    }

    useEffect(() => {
        axios.get(`${WebUrl}/api/get-stores`)
            .then((response) => {
                const stores: Store[] = response.data;
                const options: StoreOption[] = stores.map((store) => ({
                    value: store.Location_ID,
                    label: store.LocationCode,
                }));
                setStoreOptions(options);
                setAllStores(stores);
            })
            .catch(() => {
                toast.error('Failed to fetch stores');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    /**----------------------------- Get Contract Initial Data -----------------*/
    useEffect(() => {
        if (!contractData || storeOptions.length === 0) return;

        // Format date helper
        const formatDate = (date: Date | string | null | undefined): string => {
            if (!date) return '';
            return new Date(date).toISOString().split('T')[0];
        };

        // Find matching store option for dropdown
        const matchedOption = storeOptions.find(
            (option) => option.value === contractData.LocationID
        );

        if (matchedOption) {
            setSelectedOption(matchedOption);  // For the dropdown
        }

        // Populate your selectedStore for other fields
        setSelectedStore({
            Location_ID: contractData.LocationID,
            LocationCode: contractData.LocationCode,
            Location: contractData.Location,
            LocAddress: contractData.LocAddress,
            DateOpen: contractData.DateOpen,
        });

        // Populate other fields
        setSecurityMonths(contractData.SDMonths?.toString() || '');
        setAdvanceMonths(contractData.ADRMonths?.toString() || '');
        setElectricAmount(contractData.EBAmount?.toString() || '');
        setWaterAmount(contractData.WBAmount?.toString() || '');
        setSecurityAmount(contractData.SDAmount?.toString() || '');
        setAdvanceAmount(contractData.ADRAmount?.toString() || '');

        setLeaserName(contractData.LeaserName || '');
        setStartLease(formatDate(contractData.LeaseStart));
        setRentStart(formatDate(contractData.RentStart));
        setLeaseFrom(formatDate(contractData.LeaseFrom));
        setLeaseTo(formatDate(contractData.LeaseTo));

        setElectricProvider(contractData.EBDeposit || '');
        setWaterProvider(contractData.WBDeposit || '');
        setRemarks((contractData.Remarks || '').replace(/\\n/g, '\n'));
    }, [contractData, storeOptions]);
    /**---------------------------------- Web URL ------------------------------- */
    // const WebUrl = import.meta.env.VITE_WEBURL;
    const WebUrl = "";

    /** ----------- For Loading ------------------------- */
    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    useEffect(() => {
        if (!contractData || storeOptions.length === 0) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    }, [contractData, storeOptions]);


    /** ------------- Display PDF ------------------ */
    const memoizedDocViewer = useMemo(() => (
        <DocViewer
            documents={[
                {
                    uri: `/stream-contract/${contractData.Contract_ID}/${contractData.FileName}`,
                    fileType: "pdf"
                }
            ]}
            pluginRenderers={DocViewerRenderers}
            style={{ flexGrow: 1, border: "1px solid #eee", width: "100%" }}
        />
    ), [contractData.Contract_ID, contractData.FileName]);



    /**--------------------------------- Store Selected -------------------------------------*/
    const handleStoreChange = (selectedOption: StoreOption | null) => {
        const matchedStore = allStores.find((store) => store.Location_ID === selectedOption?.value) || null;
        setSelectedStore(matchedStore);
    };


    /** ------------------------------ Number of Months Change --------------------------------------- */
    const handleMonthChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: 'security' | 'advance'
    ) => {
        const rawValue = e.target.value;

        if (rawValue === '') {
            if (field === 'security') {
                setSecurityMonths('');
            } else {
                setAdvanceMonths('');
            }
            return;
        }

        let value = Math.floor(Number(rawValue));

        if (value < 1 || isNaN(value)) {
            toast.error('Number of months must be a whole number and at least 1');
            value = 1;
        }

        const stringValue = value.toString();

        if (field === 'security') {
            setSecurityMonths(stringValue);
        } else if (field === 'advance') {
            setAdvanceMonths(stringValue);
        }
    };


    /**-------------------------------- Amount Change -------------------------------------------*/
    const handleAmountChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: 'electric' | 'water' | 'adv' | 'sec'
    ) => {
        let value = e.target.value;

        // Allow empty value for typing
        if (value === '') {
            switch (field) {
                case 'electric':
                    setElectricAmount('');
                    break;
                case 'water':
                    setWaterAmount('');
                    break;
                case 'adv':
                    setAdvanceAmount('');
                    break;
                case 'sec':
                    setSecurityAmount('');
                    break;
            }
            return;
        }

        const numberValue = Number(value);

        const isValid =
            numberValue >= 1 &&
            /^\d+(\.\d{0,2})?$/.test(value); // regex allows up to 2 decimal digits

        if (!isValid) {
            toast.error('Please enter a valid amount.');
            return;
        }

        switch (field) {
            case 'electric':
                setElectricAmount(value);
                break;
            case 'water':
                setWaterAmount(value);
                break;
            case 'adv':
                setAdvanceAmount(value);
                break;
            case 'sec':
                setSecurityAmount(value);
                break;
        }
    };


    /**------------------------------------ Save Edit Changes -------------------------------*/
    const handleSaveEdit = async () => {
        const values = {
            ContractID: contractData.Contract_ID,
            documentName,
            Location_ID: selectedStore?.Location_ID,
            leaserName,
            startLease,
            rentStart,
            leaseFrom,
            leaseTo,
            securityMonths,
            securityAmount,
            advanceMonths,
            advanceAmount,
            electricProvider,
            electricAmount,
            waterProvider,
            waterAmount,
            remarks,
        };

        try {
            const result = await Swal.fire({
                title: 'Warning',
                text: 'Are you sure you want to save this contract?',
                icon: 'warning',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
                confirmButtonText: 'Yes',
                confirmButtonColor: '#1f878f',
                cancelButtonColor: '#d33',
                allowOutsideClick: false,
            });

            if (!result.isConfirmed) return;

            setisLoadingSubmit(true);

            Swal.fire({
                title: 'Please wait...',
                html: 'Updating contract...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });

            // console.log('FormData Contents:');
            // for (const [key, value] of formData.entries()) {
            //     console.log(`${key}: ${value}`);
            // }

            const response = await axios.post(`${WebUrl}/api/contract/update-contract`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const isSuccess = response.data.num > 0;
            const title = isSuccess ? 'Success' : 'Error';
            const icon = isSuccess ? 'success' : 'error';

            await Swal.fire({
                title,
                text: response.data.msg,
                icon,
                confirmButtonText: 'Ok',
                confirmButtonColor: '#1f878f',
                allowOutsideClick: false,
            });

            if (isSuccess) {
                const routePath = `${WebUrl}/contract/${contractData.Contract_ID}`;
                router.get(routePath);
            } else {
                setisLoadingSubmit(false);
            }

            setisLoadingSubmit(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            await Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#1f878f',
                allowOutsideClick: false,
            });

            // location.reload();
        } finally {
            setisLoadingSubmit(false);
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contract" />
            <Toaster position="top-right" />
            {isLoading ? (
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

                    {/* Document Name Section */}
                    <div className="px-4 md:px-8 lg:px-12 pt-4">
                        <div className="mb-2">
                            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                {contractData.DocumentName}
                            </span>
                        </div>
                    </div>

                    {/* Save Edit Button */}
                    <div className="px-4 md:px-8 lg:px-12 mb-1 flex justify-end">
                        <button
                            disabled={user.info?.PositionLevel_ID >= 4}
                            type="button"
                            onClick={handleSaveEdit}
                            className={`
                            ml-1 flex items-center gap-1 rounded px-3 py-2 text-xs text-white
                            ${user.info?.PositionLevel_ID >= 4
                                    ? 'bg-green-200 cursor-not-allowed dark:bg-green-300 dark:cursor-not-allowed'
                                    : 'bg-green-400 hover:bg-green-500 dark:bg-green-600 dark:hover:bg-green-700 cursor-pointer'}
                            `}
                        >
                            <FilePlus className="h-3 w-3" />
                            Save Edit
                        </button>
                    </div>

                    {/* Card Section with small margin */}
                    <div className="px-4 md:px-8 lg:px-12">
                        <Card className="w-full my-2 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">

                            <CardContent className="space-y-4 py-1 px-6">
                                <div className="grid grid-cols-12 md:grid-cols-4 gap-4">
                                    <div className="col-span-12 md:col-span-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Title</label>
                                        <Input
                                            value={documentName}
                                            onChange={(e) => setDocumentName(e.target.value)}
                                            readOnly={user.info?.PositionLevel_ID >= 4}
                                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
                                        />

                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabbed Container & PDF Viewer Split */}
                    <div className="px-4 md:px-8 lg:px-12">
                        <Card className="w-full my-2 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
                            <CardContent className="py-4 px-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Left: Tabs */}
                                    <div className="w-full md:w-1/2">
                                        <div className="border-b border-gray-200 mb-4">
                                            <nav className="flex space-x-4 text-sm font-medium text-gray-500">
                                                <button
                                                    onClick={() => setActiveTab('details')}
                                                    className={`pb-2 cursor-pointer ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-blue-600'}`}
                                                >
                                                    Details
                                                </button>
                                                <button
                                                    onClick={() => setActiveTab('utilities')}
                                                    className={`pb-2 cursor-pointer ${activeTab === 'utilities' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-blue-600'}`}
                                                >
                                                    Utilities
                                                </button>
                                                <button
                                                    onClick={() => setActiveTab('remarks')}
                                                    className={`pb-2 cursor-pointer ${activeTab === 'remarks' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-blue-600'}`}
                                                >
                                                    Remarks
                                                </button>
                                            </nav>
                                        </div>
                                        <div>
                                            {/* Details Tab */}
                                            {activeTab === 'details' && (
                                                <form className="space-y-5 text-sm text-gray-700 dark:text-gray-200 px-4 py-2">

                                                    <div>
                                                        <label className="block mb-1 font-semibold">Store Code</label>
                                                        <Select
                                                            isDisabled={user.info?.PositionLevel_ID >= 4}
                                                            classNamePrefix="react-select"
                                                            className="w-full"
                                                            options={storeOptions}
                                                            placeholder="Select Store Code"
                                                            isSearchable
                                                            value={storeOptions.find(option => option.value === selectedStore?.Location_ID)}
                                                            onChange={handleStoreChange}
                                                            styles={{
                                                                control: (base, state) => ({
                                                                    ...base,
                                                                    borderRadius: '0.5rem',
                                                                    padding: '0.0rem 0.45rem',
                                                                    borderColor: state.isFocused ? '#a5b4fc' : '#d1d5db',
                                                                    boxShadow: 'none',
                                                                    backgroundColor: '#fff',
                                                                    minHeight: '1rem',
                                                                    cursor: state.isDisabled ? 'not-allowed' : 'default',
                                                                }),
                                                                menu: (base) => ({
                                                                    ...base,
                                                                    borderRadius: '0.5rem',
                                                                    zIndex: 20,
                                                                }),
                                                                option: (base, state) => ({
                                                                    ...base,
                                                                    backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
                                                                    color: '#374151',
                                                                    padding: '0.5rem 1rem',
                                                                }),
                                                            }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block mb-1 font-semibold">Store Name</label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Store Name"
                                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                                            value={selectedStore?.Location || ''}
                                                            readOnly
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block mb-1 font-semibold">Address</label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Store Address"
                                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                                            value={selectedStore?.LocAddress || ''}
                                                            readOnly
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block mb-1 font-semibold">Leaser Name</label>
                                                        <Input
                                                            readOnly={user.info?.PositionLevel_ID >= 4}
                                                            type="text"
                                                            className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
                                                                ${user.info?.PositionLevel_ID >= 4 ? 'cursor-not-allowed opacity-70' : ''
                                                                }`}
                                                            placeholder="Enter Leaser Name"
                                                            value={leaserName}
                                                            onChange={(e) => setLeaserName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block mb-1 font-semibold">Store Opening</label>
                                                        <Input
                                                            type="text"
                                                            readOnly
                                                            value={
                                                                selectedStore?.DateOpen
                                                                    ? format(new Date(selectedStore.DateOpen), "dd-MM-yyyy")
                                                                    : "dd-mm-yyyy"
                                                            }
                                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                                        />

                                                    </div>
                                                    <div>
                                                        <label className="block mb-1 font-semibold">Start of Lease</label>
                                                        <DatePicker
                                                            date={startLease ? new Date(startLease) : undefined}
                                                            setDate={(date) => setStartLease(date ? format(date, "yyyy-MM-dd") : "")}
                                                            placeholder="dd-mm-yyyy"
                                                            readOnly={user.info?.PositionLevel_ID >= 4}
                                                        />

                                                    </div>
                                                    <div>
                                                        <label className="block mb-1 font-semibold">Rent Start</label>
                                                        <DatePicker
                                                            date={rentStart ? new Date(rentStart) : undefined}
                                                            setDate={(date) => setRentStart(date ? format(date, "yyyy-MM-dd") : "")}
                                                            placeholder="dd-mm-yyyy"
                                                            readOnly={user.info?.PositionLevel_ID >= 4}
                                                        />
                                                    </div>
                                                </form>
                                            )}

                                            {/* Utilities Tab */}
                                            {activeTab === 'utilities' && (
                                                <form className="space-y-6 text-sm text-gray-700 dark:text-gray-200 px-4 py-2">
                                                    {/* Lease Term */}
                                                    <div>
                                                        <label className="block mb-1 font-semibold">Lease Term</label>
                                                        <div className="mb-3">
                                                            <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">From</span>
                                                            <DatePicker
                                                                date={leaseFrom ? new Date(leaseFrom) : undefined}
                                                                setDate={(date) => setLeaseFrom(date ? format(date, "yyyy-MM-dd") : "")}
                                                                placeholder="dd-mm-yyyy"
                                                                readOnly={user.info?.PositionLevel_ID >= 4}
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">To</span>
                                                            <DatePicker
                                                                date={leaseTo ? new Date(leaseTo) : undefined}
                                                                setDate={(date) => setLeaseTo(date ? format(date, "yyyy-MM-dd") : "")}
                                                                placeholder="dd-mm-yyyy"
                                                                readOnly={user.info?.PositionLevel_ID >= 4}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Security Deposit */}
                                                    <div>
                                                        <label className="block mb-1 font-semibold">Security Deposit</label>
                                                        <Input
                                                            readOnly={user.info?.PositionLevel_ID >= 4}
                                                            type="number"
                                                            placeholder="No. of Months"
                                                            min={1}
                                                            step={1}
                                                            value={securityMonths}
                                                            onChange={(e) => handleMonthChange(e, 'security')}
                                                            className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
                                                                ${user.info?.PositionLevel_ID >= 4 ? 'cursor-not-allowed opacity-70' : ''}`}
                                                        />
                                                        <Input
                                                            readOnly={user.info?.PositionLevel_ID >= 4}
                                                            type="number"
                                                            min={1}
                                                            step={0.01}
                                                            placeholder="Amount"
                                                            value={securityAmount}
                                                            onChange={(e) => handleAmountChange(e, 'sec')}
                                                            className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
                                                                ${user.info?.PositionLevel_ID >= 4 ? 'cursor-not-allowed opacity-70' : ''}`}
                                                        />
                                                    </div>

                                                    {/* Advance Rent */}
                                                    <div>
                                                        <label className="block mb-1 font-semibold">Advance Rent</label>
                                                        <Input
                                                            readOnly={user.info?.PositionLevel_ID >= 4}
                                                            type="number"
                                                            placeholder="No. of Months"
                                                            min={1}
                                                            step={1}
                                                            value={advanceMonths}
                                                            onChange={(e) => handleMonthChange(e, 'advance')}
                                                            className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
                                                                ${user.info?.PositionLevel_ID >= 4 ? 'cursor-not-allowed opacity-70' : ''}`}
                                                        />
                                                        <Input
                                                            readOnly={user.info?.PositionLevel_ID >= 4}
                                                            type="number"
                                                            min={1}
                                                            step={0.01}
                                                            placeholder="Amount"
                                                            value={advanceAmount}
                                                            onChange={(e) => handleAmountChange(e, 'adv')}
                                                            className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
                                                                ${user.info?.PositionLevel_ID >= 4 ? 'cursor-not-allowed opacity-70' : ''}`}
                                                        />
                                                    </div>


                                                    {/* Electric Bill Deposit */}
                                                    <div>
                                                        <label className="block mb-1 font-semibold">Electric Bill Deposit</label>
                                                        <Input
                                                            readOnly={user.info?.PositionLevel_ID >= 4}
                                                            type="text"
                                                            placeholder="Service Provider"
                                                            value={electricProvider}
                                                            onChange={(e) => setElectricProvider(e.target.value)}
                                                            className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
                                                                ${user.info?.PositionLevel_ID >= 4 ? 'cursor-not-allowed opacity-70' : ''}`}
                                                        />
                                                        <Input
                                                            readOnly={user.info?.PositionLevel_ID >= 4}
                                                            type="number"
                                                            min={1}
                                                            step={0.01}
                                                            placeholder="Amount"
                                                            value={electricAmount}
                                                            onChange={(e) => handleAmountChange(e, 'electric')}
                                                            className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
                                                                ${user.info?.PositionLevel_ID >= 4 ? 'cursor-not-allowed opacity-70' : ''}`}
                                                        />
                                                    </div>

                                                    {/* Water Bill Deposit */}
                                                    <div>
                                                        <label className="block mb-1 font-semibold">Water Bill Deposit</label>
                                                        <Input
                                                            readOnly={user.info?.PositionLevel_ID >= 4}
                                                            type="text"
                                                            placeholder="Service Provider"
                                                            value={waterProvider}
                                                            onChange={(e) => setWaterProvider(e.target.value)}
                                                            className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
                                                                ${user.info?.PositionLevel_ID >= 4 ? 'cursor-not-allowed opacity-70' : ''}`}
                                                        />
                                                        <Input
                                                            readOnly={user.info?.PositionLevel_ID >= 4}
                                                            type="number"
                                                            min={1}
                                                            step={0.01}
                                                            placeholder="Amount"
                                                            value={waterAmount}
                                                            onChange={(e) => handleAmountChange(e, 'water')}
                                                            className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
                                                                ${user.info?.PositionLevel_ID >= 4 ? 'cursor-not-allowed opacity-70' : ''}`}
                                                        />
                                                    </div>

                                                </form>
                                            )}

                                            {/* Remarks Tab */}
                                            {activeTab === 'remarks' && (
                                                <div className="px-4 py-2">
                                                    <label className="block mb-1 font-semibold text-sm text-gray-700 dark:text-gray-200">Remarks</label>
                                                    <Textarea
                                                        readOnly={user.info?.PositionLevel_ID >= 4}
                                                        rows={16}
                                                        style={{ height: '180px' }}
                                                        placeholder="Enter your remarks here..."
                                                        value={remarks}
                                                        onChange={(e) => setRemarks(e.target.value)}
                                                        className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
                                                                ${user.info?.PositionLevel_ID >= 4 ? 'cursor-not-allowed opacity-70' : ''}`}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                    {/* Right: PDF Viewer */}
                                    <div className="w-full md:w-1/2">
                                        <div className="flex justify-end mb-2">
                                            <button
                                                onClick={() => setShowPDF(prev => !prev)}
                                                className="flex items-center gap-1 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded cursor-pointer"
                                            >
                                                {showPDF ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                {showPDF ? 'Hide PDF' : 'View PDF'}
                                            </button>
                                        </div>

                                        <div
                                            style={{
                                                width: '100%',
                                                border: '1px solid #eee',
                                                height: showPDF ? 'auto' : '1200px',
                                            }}
                                        >
                                            {showPDF ? (
                                                <div style={{ height: '100%' }}>{memoizedDocViewer}</div>
                                            ) : (
                                                <div
                                                    style={{
                                                        height: '1200px',
                                                        backgroundColor: '#f9f9f9',
                                                        border: '1px solid #eee',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#aaa',
                                                        position: 'relative',
                                                        flexDirection: 'column',
                                                    }}
                                                >
                                                    <FileText size={32} strokeWidth={1.5} />

                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '60%',
                                                            background: 'linear-gradient(to bottom, #f9f9f9 60%, transparent)',
                                                            pointerEvents: 'none',
                                                        }}
                                                    />

                                                    <span className="mt-2 text-sm">PDF</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )
            }
        </AppLayout >
    );

    /**----------------------------- Date Picker --------------------------------------------- */
    function DatePicker({ date, setDate, placeholder, readOnly = false }: DatePickerProps) {
        return (
            <Popover modal={false}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-left bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200
                      ${readOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                        disabled={readOnly}
                    >
                        {date ? format(date, "dd-MM-yyyy") : placeholder || "Pick a date"}
                    </button>
                </PopoverTrigger>

                {/* Only show calendar if not readOnly */}
                {!readOnly && (
                    <PopoverContent className="w-auto p-0 z-50
                    bg-white dark:bg-gray-800
                    text-gray-800 dark:text-gray-100
                    border border-gray-200 dark:border-gray-700
                    shadow-md rounded-sm">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="dark:text-gray-200"
                            classNames={{
                                selected:
                                    "bg-blue-400 text-black dark:bg-blue-500 dark:text-white rounded-full",
                            }}
                        />
                    </PopoverContent>
                )}
            </Popover>
        );

    }
}
