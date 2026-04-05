"use client"

import { useState } from "react"

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

function LineChart({ data, color }: { data: DayPoint[]; color: string }) {
  if (data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data available</div>
  }

  const W = 800
  const H = 200
  const PL = 44, PR = 16, PT = 12, PB = 32
  const cW = W - PL - PR
  const cH = H - PT - PB

  const maxVal = Math.max(...data.map(d => d.value), 1)
  const yTicks = 4
  const xPos = (i: number) => PL + (i / (data.length - 1 || 1)) * cW
  const yPos = (v: number) => PT + cH - (v / maxVal) * cH
  const points = data.map((d, i) => `${xPos(i)},${yPos(d.value)}`).join(" ")

  // Show ~7 labels
  const step = Math.max(1, Math.floor(data.length / 7))

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ minWidth: 300 }}>
        {/* Y grid + labels */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const v = Math.round((maxVal * i) / yTicks)
          const y = yPos(v)
          return (
            <g key={i}>
              <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#e2e8f0" strokeWidth={1} />
              <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#94a3b8">{v}</text>
            </g>
          )
        })}

        {/* Area fill */}
        <polygon
          points={`${xPos(0)},${PT + cH} ${points} ${xPos(data.length - 1)},${PT + cH}`}
          fill={color}
          fillOpacity={0.08}
        />

        {/* Line */}
        <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />

        {/* X-axis labels */}
        {data.map((d, i) => i % step === 0 && (
          <text key={i} x={xPos(i)} y={H - 6} textAnchor="middle" fontSize={8} fill="#94a3b8">
            {new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
          </text>
        ))}
      </svg>
    </div>
  )
}

export default function HymnDashboard({
  totalUploaded, totalAccepted, totalClicks, totalUsers,
  uploadedData, acceptedData, declinedData, totalClicksData, dailyClicksData,
}: Props) {
  const [hymnsType, setHymnsType] = useState("uploaded_hymns")
  const [clicksType, setClicksType] = useState("total_clicks")

  const hymnsMap: Record<string, { data: DayPoint[]; color: string }> = {
    uploaded_hymns: { data: uploadedData, color: "#1e90ff" },
    accepted_hymns: { data: acceptedData, color: "#22c55e" },
    declined_hymns: { data: declinedData, color: "#ef4444" },
  }
  const clicksMap: Record<string, { data: DayPoint[]; color: string }> = {
    total_clicks:  { data: totalClicksData, color: "#ff9800" },
    daily_clicks:  { data: dailyClicksData,  color: "#a855f7" },
  }

  const activeHymns = hymnsMap[hymnsType] ?? hymnsMap.uploaded_hymns
  const activeClicks = clicksMap[clicksType] ?? clicksMap.total_clicks

  const stats = [
    { label: "Total uploaded hymns", value: totalUploaded, accent: "border-l-red-500" },
    { label: "Total accepted hymns", value: totalAccepted, accent: "border-l-green-500" },
    { label: "Total clicks",         value: totalClicks,   accent: "border-l-amber-500" },
    { label: "Total users",          value: totalUsers,    accent: "border-l-blue-500" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`bg-white rounded-lg border border-slate-200 border-l-4 ${s.accent} px-5 py-4`}>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{s.value.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Trendline of hymns */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Trendline of hymns</h2>
          <select
            value={hymnsType}
            onChange={e => setHymnsType(e.target.value)}
            className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-600 bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            <option value="">Select category</option>
            <option value="uploaded_hymns">Uploaded hymns</option>
            <option value="accepted_hymns">Accepted hymns</option>
            <option value="declined_hymns">Declined hymns</option>
          </select>
        </div>
        <div className="px-4 py-4">
          <LineChart data={activeHymns.data} color={activeHymns.color} />
        </div>
      </div>

      {/* Trendline of clicks */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Trendline of clicks</h2>
          <select
            value={clicksType}
            onChange={e => setClicksType(e.target.value)}
            className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-600 bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            <option value="">Select category</option>
            <option value="total_clicks">Total clicks</option>
            <option value="daily_clicks">Daily clicks</option>
          </select>
        </div>
        <div className="px-4 py-4">
          <LineChart data={activeClicks.data} color={activeClicks.color} />
        </div>
      </div>
    </div>
  )
}
