import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { getAQILevel } from '../data/mockData';

function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const aqi = point?.aqi;
  if (aqi == null) return null;

  const level = getAQILevel(aqi, isDark);
  const hasRange =
    !point?.isLive &&
    typeof point?.aqiLow === 'number' &&
    typeof point?.aqiHigh === 'number' &&
    point.aqiHigh > point.aqiLow;

  return (
    <div className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 shadow-sm">
      <div className="flex items-center gap-2 font-mono-tabular text-[11px] text-[var(--text-muted)]">
        <span>{label}</span>
        <span aria-hidden="true">·</span>
        <span>{point?.isLive ? 'Recorded baseline' : 'Forecast'}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-2.5">
        <span
          className="font-mono-tabular text-2xl font-semibold leading-none"
          style={{ color: level.color }}
        >
          {aqi}
        </span>
        <span className="text-xs font-semibold" style={{ color: level.color }}>
          {level.label}
        </span>
      </div>
      {hasRange && (
        <div className="mt-1.5 border-t border-[var(--border-hairline)] pt-1.5 font-mono-tabular text-[11px] text-[var(--text-secondary)]">
          Expected range: {point.aqiLow}–{point.aqiHigh} AQI
        </div>
      )}
    </div>
  );
}

function CustomDot({ cx, cy, payload, isDark }) {
  if (cx == null || cy == null) return null;
  const accent = isDark ? '#2DD4BF' : '#0D6E6E';
  const surface = isDark ? '#11191B' : '#FFFFFF';
  const baselineInk = isDark ? '#EDF3F2' : '#101716';

  if (payload?.isLive) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={baselineInk}
        stroke={surface}
        strokeWidth={2}
      />
    );
  }
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3.5}
      fill={accent}
      stroke={surface}
      strokeWidth={1.5}
    />
  );
}

export default function ForecastChart({ forecast = [], city, isDark }) {
  if (!forecast.length) return null;

  const chartData = forecast.map((pt, idx) => {
    const aqiVal = Number(pt.aqi) || 0;
    const hasServerBounds =
      typeof pt.aqiLow === 'number' && typeof pt.aqiHigh === 'number';

    let low = aqiVal;
    let high = aqiVal;
    if (hasServerBounds) {
      low = pt.aqiLow;
      high = pt.aqiHigh;
    } else if (!pt.isLive) {
      const margin = Math.round(
        Math.max(9, Math.min(48, 10 + Math.max(1, idx) * 3.6 + aqiVal * 0.04))
      );
      low = Math.max(5, aqiVal - margin);
      high = Math.min(500, aqiVal + margin);
    }

    return {
      ...pt,
      aqiLow: low,
      aqiHigh: high,
      confidenceRange: [low, high],
    };
  });

  const predictedDays = chartData.filter((d) => !d.isLive);
  const statsData = predictedDays.length ? predictedDays : chartData;

  const avgAqi = Math.round(
    statsData.reduce((sum, d) => sum + d.aqi, 0) / statsData.length
  );
  const peakAqi = Math.max(...statsData.map((d) => d.aqi));
  const minAqi = Math.min(...statsData.map((d) => d.aqi));

  const avgLevel = getAQILevel(avgAqi, isDark);
  const peakLevel = getAQILevel(peakAqi, isDark);
  const minLevel = getAQILevel(minAqi, isDark);

  const lineStroke = isDark ? '#2DD4BF' : '#0D6E6E';
  const bandFill = isDark ? 'rgba(45, 212, 191, 0.16)' : 'rgba(13, 110, 110, 0.12)';
  const bandStroke = isDark ? 'rgba(45, 212, 191, 0.34)' : 'rgba(13, 110, 110, 0.25)';
  const gridStroke = isDark ? '#223135' : '#E5EAE8';
  const tickFill = isDark ? '#8CA0A0' : '#647471';
  const cursorStroke = isDark ? '#32474C' : '#C5CFCC';
  const moderateStroke = isDark ? 'rgba(251, 191, 36, 0.35)' : 'rgba(180, 83, 9, 0.32)';
  const poorStroke = isDark ? 'rgba(248, 113, 113, 0.35)' : 'rgba(185, 28, 28, 0.32)';

  const yValues = chartData.flatMap((d) => [d.aqiLow, d.aqiHigh, d.aqi]);
  const domainMin = Math.max(0, Math.floor((Math.min(...yValues) - 18) / 10) * 10);
  const domainMax = Math.min(500, Math.ceil((Math.max(...yValues) + 18) / 10) * 10);

  const summaryItems = [
    { label: '7-Day Average',   value: avgAqi,  level: avgLevel },
    { label: 'Peak Forecast',   value: peakAqi, level: peakLevel },
    { label: 'Lowest Forecast', value: minAqi,  level: minLevel },
  ];

  return (
    <section id="forecast-trajectory" className="mx-auto max-w-[1160px] px-5 pt-6 sm:px-8">
      <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 sm:p-8">
        {/* Header row */}
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
              7-Day AQI Trajectory — {city}
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Autoregressive forecast curve with horizon-scaled confidence corridor (±MAE band)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-tabular text-xs text-[var(--text-muted)]">
            <span>Shaded band: Forecast range</span>
            <span aria-hidden="true">·</span>
            <span>Moderate 100</span>
            <span aria-hidden="true">·</span>
            <span>Poor 200</span>
          </div>
        </div>

        {/* Chart Stage */}
        <div className="h-[290px] w-full min-w-0 sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <ComposedChart
              data={chartData}
              margin={{ top: 12, right: 16, left: -12, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{
                  fill: tickFill,
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
                axisLine={{ stroke: gridStroke }}
                tickLine={false}
                dy={8}
              />
              <YAxis
                tick={{
                  fill: tickFill,
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
                axisLine={false}
                tickLine={false}
                domain={[domainMin, domainMax]}
              />
              <Tooltip
                content={<CustomTooltip isDark={isDark} />}
                cursor={{ stroke: cursorStroke, strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <ReferenceLine
                y={100}
                stroke={moderateStroke}
                strokeDasharray="4 4"
                label={{
                  value: 'Moderate (100)',
                  position: 'insideTopRight',
                  fill: tickFill,
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              />
              <ReferenceLine
                y={200}
                stroke={poorStroke}
                strokeDasharray="4 4"
                label={{
                  value: 'Poor (200)',
                  position: 'insideTopRight',
                  fill: tickFill,
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              />

              {/* Confidence Range Corridor [aqiLow, aqiHigh] */}
              <Area
                type="monotone"
                dataKey="confidenceRange"
                fill={bandFill}
                stroke={bandStroke}
                strokeWidth={1}
                strokeDasharray="3 3"
                isAnimationActive={false}
              />

              {/* Central Forecast Line */}
              <Line
                type="monotone"
                dataKey="aqi"
                stroke={lineStroke}
                strokeWidth={2.5}
                dot={(dotProps) => (
                  <CustomDot key={dotProps.index} {...dotProps} isDark={isDark} />
                )}
                activeDot={{
                  r: 6,
                  fill: lineStroke,
                  stroke: isDark ? '#11191B' : '#FFFFFF',
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 3-Column Tabular Summary Strip */}
        <div className="mt-6 grid grid-cols-1 divide-y divide-[var(--border-hairline)] border-t border-[var(--border-hairline)] pt-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {summaryItems.map((item, idx) => (
            <div
              key={item.label}
              className={`py-3 sm:py-0 ${
                idx === 0 ? 'sm:pr-6' : idx === 1 ? 'sm:px-6' : 'sm:pl-6'
              }`}
            >
              <p className="text-xs font-medium text-[var(--text-muted)]">{item.label}</p>
              <div className="mt-1.5 flex items-baseline gap-2.5">
                <span
                  className="font-mono-tabular text-2xl font-semibold"
                  style={{ color: item.level.color }}
                >
                  {item.value}
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: item.level.color }}
                >
                  {item.level.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
