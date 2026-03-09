import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function WaterAvailability() {
  const navigate = useNavigate();
  const { farmerId } = useParams(); // Optional - only present when updating from dashboard
  const [formData, setFormData] = useState({
    source: 'borewell',
    availability: 'medium'
  });

  const [loading, setLoading] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  const loadExistingWaterData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/farmers/${farmerId}`);
      const farmerData = response.data.data;
      
      if (farmerData.waterAvailability) {
        setFormData({
          source: farmerData.waterAvailability.source || 'borewell',
          availability: farmerData.waterAvailability.availability || 'medium'
        });
      }
    } catch (error) {
      console.log('No existing water data found');
    }
  };

  // Load existing water data if updating from dashboard
  useEffect(() => {
    if (farmerId) {
      setIsUpdate(true);
      loadExistingWaterData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmerId]);

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
      // If updating from dashboard
      if (isUpdate && farmerId) {
        // Get existing farmer data
        const response = await axios.get(`http://localhost:5000/api/farmers/${farmerId}`);
        const farmerData = response.data.data;

        // Update water availability
        const updatedData = {
          ...farmerData,
          waterAvailability: {
            source: formData.source,
            availability: formData.availability
          }
        };

        await axios.put(`http://localhost:5000/api/farmers/${farmerId}`, updatedData);
        
        alert('Water availability updated successfully!');
        navigate(`/dashboard/${farmerId}`);
        return;
      }

      // Original registration flow
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

      const newFarmerId = response.data.data._id;

      // Store farmer ID and data for next steps
      sessionStorage.setItem('currentFarmerId', newFarmerId);
      sessionStorage.setItem('farmerData', JSON.stringify(response.data.data));

      // Clear old registration data
      sessionStorage.removeItem('personalDetails');

      console.log('Registration successful, farmer ID:', newFarmerId);

      // Navigate to land mapping
      navigate(`/land-mapping/${newFarmerId}`);
    } catch (error) {
      console.error('Error:', error);
      
      let errorMessage = isUpdate ? 'Update failed. ' : 'Registration failed. ';
      
      if (error.response) {
        errorMessage += error.response.data?.error || error.response.statusText;
      } else if (error.request) {
        errorMessage += 'Server not responding. Please check if backend is running.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isUpdate && farmerId) {
      navigate(`/dashboard/${farmerId}`);
    } else {
      navigate('/land-details');
    }
  };

  return (
    <div className="registration-container water-availability-page">
      {!isUpdate && (
        <div className="progress-bar">
          <div className="progress-step completed">1</div>
          <div className="progress-line completed"></div>
          <div className="progress-step completed">2</div>
          <div className="progress-line completed"></div>
          <div className="progress-step active">3</div>
        </div>
      )}

      <h1>Water Availability</h1>
      <p className="subtitle">{isUpdate ? 'Update your water source information' : 'Tell us about your water sources'}</p>

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
          {loading ? (isUpdate ? 'Updating...' : 'Registering...') : (isUpdate ? 'Update Water Details' : 'Complete Registration')}
          <span className="arrow">→</span>
        </button>

        <button type="button" className="back-btn" onClick={handleBack}>
          ← Back {isUpdate ? 'to Dashboard' : ''}
        </button>
      </form>
    </div>
  );
}

export default WaterAvailability;
