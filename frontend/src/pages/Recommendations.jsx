import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Recommendations() {
  const { farmerId } = useParams();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [farmerId]);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/api/crops/recommend/${farmerId}`);
      setRecommendations(response.data.data);
    } catch (error) {
      alert('Failed to get recommendations: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading recommendations...</div>;
  if (!recommendations) return <div>No recommendations available</div>;

  return (
    <div className="recommendations-container">
      <h1>Crop Recommendations for Your Land</h1>

      <section className="analysis-factors">
        <h2>Analysis Factors</h2>
        <p>Soil Quality: {recommendations.factors.soilQuality}</p>
        <p>Water Availability: {recommendations.factors.waterAvailability}</p>
        <p>Climate Condition: {recommendations.factors.climateCondition}</p>
      </section>

      <section className="crop-list">
        <h2>Recommended Crops</h2>
        {recommendations.recommendations.map((crop, index) => (
          <div key={index} className="crop-card">
            <h3>{crop.cropName}</h3>
            <p>Type: {crop.cropType}</p>
            <p>Suitability Score: {crop.suitabilityScore}%</p>
            <p>Water Requirement: {crop.waterRequirement}</p>
            <p>Growth Duration: {crop.growthDuration}</p>
            <p>Best Seasons: {crop.seasonalSuitability.join(', ')}</p>
          </div>
        ))}
      </section>

      <section className="land-division">
        <h2>Suggested Land Division Strategy</h2>
        <p>To maximize income, consider dividing your land as follows:</p>
        {recommendations.landDivisionStrategy.map((division, index) => (
          <div key={index} className="division-card">
            <h3>{division.cropName}</h3>
            <p>Allocated Area: {division.allocatedArea.toFixed(2)} acres</p>
            <p>Percentage: {division.percentage.toFixed(1)}%</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Recommendations;
