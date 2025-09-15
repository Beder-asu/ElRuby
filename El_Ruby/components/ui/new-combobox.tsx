"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ComboboxProps {
    options: { value: string; label: string }[]
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    className?: string
}

export function Combobox({
    options,
    value,
    onValueChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    emptyText = "No option found.",
    className,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Debug logging
    console.log('[DEBUG] Combobox - options length:', options.length)
    console.log('[DEBUG] Combobox - first few options:', options.slice(0, 3))

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery) return options
        return options.filter((option) =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [options, searchQuery])

    // Handle click outside to close dropdown
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [open])

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                onClick={() => setOpen(!open)}
            >
                {value ? options.find((option) => option.value === value)?.label : placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {open && (
                <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-input bg-popover shadow-md">
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                            className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                        {filteredOptions.length === 0 && (
                            <div className="py-6 text-center text-sm">{emptyText}</div>
                        )}
                        {filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                className={cn(
                                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                                    value === option.value ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                                )}
                                onClick={() => {
                                    onValueChange?.(option.value === value ? "" : option.value)
                                    setSearchQuery("")
                                    setOpen(false)
                                }}
                            >
                                <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                                {option.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
