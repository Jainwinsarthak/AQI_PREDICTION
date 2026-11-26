import { getAQILevel } from '../data/mockData';

export default function HealthImpact({ cigarettes, lungStress, riskScore, aqi, city, isDark }) {
  const level = getAQILevel(aqi, isDark);
  const clampedStress = Math.max(0, Math.min(100, Number(lungStress) || 0));

  return (
    <section id="health-impact" className="mx-auto max-w-[1160px] px-5 pt-10 sm:px-8">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
            Health Exposure Briefing
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Estimated daily respiratory burden for {city} at projected AQI {aqi} ({level.label}).
          </p>
        </div>
        <span className="font-mono-tabular text-xs text-[var(--text-muted)]">
          24-hour ambient exposure model
        </span>
      </div>

      <div className="grid grid-cols-1 divide-y divide-[var(--border-hairline)] rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] md:grid-cols-3 md:divide-x md:divide-y-0">
        {/* Metric 1: Cigarette Equivalent */}
        <div className="p-6 sm:p-7">
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            Cigarette Equivalence
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono-tabular text-4xl font-semibold text-[var(--text-primary)]">
              {cigarettes}
            </span>
            <span className="font-mono-tabular text-xs text-[var(--text-muted)]">
              cigarettes / day
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
            Estimated PM2.5 inhalation equivalence over 24 hours of ambient outdoor air exposure
            (1 cigarette ≈ 22 AQI equivalent).
          </p>
        </div>

        {/* Metric 2: Lung Stress Index */}
        <div className="p-6 sm:p-7">
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            Lung Stress Index
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className="font-mono-tabular text-4xl font-semibold"
              style={{ color: level.color }}
            >
              {clampedStress}%
            </span>
            <span className="font-mono-tabular text-xs text-[var(--text-muted)]">
              of critical load
            </span>
          </div>

          {/* Calibrated horizontal meter */}
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-muted)]">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${clampedStress}%`,
                backgroundColor: level.color,
              }}
            />
          </div>

          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            Proportional particulate burden placed on respiratory tissue relative to the CPCB
            500-index ceiling.
          </p>
        </div>

        {/* Metric 3: Composite Risk Score & Guidance */}
        <div className="p-6 sm:p-7">
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            Composite Risk Score
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className="font-mono-tabular text-4xl font-semibold"
              style={{ color: level.color }}
            >
              {riskScore}
            </span>
            <span className="font-mono-tabular text-xs text-[var(--text-muted)]">
              / 10 · {level.label}
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
            {level.guidance}
          </p>
        </div>
      </div>
    </section>
  );
}
