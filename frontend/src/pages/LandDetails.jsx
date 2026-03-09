import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ownership: 'owner',
    landSize: '',
    unit: 'acres',
    landImage: null,
    ownerName: '',
    relationToOwner: ''
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, landImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      if (errors.landImage) {
        setErrors(prev => ({ ...prev, landImage: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.landSize || parseFloat(formData.landSize) <= 0) {
      newErrors.landSize = 'Please enter a valid land size';
    }

    if (!formData.landImage) {
      newErrors.landImage = 'Please upload a land image for estimation';
    }

    if (formData.ownership === 'tenant') {
      if (!formData.ownerName.trim()) {
        newErrors.ownerName = 'Please enter owner name';
      }
      if (!formData.relationToOwner) {
        newErrors.relationToOwner = 'Please select your relation to the owner';
      }
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
          ownerName: formData.ownership === 'tenant' ? formData.ownerName : personalDetails.name,
          relationToOwner: formData.ownership === 'tenant' ? formData.relationToOwner : null,
          landImageName: formData.landImage ? formData.landImage.name : null
        },
        waterAvailability: {
          source: 'borewell',
          availability: 'medium'
        }
      };

      // Store complete data and land size for land mapping
      sessionStorage.setItem('registrationData', JSON.stringify(completeData));
      sessionStorage.setItem('landSize', formData.landSize);
      sessionStorage.setItem('landUnit', formData.unit);
      
      // Store land image preview for visualization
      if (imagePreview) {
        sessionStorage.setItem('landImagePreview', imagePreview);
      }

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

        {formData.ownership === 'tenant' && (
          <div className="form-section">
            <h2>Owner Details</h2>
            
            <input
              type="text"
              placeholder="Owner Name *"
              value={formData.ownerName}
              onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
              className={`auth-input ${errors.ownerName ? 'error' : ''}`}
            />
            {errors.ownerName && <span className="error-message">{errors.ownerName}</span>}

            <select
              value={formData.relationToOwner}
              onChange={(e) => setFormData(prev => ({ ...prev, relationToOwner: e.target.value }))}
              className={`auth-input ${errors.relationToOwner ? 'error' : ''}`}
            >
              <option value="">Select Relation to Owner *</option>
              <option value="friend">Friend</option>
              <option value="relative">Relative</option>
              <option value="cousin">Cousin</option>
              <option value="parents">Parents</option>
              <option value="children">Children</option>
              <option value="sibling">Sibling</option>
              <option value="other">Other</option>
            </select>
            {errors.relationToOwner && <span className="error-message">{errors.relationToOwner}</span>}
          </div>
        )}

        <div className="form-section">
          <h2>Land Image Upload</h2>
          <p className="field-description">Upload an image of your land for estimation (Required)</p>
          
          <div className="image-upload-container">
            <input
              type="file"
              id="landImage"
              accept="image/*"
              onChange={handleImageUpload}
              className="image-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="landImage" className="image-upload-label">
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Land preview" />
                  <span className="change-image">Click to change image</span>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">Click to upload land image</span>
                  <span className="upload-hint">Max size: 5MB</span>
                </div>
              )}
            </label>
            {formData.landImage && (
              <p className="file-name">Selected: {formData.landImage.name}</p>
            )}
            {errors.landImage && <span className="error-message">{errors.landImage}</span>}
          </div>
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
