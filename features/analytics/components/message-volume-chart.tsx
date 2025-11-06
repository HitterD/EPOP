'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'

interface MessageVolumeChartProps {
  data?: Array<{ date: string; sent: number; received: number }>
}

function generateMockData(days: number = 14) {
  return Array.from({ length: days }, (_, i) => ({
    date: format(subDays(new Date(), days - i - 1), 'MMM dd'),
    sent: Math.floor(Math.random() * 300) + 500,
    received: Math.floor(Math.random() * 400) + 600,
  }))
}

export function MessageVolumeChart({ data }: MessageVolumeChartProps) {
  const chartData = useMemo(() => generateMockData(), [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
        <Bar 
          dataKey="sent" 
          fill="hsl(var(--primary))" 
          name="Sent" 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="received" 
          fill="hsl(var(--chart-2))" 
          name="Received" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
