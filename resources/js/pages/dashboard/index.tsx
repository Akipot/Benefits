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
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast, Toaster } from 'sonner';
import Swal from 'sweetalert2';
import useSWR, { mutate } from 'swr';
import { z } from 'zod';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    Eye,
    Download,
    File,
    Filter,
    FileText,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";



interface Readings {
    Reading_ID: number;
    ReadingDate: Date;
    InitialReading: number;
    InitialDate: Date;
    InitialName: string;
    EndingReading: number;
    EndingDate: Date;
    EndingName: string;
    LastUpdate: Date;
    UpdateName: string;
    LocationCode: string;
    Location: string;
    FinalReading: number;
}

// interface ContractOfLease {
//     EmpId?: number;
// }

const breadcrumbs: BreadcrumbItemType[] = [
    {
        title: 'Store Electricity Monitoring',
        href: '/index',
    },
];

type DatePickerProps = {
    date?: Date;
    setDate: (date: Date | undefined) => void;
    placeholder?: string;
};

export default function dashboard() {
    const { auth } = usePage().props;
    const { user } = auth as { user: User; location: Location };
    const [data, setData] = useState<Readings[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    /**--------------- Filter Variables --------------------------- */
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filterReadingFrom, setFilterReadingFrom] = useState('');
    const [filterReadingTo, setFilterReadingTo] = useState('');

    const [isLoading, setIsLoading] = useState(false);

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

    /**-------------------------- Fetch Reading Data --------------------------*/
    useEffect(() => {
        axios.get(`${WebUrl}/api/get-reading`)
            .then(res => {
                setData(res.data);
                // console.log(data);
            })
            .catch(err => {
                console.error('Failed to fetch readings:', err);
                toast.error('Failed to load readings');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    /**---------------------------- Searching ----------------------------- */
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = data.filter(item => {
        const search = searchTerm.toLowerCase();

        return (
            item.InitialName.toLowerCase().includes(search) ||
            item.EndingName.toLowerCase().includes(search) ||
            item.UpdateName.toLowerCase().includes(search) ||
            item.LocationCode.toLowerCase().includes(search) ||
            item.Location.toLowerCase().includes(search)
        );
    });

    /**--------------------------- Pagination ----------------------------*/
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentRows = filteredData.slice(startIndex, startIndex + rowsPerPage);

    // const handleRowClick = (item: Readings) => {
    //     const routePath = `${WebUrl}/reading/${item.Reading_ID}`;
    //     router.get(routePath);
    // };

    /**-------------------------- Page Layout ----------------------*/
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
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

                    {/* Filter Modal */}
                    <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen} modal={false}>
                        <DialogContent
                            onInteractOutside={(e) => e.preventDefault()}
                            onEscapeKeyDown={(e) => e.preventDefault()}
                        >

                            <DialogHeader>
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-gray-700" />
                                    <DialogTitle className="text-sm">Filters</DialogTitle>
                                </div>
                            </DialogHeader>
                            <DialogDescription>
                                Filter Store Electricity Monitoring
                            </DialogDescription>
                            <form onSubmit={handleFilterSubmit} className="space-y-4 text-sm">
                                {/* Reading Date Range */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="FilterReadingFrom" className="block font-semibold mb-1">
                                            Reading Date From:
                                        </label>
                                        <DatePicker
                                            date={filterReadingFrom ? new Date(filterReadingFrom) : undefined}
                                            setDate={(date) => setFilterReadingFrom(date ? format(date, "yyyy-MM-dd") : "")}
                                            placeholder="Select from date"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="FilterReadingTo" className="block font-semibold mb-1">
                                            Reading Date To:
                                        </label>
                                        <DatePicker
                                            date={filterReadingTo ? new Date(filterReadingTo) : undefined}
                                            setDate={(date) => setFilterReadingTo(date ? format(date, "yyyy-MM-dd") : "")}
                                            placeholder="Select to date"
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <button
                                        type="button"
                                        onClick={() => setIsFilterModalOpen(false)}
                                        className="
                                            px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 text-sm
                                            hover:bg-gray-100 transition duration-150
                                            dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 cursor-pointer"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="
                                            px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-800 text-sm
                                            hover:bg-gray-200 transition duration-150
                                            dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600 cursor-pointer"
                                    >
                                        Reset Filters
                                    </button>
                                    <Button type="submit" className="cursor-pointer">Apply Filter</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Readings Table */}
                    <div className="px-4 md:px-8 lg:px-16 py-4">

                        <div className="mb-4 flex items-center justify-between">

                            {/* Search input */}
                            <div className="relative w-72 max-w-full">
                                <Input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="w-full rounded border border-gray-300 px-3 py-2 pr-10 text-xs"
                                />
                                <Search
                                    className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                                />
                            </div>

                            {/* Filter button */}
                            <button
                                onClick={() => setIsFilterModalOpen(true)}
                                className="
                                    ml-4 flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700
                                    hover:bg-gray-200 cursor-pointer
                                    dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700
                                "
                            >
                                <Filter className="h-3 w-3" />
                                Filters
                            </button>

                        </div>

                        <div className="overflow-x-auto rounded-md shadow-sm text-xs">
                            {loading ? (
                                <div className="flex justify-center items-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                    <span className="ml-3 text-gray-600 text-sm">Fetching data...</span>
                                </div>
                            ) : (
                                <table className="w-full table-auto border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-700">
                                            <th className="px-4 py-2 text-center border-b border-gray-300 dark:border-gray-600">#</th>
                                            <th className="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-600">Reading Date</th>
                                            {/* <th className="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-600">Location</th> */}
                                            <th className="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-600">Initial Reading</th>
                                            <th className="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-600"></th>
                                            <th className="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-600">Ending Reading</th>
                                            <th className="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-600"></th>
                                            <th className="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-600">Total kWh</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentRows.length > 0 ? (
                                            currentRows.map((item, idx) => {
                                                const rowNumber = startIndex + idx + 1;
                                                // const currentFinal = item.FinalReading;
                                                let trendIcon = null;


                                                if (idx < currentRows.length - 1) {
                                                    const currentFinal = Number(item.FinalReading);
                                                    const nextFinal = Number(currentRows[idx + 1].FinalReading);

                                                    // console.log(`Current: ${currentFinal}, Next: ${nextFinal}`);
                                                    // console.log(typeof currentFinal, typeof nextFinal);

                                                    if (currentFinal > nextFinal) {
                                                        trendIcon = <TrendingUp className="w-4 h-4 text-red-400" />;
                                                    } else if (currentFinal < nextFinal) {
                                                        trendIcon = <TrendingDown className="w-4 h-4 text-green-400" />;
                                                    } else {
                                                        trendIcon = <Minus className="w-4 h-4 text-gray-400" />;
                                                    }
                                                } else {
                                                    trendIcon = null;
                                                }
                                                return (
                                                    <tr
                                                        key={rowNumber}
                                                        // onClick={() => handleRowClick(item)}
                                                        // className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 border-b border-gray-200"
                                                        className="transition-all duration-150 border-b border-gray-200"
                                                    >
                                                        <td className="px-4 py-2 text-center font-bold text-gray-800 dark:text-gray-200">
                                                            {rowNumber}
                                                        </td>

                                                        <td className="px-4 py-2 text-left">
                                                            <div className="flex flex-col items-start text-gray-800 dark:text-gray-200">
                                                                <span className="font-bold text-sm leading-tight">
                                                                    {new Date(item.ReadingDate).toLocaleDateString('en-US', {
                                                                        month: 'long',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* <td className="px-4 py-2 text-left">
                                                            <div className="flex flex-col items-start">
                                                                <span className="font-bold text-xs leading-tight">
                                                                    {item.LocationCode}
                                                                </span>
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">{item.Location}</span>
                                                            </div>
                                                        </td> */}

                                                        <td className="px-4 py-2 text-left">
                                                            <div className="flex flex-col items-start text-gray-800 dark:text-gray-200">
                                                                <span className="font-bold text-xs leading-tight">
                                                                    {item.InitialReading} kWh
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-2 text-left">
                                                            <div className="flex flex-col items-start">
                                                                <span className="font-bold text-xs leading-tight">
                                                                    {new Date(item.InitialDate).toLocaleDateString('en-US', {
                                                                        month: 'long',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                    })}
                                                                </span>
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">by {item.InitialName}</span>
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-2 text-left">
                                                            <div className="flex flex-col items-start text-gray-800 dark:text-gray-200">
                                                                <span className="font-bold text-xs leading-tight">
                                                                    {item.EndingReading} kWh
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-2 text-left">
                                                            <div className="flex flex-col items-start">
                                                                <span className="font-bold text-xs leading-tight">
                                                                    {new Date(item.EndingDate).toLocaleDateString('en-US', {
                                                                        month: 'long',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                    })}
                                                                </span>
                                                                <span className="text-xs text-gray-600 dark:text-gray-400">by {item.EndingName}</span>
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-2 text-left">
                                                            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                                                <span className="font-bold text-xs leading-tight">{item.FinalReading} kWh</span>
                                                                {trendIcon && (
                                                                    <span className="text-sm">
                                                                        {trendIcon}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-2 text-center text-gray-500 border-b border-gray-200">
                                                    No data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                            )}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-end space-x-4 mt-4 text-sm text-gray-700 dark:text-gray-300">
                            {/* Show Label */}
                            <span>Show</span>

                            {/* Rows per page dropdown */}
                            <select
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="border rounded px-2 py-1 cursor-pointer border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                            >
                                {[5, 10, 25, 50].map((num) => (
                                    <option key={num} value={num}>
                                        {num}
                                    </option>
                                ))}
                            </select>

                            <span>Rows</span>

                            {/* Page info */}
                            <span>
                                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                            </span>

                            {/* First page */}
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 cursor-pointer dark:text-gray-300 text-gray-700"
                                aria-label="First Page"
                            >
                                <ChevronsLeft size={20} />
                            </button>

                            {/* Previous page */}
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 cursor-pointer dark:text-gray-300 text-gray-700"
                                aria-label="Previous Page"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            {/* Next page */}
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 cursor-pointer dark:text-gray-300 text-gray-700"
                                aria-label="Next Page"
                            >
                                <ChevronRight size={20} />
                            </button>

                            {/* Last page */}
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="p-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 cursor-pointer dark:text-gray-300 text-gray-700"
                                aria-label="Last Page"
                            >
                                <ChevronsRight size={20} />
                            </button>
                        </div>
                    </div>


                </>
            )
            }
        </AppLayout >
    );


    /**--------------------------------- Reset Filter ---------------------------------------------- */
    function handleResetFilters() {
        setFilterReadingFrom('');
        setFilterReadingTo('');
    }

    /**-------------------------------- Filter Submit ---------------------------------------------- */
    function handleFilterSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        axios.post(`${WebUrl}/api/get-reading/filter`, {
            ReadingFrom: filterReadingFrom,
            ReadingTo: filterReadingTo,
        })
            .then(res => {
                setData(res.data);
            })
            .catch(err => {
                console.error("Filter failed:", err);
                toast.error("Failed to apply filter");
            })
            .finally(() => {
                setIsFilterModalOpen(false);
                setLoading(false);
            });
    }

    /**----------------------------- Date Picker --------------------------------------------- */
    function DatePicker({ date, setDate, placeholder }: DatePickerProps) {
        return (
            <Popover modal={false}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="w-full text-left px-3 py-2 
                            border border-gray-300 dark:border-gray-700 
                            bg-white dark:bg-gray-800 
                            text-gray-700 dark:text-gray-200 
                            rounded-sm"
                    >
                        {date ? format(date, "dd-MM-yyyy") : placeholder || "Pick a date"}
                    </button>
                </PopoverTrigger>
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
            </Popover>
        );
    }
}
