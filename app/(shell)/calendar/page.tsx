"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

/**
 * Calendar/Planner Page
 * Demonstrates Calendar component integration for scheduling and date picking
 */

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>()
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar & Planner</h1>
        <p className="text-muted-foreground">
          Schedule meetings, set deadlines, and manage your time
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Single Date Picker */}
        <Card>
          <CardHeader>
            <CardTitle>Date Picker</CardTitle>
            <CardDescription>Select a single date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            {selectedDate && (
              <div className="text-sm">
                <span className="font-medium">Selected: </span>
                {format(selectedDate, "PPP")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Date Range Picker */}
        <Card>
          <CardHeader>
            <CardTitle>Date Range Picker</CardTitle>
            <CardDescription>Select a date range</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => setDateRange(range)}
              className="rounded-md border"
              numberOfMonths={1}
            />
            {dateRange?.from && (
              <div className="text-sm">
                <span className="font-medium">From: </span>
                {format(dateRange.from, "PPP")}
                {dateRange.to && (
                  <>
                    <br />
                    <span className="font-medium">To: </span>
                    {format(dateRange.to, "PPP")}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Date Picker in Popover */}
        <Card>
          <CardHeader>
            <CardTitle>Inline Date Picker</CardTitle>
            <CardDescription>Date picker in a popover</CardDescription>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        {/* Multiple Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Multiple Selection</CardTitle>
            <CardDescription>Select multiple dates</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="multiple"
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Examples</CardTitle>
          <CardDescription>Common use cases for Calendar component</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <strong>✅ Project Deadlines:</strong> Use single date picker for task due dates
          </div>
          <div>
            <strong>✅ Meeting Scheduler:</strong> Use date range picker for availability
          </div>
          <div>
            <strong>✅ Leave Management:</strong> Use multiple dates for vacation days
          </div>
          <div>
            <strong>✅ Event Planning:</strong> Use date range for conference periods
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
