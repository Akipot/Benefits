import * as React from "react";
import { cn } from "@/lib/utils";

interface OverallProgressProps {
  progress?: number;
}

export function OverallProgress({ progress = 0 }: OverallProgressProps) {

  const progressColor =
    progress <= 30
      ? "bg-red-500 dark:bg-red-600"
      : progress <= 70
        ? "bg-yellow-500 dark:bg-yellow-600"
        : "bg-green-600 dark:bg-green-500";

  return (
    <div className="w-full space-y-2">
      <div className="sm:flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
        <span>Profile Completion</span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all", progressColor)}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-right text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
        {Math.round(progress)}%
      </div>
    </div>
  );
}
