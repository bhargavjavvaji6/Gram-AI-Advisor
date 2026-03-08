import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function WaterAvailability() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    source: 'borewell',
    availability: 'medium'
  });

  const [loading, setLoading] = useState(false);

  const waterSources = [
    { value: 'borewell', label: '🚰 Borewell', icon: '🚰' },
    { value: 'canal', label: '🌊 Canal', icon: '🌊' },
    { value: 'river', label: '🏞️ River', icon: '🏞️' },
    { value: 'rain', label: '🌧️ Rain', icon: '🌧️' },
    { value: 'mixed', label: '💧 Mixed', icon: '💧' }
  ];

  const availabilityLevels = [
    { value: 'high', label: 'High', color: '#27ae60' },
    { value: 'medium', label: 'Medium', color: '#f39c12' },
    { value: 'low', label: 'Low', color: '#e74c3c' }
  ];

  const handleSourceChange = (source) => {
    setFormData(prev => ({ ...prev, source }));
  };

  const handleAvailabilityChange = (availability) => {
    setFormData(prev => ({ ...prev, availability }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get registration data from sessionStorage
      const registrationDataStr = sessionStorage.getItem('registrationData');
      
      if (!registrationDataStr) {
        alert('Registration data not found. Please start from the beginning.');
        navigate('/personal-details');
        return;
      }

      const registrationData = JSON.parse(registrationDataStr);

      // Validate required fields
      if (!registrationData.personalDetails || !registrationData.location || !registrationData.landDetails) {
        alert('Incomplete registration data. Please complete all previous steps.');
        navigate('/personal-details');
        return;
      }

      // Update with water availability
      const completeData = {
        ...registrationData,
        waterAvailability: {
          source: formData.source,
          availability: formData.availability
        }
      };

      console.log('Submitting registration data:', completeData);

      // Register farmer
      const response = await axios.post('http://localhost:5000/api/farmers/register', completeData);
      
      if (!response.data || !response.data.data || !response.data.data._id) {
        throw new Error('Invalid response from server');
      }

      const farmerId = response.data.data._id;

      // Store farmer ID and data for next steps
      sessionStorage.setItem('currentFarmerId', farmerId);
      sessionStorage.setItem('farmerData', JSON.stringify(response.data.data));

      // Clear old registration data
      sessionStorage.removeItem('personalDetails');

      console.log('Registration successful, farmer ID:', farmerId);

      // Navigate to land mapping
      navigate(`/land-mapping/${farmerId}`);
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. ';
      
      if (error.response) {
        // Server responded with error
        errorMessage += error.response.data?.error || error.response.statusText;
      } else if (error.request) {
        // Request made but no response
        errorMessage += 'Server not responding. Please check if backend is running.';
      } else {
        // Other errors
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/land-details');
  };

  return (
    <div className="registration-container water-availability-page">
      <div className="progress-bar">
        <div className="progress-step completed">1</div>
        <div className="progress-line completed"></div>
        <div className="progress-step completed">2</div>
        <div className="progress-line completed"></div>
        <div className="progress-step active">3</div>
      </div>

      <h1>Water Availability</h1>
      <p className="subtitle">Tell us about your water sources</p>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Water Source</h2>
          
          <div className="water-source-grid">
            {waterSources.map((source) => (
              <button
                key={source.value}
                type="button"
                className={`water-source-card ${formData.source === source.value ? 'selected' : ''}`}
                onClick={() => handleSourceChange(source.value)}
              >
                <span className="water-icon">{source.icon}</span>
                <span className="water-label">{source.label.replace(/[^\w\s]/g, '')}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Water Availability Level</h2>
          
          <div className="availability-options">
            {availabilityLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                className={`availability-card ${formData.availability === level.value ? 'selected' : ''}`}
                onClick={() => handleAvailabilityChange(level.value)}
                style={{
                  '--level-color': level.color
                }}
              >
                <div className="availability-indicator" style={{ background: level.color }}></div>
                <span className="availability-label">{level.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          className="complete-registration-btn"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Complete Registration'}
          <span className="arrow">→</span>
        </button>

        <button type="button" className="back-btn" onClick={handleBack}>
          ← Back
        </button>
      </form>
    </div>
  );
}

export default WaterAvailability;
