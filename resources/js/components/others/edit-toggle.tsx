'use client';

import { Eye, FilePen } from 'lucide-react';

type ModeToggleProps = {
    isEdit: boolean; // controlled
    onChange?: (mode: 'edit' | 'view') => void;
};

export default function ModeToggle({ isEdit, onChange }: ModeToggleProps) {

    const toggleMode = () => {
        if (onChange) onChange(isEdit ? 'view' : 'edit');
    };

    return (
        <div className="flex items-center space-x-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm 
                        dark:border-gray-700 dark:bg-gray-900">
            {/* Eye Icon for VIEW */}
            <Eye
                className={`h-4 w-4 transition-colors duration-200 ${!isEdit
                    ? 'text-rose-500 dark:text-rose-400 drop-shadow-[0_0_4px_rgba(244,63,94,0.8)]'
                    : 'text-gray-400 dark:text-gray-500'
                    }`}
            />

            {/* Toggle Button */}
            <button
                onClick={toggleMode}
                className={`cursor-pointer relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 
                            focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-gray-800
                            ${isEdit
                        ? 'bg-cyan-500 focus:ring-cyan-400 dark:bg-cyan-600'
                        : 'bg-rose-500 focus:ring-rose-400 dark:bg-rose-600'
                    }`}
                role="switch"
                aria-checked={isEdit}
                aria-label="Toggle edit mode"
            >
                <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white dark:bg-gray-200 shadow-sm 
                                transition-transform duration-200 ${isEdit ? 'translate-x-5' : 'translate-x-1'
                        }`}
                />
            </button>

            {/* FilePen Icon for EDIT */}
            <FilePen
                className={`h-4 w-4 transition-colors duration-200 ${isEdit
                    ? 'text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.8)]'
                    : 'text-gray-400 dark:text-gray-500'
                    }`}
            />
        </div>
    );
}
