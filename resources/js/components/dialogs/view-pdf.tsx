import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";

interface ViewProps {
    open: boolean;
    title: string;
    onCancel?: () => void;
    cancelText?: string;
    link: string;
}

export function View({
    open,
    title = "New",
    onCancel,
    cancelText = "Close",
    link,
}: ViewProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [pdfLaunched, setPdfLaunched] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile && open && !pdfLaunched) {
            window.open(link, "_blank");
            setPdfLaunched(true); // only launch once per open
        }
        if (!open) setPdfLaunched(false); // reset when modal closes
    }, [isMobile, open, link, pdfLaunched]);

    return (
        <Dialog open={open} onOpenChange={onCancel}>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                className="flex flex-col rounded-2xl p-4 md:p-8 bg-white dark:bg-gray-900 shadow-xl overflow-hidden"
                style={{
                    width: "98vw",
                    height: "95vh",
                    maxWidth: "1000px",
                    maxHeight: "95vh",
                }}
            >
                <DialogHeader className="pb-2 border-b border-gray-200 dark:border-gray-700">
                    <DialogTitle className="text-md font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                        This file has been successfully prepared and is now ready for printing.
                        You can go ahead and print it whenever you’re ready.
                    </DialogDescription>
                </DialogHeader>

                {isMobile ? (
                    <div className="flex-1 flex items-center justify-center text-center text-gray-700 dark:text-gray-300">
                        PDF has been launched in a new tab or window.
                    </div>
                ) : (
                    <div className="flex-1 my-4 overflow-auto">
                        <iframe
                            src={link}
                            title="Application PDF"
                            className="w-full h-full"
                            style={{ minHeight: "400px" }}
                        />
                    </div>
                )}

                <DialogFooter className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 transition cursor-pointer"
                    >
                        {cancelText}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
