import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle, RotateCcw } from 'lucide-react';
import { AQI_BANDS, getAQILevel, getPollutantDetails } from '../data/mockData';

function AnimatedNumber({ target }) {
  const [display, setDisplay] = useState(Number(target) || 0);
  const rafRef = useRef(null);
  const fromRef = useRef(Number(target) || 0);

  useEffect(() => {
    const nextVal = Number(target);
    const targetVal = Number.isNaN(nextVal) ? 0 : nextVal;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setDisplay(targetVal);
      fromRef.current = targetVal;
      return;
    }

    const startVal = fromRef.current;
    const duration = 520;
    let startTime = null;

    const tick = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(startVal + (targetVal - startVal) * eased);
      setDisplay(value);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = targetVal;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return <span className="tabular-nums">{display}</span>;
}

function SpectrumScale({ latestAqi, predictedAqi, isDark }) {
  const clampPct = (val) => Math.max(1, Math.min(99, (Number(val || 0) / 500) * 100));
  const predPct = clampPct(predictedAqi);
  const livePct = clampPct(latestAqi);

  return (
    <div className="mt-6 border-t border-[var(--border-hairline)] pt-5">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
        <span className="font-medium text-[var(--text-secondary)]">
          CPCB Air Quality Index Scale (0–500)
        </span>
        <span className="font-mono-tabular">
          Baseline {latestAqi} → Forecast {predictedAqi}
        </span>
      </div>

      {/* 5-segment proportional CPCB bar */}
      <div className="relative pt-3 pb-1">
        <div className="grid h-2.5 w-full grid-cols-[10%_10%_20%_20%_40%] gap-0.5 overflow-hidden rounded-full">
          {AQI_BANDS.map((band) => (
            <div
              key={band.label}
              title={`${band.label} (${band.range})`}
              style={{
                backgroundColor: isDark ? band.colorDark : band.colorLight,
                opacity: isDark ? 0.72 : 0.82,
              }}
            />
          ))}
        </div>

        {/* Baseline marker */}
        <div
          aria-hidden="true"
          title={`Latest Recorded: ${latestAqi}`}
          style={{ left: `${livePct}%` }}
          className="absolute top-2 h-4 w-[2px] -translate-x-1/2 rounded-full bg-[var(--text-muted)] transition-all duration-300"
        />

        {/* Predicted marker */}
        <div
          aria-hidden="true"
          title={`Predicted AQI: ${predictedAqi}`}
          style={{ left: `${predPct}%` }}
          className="absolute top-1.5 h-5 w-1 -translate-x-1/2 rounded-full bg-[var(--text-primary)] ring-2 ring-[var(--bg-surface)] transition-all duration-300"
        />
      </div>

      {/* Scale band labels */}
      <div className="mt-2 grid grid-cols-5 text-[11px] text-[var(--text-muted)]">
        <span>Good</span>
        <span>Moderate</span>
        <span className="text-center">Poor</span>
        <span className="text-center">Very Poor</span>
        <span className="text-right">Hazardous</span>
      </div>
    </div>
  );
}

function formatReadableDate(isoDate) {
  if (!isoDate) return '';
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function PredictionResult({ prediction, isLoading, isDark, onRetry }) {
  const showError = !isLoading && Boolean(prediction?.error);
  const showResult = !isLoading && Boolean(prediction) && !prediction.error;

  if (isLoading) {
    return (
      <div
        id="prediction-result"
        className="flex h-full min-h-[420px] flex-col justify-between rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 sm:p-8"
      >
        <div className="space-y-4">
          <div className="h-4 w-56 animate-pulse rounded bg-[var(--bg-muted)]" />
          <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="h-3.5 w-28 animate-pulse rounded bg-[var(--bg-muted)]" />
              <div className="h-14 w-32 animate-pulse rounded bg-[var(--bg-muted)]" />
              <div className="h-4 w-24 animate-pulse rounded bg-[var(--bg-muted)]" />
            </div>
            <div className="space-y-3">
              <div className="h-3.5 w-32 animate-pulse rounded bg-[var(--bg-muted)]" />
              <div className="h-16 w-36 animate-pulse rounded bg-[var(--bg-muted)]" />
              <div className="h-4 w-28 animate-pulse rounded bg-[var(--bg-muted)]" />
            </div>
          </div>
          <div className="mt-6 h-16 w-full animate-pulse rounded-lg bg-[var(--bg-muted)]" />
        </div>

        <div className="border-t border-[var(--border-hairline)] pt-4">
          <p className="font-mono-tabular text-xs text-[var(--text-muted)]">
            Running autoregressive XGBoost forecast across recent CPCB lags…
          </p>
        </div>
      </div>
    );
  }

  if (showError) {
    return (
      <div
        id="prediction-result"
        role="alert"
        className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-8 text-center"
      >
        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
        <h3 className="mt-4 font-display text-xl font-semibold text-[var(--text-primary)]">
          Forecast unavailable
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
          {prediction.error}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-4 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Retry Forecast</span>
          </button>
        )}
      </div>
    );
  }

  if (!showResult) {
    return (
      <div
        id="prediction-result"
        className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-8 text-center"
      >
        <h3 className="font-display text-xl font-semibold text-[var(--text-primary)]">
          Select a city and forecast date
        </h3>
        <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
          Search any of the 293 monitored Indian cities or click a quick-pick city on the left to
          view its latest recorded baseline and projected AQI.
        </p>
      </div>
    );
  }

  const latestVal = prediction.latestAqi ?? prediction.liveAqi ?? 0;
  const predictedVal = prediction.aqi ?? 0;
  const delta = prediction.aqiChange ?? Math.round(predictedVal - latestVal);

  const liveLevel = getAQILevel(latestVal, isDark);
  const predLevel = getAQILevel(predictedVal, isDark);
  const pollutant = getPollutantDetails(prediction.prominentPollutant);
  const secondaryPollutants = Array.isArray(prediction.pollutants)
    ? prediction.pollutants.slice(1)
    : [];

  const formattedTargetDate = formatReadableDate(prediction.date);
  const formattedBulletinDate = formatReadableDate(prediction.latestDate);

  const deltaDirection =
    delta > 0 ? 'Expected deterioration' : delta < 0 ? 'Expected improvement' : 'Stable trend';
  const deltaColor =
    delta > 0
      ? isDark
        ? '#F87171'
        : '#B91C1C'
      : delta < 0
      ? isDark
        ? '#34D399'
        : '#059669'
      : 'var(--text-secondary)';

  return (
    <div
      id="prediction-result"
      className="flex h-full flex-col justify-between rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 sm:p-8"
    >
      <div>
        {/* Unboxed editorial metadata header */}
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border-hairline)] pb-4">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
              {prediction.city}
            </h2>
            <span className="text-sm text-[var(--text-muted)]">{prediction.state}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono-tabular text-xs text-[var(--text-muted)]">
            <span>Target {formattedTargetDate}</span>
            {formattedBulletinDate && (
              <>
                <span aria-hidden="true">·</span>
                <span>Bulletin {formattedBulletinDate}</span>
              </>
            )}
          </div>
        </div>

        {/* Main comparison row: Predicted AQI focal anchor + Latest Recorded baseline */}
        <div className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-[1.25fr_1fr] sm:items-end">
          {/* Primary Focal Anchor: Predicted AQI */}
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              Predicted AQI · {formattedTargetDate}
            </p>
            <div className="mt-2 flex items-baseline gap-4">
              <div
                className="font-display text-6xl sm:text-7xl font-semibold leading-none tracking-tight"
                style={{ color: predLevel.color }}
              >
                <AnimatedNumber target={predictedVal} />
              </div>
              <div className="flex flex-col">
                <span
                  className="text-sm font-bold tracking-tight"
                  style={{ color: predLevel.color }}
                >
                  {predLevel.label}
                </span>
                <span className="font-mono-tabular text-xs text-[var(--text-muted)]">
                  Band {predLevel.range}
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
              {predLevel.text}
            </p>
          </div>

          {/* Secondary Comparative Readout: Latest Recorded + Delta */}
          <div className="border-t border-[var(--border-hairline)] pt-5 sm:border-t-0 sm:border-l sm:pl-7 sm:pt-0">
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              Latest Recorded Baseline
            </p>
            <div className="mt-2 flex items-baseline gap-3">
              <span
                className="font-mono-tabular text-3xl font-semibold leading-none"
                style={{ color: liveLevel.color }}
              >
                <AnimatedNumber target={latestVal} />
              </span>
              <span className="text-xs font-semibold" style={{ color: liveLevel.color }}>
                {liveLevel.label}
              </span>
            </div>

            {/* Net change with explicit directional icon & text label */}
            <div className="mt-4 border-t border-[var(--border-hairline)] pt-4">
              <div
                className="inline-flex items-center gap-1.5 font-mono-tabular text-sm font-semibold"
                style={{ color: deltaColor }}
              >
                {delta > 0 ? (
                  <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : delta < 0 ? (
                  <ArrowDownRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <Minus className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                <span>{delta > 0 ? `+${delta}` : delta} AQI</span>
              </div>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{deltaDirection}</p>
            </div>
          </div>
        </div>

        {/* Dominant CPCB Pollutant Driver Breakdown */}
        <div className="mt-6 border-t border-[var(--border-hairline)] pt-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-6">
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)]">
                Dominant Pollutant
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono-tabular text-xl font-semibold text-[var(--accent-primary)]">
                  {pollutant.display}
                </span>
                {secondaryPollutants.length > 0 && (
                  <span className="font-mono-tabular text-xs text-[var(--text-muted)]">
                    + {secondaryPollutants.join(', ')}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{pollutant.scale}</p>
            </div>

            <div className="sm:border-l sm:border-[var(--border-hairline)] sm:pl-6">
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                {pollutant.name}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                <span className="font-medium text-[var(--text-primary)]">Primary drivers:</span>{' '}
                {pollutant.source}{' '}
                <span className="text-[var(--text-muted)]">{pollutant.note}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calibrated 0-500 CPCB Spectrum Scale */}
      <SpectrumScale latestAqi={latestVal} predictedAqi={predictedVal} isDark={isDark} />
    </div>
  );
}
