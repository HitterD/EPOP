'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'

interface ActivityTrendChartProps {
  data?: Array<{ date: string; value: number }>
  drillDownMetric?: string | null
}

// Mock data generator
function generateMockData(days: number = 30) {
  return Array.from({ length: days }, (_, i) => ({
    date: format(subDays(new Date(), days - i - 1), 'MMM dd'),
    activeUsers: Math.floor(Math.random() * 50) + 100,
    messages: Math.floor(Math.random() * 500) + 1500,
    tasks: Math.floor(Math.random() * 30) + 60,
  }))
}

export function ActivityTrendChart({ data, drillDownMetric }: ActivityTrendChartProps) {
  const chartData = useMemo(() => generateMockData(), [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="date" 
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Legend />
        {(!drillDownMetric || drillDownMetric === 'active-users') && (
          <Line 
            type="monotone" 
            dataKey="activeUsers" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            name="Active Users"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        )}
        {(!drillDownMetric || drillDownMetric === 'messages-per-day') && (
          <Line 
            type="monotone" 
            dataKey="messages" 
            stroke="hsl(var(--chart-2))" 
            strokeWidth={2}
            name="Messages"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        )}
        {(!drillDownMetric || drillDownMetric === 'task-throughput') && (
          <Line 
            type="monotone" 
            dataKey="tasks" 
            stroke="hsl(var(--chart-3))" 
            strokeWidth={2}
            name="Tasks"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
