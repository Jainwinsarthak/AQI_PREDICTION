import { useMemo, useRef, useState } from 'react';
import { ChevronDown, ArrowRight, Loader2, Search, X } from 'lucide-react';
import { INDIA_DATA, FEATURED_CITIES, ALL_CITIES_INDEX } from '../data/mockData';

const states = Object.keys(INDIA_DATA);

export default function PredictionEngine({
  selectedState,
  selectedCity,
  selectedDate,
  onStateChange,
  onCityChange,
  onDateChange,
  onQuickPick,
  onPredict,
  isLoading,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchInputRef = useRef(null);

  const cities = selectedState ? INDIA_DATA[selectedState] || [] : [];
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const canPredict = Boolean(selectedState && selectedCity && selectedDate && !isLoading);

  const filteredMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const startsWith = [];
    const contains = [];
    for (const item of ALL_CITIES_INDEX) {
      if (item.city.toLowerCase().startsWith(q)) {
        startsWith.push(item);
      } else if (item.searchKey.includes(q)) {
        contains.push(item);
      }
      if (startsWith.length + contains.length >= 16) break;
    }
    return [...startsWith, ...contains].slice(0, 8);
  }, [searchQuery]);

  const selectSearchMatch = (match) => {
    setSearchQuery('');
    setSearchOpen(false);
    setActiveIndex(0);
    onQuickPick(match.state, match.city);
  };

  const handleSearchKeyDown = (e) => {
    if (!searchOpen || filteredMatches.length === 0) {
      if (e.key === 'Escape') {
        setSearchQuery('');
        setSearchOpen(false);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredMatches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredMatches.length) % filteredMatches.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = filteredMatches[activeIndex] || filteredMatches[0];
      if (chosen) selectSearchMatch(chosen);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSearchOpen(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canPredict) {
      onPredict(selectedState, selectedCity, selectedDate);
    }
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6">
      <div>
        <div className="flex items-baseline justify-between gap-2 border-b border-[var(--border-hairline)] pb-4">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
            Forecast Parameters
          </h2>
          <span className="font-mono-tabular text-xs text-[var(--text-muted)]">
            293 stations
          </span>
        </div>

        {/* Instant Searchable City Finder */}
        <div className="relative mt-5">
          <label
            htmlFor="airsight-city-search"
            className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]"
          >
            Find any Indian city
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              id="airsight-city-search"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
                setActiveIndex(0);
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search city or state (e.g. Surat, Patna)…"
              autoComplete="off"
              className="h-10 w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] pl-9 pr-8 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors duration-150 hover:border-[var(--border-strong)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-subtle)]"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear city search"
                onClick={() => {
                  setSearchQuery('');
                  setSearchOpen(false);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {searchOpen && searchQuery.trim().length > 0 && (
            <div
              role="listbox"
              aria-label="Matching Indian cities"
              className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] py-1 shadow-lg"
            >
              {filteredMatches.length > 0 ? (
                filteredMatches.map((match, idx) => {
                  const isHighlighted = idx === activeIndex;
                  return (
                    <button
                      key={`${match.state}-${match.city}`}
                      type="button"
                      role="option"
                      aria-selected={isHighlighted}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectSearchMatch(match);
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex w-full cursor-pointer items-baseline justify-between gap-2 px-3.5 py-2 text-left text-sm transition-colors ${
                        isHighlighted
                          ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)]'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-muted)]'
                      }`}
                    >
                      <span className="font-medium truncate">{match.city}</span>
                      <span className="text-xs text-[var(--text-muted)] shrink-0">
                        {match.state}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="px-3.5 py-2.5 text-xs text-[var(--text-muted)]">
                  No matching CPCB station found for &ldquo;{searchQuery}&rdquo;.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quick-pick featured city buttons */}
        <div className="mt-5">
          <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">
            Quick-pick cities
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {FEATURED_CITIES.map((preset) => {
              const isActive =
                selectedCity === preset.city && selectedState === preset.state;
              return (
                <button
                  key={preset.city}
                  type="button"
                  disabled={isLoading}
                  onClick={() => onQuickPick(preset.state, preset.city)}
                  className={`h-9 cursor-pointer rounded-lg border px-2.5 text-xs font-semibold transition-all duration-150 whitespace-nowrap truncate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] ${
                    isActive
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)] text-[var(--accent-primary)]'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {preset.city}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Controls */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          {/* State */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="airsight-state"
              className="text-xs font-semibold text-[var(--text-secondary)]"
            >
              State or Union Territory
            </label>
            <div className="relative">
              <select
                id="airsight-state"
                value={selectedState}
                onChange={(e) => onStateChange(e.target.value)}
                className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] pl-3.5 pr-9 text-sm font-medium text-[var(--text-primary)] transition-colors duration-150 hover:border-[var(--border-strong)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-subtle)]"
              >
                <option value="" disabled>
                  Select State
                </option>
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* City */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="airsight-city"
              className="text-xs font-semibold text-[var(--text-secondary)]"
            >
              Monitoring City
            </label>
            <div className="relative">
              <select
                id="airsight-city"
                value={selectedCity}
                onChange={(e) => onCityChange(e.target.value)}
                disabled={!selectedState}
                className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] pl-3.5 pr-9 text-sm font-medium text-[var(--text-primary)] transition-colors duration-150 hover:border-[var(--border-strong)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-subtle)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  {selectedState ? 'Select City' : 'Select State first'}
                </option>
                {cities.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="airsight-date"
              className="text-xs font-semibold text-[var(--text-secondary)]"
            >
              Target Forecast Date
            </label>
            <input
              id="airsight-date"
              type="date"
              value={selectedDate}
              min={today}
              max={maxDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="font-mono-tabular h-10 w-full cursor-pointer rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 text-sm font-medium text-[var(--text-primary)] transition-colors duration-150 hover:border-[var(--border-strong)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-subtle)]"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canPredict}
            className="mt-2 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary)] px-4 text-sm font-semibold text-white dark:text-[#06201e] transition-all duration-150 hover:-translate-y-[1px] hover:bg-[var(--accent-primary-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Calculating Forecast…</span>
              </>
            ) : (
              <>
                <span>Predict AQI</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-4 border-t border-[var(--border-hairline)] pt-3.5 text-xs leading-relaxed text-[var(--text-muted)]">
        Forecasts compute day-by-day from the latest CPCB station record up to 30 days ahead.
      </p>
    </div>
  );
}
