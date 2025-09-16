import { useState, useRef, useEffect } from "react";
import { Link } from "@inertiajs/react";
import type { NavItem } from "@/types";
import { ChevronDown } from "lucide-react";
import ReactDOM from "react-dom";
import { useIsMobile } from '@/hooks/use-mobile';

interface Props {
    items: NavItem[];
    isCollapsed: boolean;
}

export function NavMain({ items, isCollapsed }: Props) {
    const isMobile = useIsMobile();

    return (
        <nav className="flex flex-col gap-1">
            {items.map((item, index) =>
                item.children && item.children.length > 0 ? (
                    <DropdownNavItem key={index} item={item} isCollapsed={isCollapsed} />
                ) : item.onClick ? (
                    <a
                        key={index}
                        href={item.href}
                        onClick={item.onClick}
                        className="flex items-start px-3 py-2 text-sm rounded hover:bg-gray-200 transition dark:hover:bg-gray-700 cursor-pointer"
                    >
                        {item.icon && <item.icon className="mr-2 w-4 h-4 mt-1 flex-shrink-0" />}
                        {!isCollapsed && <span>{item.title}</span>}
                    </a>
                ) : (
                    <Link
                        key={index}
                        href={item.href!}
                        className="flex items-start px-3 py-2 text-sm rounded hover:bg-gray-200 transition dark:hover:bg-gray-700"
                    >
                        {item.icon && <item.icon className="mr-2 w-4 h-4 mt-1 flex-shrink-0" />}
                        {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                )
            )}
        </nav>
    );
}

function DropdownNavItem({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
    const isMobile = useIsMobile();
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleEnter = () => {
        if (!isMobile) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setIsOpen(true);
        }
    };
    const handleLeave = () => {
        if (!isMobile) {
            timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
        }
    };
    const handleClick = () => {
        if (isMobile) setIsOpen(prev => !prev);
    };

    useEffect(() => {
        if (isOpen && triggerRef.current && isCollapsed && !isMobile) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({ top: rect.top, left: rect.right });
        }
    }, [isOpen, isCollapsed, isMobile]);

    const submenu = (
        <div className="min-w-[12rem] flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-[9999]">
            <div className="px-3 py-2 text-xs font-medium border-b border-gray-200 dark:border-gray-700">
                {item.title}
            </div>
            {item.children?.map((child, idx) =>
                child.onClick ? (
                    <a
                        key={idx}
                        href={child.href}
                        onClick={child.onClick}
                        className="flex items-center gap-2 px-3 py-1 text-xs text-gray-700 rounded hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                    >
                        {child.icon && <child.icon className="w-4 h-4 flex-shrink-0" />}
                        {child.title}
                    </a>
                ) : (
                    <Link
                        key={idx}
                        href={child.href!}
                        className="flex items-center gap-2 px-3 py-1 text-xs text-gray-700 rounded hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        {child.icon && <child.icon className="w-4 h-4 flex-shrink-0" />}
                        {child.title}
                    </Link>
                )
            )}
        </div>
    );

    return (
        <div
            className="relative flex flex-col"
            ref={triggerRef}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            <div
                onClick={handleClick}
                className="flex items-center px-3 py-2 text-sm rounded w-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            >
                {item.icon && <item.icon className="mr-2 w-4 h-4 flex-shrink-0" />}
                {!isCollapsed && <span className="flex-1">{item.title}</span>}
                {!isCollapsed && item.children && (
                    <ChevronDown
                        className={`w-4 h-4 ml-auto transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                            }`}
                    />
                )}
            </div>

            {!isCollapsed && (
                <div
                    className={`ml-6 mt-1 flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                >
                    {item.children?.map((child, idx) =>
                        child.onClick ? (
                            <a
                                key={idx}
                                href={child.href}
                                onClick={child.onClick}
                                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-700 rounded hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                            >
                                {child.icon && <child.icon className="w-4 h-4 flex-shrink-0" />}
                                {child.title}
                            </a>
                        ) : (
                            <Link
                                key={idx}
                                href={child.href!}
                                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-700 rounded hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                {child.icon && <child.icon className="w-4 h-4 flex-shrink-0" />}
                                {child.title}
                            </Link>
                        )
                    )}
                </div>
            )}

            {isCollapsed && !isMobile && isOpen &&
                ReactDOM.createPortal(
                    <div
                        style={{ position: "fixed", top: coords.top, left: coords.left }}
                        className="transition duration-300 ease-in-out transform origin-top-left scale-100 opacity-100"
                    >
                        {submenu}
                    </div>,
                    document.body
                )}
        </div>
    );
}
