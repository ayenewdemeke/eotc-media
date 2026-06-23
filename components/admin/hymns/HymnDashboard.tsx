"use client"

import { useState } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/admin/shared/PageHeader"

interface DayPoint {
  date: string
  value: number
}

interface Props {
  totalUploaded: number
  totalAccepted: number
  totalClicks: number
  totalUsers: number
  uploadedData: DayPoint[]
  acceptedData: DayPoint[]
  declinedData: DayPoint[]
  totalClicksData: DayPoint[]
  dailyClicksData: DayPoint[]
}

function TrendChart({ data, color }: { data: DayPoint[]; color: string }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        No data available
      </div>
    )
  }

  const formatted = data.map(d => ({
    label: new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    value: d.value,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id={`fill-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.18} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          width={36}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 2" }}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          labelStyle={{ color: "#475569", fontWeight: 500, marginBottom: 2 }}
          itemStyle={{ color }}
          formatter={(v: number) => [v.toLocaleString(), "Value"]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#fill-${color.slice(1)})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default function HymnDashboard({
  totalUploaded, totalAccepted, totalClicks, totalUsers,
  uploadedData, acceptedData, declinedData, totalClicksData, dailyClicksData,
}: Props) {
  const [hymnsType, setHymnsType] = useState("uploaded_hymns")
  const [clicksType, setClicksType] = useState("total_clicks")

  const hymnsMap: Record<string, { data: DayPoint[]; color: string }> = {
    uploaded_hymns: { data: uploadedData, color: "#3b82f6" },
    accepted_hymns: { data: acceptedData, color: "#22c55e" },
    declined_hymns: { data: declinedData, color: "#ef4444" },
  }
  const clicksMap: Record<string, { data: DayPoint[]; color: string }> = {
    total_clicks: { data: totalClicksData, color: "#f59e0b" },
    daily_clicks: { data: dailyClicksData,  color: "#a855f7" },
  }

  const activeHymns  = hymnsMap[hymnsType]  ?? hymnsMap.uploaded_hymns
  const activeClicks = clicksMap[clicksType] ?? clicksMap.total_clicks

  const stats = [
    { label: "Total uploaded hymns", value: totalUploaded, accent: "border-l-destructive" },
    { label: "Total accepted hymns", value: totalAccepted, accent: "border-l-success" },
    { label: "Total clicks",         value: totalClicks,   accent: "border-l-warning" },
    { label: "Total users",          value: totalUsers,    accent: "border-l-primary" },
  ]

  const selectClass =
    "rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] cursor-pointer"

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <PageHeader title="Hymn dashboard" description="Overview of hymn submissions and engagement." />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label} className={`border-l-4 ${s.accent}`}>
            <CardContent className="px-5 py-4">
              <p className="text-metric tabular-nums text-foreground">{s.value.toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trendline of hymns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
          <CardTitle className="text-sm">Trendline of hymns</CardTitle>
          <select value={hymnsType} onChange={e => setHymnsType(e.target.value)} className={selectClass}>
            <option value="uploaded_hymns">Uploaded hymns</option>
            <option value="accepted_hymns">Accepted hymns</option>
            <option value="declined_hymns">Declined hymns</option>
          </select>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-3">
          <TrendChart data={activeHymns.data} color={activeHymns.color} />
        </CardContent>
      </Card>

      {/* Trendline of clicks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
          <CardTitle className="text-sm">Trendline of clicks</CardTitle>
          <select value={clicksType} onChange={e => setClicksType(e.target.value)} className={selectClass}>
            <option value="total_clicks">Total clicks</option>
            <option value="daily_clicks">Daily clicks</option>
          </select>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-3">
          <TrendChart data={activeClicks.data} color={activeClicks.color} />
        </CardContent>
      </Card>
    </div>
  )
}
