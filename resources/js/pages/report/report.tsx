import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { Location, User, type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import '@cyntler/react-doc-viewer/dist/index.css';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, usePage } from '@inertiajs/react';
import { BuildingIcon, UserCheckIcon } from '@phosphor-icons/react';
import { FileTextIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { z } from 'zod';

interface MyResignationProps {
    EmpResID?: number;
}

const breadcrumbs: BreadcrumbItemType[] = [
    {
        title: 'Report',
        href: '/report',
    },
];

const ResignationSchema = z.object({
    CutoffPeriodFrom: z.string().min(1, { message: 'CuttOff Period From is required.' }),
    CutoffPeriodTo: z.string().min(1, { message: 'CuttOff Period To is required.' }),
    EffectiveDateFrom: z.string().min(1, { message: 'Effective Date From is required.' }),
    EffectiveDateTo: z.string().min(1, { message: 'Effective Date To is required.' }),
});
const defaultValues = {
    CutoffPeriodFrom: '',
    CutoffPeriodTo: '',
    EffectiveDateFrom: '',
    EffectiveDateTo: '',
} satisfies z.infer<typeof ResignationSchema>;

export default function Report({ EmpResID }: MyResignationProps) {
    const { auth } = usePage().props;
    const { user } = auth as { user: User; location: Location };
    const form = useForm<z.infer<typeof ResignationSchema>>({
        resolver: zodResolver(ResignationSchema),
        defaultValues: defaultValues,
    });
    /** ------------------------- Variable Declaration -------------------- */

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSubmit, setisLoadingSubmit] = useState(false);
    const onSubmit = async (values: z.infer<typeof ResignationSchema>) => {
        setisLoadingSubmit(true);
        try {
            const params = new URLSearchParams({
                CutoffPeriodFrom: values.CutoffPeriodFrom,
                CutoffPeriodTo: values.CutoffPeriodTo,
                EffectiveDateFrom: values.EffectiveDateFrom,
                EffectiveDateTo: values.EffectiveDateTo,
            }).toString();

            const url = route('within-allowable-date.download') + `?${params}`;

            const swalInstance = Swal.fire({
                title: 'Downloading...',
                text: 'Please wait while the report is being downloaded.',
                icon: 'info',
                showConfirmButton: false,
                allowOutsideClick: false,
                width: '400px',
                didOpen: () => {
                    Swal.showLoading();
                    window.location.href = url;

                    setTimeout(() => {
                        Swal.close();
                        setisLoadingSubmit(false);
                    }, 3000);
                },
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to initiate the download.',
                icon: 'error',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#d33',
                allowOutsideClick: false,
                width: '400px',
            });
            setisLoadingSubmit(false);
        }
    };

    /** ----------- For Loading ------------------------- */
    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [isLoading]);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Resignation Letter" />
            {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-4 py-10">
                    <div className="relative flex h-12 w-12 items-center justify-center">
                        <div className="absolute h-12 w-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent"></div>
                        <div className="absolute h-10 w-10 rounded-full bg-blue-100"></div>
                    </div>
                    <span className="animate-pulse text-sm font-medium text-gray-600">Loading, please wait...</span>
                </div>
            ) : (
                <>
                    <div className="w-full space-y-6 px-4 py-6 md:px-8 lg:px-16">
                        {/* Breadcrumbs */}
                        <div className="flex flex-col gap-y-2 text-xs font-medium text-gray-700 md:flex-row md:items-center md:justify-between">
                            <Breadcrumb className="text-[0.70rem]">
                                <BreadcrumbList>
                                    <BreadcrumbItem className="bg-background">
                                        <UserCheckIcon></UserCheckIcon>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <BreadcrumbLink className="">{user.info?.EmployeeNo}</BreadcrumbLink>
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
                                                <BreadcrumbPage className="text-[0.75rem] font-semibold">{user.info?.FullName}</BreadcrumbPage>
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
                                                <BreadcrumbPage className="text-[0.75rem] font-semibold">
                                                    {user.info?.location?.Location}
                                                </BreadcrumbPage>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Location</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        <div className="text-md mt-2 mb-2 flex w-full items-center justify-start">
                            <span className="font-semibold text-gray-800 dark:text-white">Generate Reports of Resign Employees</span>
                        </div>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4 px-6 py-4">
                            <Card className="bg-background w-full rounded-md shadow-sm dark:bg-[#0a0a0a]">
                                <CardContent className="px-6 py-2">
                                    {/* First Row */}
                                    <div className="mb-6 flex w-full space-x-6 text-sm">
                                        {/* Left Column */}
                                        <div className="w-1/2 space-y-4">
                                            <FormField
                                                control={form.control}
                                                name={'CutoffPeriodFrom'}
                                                render={({ field }) => (
                                                    <FormItem className="mt-1">
                                                        <FormLabel className="text-foreground">
                                                            Cutoff Period From<span className="text-red-600">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="date"
                                                                className="bg-background w-full rounded-[0.25rem] border border-gray-300 text-sm text-gray-900 shadow-sm transition duration-200 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-800 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:dark:invert"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Right Column */}
                                        <div className="w-1/2 space-y-4">
                                            <FormField
                                                control={form.control}
                                                name={'CutoffPeriodTo'}
                                                render={({ field }) => (
                                                    <FormItem className="mt-1">
                                                        <FormLabel className="text-foreground">
                                                            Cutoff Period To<span className="text-red-600">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="date"
                                                                className="bg-background w-full rounded-[0.25rem] border border-gray-300 text-sm text-gray-900 shadow-sm transition duration-200 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-800 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:dark:invert"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Second Row */}
                                    <div className="flex w-full space-x-6 text-sm">
                                        {/* Left Column */}
                                        <div className="w-1/2 space-y-4">
                                            <FormField
                                                control={form.control}
                                                name={'EffectiveDateFrom'}
                                                render={({ field }) => (
                                                    <FormItem className="mt-1">
                                                        <FormLabel className="text-foreground">
                                                            Effective Date From<span className="text-red-600">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="date"
                                                                className="bg-background w-full rounded-[0.25rem] border border-gray-300 text-sm text-gray-900 shadow-sm transition duration-200 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-800 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:dark:invert"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Right Column */}
                                        <div className="w-1/2 space-y-4">
                                            <FormField
                                                control={form.control}
                                                name={'EffectiveDateTo'}
                                                render={({ field }) => (
                                                    <FormItem className="mt-1">
                                                        <FormLabel className="text-foreground">
                                                            Effective Date To<span className="text-red-600">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="date"
                                                                className="bg-background w-full rounded-[0.25rem] border border-gray-300 text-sm text-gray-900 shadow-sm transition duration-200 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-800 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:dark:invert"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    className="flex cursor-pointer items-center justify-center gap-2 rounded-sm bg-blue-600 px-10 py-3 text-white shadow-md transition hover:bg-blue-700"
                                    onClick={form.handleSubmit(onSubmit)}
                                    disabled={isLoadingSubmit}
                                >
                                    <FileTextIcon size={20} />
                                    {isLoadingSubmit ? 'Loading...' : 'Generate Report'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </>
            )}
        </AppLayout>
    );
}
