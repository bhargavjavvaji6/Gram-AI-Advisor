import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Crop income data (per acre in INR)
const cropIncomeData = {
  'Rice': { pricePerQuintal: 2100, yieldPerAcre: 25, duration: '120-150 days' },
  'Wheat': { pricePerQuintal: 2015, yieldPerAcre: 20, duration: '120-150 days' },
  'Cotton': { pricePerQuintal: 6620, yieldPerAcre: 8, duration: '150-180 days' },
  'Sugarcane': { pricePerQuintal: 315, yieldPerAcre: 350, duration: '12-18 months' },
  'Maize': { pricePerQuintal: 1963, yieldPerAcre: 22, duration: '90-120 days' },
  'Groundnut': { pricePerQuintal: 5885, yieldPerAcre: 12, duration: '100-150 days' },
  'Soybean': { pricePerQuintal: 4300, yieldPerAcre: 10, duration: '90-120 days' },
  'Tomato': { pricePerQuintal: 2500, yieldPerAcre: 200, duration: '60-90 days' },
  'Potato': { pricePerQuintal: 1500, yieldPerAcre: 150, duration: '90-120 days' },
  'Onion': { pricePerQuintal: 2200, yieldPerAcre: 120, duration: '120-150 days' },
  'Cabbage': { pricePerQuintal: 1800, yieldPerAcre: 180, duration: '90-120 days' },
  'Cauliflower': { pricePerQuintal: 2000, yieldPerAcre: 160, duration: '90-120 days' },
  'Radish': { pricePerQuintal: 1200, yieldPerAcre: 100, duration: '30-45 days' },
  'Carrot': { pricePerQuintal: 2500, yieldPerAcre: 120, duration: '90-120 days' },
  'Brinjal': { pricePerQuintal: 2000, yieldPerAcre: 140, duration: '120-150 days' },
  'Chilli': { pricePerQuintal: 8000, yieldPerAcre: 15, duration: '150-180 days' },
  'Turmeric': { pricePerQuintal: 7500, yieldPerAcre: 25, duration: '7-9 months' },
  'Ginger': { pricePerQuintal: 10000, yieldPerAcre: 50, duration: '8-10 months' }
};

// Government schemes
const governmentSchemes = [
  {
    name: 'Prime Minister Matsya Sampada Yojana',
    description: 'Financial assistance for fisheries and aquaculture',
    subsidy: '40-60% of project cost',
    maxAmount: '₹60 lakhs',
    eligibility: 'Fish farmers, entrepreneurs',
    benefits: 'Infrastructure development, training, marketing support',
    applyUrl: 'https://pmmsy.dof.gov.in/'
  },
  {
    name: 'PM-KUSUM Scheme',
    description: 'Solar pump installation and grid-connected solar power',
    subsidy: '60% of cost (30% central + 30% state)',
    maxAmount: '₹7.5 lakhs per pump',
    eligibility: 'Individual farmers, cooperatives',
    benefits: 'Reduced electricity cost, additional income from solar power',
    applyUrl: 'https://pmkusum.mnre.gov.in/'
  },
  {
    name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    description: 'Financial assistance for farm machinery and equipment',
    subsidy: '40-50% of cost',
    maxAmount: '₹1.25 lakhs',
    eligibility: 'Small and marginal farmers',
    benefits: 'Tractors, harvesters, sprayers at subsidized rates',
    applyUrl: 'https://agrimachinery.nic.in/'
  },
  {
    name: 'National Agriculture Market (e-NAM)',
    description: 'Online trading platform for agricultural commodities',
    subsidy: 'Free registration and trading',
    maxAmount: 'No limit',
    eligibility: 'All farmers',
    benefits: 'Better price discovery, transparent auction, online payment',
    applyUrl: 'https://www.enam.gov.in/'
  }
];

function Recommendations() {
  const { farmerId } = useParams();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showSchemes, setShowSchemes] = useState(false);
  const [showAllCrops, setShowAllCrops] = useState(false);

  const handleApplyScheme = (scheme) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `You are about to apply for:\n\n${scheme.name}\n\n` +
      `Subsidy: ${scheme.subsidy}\n` +
      `Max Amount: ${scheme.maxAmount}\n\n` +
      `You will be redirected to the official government portal. Continue?`
    );
    
    if (confirmed) {
      // Open the scheme's official website in a new tab
      window.open(scheme.applyUrl, '_blank', 'noopener,noreferrer');
      
      // Show success message
      setTimeout(() => {
        alert(
          `Application process started!\n\n` +
          `Please complete the application on the official portal.\n\n` +
          `Required documents:\n` +
          `• Aadhaar Card\n` +
          `• Land ownership documents\n` +
          `• Bank account details\n` +
          `• Passport size photo\n\n` +
          `For assistance, contact your local agriculture office.`
        );
      }, 500);
    }
  };

  useEffect(() => {
    if (farmerId) {
      // Always fetch fresh recommendations when page loads
      // This ensures we use the latest soil and water data
      fetchRecommendations();
    }
  }, [farmerId]); // Added dependency

  const fetchRecommendations = async () => {
    try {
      // Get farmer data first to pass soil/water info
      const farmerResponse = await axios.get(`http://localhost:5000/api/farmers/${farmerId}`);
      const farmerData = farmerResponse.data.data;
      
      // Pass farmer's actual soil and water data to get personalized recommendations
      const response = await axios.post(`http://localhost:5000/api/crops/recommend/${farmerId}`, {
        soilReport: farmerData.soilReport,
        location: farmerData.location,
        landDetails: farmerData.landDetails,
        waterAvailability: farmerData.waterAvailability
      });
      
      console.log('Recommendations received:', response.data.data);
      setRecommendations(response.data.data);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      alert('Failed to get recommendations: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateIncome = (cropName, area) => {
    const cropData = cropIncomeData[cropName];
    if (!cropData) {
      return { 
        gross: 0, 
        cost: 0, 
        net: 0, 
        duration: 'N/A', 
        yield: 0, 
        price: 0 
      };
    }

    const grossIncome = cropData.pricePerQuintal * cropData.yieldPerAcre * area;
    const cultivationCost = grossIncome * 0.4; // Assume 40% cultivation cost
    const netIncome = grossIncome - cultivationCost;

    return {
      gross: grossIncome,
      cost: cultivationCost,
      net: netIncome,
      duration: cropData.duration,
      yield: cropData.yieldPerAcre * area,
      price: cropData.pricePerQuintal
    };
  };

  const calculateSchemeIncome = (netIncome, scheme) => {
    let subsidyAmount = 0;
    
    switch(scheme.name) {
      case 'PM-KUSUM Scheme':
        // Assume 30% additional income from solar power
        subsidyAmount = netIncome * 0.30;
        break;
      case 'Sub-Mission on Agricultural Mechanization (SMAM)':
        // Assume 15% cost reduction through mechanization
        subsidyAmount = netIncome * 0.15;
        break;
      case 'National Agriculture Market (e-NAM)':
        // Assume 10% better price through e-NAM
        subsidyAmount = netIncome * 0.10;
        break;
      default:
        subsidyAmount = 0;
    }
    
    return subsidyAmount;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleBackToDashboard = () => {
    navigate(`/dashboard/${farmerId}`);
  };

  if (loading) {
    return (
      <div className="recommendations-container">
        <div className="loading">Loading recommendations...</div>
      </div>
    );
  }

  if (!recommendations || !recommendations.recommendations || recommendations.recommendations.length === 0) {
    return (
      <div className="recommendations-container">
        <div className="recommendations-header">
          <button className="back-btn" onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </button>
          <h1>🌾 Crop Recommendations for Your Land</h1>
        </div>
        <div className="error-message">
          <p>No recommendations available. Please complete your soil report first.</p>
          <button onClick={handleBackToDashboard}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const totalIncome = recommendations?.landDivisionStrategy?.reduce((sum, division) => {
    const income = calculateIncome(division.cropName, division.allocatedArea);
    return sum + income.net;
  }, 0) || 0;

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <button className="back-btn" onClick={handleBackToDashboard}>
          ← Back to Dashboard
        </button>
        <h1>🌾 Crop Recommendations for Your Land</h1>
      </div>

      <section className="analysis-factors">
        <h2>Analysis Factors</h2>
        <div className="factors-grid">
          <div className="factor-card">
            <span className="factor-icon">🌱</span>
            <div>
              <p className="factor-label">Soil Quality</p>
              <p className="factor-value">{recommendations?.factors?.soilQuality || 'N/A'}</p>
            </div>
          </div>
          <div className="factor-card">
            <span className="factor-icon">💧</span>
            <div>
              <p className="factor-label">Water Availability</p>
              <p className="factor-value">{recommendations?.factors?.waterAvailability || 'N/A'}</p>
            </div>
          </div>
          <div className="factor-card">
            <span className="factor-icon">🌤️</span>
            <div>
              <p className="factor-label">Climate Condition</p>
              <p className="factor-value">{recommendations?.factors?.climateCondition || 'N/A'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="income-summary">
        <h2>💰 Estimated Total Annual Income</h2>
        <div className="income-card-large">
          <p className="income-amount">{formatCurrency(totalIncome)}</p>
          <p className="income-subtitle">Net income from all recommended crops</p>
        </div>
      </section>

      <section className="crop-list">
        <h2>Your Personalized Crop Plan</h2>
        <p className="section-subtitle">Based on your {recommendations?.landDivisionStrategy?.reduce((sum, d) => sum + (d.allocatedArea || 0), 0).toFixed(1) || 0} acres of land</p>
        
        <div className="main-recommendations">
          <h3>🌟 Main Recommended Crops</h3>
          {recommendations?.landDivisionStrategy?.map((division, index) => {
          const income = calculateIncome(division.cropName, division.allocatedArea);
          // Find the crop details from recommendations
          const cropDetails = recommendations?.recommendations?.find(c => c.cropName === division.cropName);
          
          return (
            <div 
              key={index} 
              className={`crop-card-enhanced ${selectedCrop === division.cropName ? 'selected' : ''}`}
              onClick={() => setSelectedCrop(selectedCrop === division.cropName ? null : division.cropName)}
            >
              <div className="crop-header">
                <div className="crop-title-section">
                  <h3>{division.cropName}</h3>
                  <p className="allocated-land">
                    <span className="land-icon">📏</span>
                    {division.allocatedArea?.toFixed(1) || 0} acres ({division.percentage?.toFixed(0) || 0}% of your land)
                  </p>
                </div>
                <span className="suitability-badge">{cropDetails?.suitabilityScore || 100}% Match</span>
              </div>
              
              <div className="crop-details-grid">
                <div className="crop-detail">
                  <span className="detail-icon">🌾</span>
                  <div>
                    <p className="detail-label">Type</p>
                    <p className="detail-value">{cropDetails?.cropType || 'Crop'}</p>
                  </div>
                </div>
                <div className="crop-detail">
                  <span className="detail-icon">💧</span>
                  <div>
                    <p className="detail-label">Water Need</p>
                    <p className="detail-value">{cropDetails?.waterRequirement || 'Medium'}</p>
                  </div>
                </div>
                <div className="crop-detail">
                  <span className="detail-icon">⏱️</span>
                  <div>
                    <p className="detail-label">Duration</p>
                    <p className="detail-value">{income.duration}</p>
                  </div>
                </div>
                <div className="crop-detail">
                  <span className="detail-icon">📅</span>
                  <div>
                    <p className="detail-label">Best Season</p>
                    <p className="detail-value">{cropDetails?.seasonalSuitability?.join(', ') || 'All seasons'}</p>
                  </div>
                </div>
              </div>

              <div className="income-projection">
                <h4>Income Projection for {division.allocatedArea?.toFixed(1) || 0} Acres</h4>
                <div className="income-breakdown">
                  <div className="income-row">
                    <span>Expected Yield:</span>
                    <span className="income-value">{income.yield?.toFixed(1) || 0} quintals</span>
                  </div>
                  <div className="income-row">
                    <span>Market Price:</span>
                    <span className="income-value">{formatCurrency(income.price)}/quintal</span>
                  </div>
                  <div className="income-row">
                    <span>Gross Income:</span>
                    <span className="income-value">{formatCurrency(income.gross)}</span>
                  </div>
                  <div className="income-row">
                    <span>Cultivation Cost:</span>
                    <span className="income-value negative">-{formatCurrency(income.cost)}</span>
                  </div>
                  <div className="income-row total">
                    <span>Net Income:</span>
                    <span className="income-value positive">{formatCurrency(income.net)}</span>
                  </div>
                </div>
              </div>

              {selectedCrop === division.cropName && (
                <div className="crop-expanded">
                  <div className="why-recommended">
                    <h4>Why This Crop?</h4>
                    <ul>
                      <li>✓ Matches your soil type: {recommendations?.factors?.soilQuality || 'Good'}</li>
                      <li>✓ Suitable for water availability: {recommendations?.factors?.waterAvailability || 'Medium'}</li>
                      <li>✓ Ideal for climate: {recommendations?.factors?.climateCondition || 'Favorable'}</li>
                      <li>✓ High profitability: {formatCurrency(income.net)} net income</li>
                    </ul>
                  </div>
                  <button 
                    className="view-schemes-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSchemes(true);
                    }}
                  >
                    View Government Schemes →
                  </button>
                </div>
              )}
            </div>
          );
        }) || <p>No crop recommendations available</p>}
        </div>

        {/* Additional Crops Section */}
        {recommendations?.recommendations && recommendations.recommendations.length > 3 && (
          <div className="additional-crops-section">
            <button 
              className="toggle-crops-btn"
              onClick={() => setShowAllCrops(!showAllCrops)}
            >
              {showAllCrops ? '− Hide' : '+ Show'} Additional Suitable Crops ({recommendations.recommendations.length - 3} more)
            </button>
            
            {showAllCrops && (
              <div className="additional-crops-grid">
                <h3>Other Suitable Crops for Your Land</h3>
                <p className="additional-subtitle">These crops also match your soil and water conditions</p>
                
                {recommendations.recommendations
                  .filter(crop => !recommendations.landDivisionStrategy.some(d => d.cropName === crop.cropName))
                  .map((crop, index) => (
                    <div key={index} className="additional-crop-card">
                      <div className="additional-crop-header">
                        <h4>{crop.cropName}</h4>
                        <span className="suitability-badge-small">{crop.suitabilityScore}%</span>
                      </div>
                      <div className="additional-crop-info">
                        <p><span className="info-icon">🌾</span> {crop.cropType}</p>
                        <p><span className="info-icon">💧</span> {crop.waterRequirement} water</p>
                        <p><span className="info-icon">⏱️</span> {crop.growthDuration}</p>
                        <p><span className="info-icon">📈</span> {crop.marketDemand} demand</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="income-summary-final">
        <h2>� Your Total Estimated Income</h2>
        <div className="income-card-large">
          <p className="income-amount">{formatCurrency(totalIncome)}</p>
          <p className="income-subtitle">Net annual income from all recommended crops</p>
          <p className="income-note">* Prices are indicative and may vary based on market conditions</p>
        </div>
      </section>

      {showSchemes && (
        <div className="schemes-modal" onClick={() => setShowSchemes(false)}>
          <div className="schemes-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowSchemes(false)}>×</button>
            
            <h2>🏛️ Government Schemes for Farmers</h2>
            <p className="schemes-intro">Apply for these schemes to increase your income and reduce costs</p>

            <div className="schemes-grid">
              {governmentSchemes.map((scheme, index) => {
                const additionalIncome = calculateSchemeIncome(totalIncome, scheme);
                return (
                  <div key={index} className="scheme-card">
                    <h3>{scheme.name}</h3>
                    <p className="scheme-description">{scheme.description}</p>
                    
                    <div className="scheme-details">
                      <div className="scheme-row">
                        <span className="scheme-label">Subsidy:</span>
                        <span className="scheme-value">{scheme.subsidy}</span>
                      </div>
                      <div className="scheme-row">
                        <span className="scheme-label">Max Amount:</span>
                        <span className="scheme-value">{scheme.maxAmount}</span>
                      </div>
                      <div className="scheme-row">
                        <span className="scheme-label">Eligibility:</span>
                        <span className="scheme-value">{scheme.eligibility}</span>
                      </div>
                      {additionalIncome > 0 && (
                        <div className="scheme-row highlight">
                          <span className="scheme-label">Potential Benefit:</span>
                          <span className="scheme-value positive">+{formatCurrency(additionalIncome)}/year</span>
                        </div>
                      )}
                    </div>

                    <div className="scheme-benefits">
                      <p className="benefits-label">Benefits:</p>
                      <p>{scheme.benefits}</p>
                    </div>

                    <button 
                      className="apply-scheme-btn"
                      onClick={() => handleApplyScheme(scheme)}
                    >
                      Apply Now →
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="final-income-projection">
              <h3>Final Income After Government Schemes</h3>
              <div className="final-income-breakdown">
                <div className="final-row">
                  <span>Base Income:</span>
                  <span>{formatCurrency(totalIncome)}</span>
                </div>
                {governmentSchemes.map((scheme, index) => {
                  const benefit = calculateSchemeIncome(totalIncome, scheme);
                  if (benefit > 0) {
                    return (
                      <div key={index} className="final-row">
                        <span>{scheme.name}:</span>
                        <span className="positive">+{formatCurrency(benefit)}</span>
                      </div>
                    );
                  }
                  return null;
                })}
                <div className="final-row total">
                  <span>Total Potential Income:</span>
                  <span className="final-amount">
                    {formatCurrency(totalIncome + governmentSchemes.reduce((sum, scheme) => 
                      sum + calculateSchemeIncome(totalIncome, scheme), 0
                    ))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recommendations;
