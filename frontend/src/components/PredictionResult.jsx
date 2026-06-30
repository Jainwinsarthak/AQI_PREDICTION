import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAQILevel } from '../data/mockData';
import { MapPin, Calendar, ArrowRight, ArrowDown, Sparkles } from 'lucide-react';

function AnimatedNumber({ target }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  const start = useRef(null);
  const duration = 1000;

  useEffect(() => {
    setDisplay(0);
    start.current = null;
    const val = Number(target);
    const targetVal = isNaN(val) ? 0 : val;
    
    const animate = (ts) => {
      if (!start.current) start.current = ts;
      const progress = Math.min((ts - start.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * targetVal));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);

  return <span>{isNaN(display) ? 0 : display}</span>;
}

// ─── Props: prediction object | isLoading ────────────────────
export default function PredictionResult({ prediction, isLoading }) {
  const showLoader = isLoading;
  const showResult = !isLoading && prediction;

  const predLevel = prediction ? getAQILevel(prediction.aqi) : null;
  const liveLevel = prediction ? getAQILevel(prediction.liveAqi) : null;
  const isWorse = prediction ? prediction.aqiChange > 0 : false;
  const changeColor = isWorse ? '#ef4444' : '#10b981'; // Red for deterioration, Green for improvement

  const formattedDate = prediction
    ? new Date(prediction.date).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '';

  return (
    <div id="prediction-result" className="px-6 pb-8">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Loading state */}
          {showLoader && (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="rounded-3xl p-12 flex flex-col items-center justify-center gap-5"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                minHeight: 220,
              }}
            >
              {/* Pulsing orb */}
              <div className="relative flex items-center justify-center">
                <div
                  className="absolute w-24 h-24 rounded-full"
                  style={{
                    background: 'rgba(109,40,217,0.15)',
                    animation: 'pulse-glow 1.5s ease-in-out infinite',
                  }}
                />
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6d28d9, #db2777)' }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 rounded-full border-2 border-white border-t-transparent"
                  />
                </div>
              </div>
              <div>
                <p className="text-white/70 font-semibold text-center">Running XGBoost Model</p>
                <p className="text-white/30 text-sm text-center mt-1">Analyzing atmospheric conditions…</p>
              </div>
            </motion.div>
          )}

          {/* Result state */}
          {showResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
               {/* Location Header */}
               <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <MapPin size={14} className="text-violet-400" />
                    {prediction.city}, {prediction.state}
                  </div>
                  <div className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: `${predLevel.color}20`, border: `1px solid ${predLevel.border}`, color: predLevel.color }}>
                    XGBoost Prediction
                  </div>
                </div>

              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                
                {/* 1. LIVE AQI (Subdued) */}
                <div 
                  className="flex-1 w-full rounded-3xl p-6 md:p-8 flex flex-col justify-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <p className="text-xs font-bold tracking-widest text-white/40 uppercase mb-4">Live AQI (Today)</p>
                  <div className="flex items-end gap-4 mb-2">
                    <div className="text-[60px] md:text-[70px] font-black leading-none" style={{ color: liveLevel.color }}>
                      <AnimatedNumber target={prediction.liveAqi} />
                    </div>
                  </div>
                  <div className="inline-flex self-start items-center px-4 py-1.5 rounded-xl text-sm font-bold tracking-wide" style={{ background: `${liveLevel.color}15`, border: `1px solid ${liveLevel.border}`, color: liveLevel.color }}>
                    {liveLevel.label}
                  </div>
                </div>

                {/* 2. CHANGE INDICATOR */}
                <div className="flex flex-col items-center justify-center shrink-0 my-2 md:my-0">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <ArrowRight size={20} className="hidden md:block text-white/40" />
                    <ArrowDown size={20} className="block md:hidden text-white/40" />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black" style={{ color: changeColor }}>
                      {prediction.aqiChange > 0 ? '+' : ''}{prediction.aqiChange} AQI
                    </div>
                    <div className="text-xs text-white/40 font-medium mt-1">
                      Expected {isWorse ? 'Deterioration' : 'Improvement'}
                    </div>
                  </div>
                </div>

                {/* 3. PREDICTED AQI (Highlighted) */}
                <div 
                  className="flex-1 w-full rounded-3xl p-6 md:p-8 relative overflow-hidden"
                  style={{ background: predLevel.bg, border: `1px solid ${predLevel.border}`, boxShadow: `0 0 60px ${predLevel.glow}15` }}
                >
                   {/* Top glow line */}
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${predLevel.color}, transparent)` }} />
                  
                  {/* Radial glow */}
                  <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${predLevel.glow}30, transparent 70%)`, filter: 'blur(30px)' }} />

                  <p className="text-xs font-bold tracking-widest text-white/60 uppercase mb-4 flex items-center gap-2">
                    <Sparkles size={12} style={{ color: predLevel.color }} /> Predicted AQI ({formattedDate})
                  </p>
                  
                  <div className="flex items-end gap-4 mb-2">
                    <div className="text-[80px] md:text-[90px] font-black leading-none" style={{ color: predLevel.color, textShadow: `0 0 40px ${predLevel.glow}60` }}>
                      <AnimatedNumber target={prediction.aqi} />
                    </div>
                  </div>
                  <div className="inline-flex self-start items-center px-4 py-1.5 rounded-xl text-sm font-black tracking-wide" style={{ background: `${predLevel.color}25`, border: `1px solid ${predLevel.border}`, color: predLevel.color }}>
                    {predLevel.label}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
