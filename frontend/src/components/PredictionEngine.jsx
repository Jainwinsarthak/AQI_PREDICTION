import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles, Loader } from 'lucide-react';
import { INDIA_DATA } from '../data/mockData';

const states = Object.keys(INDIA_DATA);

function SelectField({ label, value, onChange, options, placeholder, disabled }) {
  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      <label className="text-xs font-semibold text-white/40 tracking-widest uppercase">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none rounded-2xl px-4 py-4 text-sm font-medium outline-none transition-all duration-200 cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: value ? '#fff' : 'rgba(255,255,255,0.3)',
            backdropFilter: 'blur(12px)',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(167,139,250,0.5)';
            e.target.style.boxShadow = '0 0 0 3px rgba(109,40,217,0.15)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(255,255,255,0.1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <option value="" disabled style={{ background: '#0f0f1a' }}>{placeholder}</option>
          {options.map(opt => (
            <option key={opt} value={opt} style={{ background: '#0f0f1a', color: '#fff' }}>{opt}</option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        />
      </div>
    </div>
  );
}

function DateField({ value, onChange }) {
  // Min = today, Max = today + 30 days
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      <label className="text-xs font-semibold text-white/40 tracking-widest uppercase">Future Date</label>
      <input
        type="date"
        value={value}
        min={today}
        max={maxDate}
        onChange={e => onChange(e.target.value)}
        className="rounded-2xl px-4 py-4 text-sm font-medium outline-none transition-all duration-200 cursor-pointer w-full"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: value ? '#fff' : 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(12px)',
          colorScheme: 'dark',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'rgba(167,139,250,0.5)';
          e.target.style.boxShadow = '0 0 0 3px rgba(109,40,217,0.15)';
        }}
        onBlur={e => {
          e.target.style.borderColor = 'rgba(255,255,255,0.1)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

// ─── Props: onPredict(state, city, date), isLoading ──────────
export default function PredictionEngine({ onPredict, isLoading }) {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity]   = useState('');
  const [selectedDate, setSelectedDate]   = useState('');

  const cities = selectedState ? INDIA_DATA[selectedState] : [];
  const canPredict = selectedState && selectedCity && selectedDate && !isLoading;

  const handleStateChange = (s) => {
    setSelectedState(s);
    setSelectedCity('');
  };

  const handleSubmit = () => {
    if (canPredict) onPredict(selectedState, selectedCity, selectedDate);
  };

  return (
    <section className="relative px-6 pb-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(32px)',
            boxShadow: '0 0 80px rgba(109,40,217,0.12), 0 32px 64px rgba(0,0,0,0.4)',
          }}
        >
          {/* Top gradient line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.6), rgba(244,114,182,0.6), transparent)' }}
          />

          {/* Card body */}
          <div className="p-8 md:p-10">
            {/* Section label */}
            <div className="flex items-center gap-2 mb-8">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6d28d9, #db2777)' }}
              >
                <Sparkles size={13} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-white/70">AQI Prediction Engine</span>
            </div>

            {/* Form inputs */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <SelectField
                label="State"
                value={selectedState}
                onChange={handleStateChange}
                options={states}
                placeholder="Select State"
              />
              <SelectField
                label="City"
                value={selectedCity}
                onChange={setSelectedCity}
                options={cities}
                placeholder={selectedState ? 'Select City' : 'Select State first'}
                disabled={!selectedState}
              />
              <DateField value={selectedDate} onChange={setSelectedDate} />
            </div>

            {/* Predict button */}
            <motion.button
              onClick={handleSubmit}
              disabled={!canPredict}
              whileHover={canPredict ? { scale: 1.015 } : {}}
              whileTap={canPredict ? { scale: 0.98 } : {}}
              className="w-full py-5 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300"
              style={{
                background: canPredict
                  ? 'linear-gradient(135deg, #6d28d9, #9333ea, #db2777)'
                  : 'rgba(255,255,255,0.05)',
                color: canPredict ? '#fff' : 'rgba(255,255,255,0.25)',
                boxShadow: canPredict ? '0 0 40px rgba(109,40,217,0.4), 0 8px 24px rgba(109,40,217,0.3)' : 'none',
                cursor: canPredict ? 'pointer' : 'not-allowed',
                border: canPredict ? 'none' : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Predicting AQI…
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Predict AQI
                </>
              )}
            </motion.button>

            {/* Helper text */}
            {!selectedState && (
              <p className="text-center text-xs text-white/25 mt-4">
                Select a state, city, and date to get your AQI prediction
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
