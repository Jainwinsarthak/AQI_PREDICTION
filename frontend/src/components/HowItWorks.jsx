import { motion } from 'framer-motion';
import { MapPin, CalendarDays, BrainCircuit, HeartPulse } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: MapPin,
    title: 'Select State & City',
    desc: 'Choose from 293 cities across 15 Indian states in our dataset.',
    color: '#a78bfa',
  },
  {
    step: '02',
    icon: CalendarDays,
    title: 'Pick a Future Date',
    desc: 'Select any date up to 30 days ahead to forecast AQI.',
    color: '#f472b6',
  },
  {
    step: '03',
    icon: BrainCircuit,
    title: 'XGBoost Predicts AQI',
    desc: 'Our ML model trained on 2022–2025 data runs the prediction instantly.',
    color: '#fb923c',
  },
  {
    step: '04',
    icon: HeartPulse,
    title: 'Health Impact Generated',
    desc: 'See cigarette equivalents, lung stress, and a 7-day forecast.',
    color: '#34d399',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative px-6 py-20 overflow-hidden">
      {/* Ambient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(109,40,217,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            How It{' '}
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Works</span>
          </h2>
          <p className="text-white/40 text-base max-w-lg mx-auto">
            Four simple steps from city selection to a complete AQI prediction and health analysis.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -3 }}
                className="relative rounded-2xl p-6 group overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at 0% 0%, ${s.color}10, transparent)` }}
                />

                <div className="relative flex items-start gap-5">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${s.color}18`,
                      border: `1px solid ${s.color}35`,
                    }}
                  >
                    <Icon size={20} style={{ color: s.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Step number */}
                    <span
                      className="text-xs font-black tracking-widest"
                      style={{ color: `${s.color}70` }}
                    >
                      STEP {s.step}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1 mb-2">{s.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12 px-6 py-5 rounded-2xl"
          style={{
            background: 'rgba(109,40,217,0.08)',
            border: '1px solid rgba(109,40,217,0.2)',
          }}
        >
          <p className="text-sm text-white/50 leading-relaxed">
            Built with{' '}
            <span className="text-violet-400 font-semibold">XGBoost</span> ·
            Trained on{' '}
            <span className="text-violet-400 font-semibold">4,14,964 records</span> across{' '}
            <span className="text-violet-400 font-semibold">293 Indian cities</span> ·
            R² Score{' '}
            <span className="text-violet-400 font-semibold">0.8387</span> · MAE{' '}
            <span className="text-violet-400 font-semibold">13.642</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
