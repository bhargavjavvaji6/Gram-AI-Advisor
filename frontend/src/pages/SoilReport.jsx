import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function SoilReport() {
  const { farmerId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [soilData, setSoilData] = useState({
    soilType: 'Loamy',
    pH: '7.60',
    nitrogen: '112.89',
    phosphorus: '21.18',
    potassium: '123.6',
    organicCarbon: '0.24'
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleChange = (field, value) => {
    setSoilData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get farmer data from sessionStorage as fallback
      let farmerData = null;
      
      try {
        const response = await axios.get(`http://localhost:5000/api/farmers/${farmerId}`);
        farmerData = response.data.data;
      } catch (error) {
        console.log('Farmer not found in backend, using session data');
        // If farmer not found, get from session storage
        const registrationData = sessionStorage.getItem('registrationData');
        if (registrationData) {
          farmerData = JSON.parse(registrationData);
          farmerData._id = farmerId;
        }
      }

      if (!farmerData) {
        alert('Session expired. Please register again.');
        navigate('/');
        return;
      }

      // Update farmer with soil data
      const updatedFarmer = {
        ...farmerData,
        soilReport: {
          ...soilData,
          pH: parseFloat(soilData.pH),
          nitrogen: parseFloat(soilData.nitrogen),
          phosphorus: parseFloat(soilData.phosphorus),
          potassium: parseFloat(soilData.potassium),
          organicCarbon: parseFloat(soilData.organicCarbon),
          reportUrl: file ? 'demo://soil-report.pdf' : 'demo://manual-entry',
          uploadedAt: new Date()
        }
      };

      // Store in session for recommendations page
      sessionStorage.setItem('farmerWithSoil', JSON.stringify(updatedFarmer));

      // Try to update in backend
      try {
        await axios.put(`http://localhost:5000/api/farmers/${farmerId}`, updatedFarmer);
      } catch (error) {
        console.log('Backend update failed, using session storage');
      }

      // Clear registration session data
      sessionStorage.removeItem('personalDetails');
      sessionStorage.removeItem('registrationData');

      navigate(`/dashboard/${farmerId}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save soil report: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate(`/recommendations/${farmerId}`);
  };

  return (
    <div className="soil-report-container">
      <h1>Soil Test Report</h1>
      <p className="subtitle">Enter your soil analysis details from lab report</p>

      <div className="soil-report-example">
        <p>💡 <strong>Tip:</strong> Enter values from your soil test report. Sample values are pre-filled based on typical Indian soil.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Upload Lab Report (Optional)</h2>
          <div className="file-upload-area">
            <input 
              type="file" 
              id="file-upload"
              accept=".pdf,.jpg,.jpeg,.png" 
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="file-upload" className="file-upload-label">
              📄 {file ? file.name : 'Choose file (PDF/Image)'}
            </label>
          </div>
        </div>

        <div className="form-section">
          <h2>Soil Analysis Details</h2>
          
          <div className="form-group">
            <label htmlFor="soilType">Soil Type</label>
            <select
              id="soilType"
              value={soilData.soilType}
              onChange={(e) => handleChange('soilType', e.target.value)}
            >
              <option value="Sandy">Sandy</option>
              <option value="Loamy">Loamy</option>
              <option value="Clay">Clay</option>
              <option value="Silt">Silt</option>
              <option value="Peaty">Peaty</option>
              <option value="Chalky">Chalky</option>
              <option value="Red Soil">Red Soil</option>
              <option value="Black Soil">Black Soil</option>
              <option value="Alluvial">Alluvial</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pH">pH Level (1:2.5)</label>
            <input
              id="pH"
              type="number"
              step="0.01"
              min="0"
              max="14"
              placeholder="e.g., 7.60"
              value={soilData.pH}
              onChange={(e) => handleChange('pH', e.target.value)}
              required
            />
            <small>Ideal range: 6.0 - 7.5 for most crops</small>
          </div>

          <div className="form-group">
            <label htmlFor="nitrogen">Nitrogen - N (kg/ha)</label>
            <input
              id="nitrogen"
              type="number"
              step="0.01"
              placeholder="e.g., 112.89"
              value={soilData.nitrogen}
              onChange={(e) => handleChange('nitrogen', e.target.value)}
              required
            />
            <small>From soil test report</small>
          </div>

          <div className="form-group">
            <label htmlFor="phosphorus">Phosphorus - P₂O₅ (kg/ha)</label>
            <input
              id="phosphorus"
              type="number"
              step="0.01"
              placeholder="e.g., 21.18"
              value={soilData.phosphorus}
              onChange={(e) => handleChange('phosphorus', e.target.value)}
              required
            />
            <small>From soil test report</small>
          </div>

          <div className="form-group">
            <label htmlFor="potassium">Potassium - K₂O (kg/ha)</label>
            <input
              id="potassium"
              type="number"
              step="0.01"
              placeholder="e.g., 123.6"
              value={soilData.potassium}
              onChange={(e) => handleChange('potassium', e.target.value)}
              required
            />
            <small>From soil test report</small>
          </div>

          <div className="form-group">
            <label htmlFor="organicCarbon">Organic Carbon - OC (%)</label>
            <input
              id="organicCarbon"
              type="number"
              step="0.01"
              placeholder="e.g., 0.24"
              value={soilData.organicCarbon}
              onChange={(e) => handleChange('organicCarbon', e.target.value)}
              required
            />
            <small>From soil test report</small>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleSkip}>
            Skip for Now
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : 'Get Crop Recommendations'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SoilReport;
