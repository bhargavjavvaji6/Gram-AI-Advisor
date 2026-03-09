import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const { farmerId } = useParams();
  const navigate = useNavigate();
  const [farmerData, setFarmerData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadFarmerData = async () => {
    try {
      // Try to get from backend
      const response = await axios.get(`http://localhost:5000/api/farmers/${farmerId}`);
      setFarmerData(response.data.data);
    } catch (error) {
      // Fallback to session storage
      const sessionData = sessionStorage.getItem('farmerWithSoil') || sessionStorage.getItem('registrationData');
      if (sessionData) {
        const data = JSON.parse(sessionData);
        data._id = farmerId;
        setFarmerData(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (farmerId) {
      loadFarmerData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmerId]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading your dashboard...</div>
      </div>
    );
  }

  if (!farmerData) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <p>Unable to load farmer data. Please register again.</p>
          <button onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  const landSize = farmerData.landDetails?.totalArea || 0;
  const unit = farmerData.landDetails?.unit || 'acres';
  const location = farmerData.location ? 
    `${farmerData.location.village}, ${farmerData.location.city}, ${farmerData.location.state}` : 
    '—';
  const hasSoilReport = farmerData.soilReport && farmerData.soilReport.pH;
  const hasWaterData = farmerData.waterAvailability && farmerData.waterAvailability.availability;
  const farmerName = farmerData.personalDetails?.name || 'Farmer';
  const canGetAdvice = hasSoilReport && hasWaterData;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Hello, {farmerName} 👋</h1>
        <p className="dashboard-subtitle">What would you like to do today?</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Land Size</h3>
          <p className="stat-value">{landSize} <span className="stat-unit">{unit}</span></p>
        </div>

        <div className="stat-card">
          <h3>Location</h3>
          <p className="stat-location">{location}</p>
        </div>

        <div className="stat-card">
          <h3>Crop Suggestions</h3>
          <p className="stat-value">{canGetAdvice ? 'Ready' : 'Pending'}</p>
        </div>
      </div>

      <div className="quick-actions-section">
        <h2>Quick Actions</h2>

        <div className="action-cards">
          <button 
            className="action-card"
            onClick={() => navigate(`/soil-report/${farmerId}`)}
          >
            <div className="action-icon soil-icon">🌱</div>
            <div className="action-content">
              <h3>Soil Test</h3>
              <p>{hasSoilReport ? '✓ Updated - Click to modify' : 'Enter soil parameters'}</p>
            </div>
          </button>

          <button 
            className="action-card"
            onClick={() => navigate(`/water-availability/${farmerId}`)}
          >
            <div className="action-icon water-icon">💧</div>
            <div className="action-content">
              <h3>Water Source</h3>
              <p>{hasWaterData ? '✓ Updated - Click to modify' : 'Enter water availability'}</p>
            </div>
          </button>

          <button 
            className={`action-card ${canGetAdvice ? 'action-card-primary' : ''}`}
            onClick={() => navigate(`/recommendations/${farmerId}`)}
            disabled={!canGetAdvice}
          >
            <div className="action-icon crop-icon">📊</div>
            <div className="action-content">
              <h3>Get Crop Advice</h3>
              <p>{canGetAdvice ? '✓ Ready - View latest recommendations' : 'Complete soil test and water source first'}</p>
            </div>
          </button>
        </div>
      </div>

      {hasSoilReport && (
        <div className="soil-summary">
          <h2>Your Soil Report Summary</h2>
          <div className="soil-params">
            <div className="soil-param">
              <span className="param-label">pH Level</span>
              <span className="param-value">{farmerData.soilReport.pH}</span>
            </div>
            <div className="soil-param">
              <span className="param-label">Nitrogen</span>
              <span className="param-value">{farmerData.soilReport.nitrogen} kg/ha</span>
            </div>
            <div className="soil-param">
              <span className="param-label">Phosphorus</span>
              <span className="param-value">{farmerData.soilReport.phosphorus} kg/ha</span>
            </div>
            <div className="soil-param">
              <span className="param-label">Potassium</span>
              <span className="param-value">{farmerData.soilReport.potassium} kg/ha</span>
            </div>
          </div>
        </div>
      )}

      {hasWaterData && (
        <div className="water-summary">
          <h2>Your Water Availability Summary</h2>
          <div className="water-params">
            <div className="water-param">
              <span className="param-label">Water Source</span>
              <span className="param-value">{farmerData.waterAvailability.source}</span>
            </div>
            <div className="water-param">
              <span className="param-label">Availability Level</span>
              <span className={`param-value availability-${farmerData.waterAvailability.availability}`}>
                {farmerData.waterAvailability.availability}
              </span>
            </div>
          </div>
        </div>
      )}

      {canGetAdvice && (
        <div className="recommendation-prompt">
          <h2>🌾 Ready for Crop Recommendations!</h2>
          <p>Your soil and water data is complete. Click "Get Crop Advice" to see personalized recommendations.</p>
          <button 
            className="get-advice-btn"
            onClick={() => navigate(`/recommendations/${farmerId}`)}
          >
            Get Crop Advice Now →
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
