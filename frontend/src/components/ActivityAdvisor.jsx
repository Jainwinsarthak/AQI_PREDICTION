import { useState } from 'react';
import { Footprints, TrainFront, ShieldCheck, Wind } from 'lucide-react';
import {
  SENSITIVITY_PROFILES,
  getOutdoorGuidance,
  getPollutantDetails,
} from '../data/mockData';

const DOMAIN_ICONS = [Footprints, TrainFront, ShieldCheck, Wind];

export default function ActivityAdvisor({ aqi, prominentPollutant, city, isDark }) {
  const [profileId, setProfileId] = useState('general');
  const pollutant = getPollutantDetails(prominentPollutant);
  const guidanceCards = getOutdoorGuidance(aqi, pollutant.code, profileId, isDark);

  return (
    <section id="activity-advisor" className="mx-auto max-w-[1160px] px-5 pt-10 sm:px-8">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold text-[var(--accent-primary)]">
            Daily Decision Briefing
          </p>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
            Outdoor Activity Advisor
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Actionable protocols for {city} calibrated to projected AQI {aqi} and dominant driver{' '}
            <span className="font-mono-tabular font-semibold text-[var(--text-primary)]">
              {pollutant.display}
            </span>
            .
          </p>
        </div>

        {/* Interactive Sensitivity Profile Segmented Control */}
        <div
          role="group"
          aria-label="Select personal sensitivity profile"
          className="inline-flex self-start rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-1 md:self-auto"
        >
          {SENSITIVITY_PROFILES.map((profile) => {
            const active = profile.id === profileId;
            return (
              <button
                key={profile.id}
                type="button"
                aria-pressed={active}
                onClick={() => setProfileId(profile.id)}
                className={`h-8 cursor-pointer rounded-lg px-3 text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] ${
                  active
                    ? 'bg-[var(--accent-primary)] text-white dark:text-[#06201e]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {profile.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Domain Hairline Action Matrix */}
      <div className="grid grid-cols-1 divide-y divide-[var(--border-hairline)] rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
        {guidanceCards.map((item, idx) => {
          const Icon = DOMAIN_ICONS[idx] || Wind;
          const borderClasses = [
            'sm:border-b sm:border-r lg:border-b-0',
            'sm:border-b lg:border-b-0 lg:border-r',
            'sm:border-r',
            '',
          ][idx];

          return (
            <div
              key={item.domain}
              className={`flex flex-col justify-between p-6 border-[var(--border-hairline)] ${borderClasses}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
                    <Icon className="h-4 w-4 text-[var(--text-secondary)]" aria-hidden="true" />
                    <span>{item.domain}</span>
                  </span>

                  <span
                    className="font-mono-tabular text-xs font-semibold"
                    style={{ color: item.color }}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-[var(--text-primary)]">
                  {item.headline}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {item.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
