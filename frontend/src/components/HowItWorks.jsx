import { footerStats } from '../data/mockData';

const steps = [
  {
    number: '01.',
    title: 'Select Monitoring Station',
    desc: 'Choose from 293 CPCB-monitored cities across 32 Indian states and union territories to anchor the forecast to the latest recorded station reading.',
  },
  {
    number: '02.',
    title: 'Choose Forecast Horizon',
    desc: 'Pick any date up to 30 days ahead. Seasonal harmonics, winter inversion windows, monsoon washout, and crop-burning periods are encoded automatically.',
  },
  {
    number: '03.',
    title: 'Autoregressive XGBoost Inference',
    desc: 'Starting from the most recent daily bulletin, the model rolls forward day-by-day using 1-day, 3-day, and 7-day AQI lags plus a 7-day rolling mean.',
  },
  {
    number: '04.',
    title: 'Trajectory & Exposure Briefing',
    desc: 'Each query produces a 7-day projected AQI curve alongside cigarette equivalence, lung stress index, and actionable respiratory guidance.',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="methodology"
      className="mx-auto max-w-[1160px] px-5 pt-16 pb-16 sm:px-8 sm:pt-20 sm:pb-20"
    >
      {/* Editorial Section Header */}
      <div className="max-w-2xl">
        <p className="text-xs font-semibold text-[var(--accent-primary)]">
          Methodology &amp; Calibration
        </p>
        <h2 className="mt-2 font-display text-balance text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
          How the forecasting pipeline works
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-secondary)]">
          Predictions are computed on demand from daily Central Pollution Control Board bulletins
          and multi-year historical series—never written back into the training set.
        </p>
      </div>

      {/* 2x2 Hairline-Divided Editorial Steps */}
      <div className="mt-10 grid grid-cols-1 border-t border-[var(--border-hairline)] md:grid-cols-2">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className={`border-b border-[var(--border-hairline)] py-7 ${
              index % 2 === 0 ? 'md:pr-10' : 'md:border-l md:pl-10'
            }`}
          >
            <div className="flex items-baseline gap-3">
              <span className="font-mono-tabular text-sm font-semibold text-[var(--accent-primary)]">
                {step.number}
              </span>
              <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                {step.title}
              </h3>
            </div>
            <p className="mt-2.5 pl-8 text-sm leading-relaxed text-[var(--text-secondary)]">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Adjacent Model Calibration & Dataset Ledger (Claim-to-Proof Adjacency) */}
      <div className="mt-12 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border-hairline)] pb-4">
          <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
            Model Calibration &amp; Dataset Ledger
          </h3>
          <span className="font-mono-tabular text-xs text-[var(--text-muted)]">
            Source: CPCB India Daily AQI Bulletins
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {footerStats.map((stat) => (
            <div key={stat.label}>
              <div className="font-mono-tabular text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
                {stat.value}
              </div>
              <div className="mt-1 text-xs font-semibold text-[var(--text-secondary)]">
                {stat.label}
              </div>
              {stat.note && (
                <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                  {stat.note}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
