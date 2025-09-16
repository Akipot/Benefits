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

interface AlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm?: () => void;   // <-- new confirm callback
  onCancel?: () => void;
  cancelText?: string;
  headerIcon?: LucideIcon;
  variant?: Variant;
}

export function Alert({
  open,
  onOpenChange,
  title = "Error!",
  description = "Server Error, kindly report to IT",
  onConfirm,
  onCancel,
  cancelText = "Ok",
  headerIcon: HeaderIcon,
  variant = "info",
}: AlertProps) {

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
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 text-lg font-semibold ${variantColors[variant]}`}>
            {HeaderIcon && <HeaderIcon className="w-5 h-5" />}
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
                onConfirm?.();       // <-- trigger confirm callback
                onCancel?.();        // optional cancel logic
                onOpenChange(false); // close the dialog
              }}
              className="px-3 py-1 text-md bg-gray-200 text-gray-800 rounded hover:bg-gray-300 
        dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 
        transition cursor-pointer"
            >
              {cancelText}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
