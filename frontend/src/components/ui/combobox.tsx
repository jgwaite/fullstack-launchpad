import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
  id?: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onSelect: (option: ComboboxOption | null) => void
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  disabled?: boolean
  allowCreateNew?: boolean
  createNewLabel?: (query: string) => string
  customFilter?: (options: ComboboxOption[], search: string) => ComboboxOption[]
  autoFocus?: boolean
}

export function Combobox({
  options,
  value,
  onSelect,
  placeholder = "Select option...",
  searchPlaceholder = "Search options...",
  className,
  disabled,
  allowCreateNew = false,
  createNewLabel = (query) => `Create "${query}"`,
  customFilter,
  autoFocus,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    if (customFilter) {
      return customFilter(options, searchValue)
    }

    if (!searchValue) return options

    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [options, searchValue, customFilter])

  const displayValue = React.useMemo(() => {
    const selected = options.find((option) => option.value === value)
    if (selected) return selected.label
    if (value && typeof value === 'string' && value.trim().length > 0) return value
    return placeholder
  }, [options, value, placeholder])

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === value) {
      onSelect(null)
    } else {
      const selected = filteredOptions.find((option) => option.value === selectedValue)
      if (selected) {
        onSelect(selected)
      } else if (allowCreateNew && searchValue) {
        // Create new option
        onSelect({
          value: searchValue,
          label: searchValue,
        })
      }
    }
    setOpen(false)
    setSearchValue("")
  }

  const shouldShowCreateNew = React.useMemo(() => {
    return (
      allowCreateNew &&
      searchValue.trim() &&
      !filteredOptions.some(
        (option) => option.label.toLowerCase() === searchValue.toLowerCase()
      )
    )
  }, [allowCreateNew, searchValue, filteredOptions])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
          disabled={disabled}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
            autoFocus={autoFocus}
          />
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={handleSelect}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="truncate">{option.label}</span>
              </CommandItem>
            ))}
            {shouldShowCreateNew && (
              <CommandItem
                value={searchValue}
                onSelect={handleSelect}
                className="cursor-pointer border-t"
              >
                <span className="truncate text-muted-foreground">
                  {createNewLabel(searchValue)}
                </span>
              </CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
