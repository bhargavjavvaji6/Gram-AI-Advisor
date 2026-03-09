import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    state: '',
    city: '',
    village: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/farmers/login', {
        email: formData.email,
        password: formData.password
      });

      const farmer = response.data.data;
      
      // Store farmer data in session
      sessionStorage.setItem('currentFarmerId', farmer._id);
      sessionStorage.setItem('farmerData', JSON.stringify(farmer));
      sessionStorage.setItem('isAuthenticated', 'true');

      // Navigate to land details or dashboard based on completion
      if (farmer.landDetails && farmer.landDetails.totalArea) {
        navigate(`/dashboard/${farmer._id}`);
      } else {
        navigate('/land-details');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(error.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate signup fields
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        alert('Please fill all required fields');
        setLoading(false);
        return;
      }

      if (isSignUp && (!formData.state || !formData.city || !formData.village)) {
        alert('Please fill in your location details');
        setLoading(false);
        return;
      }

      console.log('Signing up with:', { 
        name: formData.name, 
        email: formData.email, 
        phone: formData.phone,
        state: formData.state,
        city: formData.city,
        village: formData.village
      });

      // Create account
      const response = await axios.post('http://localhost:5000/api/farmers/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        state: formData.state,
        city: formData.city,
        village: formData.village
      });

      console.log('Signup response:', response.data);

      const farmer = response.data.data;

      // Store farmer data
      sessionStorage.setItem('currentFarmerId', farmer._id);
      sessionStorage.setItem('farmerData', JSON.stringify(farmer));
      sessionStorage.setItem('isAuthenticated', 'true');

      alert('Account created successfully!');
      
      // Navigate to land details to complete profile
      navigate('/land-details');
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Signup failed. ';
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-left">
          <h1 className="auth-title">Sign {isSignUp ? 'Up' : 'In'}</h1>
          
          <div className="social-login">
            <button className="social-btn facebook-btn" type="button">
              <span>f</span>
            </button>
            <button className="social-btn google-btn" type="button">
              <span>G</span>
            </button>
            <button className="social-btn linkedin-btn" type="button">
              <span>in</span>
            </button>
          </div>

          <p className="auth-divider">or use your account</p>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
            {isSignUp && (
              <>
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  className="auth-input"
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  className="auth-input"
                />
                <select
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  required
                  className="auth-input"
                >
                  <option value="">Select State *</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
                <input
                  type="text"
                  placeholder="City/District *"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  required
                  className="auth-input"
                />
                <input
                  type="text"
                  placeholder="Village/Town *"
                  value={formData.village}
                  onChange={(e) => handleChange('village', e.target.value)}
                  required
                  className="auth-input"
                />
              </>
            )}
            
            <input
              type="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              className="auth-input"
            />
            
            <input
              type="password"
              placeholder="Password *"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
              className="auth-input"
            />

            {!isSignUp && (
              <a href="#" className="forgot-password">Forgot your password?</a>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Please wait...' : (isSignUp ? 'SIGN UP' : 'SIGN IN')}
            </button>
          </form>
        </div>

        <div className="auth-right">
          <h2 className="auth-welcome">Hey There!</h2>
          <p className="auth-welcome-text">
            {isSignUp 
              ? 'Already have an account? Sign in to continue your farming journey'
              : 'Begin your amazing journey by creating an account with us today'}
          </p>
          <button 
            className="auth-toggle-btn"
            onClick={() => setIsSignUp(!isSignUp)}
            type="button"
          >
            {isSignUp ? 'SIGN IN' : 'SIGN UP'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
