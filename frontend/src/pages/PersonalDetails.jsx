import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { indianStates } from '../data/indianStates';

function PersonalDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    state: '',
    city: '',
    village: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit Indian phone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.state) {
      newErrors.state = 'Please select a state';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.village.trim()) {
      newErrors.village = 'Village/Town is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Store data in sessionStorage to pass to next step
      sessionStorage.setItem('personalDetails', JSON.stringify(formData));
      navigate('/land-details');
    }
  };

  return (
    <div className="registration-container">
      <div className="progress-bar">
        <div className="progress-step active">1</div>
        <div className="progress-line"></div>
        <div className="progress-step">2</div>
        <div className="progress-line"></div>
        <div className="progress-step">3</div>
      </div>

      <h1>Personal Details</h1>
      <p className="subtitle">Let's start with your basic information</p>

      <form onSubmit={handleNext}>
        <div className="form-section">
          <h2>Personal Information</h2>
          
          <div className="form-group">
            <label htmlFor="name">Full Name <span className="required">*</span></label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number <span className="required">*</span></label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              maxLength="10"
              className={errors.phoneNumber ? 'error' : ''}
            />
            {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address (Optional)</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
        </div>

        <div className="form-section">
          <h2>Location Details</h2>
          
          <div className="form-group">
            <label htmlFor="state">State <span className="required">*</span></label>
            <select
              id="state"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className={errors.state ? 'error' : ''}
            >
              <option value="">Select your state</option>
              {indianStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.state && <span className="error-message">{errors.state}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="city">City/District <span className="required">*</span></label>
            <input
              id="city"
              type="text"
              placeholder="Enter your city or district"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className={errors.city ? 'error' : ''}
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="village">Village/Town <span className="required">*</span></label>
            <input
              id="village"
              type="text"
              placeholder="Enter your village or town name"
              value={formData.village}
              onChange={(e) => handleChange('village', e.target.value)}
              className={errors.village ? 'error' : ''}
            />
            {errors.village && <span className="error-message">{errors.village}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
            Back
          </button>
          <button type="submit" className="btn-primary">
            Next: Land Details
          </button>
        </div>
      </form>
    </div>
  );
}

export default PersonalDetails;
