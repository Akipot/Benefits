// app-sidebar.tsx
import 'pdfjs-dist/web/pdf_viewer.css';
import React, { useState, useEffect } from 'react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { Location, User, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import AppLogo from './app-logo';
import {
    BookCopy,
    CreditCard,
    PiggyBank,
    UserRound,
    Settings2,
    CircleAlert,
    UserRoundCheck,
    ClipboardList,
    Wallet,
    IdCard,
} from 'lucide-react';
import { Alert } from '@/components/dialogs/alert-dialog';
import axios from 'axios';

const WebUrl = '';

const mainNavItems: NavItem[] = [
    {
        title: 'Profile',
        icon: UserRound,
        href: `${WebUrl}/profile`,
    },
    {
        title: 'HR Forms',
        icon: BookCopy,
        children: [
            { title: 'SLA Membership', icon: PiggyBank, href: `${WebUrl}/forms/sla` },
            { title: 'E-Card Membership', icon: CreditCard, href: `${WebUrl}/forms/ecard` },
        ],
    },
    {
        title: 'Applications',
        icon: ClipboardList,
        children: [
            { title: 'SLA Application', icon: Wallet, href: `${WebUrl}/applications/sla` },
            { title: 'E-Card Application', icon: IdCard, href: `${WebUrl}/applications/ecard` },
        ],
    },
    // {
    //     title: 'Maintenance',
    //     icon: Settings2,
    //     children: [{ title: 'HR Manager', icon: UserRoundCheck, href: `${WebUrl}/forms/sla` }],
    // },
];

function useResponsiveCollapsed() {
    const { state } = useSidebar();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return !isMobile && state === 'collapsed';
}

export function AppSidebar() {
    const { auth } = usePage().props;
    const { user } = auth as { user: User; location: Location };
    const isCollapsed = useResponsiveCollapsed();

    /** ----------------------- Alert State ---------------------- */
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertDescription, setAlertDescription] = useState('');
    const [alertIcon, setAlertIcon] = useState<any>(null);
    const [alertVariant, setAlertVariant] = useState<'info' | 'error' | 'success'>('info');

    /** ----------------------- Protected Click ---------------------- */
    const handleProtectedClick = async (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
        href?: string
    ) => {
        e.preventDefault();

        try {
            const res = await axios.get(`${WebUrl}/api/check-profile-completion/${user.Emp_ID}`);

            if (res.data.complete) {
                window.location.href = href!;
            } else {
                setAlertTitle('Profile Incomplete');
                setAlertDescription(
                    'Please complete your Address, TIN, SSS, PhilHealth, and HDMF before accessing this form.'
                );
                setAlertIcon(CircleAlert);
                setAlertVariant('error');
                setAlertOpen(true);
            }
        } catch (err) {
            console.error(err);
            setAlertTitle('Error');
            setAlertDescription('Unable to verify profile at the moment.');
            setAlertIcon(CircleAlert);
            setAlertVariant('error');
            setAlertOpen(true);
        }
    };

    /** ----------------------- Inject onClick ---------------------- */
    // const filteredNavItems = mainNavItems.map((item) => {
    //     if (item.title === 'HR Forms' && item.children) {
    //         return {
    //             ...item,
    //             children: item.children.map((child) => ({
    //                 ...child,
    //                 onClick: (e: any) => handleProtectedClick(e, child.href),
    //             })),
    //         };
    //     }
    //     return item;
    // });

    const filteredNavItems = mainNavItems
        // Hide "Applications" and "Maintenance" for team_ID === "9"
        .filter((item) => {
            if (user.info?.team_ID !== "9") {
                return item.title !== "Applications";
            }
            return true;
        })
        // Inject onClick for HR Forms
        .map((item) => {
            if (item.title === "HR Forms" && item.children) {
                return {
                    ...item,
                    children: item.children.map((child) => ({
                        ...child,
                        onClick: (e: any) => handleProtectedClick(e, child.href),
                    })),
                };
            }
            return item;
        });

    return (
        <>
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/" prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent className="mb-0.5 truncate leading-none font-semibold mt-2">
                    <NavMain items={filteredNavItems} isCollapsed={isCollapsed} />
                </SidebarContent>

                <SidebarFooter>
                    <NavUser />
                </SidebarFooter>
            </Sidebar>

            {/* Alert Dialog */}
            <Alert
                open={alertOpen}
                onOpenChange={setAlertOpen}
                title={alertTitle}
                description={alertDescription}
                headerIcon={alertIcon}
                variant={alertVariant}
            />
        </>
    );
}
