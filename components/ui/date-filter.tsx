"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { CalendarDays, X } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface DateFilterProps {
  startDate: Date | undefined
  endDate: Date | undefined
  onStartDateChange: (date: Date | undefined) => void
  onEndDateChange: (date: Date | undefined) => void
  onClearFilters: () => void
  className?: string
}

export function DateFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
  className = ""
}: DateFilterProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Start Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 bg-transparent"
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            {startDate ? format(startDate, 'dd/MM/yyyy', { locale: fr }) : "Date de début"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={startDate}
            onSelect={onStartDateChange}
            disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      {/* End Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 bg-transparent"
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            {endDate ? format(endDate, 'dd/MM/yyyy', { locale: fr }) : "Date de fin"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={endDate}
            onSelect={onEndDateChange}
            disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters Button */}
      {(startDate || endDate) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
