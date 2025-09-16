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
    Minus,
    ArrowBigDownDash
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
import { PDFDocument } from "pdf-lib";

import Pagination from "@/components/others/pagination";
import { View } from "@/components/dialogs/view-pdf";


const breadcrumbs: BreadcrumbItemType[] = [
    {
        title: 'SLA Applications',
        href: '/index',
    },
];

interface SLA {
    Application_ID: number;
    Status: string;
    EmployeeNo: string;
    FullName: string;
    Company: string;
    Branch: string;
    InsertDate: string;
    FileName: string;
    FilePath: string;
    CutoffFrom: string;
    CutoffTo: string;
}

export default function Dashboard() {
    /**--------------------------------User Info -------------------------------*/
    const { auth } = usePage().props;
    const { user } = auth as { user: User; location: Location };

    const [data, setData] = useState<SLA[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');

    const [isLoading, setIsLoading] = useState(false);

    // const WebUrl = import.meta.env.VITE_WEBURL;
    const WebUrl = "";

    /**-------------------------- Fetch SLA Applications --------------------------*/
    useEffect(() => {
        axios.get(`${WebUrl}/api/get-sla-applications`)
            .then(res => {
                setData(res.data);
            })
            .catch(err => {
                console.error('Failed to fetch SLA Applications:', err);
                toast.error('Failed to load SLA applications. Try again later.');
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
            item.EmployeeNo.toLowerCase().includes(search) ||
            item.FullName.toLowerCase().includes(search) ||
            (Number(item.Status) === 1 ? 'Completed' : 'Ongoing').includes(search) ||
            (item.InsertDate || '').toLowerCase().includes(search) ||
            (item.Company || '').toLowerCase().includes(search) ||
            (item.Branch || '').toLowerCase().includes(search)
        );
    });

    /**--------------------------- Pagination ----------------------------*/
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentRows = filteredData.slice(startIndex, startIndex + rowsPerPage);


    /** ----------- For Loading ------------------------- */
    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    /** ----------------------------- Selection ------------------------ */
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const allSelected = currentRows.every(item =>
        selectedIds.includes(item.Application_ID)
    );
    const someSelected =
        currentRows.some(item => selectedIds.includes(item.Application_ID)) &&
        !allSelected;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSelected = [
                ...new Set([...selectedIds, ...currentRows.map(item => item.Application_ID)])
            ];
            setSelectedIds(newSelected);
            // console.log("Selected after select all:", newSelected);
        } else {
            const newSelected = selectedIds.filter(
                id => !currentRows.some(item => item.Application_ID === id)
            );
            setSelectedIds(newSelected);
            // console.log("Selected after deselect all:", newSelected);
        }
    };

    const handleCheckboxChange = (id: number, checked: boolean) => {
        setSelectedIds(prev => {
            const updated = checked ? [...prev, id] : prev.filter(i => i !== id);
            console.log("Selected Application IDs:", updated);
            return updated;
        });
    };

    useEffect(() => {
        // console.log("Selected Application IDs updated:", selectedIds);
    }, [selectedIds]);

    /** -------------------------- Generate / Download PDF -------------------- */
    const handleDownloadSelected = async () => {
        if (selectedIds.length === 0) return;

        const selectedFiles = data.filter(d => selectedIds.includes(d.Application_ID));

        if (selectedFiles.length === 0) return;

        const cutoffFromDates = selectedFiles.map(f => f.CutoffFrom);
        const cutoffToDates = selectedFiles.map(f => f.CutoffTo);

        const From = cutoffFromDates.reduce((min, d) => (d < min ? d : min), cutoffFromDates[0]);
        const To = cutoffToDates.reduce((max, d) => (d > max ? d : max), cutoffToDates[0]);

        const zipName = `${From}_To_${To}.zip`;

        const idsParam = selectedIds.join(',');
        const url = `${WebUrl}/api/download-sla-zip?ids=${idsParam}`;

        try {
            const response = await axios.get(url, {
                responseType: 'blob',
                withCredentials: true
            });

            const blob = new Blob([response.data], { type: 'application/zip' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = zipName; // use frontend-calculated name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.location.reload();
        } catch (error) {
            console.error('Download failed', error);
        }
    };

    /** ----------------------------- View Application  ------------------------ */
    const [viewTitle, setViewTitle] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedSLA, setSelectedSLA] = useState<SLA | null>(null)
    const [viewLink, setViewLink] = useState("");


    const handleViewApplication = async (item: SLA) => {
        setViewTitle(`APPLICATION FORM - ${item.FullName} (${item.EmployeeNo})`)
        setSelectedSLA(item);
        const pdfLink = `${WebUrl}/storage/${item.FilePath}/${item.FileName}`;
        setViewLink(pdfLink);
        setViewOpen(true);
    };


    /**-------------------------- Page Layout ----------------------*/
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="SLA Applications" />
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

                    <div className="px-4 md:px-8 lg:px-6 py-4">
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

                            {selectedIds.length > 0 && (
                                <Button
                                    className="
                                        ml-4 flex items-center gap-1 rounded border border-yellow-500 bg-yellow-500 px-3 py-2 text-xs text-black font-bold
                                        hover:bg-yellow-600 cursor-pointer
                                        dark:border-yellow-400 dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-500
                                    "
                                    onClick={handleDownloadSelected}


                                >
                                    <ArrowBigDownDash className="h-3 w-3" />
                                    Generate Form
                                </Button>
                            )}

                        </div>

                        <div className="overflow-x-auto rounded-md shadow-sm text-xs">


                            {loading ? (
                                <div className="flex flex-col justify-center items-center py-10">
                                    <div className="flex space-x-1 mb-2">
                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-fade"></span>
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-fade animation-delay-200"></span>
                                        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-fade animation-delay-400"></span>
                                    </div>
                                    <span className="text-gray-400 text-xs">Hang tight, loading data…</span>
                                </div>

                            ) : (
                                <div className="overflow-x-auto scrollbar">
                                    <table className="w-full table-auto border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 dark:bg-gray-700">
                                                <th className="px-4 py-2 text-center border-b border-gray-300 dark:border-gray-600">
                                                    <input
                                                        type="checkbox"
                                                        className="cursor-pointer"
                                                        checked={allSelected}
                                                        ref={el => {
                                                            if (el) el.indeterminate = someSelected;
                                                        }}
                                                        onChange={e => handleSelectAll(e.target.checked)}
                                                        onClick={e => e.stopPropagation()}
                                                    />


                                                </th>
                                                <th className="px-4 py-2 text-center border-b border-gray-300 dark:border-gray-600">#</th>
                                                <th className="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-600">Status</th>
                                                <th className="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-600">Employee</th>
                                                <th className="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-600">Cutoff Period</th>
                                                <th className="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-600">Date Submitted</th>
                                                <th className="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-600">Company</th>
                                                <th className="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-600">Branch</th>
                                                <th className="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-600">Application Form</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentRows.length > 0 ? (
                                                currentRows.map((item, idx) => (
                                                    <tr
                                                        onClick={() => handleViewApplication(item)}
                                                        key={item.Application_ID}
                                                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 border-b border-gray-200"
                                                    >
                                                        <td className="px-4 py-2 text-center border-b border-gray-300 dark:border-gray-600">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.includes(item.Application_ID)}
                                                                onChange={e =>
                                                                    handleCheckboxChange(item.Application_ID, e.target.checked)
                                                                }
                                                                onClick={e => e.stopPropagation()}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 text-center font-bold text-gray-800 dark:text-gray-200">{startIndex + idx + 1}</td>
                                                        <td className="px-4 py-2 text-left">
                                                            <span
                                                                className={`px-2 py-1 rounded text-xs font-bold ${item.Status === "Generated"
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100"
                                                                    : "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100"
                                                                    }`}
                                                            >
                                                                {item.Status}
                                                            </span>
                                                        </td>


                                                        <td className="px-4 py-2 text-left">
                                                            <div className="flex items-left gap-4 text-gray-800 dark:text-gray-200">
                                                                <div className="flex flex-col items-start">
                                                                    <span className="font-bold text-sm leading-tight">{item.EmployeeNo}</span>
                                                                    <span className="text-xs text-gray-600 dark:text-gray-400">{item.FullName}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2 text-left">
                                                            <div className="flex items-left gap-4 text-gray-800 dark:text-gray-200">
                                                                <div className="flex flex-col items-start">
                                                                    <span className="font-bold text-sm leading-tight">
                                                                        {new Date(item.CutoffFrom).toLocaleDateString('en-US', {
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            year: 'numeric',
                                                                        })} to
                                                                    </span>
                                                                    <span className="font-bold text-sm leading-tight">
                                                                        {new Date(item.CutoffTo).toLocaleDateString('en-US', {
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            year: 'numeric',
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            </div>



                                                        </td>
                                                        <td className="px-4 py-2 text-left">
                                                            <span className="font-bold text-sm leading-tight">
                                                                {new Date(item.InsertDate).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                })}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-left font-bold text-gray-800 dark:text-gray-200">{item.Company}</td>
                                                        <td className="px-4 py-2 text-left font-bold text-gray-800 dark:text-gray-200">{item.Branch}</td>
                                                        <td className="px-4 py-2 text-left font-bold text-gray-800 dark:text-gray-200">{item.FileName}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={9} className="px-4 py-2 text-center text-gray-500 border-b border-gray-200">
                                                        No data available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                            )}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            rowsPerPage={rowsPerPage}
                            setCurrentPage={setCurrentPage}
                            setRowsPerPage={setRowsPerPage}
                        />


                        <View
                            open={viewOpen}
                            title={viewTitle}
                            onCancel={() => setViewOpen(false)}
                            link={viewLink}
                        />

                    </div>

                </>
            )
            }
        </AppLayout >
    );

}
