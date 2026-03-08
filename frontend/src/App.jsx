import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PersonalDetails from './pages/PersonalDetails';
import LandDetails from './pages/LandDetails';
import WaterAvailability from './pages/WaterAvailability';
import Dashboard from './pages/Dashboard';
import LandMapping from './pages/LandMapping';
import SoilReport from './pages/SoilReport';
import Recommendations from './pages/Recommendations';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registration" element={<PersonalDetails />} />
          <Route path="/personal-details" element={<PersonalDetails />} />
          <Route path="/land-details" element={<LandDetails />} />
          <Route path="/water-availability" element={<WaterAvailability />} />
          <Route path="/dashboard/:farmerId" element={<Dashboard />} />
          <Route path="/land-mapping/:farmerId" element={<LandMapping />} />
          <Route path="/soil-report/:farmerId" element={<SoilReport />} />
          <Route path="/recommendations/:farmerId" element={<Recommendations />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
