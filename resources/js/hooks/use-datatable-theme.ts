import { useEffect, useState } from 'react';

export function useDataTableTheme() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check initial theme
        setIsDark(document.documentElement.classList.contains('dark'));

        // Listen for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    setIsDark(document.documentElement.classList.contains('dark'));
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);
    const borderColor = isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(209, 213, 219, 0.5)';
    return {
        customStyles: {
            pagination: {
                style: {
                    justifyContent: 'right',
                    padding: '0.5rem 1rem',
                    display: 'flex',
                    width: '100%',
                    backgroundColor: 'transparent',
                    border: `1px solid ${borderColor}`,
                    borderTopColor: 'transparent',
                    color: isDark ? '#e5e7eb' : '#000000',
                },
            },
            tableWrapper: {
                style: {
                    overflowX: 'auto',
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${borderColor}`,
                },
            },
            table: {
                style: {
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    color: isDark ? '#e5e7eb' : '#374151',
                },
            },
            headRow: {
                style: {
                    backgroundColor: isDark ? '#374151' : '#f9fafb',
                    borderBottomColor: isDark ? '#4b5563' : '#e5e7eb',
                },
            },
            headCells: {
                style: {
                    color: isDark ? '#f3f4f6' : '#374151',
                    fontWeight: '600',
                    fontSize: '0.75rem',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                },
            },
            rows: {
                style: {
                    backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
                    borderBottomColor: isDark ? '#374151' : '#f3f4f6',
                    '&:hover': {
                        backgroundColor: isDark ? '#374151' : '#f9fafb',
                    },
                    cursor: 'pointer',
                },
            },
            cells: {
                style: {
                    color: isDark ? '#e5e7eb' : '#374151',
                    fontSize: '0.75rem',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                },
            },
        },
    };
}
