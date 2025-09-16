import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface LoadingDialogProps {
    open: boolean;
    description?: string;
}

export function Loading({ open, description = "Loading..." }: LoadingDialogProps) {
    return (
        <Dialog open={open} modal>
            <DialogContent
                className="flex flex-col items-center justify-center gap-6 py-8 w-80"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="sr-only">Loading</DialogTitle>
                    <DialogDescription className="text-center">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                {/* Bouncing + blinking dots */}
                <div className="flex gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full [animation:bounceBlink_0.8s_ease-in-out_infinite]"></span>
                    <span className="w-3 h-3 bg-blue-500 rounded-full [animation:bounceBlink_0.8s_ease-in-out_infinite_0.2s]"></span>
                    <span className="w-3 h-3 bg-yellow-400 rounded-full [animation:bounceBlink_0.8s_ease-in-out_infinite_0.4s]"></span>
                </div>

                {/* Inline keyframes */}
                <style>
                    {`
            @keyframes bounceBlink {
              0%, 100% { transform: translateY(0); opacity: 0.3; }
              50% { transform: translateY(-8px); opacity: 1; }
            }
          `}
                </style>
            </DialogContent>
        </Dialog>
    );
}
