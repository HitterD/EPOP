'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'

interface TaskCompletionChartProps {
  data?: Array<{ date: string; created: number; completed: number }>
}

function generateMockData(days: number = 30) {
  return Array.from({ length: days }, (_, i) => ({
    date: format(subDays(new Date(), days - i - 1), 'MMM dd'),
    created: Math.floor(Math.random() * 25) + 40,
    completed: Math.floor(Math.random() * 30) + 35,
    backlog: Math.floor(Math.random() * 20) + 50,
  }))
}

export function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  const chartData = useMemo(() => generateMockData(), [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
        <Area 
          type="monotone" 
          dataKey="backlog" 
          stackId="1"
          stroke="hsl(var(--muted-foreground))" 
          fill="hsl(var(--muted))" 
          name="Backlog"
        />
        <Area 
          type="monotone" 
          dataKey="created" 
          stackId="1"
          stroke="hsl(var(--primary))" 
          fill="hsl(var(--primary))" 
          fillOpacity={0.6}
          name="Created"
        />
        <Area 
          type="monotone" 
          dataKey="completed" 
          stackId="1"
          stroke="hsl(var(--chart-3))" 
          fill="hsl(var(--chart-3))" 
          fillOpacity={0.6}
          name="Completed"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
