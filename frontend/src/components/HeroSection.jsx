import { Sun, Moon } from 'lucide-react';

export default function HeroSection({ isDark, onToggleTheme }) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border-hairline)]">
      {/* Delicate architectural contour lines layered softly over the 3D cloud & smoke atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      >
        <svg
          viewBox="0 0 1440 420"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full opacity-[0.26] dark:opacity-[0.16]"
        >
          <g stroke="var(--border-strong)" strokeWidth="1">
            <ellipse cx="1160" cy="140" rx="520" ry="210" />
            <ellipse cx="1160" cy="140" rx="400" ry="155" />
            <ellipse cx="1160" cy="140" rx="280" ry="105" />
          </g>
          <path
            d="M0 320 C 310 265, 580 355, 920 280 C 1150 230, 1300 250, 1440 215"
            stroke="var(--accent-primary)"
            strokeOpacity="0.22"
            strokeWidth="1.25"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-[1160px] px-5 pt-8 pb-10 sm:px-8 sm:pt-10 sm:pb-12">
        {/* Top editorial utility row: unboxed dateline + daylight/observatory theme toggle */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--accent-primary)]">
              Atmospheric Intelligence
            </span>
            <span aria-hidden="true">·</span>
            <span>293 Indian Cities</span>
            <span aria-hidden="true">·</span>
            <span>CPCB Daily Bulletins</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">XGBoost Time-Series</span>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to daylight mode' : 'Switch to dark observatory mode'}
            title={isDark ? 'Switch to Daylight Mode' : 'Switch to Dark Mode'}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition-colors duration-150 hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] whitespace-nowrap shrink-0"
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                <span>Daylight</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
                <span>Observatory Dark</span>
              </>
            )}
          </button>
        </div>

        {/* Masthead headline & concise lead */}
        <div className="max-w-3xl">
          <h1 className="font-display text-balance text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-[3.25rem] leading-[1.08]">
            Forecast India&apos;s air quality, up to 30 days ahead.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] sm:text-base leading-relaxed text-[var(--text-secondary)]">
            Search any monitored city across 32 Indian states and union territories to run an
            autoregressive AQI forecast, inspect pollutant drivers and 7-day confidence corridors,
            and get tailored outdoor activity guidance.
          </p>
        </div>
      </div>
    </section>
  );
}
