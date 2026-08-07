"use client";

import React from "react";

export interface BarChartItem {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartItem[];
}

export function BarChart({ data }: BarChartProps) {
  const svgWidth = 500;
  const svgHeight = 300;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 50;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map((d) => d.value), 0);
  const limit = maxVal > 0 ? maxVal : 5;

  const ticks = [0, Math.ceil(limit / 4), Math.ceil((limit * 2) / 4), Math.ceil((limit * 3) / 4), limit];
  const uniqueTicks = Array.from(new Set(ticks)).sort((a, b) => a - b);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[600px]">
        <style>{`
          @keyframes growUp {
            from { transform: scaleY(0); }
            to { transform: scaleY(1); }
          }
        `}</style>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto drop-shadow-sm">
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <filter id="barShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#10b981" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Grid Lines */}
          {uniqueTicks.map((tick) => {
            const y = paddingTop + chartHeight - (tick / limit) * chartHeight;
            return (
              <g key={tick} className="opacity-80">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={tick === 0 ? "0" : "4 4"}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] font-bold fill-slate-400"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((item, i) => {
            const count = data.length;
            const barSpacing = 24;
            const barWidth = (chartWidth - barSpacing * (count - 1)) / count;
            const x = paddingLeft + i * (barWidth + barSpacing);
            const val = item.value;
            const barHeight = limit > 0 ? (val / limit) * chartHeight : 0;
            const y = paddingTop + chartHeight - barHeight;

            return (
              <g key={item.label} className="group">
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight > 0 ? barHeight : 2}
                  rx={6}
                  fill={val > 0 ? "url(#barGradient)" : "#cbd5e1"}
                  filter={val > 0 ? "url(#barShadow)" : ""}
                  className="transition-all duration-500 ease-out origin-bottom hover:fill-[#059669] hover:opacity-90"
                  style={{
                    transformOrigin: `${x + barWidth / 2}px ${paddingTop + chartHeight}px`,
                    animation: "growUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                  }}
                />

                {val > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 8}
                    textAnchor="middle"
                    className="text-[10px] font-extrabold fill-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:opacity-100"
                  >
                    {val}
                  </text>
                )}

                <text
                  x={x + barWidth / 2}
                  y={paddingTop + chartHeight + 20}
                  textAnchor="middle"
                  className="text-[9px] sm:text-[10px] font-bold fill-slate-500 select-none"
                >
                  {item.label.length > 10 ? item.label.slice(0, 8) + "..." : item.label}
                </text>
                {item.label.length > 12 && (
                  <title>{item.label}</title>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export interface DonutChartItem {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartItem[];
  totalValue: number;
}

export function DonutChart({ data, totalValue }: DonutChartProps) {
  const r = 70;
  const cx = 110;
  const cy = 110;
  const C = 2 * Math.PI * r;

  let cumulativePercent = 0;

  return (
    <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-12 py-2">
      {/* SVG Donut */}
      <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px]">
        <svg viewBox="0 0 220 220" className="w-full h-full transform -rotate-90">
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="20"
          />

          {data.map((item) => {
            const percent = totalValue > 0 ? item.value / totalValue : 0;
            const strokeDasharray = `${percent * C} ${C}`;
            const strokeDashoffset = -cumulativePercent * C;
            cumulativePercent += percent;

            return (
              <circle
                key={item.label}
                cx={cx}
                cy={cy}
                r={r}
                fill="transparent"
                stroke={item.color}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap={percent > 0.03 ? "round" : "butt"}
                className="transition-all duration-500 hover:stroke-width-[24] cursor-pointer"
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                }}
              >
                <title>{`${item.label}: ${item.value} Tamu (${Math.round(percent * 100)}%)`}</title>
              </circle>
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl sm:text-3xl font-black text-slate-800">{totalValue}</span>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tamu</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 w-full max-w-md space-y-3.5">
        {data.map((item) => {
          const percent = totalValue > 0 ? item.value / totalValue : 0;
          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full shadow-inner" style={{ backgroundColor: item.color }} />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 font-bold text-xs sm:text-sm">
                <span className="text-slate-400 text-[10px] sm:text-xs font-semibold">({Math.round(percent * 100)}%)</span>
                <span className="text-slate-800">{item.value} Tamu</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
