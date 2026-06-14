import React, { useState } from 'react';
import { api } from '../utils/api';
import { Car, Utensils, Home, ShoppingBag, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function Calculator({ onCalculationSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    carKmPerWeek: 120,
    carType: 'PETROL',
    transitHoursPerWeek: 4,
    flightsPerYear: 2,
    dietType: 'MEAT_LIGHT',
    householdSize: 2,
    homeEnergySource: 'GRID',
    heatingType: 'GAS',
    shoppingHabits: 'AVERAGE'
  });

  const validateStep = (s) => {
    const err = {};
    if (s === 1) {
      if (formData.carKmPerWeek < 0) err.carKmPerWeek = 'Commute distance cannot be negative';
      if (formData.transitHoursPerWeek < 0) err.transitHoursPerWeek = 'Transit hours cannot be negative';
      if (formData.flightsPerYear < 0) err.flightsPerYear = 'Flights cannot be negative';
    }
    if (s === 3) {
      if (formData.householdSize < 1) err.householdSize = 'Household size must be at least 1';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStep((s) => s - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.endsWith('Week') || name.endsWith('Year') || name === 'householdSize' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setLoading(true);
    try {
      const data = await api.calculateFootprint(formData);
      setResult(data);
      setSuccess(true);
      if (onCalculationSuccess) {
        onCalculationSuccess(data);
      }
    } catch (err) {
      console.error(err);
      setErrors({ global: 'Failed to calculate. Please check inputs.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Carbon Calculator</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Estimate your annual footprint by answering a few simple lifestyle questions.
      </p>

      {success ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ display: 'inline-flex', background: 'var(--primary-glow)', padding: '16px', borderRadius: '50%', marginBottom: '24px', border: '1px solid var(--primary)' }}>
            <CheckCircle2 size={40} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Calculation Complete!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Your baseline annual carbon footprint is calculated.
          </p>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'around', gap: '20px', marginBottom: '40px' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Annual Footprint</span>
              <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>{result?.totalFootprint}</span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block' }}>Metric Tons $CO_2e$</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => { setSuccess(false); setStep(1); }}>
              Recalculate
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '32px' }}>
          {/* Progress Bar */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <span>Step {step} of 4</span>
              <span>{step === 1 ? 'Transportation' : step === 2 ? 'Diet & Food' : step === 3 ? 'Home Energy' : 'Consumption'}</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${(step / 4) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', transition: 'var(--transition-smooth)' }}></div>
            </div>
          </div>

          {errors.global && (
            <div className="alert-container alert-error">
              <span>{errors.global}</span>
            </div>
          )}

          {/* Step 1: Transport */}
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Car size={24} color="var(--primary)" />
                <h3 style={{ fontSize: '20px' }}>Transportation Habits</h3>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Car Fuel Type</label>
                <select name="carType" className="form-select" value={formData.carType} onChange={handleChange}>
                  <option value="PETROL">Petrol/Gasoline</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ELECTRIC">Electric (EV)</option>
                  <option value="NONE">No Car (Walk/Cycle/Transit Only)</option>
                </select>
              </div>

              {formData.carType !== 'NONE' && (
                <div className="form-group">
                  <label className="form-label">Weekly Commute (Kilometers)</label>
                  <input type="number" name="carKmPerWeek" className="form-input" min="0" value={formData.carKmPerWeek} onChange={handleChange} />
                  {errors.carKmPerWeek && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.carKmPerWeek}</span>}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Weekly Public Transit Time (Hours)</label>
                <input type="number" name="transitHoursPerWeek" className="form-input" min="0" value={formData.transitHoursPerWeek} onChange={handleChange} />
                {errors.transitHoursPerWeek && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.transitHoursPerWeek}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Flights taken per Year</label>
                <input type="number" name="flightsPerYear" className="form-input" min="0" value={formData.flightsPerYear} onChange={handleChange} />
                {errors.flightsPerYear && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.flightsPerYear}</span>}
              </div>
            </div>
          )}

          {/* Step 2: Diet */}
          {step === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Utensils size={24} color="var(--primary)" />
                <h3 style={{ fontSize: '20px' }}>Diet & Food Consumption</h3>
              </div>

              <div className="form-group">
                <label className="form-label">Which best describes your diet?</label>
                <select name="dietType" className="form-select" value={formData.dietType} onChange={handleChange}>
                  <option value="MEAT_HEAVY">Meat-Heavy (Eat beef/pork daily)</option>
                  <option value="MEAT_LIGHT">Light Meat (Mostly chicken/fish, infrequent red meat)</option>
                  <option value="PESCATARIAN">Pescatarian (Fish but no other meat)</option>
                  <option value="VEGETARIAN">Vegetarian (No meat/fish, eat dairy/eggs)</option>
                  <option value="VEGAN">Vegan (No animal products)</option>
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Agricultural farming (especially livestock) is one of the leading global drivers of carbon emissions.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Energy */}
          {step === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Home size={24} color="var(--primary)" />
                <h3 style={{ fontSize: '20px' }}>Home Utilities & Energy</h3>
              </div>

              <div className="form-group">
                <label className="form-label">Household Size (Number of members)</label>
                <input type="number" name="householdSize" className="form-input" min="1" value={formData.householdSize} onChange={handleChange} />
                {errors.householdSize && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.householdSize}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Electricity Tariff Source</label>
                <select name="homeEnergySource" className="form-select" value={formData.homeEnergySource} onChange={handleChange}>
                  <option value="GRID">Standard Utility Grid (Coal/Gas Mix)</option>
                  <option value="RENEWABLE">Green Energy / Solar Tariffs</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Home Heating Source</label>
                <select name="heatingType" className="form-select" value={formData.heatingType} onChange={handleChange}>
                  <option value="GAS">Natural Gas</option>
                  <option value="ELECTRIC">Electric Heat Pump / Radiator</option>
                  <option value="OIL">Oil Burner</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Shopping */}
          {step === 4 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <ShoppingBag size={24} color="var(--primary)" />
                <h3 style={{ fontSize: '20px' }}>Shopping & Consumption</h3>
              </div>

              <div className="form-group">
                <label className="form-label">How frequently do you buy clothing, gadgets, and homewares?</label>
                <select name="shoppingHabits" className="form-select" value={formData.shoppingHabits} onChange={handleChange}>
                  <option value="MINIMAL">Minimalist (Buy only necessities, repair & recycle)</option>
                  <option value="AVERAGE">Average (Moderate purchases, replace devices when needed)</option>
                  <option value="HEAVY">Heavy Shopper (Frequent luxury/fast-fashion purchases)</option>
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Industrial production, global shipping, and disposal accounts for substantial baseline indirect carbon footprints.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
            {step > 1 ? (
              <button type="button" className="btn-secondary" onClick={handleBack}>
                <ArrowLeft size={18} /> Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button type="button" className="btn-primary" onClick={handleNext}>
                Next <ArrowRight size={18} />
              </button>
            ) : (
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Calculating...' : 'Submit Calculator'} <CheckCircle2 size={18} />
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
