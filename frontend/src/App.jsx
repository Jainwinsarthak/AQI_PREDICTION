import './index.css';
import { useState } from 'react';

import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PredictionEngine from './components/PredictionEngine';
import PredictionResult from './components/PredictionResult';
import HealthImpact from './components/HealthImpact';
import ForecastChart from './components/ForecastChart';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';

function App() {
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = async (state, city, date) => {
    setIsLoading(true);
    setPrediction(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state, city, date }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${res.status}`);
      }

      const result = await res.json();
      setPrediction(result);

      // Smooth scroll to result
      setTimeout(() => {
        document.getElementById('prediction-result')?.scrollIntoView({
          behavior: 'smooth', block: 'start',
        });
      }, 100);
    } catch (err) {
      console.error('Prediction fetch error:', err);
      setPrediction({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ background: '#060912', minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      <PredictionEngine onPredict={handlePredict} isLoading={isLoading} />
      <PredictionResult prediction={prediction} isLoading={isLoading} />
      {prediction && (
        <>
          <HealthImpact
            cigarettes={prediction.cigarettes}
            lungStress={prediction.lungStress}
            riskScore={prediction.riskScore}
            aqi={prediction.aqi}
          />
          <ForecastChart forecast={prediction.forecast} city={prediction.city} />
        </>
      )}
      <HowItWorks />
      <Footer />
    </div>
  );
}

export default App;
