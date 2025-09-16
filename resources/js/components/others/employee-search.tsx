import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { router } from "@inertiajs/react"

export function EmployeeSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const WebUrl = "";

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length > 0) {
        setLoading(true)
        fetch(`/api/employees/search?key=${encodeURIComponent(query)}`)
          .then((res) => res.json())
          .then((data) => setResults(data))
          .finally(() => setLoading(false))
      } else {
        setResults([])
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(delayDebounce)
  }, [query])

  // Click outside to clear
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setQuery("")
        setResults([])
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (id: number) => {
    router.visit(`${WebUrl}/user/${id}`)
  }

  const handleClear = () => {
    setQuery("")
    setResults([])
  }

  return (
    <div className="relative w-full sm:w-104" ref={wrapperRef}>
      {/* Input with search icon and clear button */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-300" />
        <Input
          type="text"
          placeholder="Search employee..."
          className="pl-9 pr-9 bg-white dark:bg-[#0A0A0A]
                     text-xs sm:text-sm 
                     text-gray-900 dark:text-gray-200 
                     placeholder-gray-400 dark:placeholder-gray-400 
                     border border-gray-300 dark:border-gray-600"


          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {(loading || results.length > 0 || (query && !loading)) && (
        <div className="absolute mt-1 w-full max-h-64 overflow-auto rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 shadow-lg z-50 text-xs sm:text-sm scrollbar">
          {loading && (
            <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
              Searching...
            </div>
          )}

          {!loading && results.length === 0 && query.trim().length > 0 && (
            <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
              No employee found
            </div>
          )}

          {!loading &&
            results.map((user) => (
              <div
                key={user.Employee_ID}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer truncate text-gray-900 dark:text-gray-200"
                onClick={() => handleSelect(user.Employee_ID)}
              >
                <span className="font-medium">{user.FullName}</span>{" "}
                <span className="truncate">({user.EmployeeNo})</span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
