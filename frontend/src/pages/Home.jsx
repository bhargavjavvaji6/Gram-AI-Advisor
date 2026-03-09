import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();

  const checkAuthentication = async () => {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    const farmerId = sessionStorage.getItem('currentFarmerId');

    if (isAuthenticated && farmerId) {
      try {
        // Verify farmer still exists in backend
        const response = await axios.get(`http://localhost:5000/api/farmers/${farmerId}`);
        const farmer = response.data.data;

        // If farmer has completed land details, go to dashboard
        if (farmer.landDetails && farmer.landDetails.totalArea) {
          navigate(`/dashboard/${farmerId}`);
        } else {
          // Otherwise continue to land details
          navigate('/land-details');
        }
      } catch (error) {
        // If farmer not found, clear session and stay on home
        sessionStorage.clear();
      }
    }
  };

  useEffect(() => {
    checkAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetStarted = () => {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    
    if (isAuthenticated) {
      navigate('/land-details');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="logo-circle">
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 80 80" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M40 55V35M40 35C40 35 35 30 30 30C25 30 25 35 25 35M40 35C40 35 45 30 50 30C55 30 55 35 55 35M40 55H35C33 55 30 53 30 50V35M40 55H45C47 55 50 53 50 50V35" 
              stroke="#2c5f2d" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="home-title">Smart Farmer Advisor</h1>
        
        <p className="home-subtitle">
          Get scientific crop recommendations for your land
        </p>

        <button 
          className="get-started-btn"
          onClick={handleGetStarted}
        >
          Get Started
          <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
}

export default Home;
