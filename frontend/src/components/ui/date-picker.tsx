"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  id?: string;
  label?: string;
  value?: Date | string;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

export function DatePicker({
  id,
  label,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  error,
  required = false,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (!value) return undefined;
    if (typeof value === "string") {
      return value ? new Date(value) : undefined;
    }
    return value;
  });

  React.useEffect(() => {
    if (!value) {
      setDate(undefined);
      return;
    }
    if (typeof value === "string") {
      setDate(value ? new Date(value) : undefined);
    } else {
      setDate(value);
    }
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onChange?.(selectedDate);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant={"outline"}
            disabled={disabled}
            className={cn(
              "w-full pl-3 text-left font-normal",
              !date && "text-muted-foreground",
              error && "border-red-500 focus-visible:ring-red-500"
            )}
          >
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={date =>
              date > new Date() || date < new Date("1900-01-01")
            }
            captionLayout="dropdown"
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
