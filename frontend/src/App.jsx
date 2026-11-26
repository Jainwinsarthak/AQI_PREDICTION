import './index.css';
import { useState, useEffect, useCallback, useRef } from 'react';

import AtmosphericBackdrop from './components/AtmosphericBackdrop';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PredictionEngine from './components/PredictionEngine';
import PredictionResult from './components/PredictionResult';
import ForecastChart from './components/ForecastChart';
import ActivityAdvisor from './components/ActivityAdvisor';
import HealthImpact from './components/HealthImpact';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';

function getDefaultFutureDate(offsetDays = 3) {
  const dt = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return dt.toISOString().split('T')[0];
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  try {
    return localStorage.getItem('airsight-theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDark = theme === 'dark';

  // Controlled forecast query state — preloaded with featured city (Delhi, +3 days)
  const [selectedState, setSelectedState] = useState('Delhi');
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [selectedDate, setSelectedDate] = useState(() => getDefaultFutureDate(3));

  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const abortRef = useRef(null);

  // Sync .dark class on <html> and persist user choice
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('airsight-theme', theme);
    } catch {
      // ignore storage access issues
    }
  }, [theme, isDark]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handlePredict = useCallback(async (state, city, date, options = {}) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setPrediction(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state, city, date }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${res.status}`);
      }

      const result = await res.json();
      setPrediction(result);

      if (options.scrollToResult) {
        setTimeout(() => {
          document.getElementById('prediction-result')?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }, 80);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Prediction fetch error:', err);
      setPrediction({ error: err.message || 'Unable to fetch AQI prediction.' });
    } finally {
      if (abortRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, []);

  // Automatically load initial featured city forecast on first mount
  useEffect(() => {
    handlePredict('Delhi', 'Delhi', selectedDate);
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStateChange = (nextState) => {
    setSelectedState(nextState);
    setSelectedCity('');
  };

  const handleQuickPick = (state, city) => {
    const activeDate = selectedDate || getDefaultFutureDate(3);
    setSelectedState(state);
    setSelectedCity(city);
    setSelectedDate(activeDate);
    handlePredict(state, city, activeDate);
  };

  const handleRetry = () => {
    if (selectedState && selectedCity && selectedDate) {
      handlePredict(selectedState, selectedCity, selectedDate);
    }
  };

  const hasValidPrediction = Boolean(prediction && !prediction.error);
  const activeAqi = hasValidPrediction ? prediction.aqi : 140;

  return (
    <div id="top" className="relative min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Interactive cursor-reactive Three.js cloud, smoke & particulate backdrop */}
      <AtmosphericBackdrop isDark={isDark} aqi={activeAqi} />

      <div className="relative z-10">
        <Navbar />

        <main>
          <HeroSection isDark={isDark} onToggleTheme={toggleTheme} />

          {/* Asymmetric 2-Column Observatory Workspace */}
          <section
            id="forecast-workspace"
            aria-label="AQI Forecast Workspace"
            className="mx-auto max-w-[1160px] px-5 pt-8 sm:px-8 sm:pt-10"
          >
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[370px_1fr]">
              <PredictionEngine
                selectedState={selectedState}
                selectedCity={selectedCity}
                selectedDate={selectedDate}
                onStateChange={handleStateChange}
                onCityChange={setSelectedCity}
                onDateChange={setSelectedDate}
                onQuickPick={handleQuickPick}
                onPredict={(st, ct, dt) => handlePredict(st, ct, dt, { scrollToResult: true })}
                isLoading={isLoading}
              />

              <PredictionResult
                prediction={prediction}
                isLoading={isLoading}
                isDark={isDark}
                onRetry={handleRetry}
              />
            </div>
          </section>

          {/* 7-Day Confidence Trajectory, Outdoor Activity Advisor & Health Exposure */}
          {hasValidPrediction && (
            <>
              <ForecastChart
                forecast={prediction.forecast}
                city={prediction.city}
                isDark={isDark}
              />
              <ActivityAdvisor
                aqi={prediction.aqi}
                prominentPollutant={prediction.prominentPollutant}
                city={prediction.city}
                isDark={isDark}
              />
              <HealthImpact
                cigarettes={prediction.cigarettes}
                lungStress={prediction.lungStress}
                riskScore={prediction.riskScore}
                aqi={prediction.aqi}
                city={prediction.city}
                isDark={isDark}
              />
            </>
          )}

          <HowItWorks />
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
