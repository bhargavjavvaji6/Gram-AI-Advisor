import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ownership: 'owner',
    landSize: '',
    unit: 'acres'
  });

  const [errors, setErrors] = useState({});

  const handleOwnershipChange = (type) => {
    setFormData(prev => ({ ...prev, ownership: type }));
  };

  const handleUnitChange = (unit) => {
    setFormData(prev => ({ ...prev, unit }));
  };

  const handleLandSizeChange = (value) => {
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, landSize: value }));
      if (errors.landSize) {
        setErrors(prev => ({ ...prev, landSize: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.landSize || parseFloat(formData.landSize) <= 0) {
      newErrors.landSize = 'Please enter a valid land size';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Get personal details from previous step
      const personalDetails = JSON.parse(sessionStorage.getItem('personalDetails') || '{}');

      // Combine all data
      const completeData = {
        personalDetails: {
          name: personalDetails.name,
          phoneNumber: personalDetails.phoneNumber,
          email: personalDetails.email
        },
        location: {
          state: personalDetails.state,
          city: personalDetails.city,
          village: personalDetails.village
        },
        landDetails: {
          totalArea: parseFloat(formData.landSize),
          unit: formData.unit,
          isOwner: formData.ownership === 'owner',
          ownerName: formData.ownership === 'tenant' ? 'To be provided' : personalDetails.name
        },
        waterAvailability: {
          source: 'borewell',
          availability: 'medium'
        }
      };

      // Store complete data
      sessionStorage.setItem('registrationData', JSON.stringify(completeData));

      // Navigate to next step
      navigate('/water-availability');
    } catch (error) {
      alert('Error processing data: ' + error.message);
    }
  };

  const handleBack = () => {
    navigate('/personal-details');
  };

  return (
    <div className="registration-container land-details-page">
      <div className="progress-bar">
        <div className="progress-step completed">1</div>
        <div className="progress-line completed"></div>
        <div className="progress-step active">2</div>
        <div className="progress-line"></div>
        <div className="progress-step">3</div>
      </div>

      <h1>Land Information</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Land Ownership</h2>
          
          <div className="ownership-options">
            <button
              type="button"
              className={`ownership-card ${formData.ownership === 'owner' ? 'selected' : ''}`}
              onClick={() => handleOwnershipChange('owner')}
            >
              <span className="ownership-icon">🏠</span>
              <span className="ownership-label">Owner</span>
            </button>

            <button
              type="button"
              className={`ownership-card ${formData.ownership === 'tenant' ? 'selected' : ''}`}
              onClick={() => handleOwnershipChange('tenant')}
            >
              <span className="ownership-icon">🤝</span>
              <span className="ownership-label">Tenant</span>
            </button>
          </div>
        </div>

        <div className="form-section">
          <h2>Land Size</h2>
          
          <div className="land-size-container">
            <input
              type="text"
              placeholder="e.g. 5"
              value={formData.landSize}
              onChange={(e) => handleLandSizeChange(e.target.value)}
              className={`land-size-input ${errors.landSize ? 'error' : ''}`}
            />

            <div className="unit-selector">
              <button
                type="button"
                className={`unit-btn ${formData.unit === 'acres' ? 'selected' : ''}`}
                onClick={() => handleUnitChange('acres')}
              >
                Acres
              </button>
              <button
                type="button"
                className={`unit-btn ${formData.unit === 'cents' ? 'selected' : ''}`}
                onClick={() => handleUnitChange('cents')}
              >
                Cents
              </button>
            </div>
          </div>
          {errors.landSize && <span className="error-message">{errors.landSize}</span>}
        </div>

        <button type="submit" className="complete-registration-btn">
          Complete Registration
          <span className="arrow">→</span>
        </button>

        <button type="button" className="back-btn" onClick={handleBack}>
          ← Back
        </button>
      </form>
    </div>
  );
}

export default LandDetails;
