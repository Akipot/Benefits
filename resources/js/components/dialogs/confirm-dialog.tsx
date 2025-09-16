import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { LucideIcon } from "lucide-react";

type Variant = "error" | "warning" | "success" | "info";

interface ConfirmProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    onConfirm: () => Promise<void> | void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    headerIcon?: LucideIcon;
    variant?: Variant;
}

export function Confirm({
    open,
    onOpenChange,
    title = "Confirm",
    description = "Are you sure?",
    onConfirm,
    onCancel,
    confirmText = "Yes",
    cancelText = "Cancel",
    headerIcon: HeaderIcon,
    variant = "info",
}: ConfirmProps) {

    const variantColors: Record<Variant, string> = {
        error: "text-red-500",
        warning: "text-yellow-500",
        success: "text-green-500",
        info: "text-blue-500",
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                className="max-w-sm rounded-lg p-6 bg-white dark:bg-gray-800"
            >
                {/* <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {HeaderIcon && (
                            <HeaderIcon className={`w-5 h-5 ${variantColors[variant]}`} />
                        )}
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {description}
                    </DialogDescription>
                </DialogHeader> */}

                <DialogHeader>
                    <DialogTitle className={`flex items-center gap-2 text-lg font-semibold ${variantColors[variant]}`}>
                        {HeaderIcon && (
                            <HeaderIcon className={`w-5 h-5`} />
                        )}
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex !justify-center gap-2 mt-4">
                    {cancelText && (
                        <button
                            type="button"
                            onClick={() => {
                                onCancel?.();
                                onOpenChange(false);
                            }}
                            className="px-3 py-1 text-md bg-gray-200 text-gray-800 rounded hover:bg-gray-300 
                                dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 
                                transition cursor-pointer"
                        >
                            {cancelText}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={async () => {
                            onOpenChange(false);
                            await onConfirm();
                        }}
                        className="px-3 py-1 text-md bg-blue-600 text-white rounded hover:bg-blue-700 
                                dark:bg-blue-500 dark:hover:bg-blue-600 
                                transition cursor-pointer"
                    >
                        {confirmText}
                    </button>
                </DialogFooter>

            </DialogContent>
        </Dialog >
    );
}
