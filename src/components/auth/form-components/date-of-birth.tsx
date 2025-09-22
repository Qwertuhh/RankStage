"use client";

import React from "react";
import { UseFormReturn} from "react-hook-form";
import { z } from "zod";
import { formSchema } from "@/types/auth/signup-form-schema";
import { CalendarIcon } from "lucide-react";
import {
  FormField,
  FormItem,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function DateOfBirthComponent({
  form,
}: {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}) {
  const selected = form.watch("dateOfBirth");

  return (
    <FormField
      control={form.control}
      name="dateOfBirth"
      render={({ field }) => (
        <FormItem>
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium">Date of Birth</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[260px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selected ? selected.toLocaleDateString() : "Select your date of birth"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selected ?? undefined}
                  onSelect={(d) => {
                    // react-hook-form expects a Date
                    if (d) field.onChange(d);
                  }}
                  // prevent selecting future dates
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormDescription className="text-xs text-muted-foreground">
              Use your real date of birth. You can’t select a future date.
            </FormDescription>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
