import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative pt-36 pb-12 px-6 text-center overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(109,40,217,0.18) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto">

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl font-black tracking-tight leading-none mb-5"
        >
          <span className="text-white">Predict Future</span>
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 60%, #fb923c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Air Quality</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-white/45 max-w-xl mx-auto leading-relaxed"
        >
          Select any Indian city and a future date.
          Our XGBoost model predicts the AQI instantly.
        </motion.p>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center mt-8 gap-1.5"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-0.5 h-6 rounded-full"
            style={{ background: 'linear-gradient(180deg, rgba(167,139,250,0.6), transparent)' }}
          />
          <span className="text-xs text-white/25 tracking-widest">PREDICT BELOW</span>
        </motion.div>
      </div>
    </section>
  );
}
