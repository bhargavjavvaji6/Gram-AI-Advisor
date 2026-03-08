import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    personalDetails: { name: '', phoneNumber: '', email: '' },
    location: { state: '', city: '', village: '' },
    landDetails: { totalArea: '', unit: 'acres', isOwner: true, ownerName: '' },
    waterAvailability: { source: 'borewell', availability: 'medium' }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/farmers/register', formData);
      const farmerId = response.data.data._id;
      navigate(`/land-mapping/${farmerId}`);
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
  };

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  return (
    <div className="registration-container">
      <h1>Farmer Registration</h1>
      <form onSubmit={handleSubmit}>
        <section>
          <h2>Personal Details</h2>
          <input
            type="text"
            placeholder="Name"
            required
            value={formData.personalDetails.name}
            onChange={(e) => handleChange('personalDetails', 'name', e.target.value)}
          />
          <input
            type="tel"
            placeholder="Phone Number"
            required
            value={formData.personalDetails.phoneNumber}
            onChange={(e) => handleChange('personalDetails', 'phoneNumber', e.target.value)}
          />
          <input
            type="email"
            placeholder="Email (Optional)"
            value={formData.personalDetails.email}
            onChange={(e) => handleChange('personalDetails', 'email', e.target.value)}
          />
        </section>

        <section>
          <h2>Location</h2>
          <input
            type="text"
            placeholder="State"
            required
            value={formData.location.state}
            onChange={(e) => handleChange('location', 'state', e.target.value)}
          />
          <input
            type="text"
            placeholder="City"
            required
            value={formData.location.city}
            onChange={(e) => handleChange('location', 'city', e.target.value)}
          />
          <input
            type="text"
            placeholder="Village/Town"
            required
            value={formData.location.village}
            onChange={(e) => handleChange('location', 'village', e.target.value)}
          />
        </section>

        <section>
          <h2>Land Details</h2>
          <input
            type="number"
            placeholder="Total Area"
            required
            value={formData.landDetails.totalArea}
            onChange={(e) => handleChange('landDetails', 'totalArea', e.target.value)}
          />
          <select
            value={formData.landDetails.unit}
            onChange={(e) => handleChange('landDetails', 'unit', e.target.value)}
          >
            <option value="acres">Acres</option>
            <option value="cents">Cents</option>
          </select>
          <label>
            <input
              type="checkbox"
              checked={formData.landDetails.isOwner}
              onChange={(e) => handleChange('landDetails', 'isOwner', e.target.checked)}
            />
            I am the land owner
          </label>
          {!formData.landDetails.isOwner && (
            <input
              type="text"
              placeholder="Owner Name"
              value={formData.landDetails.ownerName}
              onChange={(e) => handleChange('landDetails', 'ownerName', e.target.value)}
            />
          )}
        </section>

        <section>
          <h2>Water Availability</h2>
          <select
            value={formData.waterAvailability.source}
            onChange={(e) => handleChange('waterAvailability', 'source', e.target.value)}
          >
            <option value="borewell">Borewell</option>
            <option value="canal">Canal</option>
            <option value="river">River</option>
            <option value="rain">Rain</option>
            <option value="mixed">Mixed</option>
          </select>
          <select
            value={formData.waterAvailability.availability}
            onChange={(e) => handleChange('waterAvailability', 'availability', e.target.value)}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </section>

        <button type="submit">Next: Land Mapping</button>
      </form>
    </div>
  );
}

export default Registration;
