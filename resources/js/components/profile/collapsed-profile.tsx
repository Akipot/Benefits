import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { useIsMobile } from '@/hooks/use-mobile';
import { UserRound as UserIcon } from 'lucide-react';
import type { User } from '@/types';
import { Link } from '@inertiajs/react';

interface Props {
    user: User;
    isCollapsed: boolean;
}

const WebUrl = ''; // your base URL

export function CollapsedProfile({ user, isCollapsed }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement | null>(null);
    const isMobile = useIsMobile();

    useEffect(() => {
        if (isOpen && triggerRef.current && isCollapsed && !isMobile) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({ top: rect.top, left: rect.right });
        }
    }, [isOpen, isCollapsed, isMobile]);

    if (!isCollapsed) return null;

    return (
        <div
            ref={triggerRef}
            className="flex items-center px-3 py-2 text-sm rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {/* Sidebar Icon as link */}
            <Link href={`${WebUrl}/profile`}>
                <UserIcon className="w-4.5 h-4.5 text-gray-700 dark:text-gray-200 flex-shrink-0" />
            </Link>

            {/* Floating hover card */}
            {isOpen && !isMobile &&
                ReactDOM.createPortal(
                    <div
                        className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg p-2 min-w-[100px] z-[9999]"
                        style={{ position: "fixed", top: coords.top, left: coords.left }}
                    >
                        <span className="text-xs font-medium text-gray-900 dark:text-white text-left">
                            Profile
                        </span>
                    </div>,
                    document.body
                )
            }

        </div>
    );
}
