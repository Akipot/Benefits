import AppLayout from '@/layouts/app-layout';
import { User, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Welcome',
        href: '/index',
    },
];

export default function Home() {
    const { auth } = usePage().props;
    const { user } = auth as { user: User };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home" />

            <div className="mt-32 flex flex-col items-center justify-center space-y-6 px-4 text-center">
                <motion.h1
                    className="text-4xl font-extrabold text-gray-800 dark:text-[#ebebeb]"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    Welcome, {user.info?.FullName}!
                </motion.h1>

                <motion.p
                    className="mb-7 max-w-xl text-lg text-gray-600 dark:text-[#ebebeb]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    Welcome to <span className="font-semibold text-blue-600 dark:text-[#bd0000]">HR Benefits</span>. We're glad to have you
                    here. Feel free to proceed with your transactions seamlessly.
                </motion.p>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.55, rotate: 4 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                >
                    <span className="inline-block cursor-pointer rounded-2xl bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 shadow-md transition-all">
                        Always here for you 🚀
                    </span>
                </motion.div>
            </div>
        </AppLayout>
    );
}
