"use client"

interface DataPoint {
  month: string
  uploaded: number
  accepted: number
}

interface Props {
  data: DataPoint[]
}

export default function HymnTrendChart({ data }: Props) {
  if (data.length === 0) return null

  const WIDTH = 600
  const HEIGHT = 180
  const PAD_L = 36
  const PAD_R = 16
  const PAD_T = 12
  const PAD_B = 28
  const chartW = WIDTH - PAD_L - PAD_R
  const chartH = HEIGHT - PAD_T - PAD_B

  const maxVal = Math.max(...data.flatMap(d => [d.uploaded, d.accepted]), 1)
  const yTicks = 4

  const xPos = (i: number) => PAD_L + (i / (data.length - 1 || 1)) * chartW
  const yPos = (v: number) => PAD_T + chartH - (v / maxVal) * chartH

  const polyline = (key: "uploaded" | "accepted") =>
    data.map((d, i) => `${xPos(i)},${yPos(d[key])}`).join(" ")

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        style={{ minWidth: 320 }}
      >
        {/* Y-axis grid lines + labels */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const v = Math.round((maxVal * i) / yTicks)
          const y = yPos(v)
          return (
            <g key={i}>
              <line x1={PAD_L} y1={y} x2={WIDTH - PAD_R} y2={y} stroke="#e2e8f0" strokeWidth={1} />
              <text x={PAD_L - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#94a3b8">{v}</text>
            </g>
          )
        })}

        {/* Uploaded line (blue) */}
        <polyline
          points={polyline("uploaded")}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Accepted line (green) */}
        <polyline
          points={polyline("accepted")}
          fill="none"
          stroke="#22c55e"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Dots + x-labels */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xPos(i)} cy={yPos(d.uploaded)} r={3} fill="#3b82f6" />
            <circle cx={xPos(i)} cy={yPos(d.accepted)} r={3} fill="#22c55e" />
            {/* x-axis label — show every other if many points */}
            {(data.length <= 7 || i % 2 === 0) && (
              <text
                x={xPos(i)}
                y={HEIGHT - 4}
                textAnchor="middle"
                fontSize={9}
                fill="#94a3b8"
              >
                {d.month}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-blue-500 inline-block rounded" />
          Uploaded
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-green-500 inline-block rounded" />
          Accepted
        </span>
      </div>
    </div>
  )
}
