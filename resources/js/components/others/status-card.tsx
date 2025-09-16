import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LucideIcon, Eye, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatusCardProps {
    icon: LucideIcon;
    title: string;
    message: string;
    buttonLink: string;
    colorClass?: string;
}

export default function StatusCard({
    icon: Icon,
    title,
    message,
    buttonLink,
    colorClass = "text-blue-500 dark:text-blue-400",
}: StatusCardProps) {
    const [flipped, setFlipped] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const bgClass = colorClass
        .replace(/text-/g, "bg-")
        .replace(/dark:bg-/g, "dark:bg-");
    const hoverBgClass = bgClass.replace(/(bg-\S+)/g, "$1 hover:$1");

    return (
        <div className="w-full space-y-2 px-2 py-6 md:px-1 lg:px-4">
            <div className="w-full px-4 py-4">
                <div
                    className={`relative w-full perspective transition-all duration-500 ${flipped ? "h-[700px]" : "h-96"
                        }`}
                >
                    <motion.div
                        className="relative w-full h-full"
                        animate={{ rotateY: flipped ? 180 : 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        {/* FRONT */}
                        <Card
                            className="absolute inset-0 backface-hidden w-full h-full dark:bg-black-900 dark:border-gray-700"
                            style={{ backfaceVisibility: "hidden" }}
                        >
                            <CardContent className="flex flex-col items-center justify-center text-center h-full">
                                <motion.div
                                    animate={{
                                        rotate: [0, -10, 10, -10, 10, 0],
                                    }}
                                    transition={{
                                        rotate: {
                                            repeat: Infinity,
                                            duration: 0.6,
                                            repeatDelay: 1.4,
                                            ease: "easeInOut",
                                        },
                                    }}
                                >
                                    <Icon className={`w-32 h-32 mb-4 ${colorClass}`} />
                                </motion.div>
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                                    {title}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    {message}
                                </p>
                                <button
                                    onClick={() => setFlipped(true)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${bgClass} hover:opacity-90 transition text-sm cursor-pointer`}
                                >
                                    <Eye className="w-4 h-4" />
                                    View Application Form
                                </button>
                            </CardContent>
                        </Card>

                        {/* BACK */}
                        <Card
                            className="absolute inset-0 backface-hidden w-full h-full dark:bg-black-900 dark:border-gray-700"
                            style={{
                                transform: "rotateY(180deg)",
                                backfaceVisibility: "hidden",
                            }}
                        >
                            <CardContent className="h-full w-full flex flex-col p-0">
                                {isMobile ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                                            PDF will be launched in a new tab.
                                        </p>
                                        <button
                                            onClick={() => window.open(buttonLink, "_blank")}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                        >
                                            Open PDF
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-1 bg-gray-100 dark:bg-gray-800">
                                        <iframe
                                            src={buttonLink}
                                            className="w-full h-[75vh] rounded-b-lg"
                                            title="Application PDF"
                                        />
                                    </div>

                                )}

                                <div className="flex justify-center py-3">
                                    <button
                                        onClick={() => setFlipped(false)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white transition text-sm cursor-pointer"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Hide Application Form
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
