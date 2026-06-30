import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { getAQILevel } from '../data/mockData';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const aqi = payload[0]?.value;
  const level = getAQILevel(aqi);
  return (
    <div
      className="rounded-2xl px-4 py-3"
      style={{
        background: 'rgba(6,9,18,0.95)',
        border: `1px solid ${level.border}`,
        backdropFilter: 'blur(16px)',
      }}
    >
      <p className="text-white/50 text-xs mb-1">{label}</p>
      <p className="text-2xl font-black" style={{ color: level.color }}>{aqi}</p>
      <p className="text-xs font-semibold mt-0.5" style={{ color: level.color }}>{level.label}</p>
    </div>
  );
};

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  
  if (payload.isLive) {
    return (
      <circle cx={cx} cy={cy} r={5} fill="#3b82f6" stroke="#fff" strokeWidth={2} />
    );
  }
  return (
    <circle cx={cx} cy={cy} r={4} fill="#a78bfa" strokeWidth={0} />
  );
};

// ─── Props: forecast[{label, aqi}], city ─────────────────────
export default function ForecastChart({ forecast = [], city }) {
if (!forecast.length) {
  return (
    <div className="text-white p-6">
      No forecast data available
    </div>
  );
}

const avgAqi = Math.round(
  forecast.reduce((s, d) => s + d.aqi, 0) / forecast.length
);

const peakAqi = Math.max(...forecast.map(d => d.aqi));
const minAqi = Math.min(...forecast.map(d => d.aqi));
const avgLevel = getAQILevel(avgAqi);

  return (
    <section className="px-6 pb-10">
      <div className="max-w-4xl mx-auto">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-5"
        >
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <span className="text-xs font-semibold tracking-widest text-white/30 uppercase">7-Day Forecast — {city}</span>
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl overflow-hidden p-6 md:p-8"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Chart */}
          <div style={{ height: 260, width: '100%', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#a78bfa" stopOpacity={0.35} />
                    <stop offset="60%"  stopColor="#db2777" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#db2777" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#3b82f6" />
                    <stop offset="25%"  stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#fb923c" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(167,139,250,0.2)', strokeWidth: 1 }} />
                <ReferenceLine y={200} stroke="rgba(239,68,68,0.3)" strokeDasharray="4 4" />
                <ReferenceLine y={100} stroke="rgba(245,158,11,0.25)" strokeDasharray="4 4" />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  stroke="url(#lineGradient)"
                  strokeWidth={2.5}
                  fill="url(#areaGradient)"
                  dot={<CustomDot />}
                  activeDot={{ r: 7, fill: '#f472b6', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-3 gap-4 mt-6 pt-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            {[
              { label: '7-Day Average', value: avgAqi, color: avgLevel.color },
              { label: 'Peak AQI',       value: peakAqi, color: getAQILevel(peakAqi).color },
              { label: 'Best AQI',       value: minAqi,  color: getAQILevel(minAqi).color },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-white/35 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
