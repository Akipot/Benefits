import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { User } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown, LogOut } from 'lucide-react';

export function NavUser() {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const { user } = auth;
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const isCollapsed = state === "collapsed";

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group flex items-center gap-3 text-left"
                        >
                            {!isCollapsed && (
                                <div className="flex flex-col truncate">
                                    <span className="truncate text-sm leading-tight font-semibold">{user.info?.FullName}</span>
                                    <span className="text-muted-foreground truncate text-[0.65rem] leading-tight">{user.info?.Position}</span>
                                </div>
                            )}
                            {isCollapsed ? (
                                <div className="flex w-full justify-center">
                                    <LogOut className="text-muted-foreground size-4" />
                                </div>
                            ) : (
                                <ChevronsUpDown className="text-muted-foreground ml-auto size-4" />
                            )}
                        </SidebarMenuButton>

                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={isMobile ? 'bottom' : isCollapsed ? 'left' : 'bottom'}
                    >
                        <UserMenuContent user={user.info?.Employee_ID} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
