import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  
  // Fix location display - check all possible data sources
  let location = '—';
  if (farmerData.location && farmerData.location.village) {
    location = `${farmerData.location.village}, ${farmerData.location.city}, ${farmerData.location.state}`;
  } else if (farmerData.personalDetails) {
    // Fallback to personal details if location not in separate object
    const village = farmerData.personalDetails.village || farmerData.village || '';
    const city = farmerData.personalDetails.city || farmerData.city || '';
    const state = farmerData.personalDetails.state || farmerData.state || '';
    if (village || city || state) {
      location = [village, city, state].filter(Boolean).join(', ');
    }
  }
  
  const hasSoilReport = farmerData.soilReport && farmerData.soilReport.pH;
  const hasWaterData = farmerData.waterAvailability && farmerData.waterAvailability.availability;
  
  // Get full name from personalDetails
  const farmerName = farmerData.personalDetails?.name || 
                     farmerData.name || 
                     'Farmer';
  
  const canGetAdvice = hasSoilReport && hasWaterData;

  const handleDownloadReport = async () => {
    try {
      console.log('Starting PDF generation...');
      console.log('Farmer data:', farmerData);
      
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(44, 95, 45);
      doc.text('Gram AI Advisor - Farmer Report', 105, 20, { align: 'center' });
      
      // Farmer Details
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Farmer Information', 14, 35);
      
      doc.setFontSize(10);
      const farmerInfo = [
        ['Name', String(farmerName || 'N/A')],
        ['Phone', String(farmerData.personalDetails?.phone || farmerData.personalDetails?.phoneNumber || 'N/A')],
        ['Email', String(farmerData.personalDetails?.email || 'N/A')],
        ['Location', String(location || 'N/A')],
        ['Land Size', `${landSize} ${unit}`],
        ['Ownership', farmerData.landDetails?.isOwner ? 'Owner' : 'Tenant']
      ];
      
      console.log('Adding farmer info table...');
      autoTable(doc, {
        startY: 40,
        head: [['Field', 'Value']],
        body: farmerInfo,
        theme: 'grid',
        headStyles: { fillColor: [44, 95, 45] }
      });
      
      let yPos = doc.lastAutoTable.finalY + 10;
      
      // Soil Test Results
      if (hasSoilReport) {
        console.log('Adding soil test results...');
        doc.setFontSize(14);
        doc.text('Soil Test Results', 14, yPos);
        yPos += 5;
        
        const soilData = [
          ['Soil Type', String(farmerData.soilReport.soilType || 'N/A')],
          ['pH Level', String(farmerData.soilReport.pH || 'N/A')],
          ['Nitrogen (N)', `${farmerData.soilReport.nitrogen || 'N/A'} kg/ha`],
          ['Phosphorus (P2O5)', `${farmerData.soilReport.phosphorus || 'N/A'} kg/ha`],
          ['Potassium (K2O)', `${farmerData.soilReport.potassium || 'N/A'} kg/ha`],
          ['Organic Carbon (OC)', `${farmerData.soilReport.organicCarbon || 'N/A'} %`]
        ];
        
        autoTable(doc, {
          startY: yPos,
          head: [['Parameter', 'Value']],
          body: soilData,
          theme: 'striped',
          headStyles: { fillColor: [76, 175, 80] }
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
      }
      
      // Water Availability
      if (hasWaterData) {
        console.log('Adding water availability...');
        doc.setFontSize(14);
        doc.text('Water Availability', 14, yPos);
        yPos += 5;
        
        const waterData = [
          ['Water Source', String(farmerData.waterAvailability.source || 'N/A')],
          ['Availability Level', String(farmerData.waterAvailability.availability || 'N/A')]
        ];
        
        autoTable(doc, {
          startY: yPos,
          head: [['Parameter', 'Value']],
          body: waterData,
          theme: 'striped',
          headStyles: { fillColor: [33, 150, 243] }
        });
        
        yPos = doc.lastAutoTable.finalY + 10;
      }
      
      // Get crop recommendations
      if (canGetAdvice) {
        console.log('Fetching crop recommendations...');
        try {
          const response = await axios.post(`http://localhost:5000/api/crops/recommend/${farmerId}`, {
            soilReport: farmerData.soilReport,
            location: farmerData.location,
            landDetails: farmerData.landDetails,
            waterAvailability: farmerData.waterAvailability
          });
          
          console.log('Recommendations received:', response.data);
          const recommendations = response.data.data;
          
          // Add new page for recommendations
          doc.addPage();
          yPos = 20;
          
          doc.setFontSize(16);
          doc.setTextColor(44, 95, 45);
          doc.text('Crop Recommendations', 14, yPos);
          yPos += 10;
          
          // Crop recommendations table
          if (recommendations.landDivisionStrategy && recommendations.landDivisionStrategy.length > 0) {
            console.log('Adding crop recommendations table...');
            const cropData = recommendations.landDivisionStrategy.map(crop => [
              String(crop.cropName || 'N/A'),
              `${(crop.allocatedArea || 0).toFixed(2)} acres`,
              `${(crop.percentage || 0).toFixed(1)}%`
            ]);
            
            autoTable(doc, {
              startY: yPos,
              head: [['Crop Name', 'Allocated Area', 'Percentage']],
              body: cropData,
              theme: 'grid',
              headStyles: { fillColor: [44, 95, 45] }
            });
            
            yPos = doc.lastAutoTable.finalY + 10;
            
            // Financial Plan
            console.log('Adding financial plan...');
            doc.setFontSize(14);
            doc.text('Financial Plan', 14, yPos);
            yPos += 5;
            
            // Calculate income for each crop
            const cropIncomeData = {
              'Rice': { pricePerQuintal: 2100, yieldPerAcre: 25, costPerAcre: 35000 },
              'Wheat': { pricePerQuintal: 2015, yieldPerAcre: 20, costPerAcre: 28000 },
              'Cotton': { pricePerQuintal: 6620, yieldPerAcre: 8, costPerAcre: 45000 },
              'Tomato': { pricePerQuintal: 2500, yieldPerAcre: 200, costPerAcre: 80000 },
              'Potato': { pricePerQuintal: 1500, yieldPerAcre: 150, costPerAcre: 55000 },
              'Onion': { pricePerQuintal: 2200, yieldPerAcre: 120, costPerAcre: 48000 },
              'Maize': { pricePerQuintal: 1963, yieldPerAcre: 22, costPerAcre: 25000 },
              'Sugarcane': { pricePerQuintal: 315, yieldPerAcre: 350, costPerAcre: 85000 },
              'Radish': { pricePerQuintal: 1200, yieldPerAcre: 100, costPerAcre: 18000 },
              'Coriander': { pricePerQuintal: 6000, yieldPerAcre: 8, costPerAcre: 15000 },
              'Oat': { pricePerQuintal: 1800, yieldPerAcre: 18, costPerAcre: 20000 }
            };
            
            const financialData = [];
            let totalInvestment = 0;
            let totalGrossIncome = 0;
            let totalNetProfit = 0;
            
            recommendations.landDivisionStrategy.forEach(crop => {
              const cropInfo = cropIncomeData[crop.cropName] || { pricePerQuintal: 3000, yieldPerAcre: 15, costPerAcre: 30000 };
              const area = crop.allocatedArea || 0;
              const totalYield = cropInfo.yieldPerAcre * area;
              const grossIncome = cropInfo.pricePerQuintal * totalYield;
              const investment = cropInfo.costPerAcre * area;
              const netProfit = grossIncome - investment;
              
              totalInvestment += investment;
              totalGrossIncome += grossIncome;
              totalNetProfit += netProfit;
              
              financialData.push([
                String(crop.cropName || 'N/A'),
                `Rs ${Math.round(investment).toLocaleString('en-IN')}`,
                `Rs ${Math.round(grossIncome).toLocaleString('en-IN')}`,
                `Rs ${Math.round(netProfit).toLocaleString('en-IN')}`
              ]);
            });
            
            autoTable(doc, {
              startY: yPos,
              head: [['Crop', 'Investment', 'Gross Income', 'Net Profit']],
              body: financialData,
              theme: 'grid',
              headStyles: { fillColor: [76, 175, 80] },
              foot: [[
                'Total',
                `Rs ${Math.round(totalInvestment).toLocaleString('en-IN')}`,
                `Rs ${Math.round(totalGrossIncome).toLocaleString('en-IN')}`,
                `Rs ${Math.round(totalNetProfit).toLocaleString('en-IN')}`
              ]],
              footStyles: { fillColor: [44, 95, 45], fontStyle: 'bold' }
            });
          }
          
        } catch (error) {
          console.error('Error fetching recommendations:', error);
          // Continue with PDF generation even if recommendations fail
          doc.addPage();
          doc.setFontSize(12);
          doc.text('Crop recommendations will be available after completing all steps.', 14, 30);
        }
      }
      
      // Footer
      console.log('Adding footer...');
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Generated on ${new Date().toLocaleDateString('en-IN')} | Page ${i} of ${pageCount}`,
          105,
          285,
          { align: 'center' }
        );
        doc.text('Gram AI Advisor - Empowering Farmers', 105, 290, { align: 'center' });
      }
      
      // Save PDF
      console.log('Saving PDF...');
      const fileName = `${farmerName.replace(/\s+/g, '_')}_Farming_Report.pdf`;
      doc.save(fileName);
      
      console.log('PDF generated successfully!');
      alert('Report downloaded successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error stack:', error.stack);
      alert(`Error generating report: ${error.message}. Please check console for details.`);
    }
  };

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
        
        <div className="stat-card stat-card-action">
          <h3>Download Report</h3>
          <button 
            className="download-report-btn"
            onClick={handleDownloadReport}
            disabled={!canGetAdvice}
          >
            📄 Download PDF
          </button>
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

      <div className="dashboard-footer">
        <button 
          className="sign-out-btn"
          onClick={() => {
            sessionStorage.clear();
            navigate('/');
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
