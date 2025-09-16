"use client";

import { useState } from "react";
import { X, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";
import {
    FormField,
    FormItem,
    FormControl,
} from "@/components/ui/form";

interface SearchableSelectProps {
    form: any;
    name: string;
    options: { id: string | number; label: string }[];
    dependencies?: string[];
    placeholder?: string;
    labelField?: string;
    className?: string;
    hasError?: boolean; // ✅ added
}

export function SearchableSelect({
    form,
    name,
    options,
    dependencies = [],
    placeholder = "Select option",
    labelField,
    className,
    hasError = false, // ✅ default false
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn("w-full", className)}>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <div
                                    className={cn(
                                        "flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm",
                                        hasError
                                            ? "border-[#E8001B]" // 🔴 red border if error
                                            : "border-gray-300 dark:border-[#262626]",
                                        "bg-white dark:bg-[#0A0A0A]",
                                        !field.value
                                            ? "text-gray-500 dark:[#262626]"
                                            : "text-gray-900 dark:text-gray-100",
                                        "focus-within:ring-1 focus-within:ring-cyan-400 focus-within:outline-none",
                                        form.getValues("sameAsPermanent") ? "pointer-events-none opacity-70" : ""
                                    )}
                                >
                                    <span
                                        className="flex-1 whitespace-normal break-words"
                                        style={{ color: !field.value ? "#989898" : undefined }}
                                    >
                                        {field.value
                                            ? options.find((o) => o.id.toString() === field.value)?.label
                                            : placeholder}
                                    </span>

                                    <div className="flex items-center space-x-1 ml-2">
                                        {field.value && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    field.onChange("");
                                                    dependencies.forEach((dep) => form.setValue(dep, ""));
                                                }}
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                        <ChevronDown
                                            className={cn(
                                                "h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform",
                                                open ? "rotate-180" : "rotate-0"
                                            )}
                                        />
                                    </div>
                                </div>
                            </FormControl>
                        </PopoverTrigger>

                        <PopoverContent
                            className="w-full sm:w-[356px] p-0 max-h-64 overflow-y-auto scrollbar"
                            align="start"
                        >
                            <Command className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                <CommandInput
                                    placeholder="Search..."
                                    className="h-10 text-sm bg-transparent placeholder-gray-400 dark:placeholder-gray-500"
                                />
                                <CommandEmpty className="px-3 py-2 text-gray-500 dark:text-gray-400">
                                    No option found.
                                </CommandEmpty>
                                <CommandGroup>
                                    {options.map((o) => (
                                        <CommandItem
                                            key={o.id}
                                            value={o.label}
                                            onSelect={() => {
                                                field.onChange(o.id.toString());
                                                if (labelField) form.setValue(labelField, o.label);
                                                dependencies.forEach((dep) => form.setValue(dep, ""));
                                                setOpen(false);
                                            }}
                                            className={cn(
                                                "py-2 text-sm cursor-pointer",
                                                "hover:bg-gray-100 dark:hover:bg-gray-700",
                                                field.value === o.id.toString()
                                                    ? "bg-gray-100 dark:bg-gray-700"
                                                    : ""
                                            )}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    field.value === o.id.toString()
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {o.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </FormItem>
            )}
        />
    );
}
