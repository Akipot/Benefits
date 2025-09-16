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
import { PDFDocument } from "pdf-lib";


const breadcrumbs: BreadcrumbItemType[] = [
    {
        title: 'ECard Applications',
        href: '/index',
    },
];

interface Contracts {
    Contract_ID: number;
    DocumentName: string;
    FileName: string;
    DocumentType: string;
    Status: number | string;
    InsertBy: string;
    InsertedDate: string;
}

export default function Dashboard() {
    /**--------------------------------User Info -------------------------------*/
    const { auth } = usePage().props;
    const { user } = auth as { user: User; location: Location };

    const [data, setData] = useState<Contracts[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

    // const WebUrl = import.meta.env.VITE_WEBURL;
    const WebUrl = "";

    /**-------------------------- Fetch Ecard Applications --------------------------*/
    useEffect(() => {
        axios.get(`${WebUrl}/api/contract-of-lease`)
            .then(res => {
                setData(res.data);
            })
            .catch(err => {
                console.error('Failed to fetch incident classifications:', err);
                toast.error('Failed to load incident classifications');
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
            item.DocumentName.toLowerCase().includes(search) ||
            item.DocumentType.toLowerCase().includes(search) ||
            (Number(item.Status) === 1 ? 'Completed' : 'Ongoing').includes(search) ||
            (item.InsertBy || '').toLowerCase().includes(search) ||
            (item.InsertedDate || '').toLowerCase().includes(search)
        );
    });

    /**--------------------------- Pagination ----------------------------*/
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


    /**-------------------------- Page Layout ----------------------*/
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ECARD Form" />
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
                                                <BreadcrumbPage className="text-[0.75rem]">{user.info?.Location}</BreadcrumbPage>
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
                                        <th className="px-4 py-2 text-center border-b border-gray-300 dark:border-gray-600">ID</th>
                                        <th className="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-600">Document</th>
                                        <th className="px-4 py-2 text-left border-b border-gray-300 dark:border-gray-600">Uploaded</th>
                                        <th className="px-4 py-2 text-center border-b border-gray-300 dark:border-gray-600">Encode Status</th>
                                        <th className="px-4 py-2 text-center border-b border-gray-300 dark:border-gray-600">Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentRows.length > 0 ? (
                                        currentRows.map((item, idx) => (
                                            <tr
                                                key={startIndex + idx}
                                                // onClick={() => handleRowClick(item)}
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150 border-b border-gray-200"
                                            >
                                                <td className="px-4 py-2 text-center font-bold text-gray-800 dark:text-gray-200">
                                                    {item.Contract_ID}
                                                </td>
                                                <td className="px-4 py-2 text-left">
                                                    <div className="flex items-center gap-4 text-gray-800 dark:text-gray-200">
                                                        <File className="w-5 h-5 flex-shrink-0" />
                                                        <div className="flex flex-col items-start">
                                                            <span className="font-bold text-sm leading-tight">{item.DocumentName}</span>
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">{item.DocumentType}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-left">
                                                    <div className="flex flex-col items-start">
                                                        <span className="font-bold text-sm leading-tight">
                                                            {new Date(item.InsertedDate).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                        <span className="text-xs text-gray-600 dark:text-gray-400">by {item.InsertBy}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <span
                                                        className={`inline-block rounded-full px-2 py-0.5 font-semibold ${Number(item.Status) === 1
                                                            ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white'
                                                            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}
                                                    >
                                                        {Number(item.Status) === 1 ? 'Complete' : 'Ongoing'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-center space-x-2">
                                                    <button
                                                        className="p-1 text-gray-600 hover:text-gray-800 cursor-pointer dark:text-gray-300"
                                                        onClick={(e) => {
                                                            e.stopPropagation();

                                                        }}
                                                        title="Preview Uploaded PDF"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        className="p-1 text-gray-600 hover:text-gray-800 cursor-pointer dark:text-gray-300"
                                                        onClick={(e) => {
                                                            e.stopPropagation();

                                                        }}
                                                        title="Download PDF"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-2 text-center text-gray-500 border-b border-gray-200">
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                            </table>
                        )}
                    </div>

                </>
            )
            }
        </AppLayout >
    );

}
