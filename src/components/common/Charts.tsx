import React, { useState } from 'react';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export const DonutChart: React.FC<{
  slices: DonutSlice[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSublabel?: string;
}> = ({ slices, size = 152, strokeWidth = 26, centerLabel, centerSublabel }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label="Grafik proporsi audiens"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#FCECEF"
          strokeWidth={strokeWidth}
        />
        {total > 0 &&
          slices.map((slice, idx) => {
            if (slice.value <= 0) return null;
            const fraction = slice.value / total;
            const dashLength = fraction * circumference;
            const dashOffset = -cumulativePercent * circumference;
            cumulativePercent += fraction;
            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={slice.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${dashLength} ${circumference}`}
                strokeDashoffset={dashOffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
        {hoveredIdx !== null && slices[hoveredIdx] ? (
          <>
            <span className="text-base font-bold text-[#341C24] tabular-nums leading-tight">
              {total > 0 ? Math.round((slices[hoveredIdx].value / total) * 100) : 0}%
            </span>
            <span className="text-[11px] font-medium text-[#6D4E58] truncate max-w-[80px]">
              {slices[hoveredIdx].label}
            </span>
          </>
        ) : (
          <>
            {centerLabel && (
              <span className="text-lg font-bold text-[#341C24] tabular-nums leading-tight">
                {centerLabel}
              </span>
            )}
            {centerSublabel && (
              <span className="text-[11px] font-medium text-[#6D4E58] leading-tight mt-0.5">
                {centerSublabel}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export interface BarDatum {
  label: string;
  primary: number;
  secondary?: number;
}

export const PlatformBarChart: React.FC<{
  data: BarDatum[];
  primaryLabel: string;
  secondaryLabel?: string;
}> = ({ data, primaryLabel, secondaryLabel }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const maxVal = Math.max(
    1,
    ...data.map((d) => Math.max(d.primary, d.secondary || 0))
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-end gap-4 mb-3 text-xs text-[#6D4E58]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#AE5D72]" />
          {primaryLabel}
        </span>
        {secondaryLabel && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#F2B5C4]" />
            {secondaryLabel}
          </span>
        )}
      </div>
      <div className="relative h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-[#F1DCE1]">
        {/* Horizontal guide lines */}
        <div className="absolute inset-x-0 top-6 bottom-2 flex flex-col justify-between pointer-events-none">
          {[100, 75, 50, 25, 0].map((pct) => (
            <div
              key={pct}
              className="w-full border-t border-dashed border-[#F5E3E7] relative"
            >
              <span className="absolute -top-2.5 left-0 text-[10px] text-[#9A7B86] tabular-nums bg-white pr-1">
                {Math.round((maxVal * pct) / 100).toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>

        {data.map((item, idx) => {
          const pHeight = Math.max(4, Math.round((item.primary / maxVal) * 100));
          const sHeight = item.secondary
            ? Math.max(4, Math.round((item.secondary / maxVal) * 100))
            : 0;
          const isHovered = hoverIdx === idx;

          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
              className="relative z-10 flex-1 h-full flex flex-col justify-end items-center group"
            >
              {isHovered && (
                <div className="absolute -top-2 z-20 bg-[#341C24] text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-md whitespace-nowrap pointer-events-none tabular-nums">
                  <p className="font-semibold">{item.label}</p>
                  <p>
                    {primaryLabel}: {item.primary.toLocaleString('id-ID')}
                  </p>
                  {secondaryLabel && item.secondary !== undefined && (
                    <p>
                      {secondaryLabel}: {item.secondary.toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
              )}
              <div className="w-full max-w-[52px] h-full flex items-end justify-center gap-1.5 pl-4 sm:pl-0">
                <div
                  style={{ height: `${pHeight}%` }}
                  className={`flex-1 rounded-t-md transition-all duration-200 ${
                    isHovered ? 'bg-[#8F4458]' : 'bg-[#AE5D72]'
                  }`}
                />
                {secondaryLabel && item.secondary !== undefined && (
                  <div
                    style={{ height: `${sHeight}%` }}
                    className={`flex-1 rounded-t-md transition-all duration-200 ${
                      isHovered ? 'bg-[#E597AA]' : 'bg-[#F2B5C4]'
                    }`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-2 sm:gap-4 pt-2">
        {data.map((item) => (
          <div
            key={item.label}
            className="flex-1 text-center text-[11px] sm:text-xs font-medium text-[#6D4E58] truncate"
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export interface TrendPoint {
  label: string;
  reach: number;
  registrations: number;
}

export const TrendLineChart: React.FC<{ data: TrendPoint[] }> = ({ data }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const width = 540;
  const height = 210;
  const padX = 38;
  const padTop = 20;
  const padBottom = 30;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;

  const maxReach = Math.max(1, ...data.map((d) => d.reach));
  const maxReg = Math.max(1, ...data.map((d) => d.registrations));

  const getX = (idx: number) =>
    data.length <= 1 ? padX + chartW / 2 : padX + (idx / (data.length - 1)) * chartW;
  const getYReach = (val: number) => padTop + chartH - (val / maxReach) * chartH;
  const getYReg = (val: number) => padTop + chartH - (val / maxReg) * chartH;

  const reachPoints = data.map((d, i) => `${getX(i)},${getYReach(d.reach)}`).join(' ');
  const regPoints = data
    .map((d, i) => `${getX(i)},${getYReg(d.registrations)}`)
    .join(' ');

  const areaPath =
    data.length > 0
      ? `M ${getX(0)},${padTop + chartH} L ${data
          .map((d, i) => `${getX(i)},${getYReach(d.reach)}`)
          .join(' L ')} L ${getX(data.length - 1)},${padTop + chartH} Z`
      : '';

  return (
    <div className="w-full">
      <div className="flex items-center justify-end gap-4 mb-2 text-xs text-[#6D4E58]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#AE5D72] rounded" />
          Reach
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#1F7A53] rounded" />
          Registrasi
        </span>
      </div>
      <div className="relative w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="reachAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#AE5D72" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#AE5D72" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((t) => {
            const y = padTop + chartH - t * chartH;
            return (
              <line
                key={t}
                x1={padX}
                y1={y}
                x2={width - padX}
                y2={y}
                stroke="#F3DFE4"
                strokeDasharray="4 4"
              />
            );
          })}

          {areaPath && <path d={areaPath} fill="url(#reachAreaGrad)" />}

          {data.length > 1 && (
            <>
              <polyline
                fill="none"
                stroke="#AE5D72"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={reachPoints}
              />
              <polyline
                fill="none"
                stroke="#1F7A53"
                strokeWidth="2.5"
                strokeDasharray="5 4"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={regPoints}
              />
            </>
          )}

          {data.map((d, i) => {
            const cx = getX(i);
            const cyReach = getYReach(d.reach);
            const cyReg = getYReg(d.registrations);
            const isActive = hoverIdx === i;

            return (
              <g
                key={d.label}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                className="cursor-pointer"
              >
                <rect
                  x={cx - 28}
                  y={padTop}
                  width={56}
                  height={chartH + padBottom}
                  fill="transparent"
                />
                {isActive && (
                  <line
                    x1={cx}
                    y1={padTop}
                    x2={cx}
                    y2={padTop + chartH}
                    stroke="#E7C6CE"
                    strokeWidth="1.5"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cyReach}
                  r={isActive ? 6 : 4.5}
                  fill="#AE5D72"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <circle
                  cx={cx}
                  cy={cyReg}
                  r={isActive ? 5.5 : 4}
                  fill="#1F7A53"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text
                  x={cx}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-[#6D4E58] text-[11px] font-medium"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>

        {hoverIdx !== null && data[hoverIdx] && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#FDF2F4] border border-[#F0D5DC] text-xs text-[#341C24] tabular-nums">
            <span className="font-semibold">{data[hoverIdx].label}</span>
            <div className="flex items-center gap-4">
              <span>
                Reach: <strong>{data[hoverIdx].reach.toLocaleString('id-ID')}</strong>
              </span>
              <span>
                Registrasi:{' '}
                <strong className="text-[#1F7A53]">
                  {data[hoverIdx].registrations.toLocaleString('id-ID')}
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
