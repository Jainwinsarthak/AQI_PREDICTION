import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      id="about"
      className="border-t border-[var(--border-hairline)] bg-[var(--bg-surface)]"
    >
      <div className="mx-auto max-w-[1160px] px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-base font-semibold text-[var(--text-primary)]">
              AirSight India
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Environmental intelligence platform built by Sarthak Jain · Public domain AQI data
              sourced from CPCB India.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[var(--text-secondary)]">
            <a
              href="https://jainsarthak.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-[var(--accent-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] rounded-xs"
            >
              <span>Sarthak Jain Portfolio</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <a
              href="https://github.com/Jainwinsarthak/AQI_PREDICTION"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-[var(--accent-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] rounded-xs"
            >
              <span>GitHub Repository</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <span className="font-mono-tabular text-[var(--text-muted)]">
              © {new Date().getFullYear()} AirSight India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
