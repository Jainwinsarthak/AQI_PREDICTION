import { motion } from 'framer-motion';
import { getAQILevel } from '../data/mockData';

// ─── Props: cigarettes, lungStress, riskScore, aqi ───────────
export default function HealthImpact({ cigarettes, lungStress, riskScore, aqi }) {
  const level = getAQILevel(aqi);

  const cards = [
    {
      icon: '🚬',
      label: 'Cigarette Equivalent',
      value: cigarettes,
      unit: 'cigarettes/day',
      desc: 'Breathing this air is equivalent to smoking this many cigarettes.',
      color: '#f97316',
    },
    {
      icon: '🫁',
      label: 'Lung Stress',
      value: `${lungStress}%`,
      unit: 'stress index',
      desc: 'Estimated stress on lung tissue from particulate exposure.',
      color: '#ef4444',
    },
    {
      icon: '☠️',
      label: 'Risk Score',
      value: riskScore,
      unit: 'out of 10',
      desc: 'Overall health risk score based on AQI and exposure duration.',
      color: '#a855f7',
    },
  ];

  return (
    <section className="px-6 pb-10">
      <div className="max-w-4xl mx-auto">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-5"
        >
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <span className="text-xs font-semibold tracking-widest text-white/30 uppercase">Health Impact</span>
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.03, y: -3 }}
              className="relative rounded-2xl p-6 overflow-hidden"
              style={{
                background: `rgba(${card.color === '#f97316' ? '249,115,22' : card.color === '#ef4444' ? '239,68,68' : '168,85,247'}, 0.07)`,
                border: `1px solid ${card.color}25`,
              }}
            >
              {/* Background glow */}
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${card.color}20, transparent)`,
                  filter: 'blur(20px)',
                }}
              />

              <div className="relative">
                <div className="text-3xl mb-4">{card.icon}</div>
                <div className="text-3xl font-black mb-1" style={{ color: card.color }}>
                  {card.value}
                </div>
                <div className="text-xs text-white/35 mb-3 font-medium">{card.unit}</div>
                <div className="text-xs font-semibold text-white/60 mb-2">{card.label}</div>
                <p className="text-xs text-white/35 leading-relaxed">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
