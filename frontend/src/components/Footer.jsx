import { motion } from 'framer-motion';
import { Wind, Heart } from 'lucide-react';
import { footerStats } from '../data/mockData';

export default function Footer() {
  return (
    <footer className="relative px-6 pt-16 pb-8 overflow-hidden">
      {/* Top gradient border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.4), rgba(244,114,182,0.4), transparent)' }}
      />

      {/* Ambient glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(109,40,217,0.08), transparent)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative max-w-4xl mx-auto">
        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12"
        >
          {footerStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.04, y: -2 }}
              className="rounded-2xl p-5 text-center group cursor-default"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="text-xl font-black mb-1 group-hover:scale-105 transition-transform duration-200"
                style={{
                  background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-white/35 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Brand + bottom */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #db2777)' }}
            >
              <Wind size={13} className="text-white" />
            </div>
            <span className="font-bold text-sm">
              <span style={{
                background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>AirSight</span>
              <span className="text-white/40 font-light ml-1">India</span>
            </span>
          </div>

          {/* Center */}
          <p className="text-xs text-white/25 flex items-center gap-1.5">
            Made with <Heart size={10} className="text-pink-500" /> in India ·
            XGBoost · R² 0.8387 · MAE 13.642
          </p>

          {/* Right */}
          <p className="text-xs text-white/20">
            © 2025 AirSight India
          </p>
        </div>
      </div>
    </footer>
  );
}
