import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LandMapping() {
  const { farmerId } = useParams();
  const navigate = useNavigate();
  const [coordinates, setCoordinates] = useState([]);
  const [area, setArea] = useState(0);
  const [areaInCents, setAreaInCents] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonRef = useRef(null);
  const markersRef = useRef([]);
  const currentLocationMarkerRef = useRef(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          initializeMap(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to get your location. Using default location.');
          initializeMap(20.5937, 78.9629);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser');
      initializeMap(20.5937, 78.9629);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Calculate area whenever coordinates change
  useEffect(() => {
    console.log('Coordinates changed, length:', coordinates.length, coordinates);
    
    if (coordinates.length >= 3) {
      const areaInSqMeters = calculatePolygonArea(coordinates);
      const areaInAcres = parseFloat((areaInSqMeters / 4046.86).toFixed(3));
      const areaInCentsCalc = parseFloat((areaInSqMeters / 40.4686).toFixed(2));
      
      console.log('Area calculated:', {
        sqMeters: areaInSqMeters,
        acres: areaInAcres,
        cents: areaInCentsCalc
      });
      
      setArea(areaInAcres);
      setAreaInCents(areaInCentsCalc);
    } else {
      setArea(0);
      setAreaInCents(0);
    }
  }, [coordinates]);

  const initializeMap = (lat, lng) => {
    if (!mapInstanceRef.current && mapRef.current) {
      console.log('Initializing map at:', lat, lng);
      
      const map = L.map(mapRef.current).setView([lat, lng], 18); // Higher zoom for land measurement

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 20,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add current location marker
      if (currentLocation || (lat !== 20.5937 && lng !== 78.9629)) {
        const locationIcon = L.divIcon({
          className: 'current-location-marker',
          html: '<div class="location-pulse"></div>',
          iconSize: [20, 20]
        });

        currentLocationMarkerRef.current = L.marker([lat, lng], { icon: locationIcon })
          .addTo(map)
          .bindPopup('📍 Your Current Location')
          .openPopup();
      }

      // Add click event to map
      map.on('click', (e) => {
        console.log('Map clicked at:', e.latlng);
        const { lat, lng } = e.latlng;
        addMarker(lat, lng);
      });
      
      console.log('Map initialized successfully');
    }
  };

  const recenterMap = () => {
    if (currentLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([currentLocation.lat, currentLocation.lng], 18);
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.openPopup();
      }
    }
  };

  const addMarker = (lat, lng) => {
    if (coordinates.length >= 4) {
      alert('Maximum 4 boundary points allowed. Clear points to start over.');
      return;
    }

    const newCoord = { lat, lng };
    
    // Add numbered marker
    const markerNumber = coordinates.length + 1;
    const numberIcon = L.divIcon({
      className: 'numbered-marker',
      html: `<div class="marker-number">${markerNumber}</div>`,
      iconSize: [30, 30]
    });

    const marker = L.marker([lat, lng], { icon: numberIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup(`Point ${markerNumber}: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    
    markersRef.current.push(marker);

    // Update coordinates state
    setCoordinates(prevCoords => {
      const updatedCoords = [...prevCoords, newCoord];
      console.log('Coordinates updated:', updatedCoords);
      
      // Update polygon immediately
      if (updatedCoords.length >= 3) {
        updatePolygon(updatedCoords);
      } else if (updatedCoords.length === 2) {
        // Draw a line between first two points
        if (polygonRef.current) {
          mapInstanceRef.current.removeLayer(polygonRef.current);
        }
        const line = L.polyline([
          [updatedCoords[0].lat, updatedCoords[0].lng],
          [updatedCoords[1].lat, updatedCoords[1].lng]
        ], {
          color: '#2c5f2d',
          weight: 3,
          dashArray: '5, 10'
        }).addTo(mapInstanceRef.current);
        polygonRef.current = line;
      }
      
      return updatedCoords;
    });
  };

  const updatePolygon = (coords) => {
    // Remove existing polygon
    if (polygonRef.current) {
      mapInstanceRef.current.removeLayer(polygonRef.current);
    }

    if (coords.length >= 3) {
      // Create polygon
      const latlngs = coords.map(c => [c.lat, c.lng]);
      const polygon = L.polygon(latlngs, {
        color: '#2c5f2d',
        fillColor: '#4a7c4e',
        fillOpacity: 0.3,
        weight: 3
      }).addTo(mapInstanceRef.current);

      polygonRef.current = polygon;

      // Fit map to polygon bounds
      mapInstanceRef.current.fitBounds(polygon.getBounds(), { padding: [50, 50] });
    }
  };

  // Calculate polygon area using spherical law of cosines
  const calculatePolygonArea = (coords) => {
    if (coords.length < 3) return 0;
    
    let area = 0;
    const R = 6371000; // Earth's radius in meters

    for (let i = 0; i < coords.length; i++) {
      const p1 = coords[i];
      const p2 = coords[(i + 1) % coords.length];
      
      const lat1 = p1.lat * Math.PI / 180;
      const lat2 = p2.lat * Math.PI / 180;
      const lng1 = p1.lng * Math.PI / 180;
      const lng2 = p2.lng * Math.PI / 180;
      
      area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    
    area = Math.abs(area * R * R / 2);
    return area;
  };

  const clearMarkers = () => {
    // Remove all markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Remove polygon
    if (polygonRef.current) {
      mapInstanceRef.current.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }

    setCoordinates([]);
    setArea(0);
    setAreaInCents(0);
  };

  const handleSave = async () => {
    if (coordinates.length < 3) {
      alert('Please mark at least 3 points to define your land boundary');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/farmers/${farmerId}/land-mapping`, {
        coordinates,
        area,
        areaInCents
      });
      
      // Navigate to soil report
      navigate(`/soil-report/${farmerId}`);
    } catch (error) {
      console.error('Error saving land mapping:', error);
      // Continue anyway
      navigate(`/soil-report/${farmerId}`);
    }
  };

  const handleSkip = () => {
    navigate(`/soil-report/${farmerId}`);
  };

  return (
    <div className="land-mapping-container">
      <h1>Map Your Land</h1>
      <p className="subtitle">Mark 3-4 boundary points of your land</p>

      {locationError && (
        <div className="location-warning">
          ⚠️ {locationError}
        </div>
      )}

      {currentLocation && (
        <div className="location-info">
          ✅ Location detected: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
        </div>
      )}

      <div className="map-instructions">
        <div className="instruction-item">
          <span className="instruction-icon">📍</span>
          <span>Walk to each corner and click to mark points</span>
        </div>
        <div className="instruction-item">
          <span className="instruction-icon">🗺️</span>
          <span>Mark 3-4 boundary points (corners of your land)</span>
        </div>
        <div className="instruction-item">
          <span className="instruction-icon">📏</span>
          <span>Area calculated automatically in acres & cents</span>
        </div>
      </div>

      <div className="map-controls">
        {currentLocation && (
          <button type="button" className="btn-location" onClick={recenterMap}>
            📍 My Location
          </button>
        )}
        <button 
          type="button" 
          className="btn-secondary" 
          onClick={() => {
            console.log('Current state:', {
              coordinates: coordinates,
              coordinatesLength: coordinates.length,
              area: area,
              areaInCents: areaInCents,
              markers: markersRef.current.length
            });
            alert(`Coordinates: ${coordinates.length}\nMarkers: ${markersRef.current.length}\nArea: ${area} acres`);
          }}
        >
          🔍 Debug Info
        </button>
      </div>
      
      <div ref={mapRef} className="map-container"></div>

      <div className="map-info">
        <div className="info-card">
          <h3>Marked Points</h3>
          <p className="info-value">{coordinates.length}<span className="info-unit">/4</span></p>
          <small className="info-hint">
            {coordinates.length === 0 && 'Click on map to add points'}
            {coordinates.length === 1 && 'Add 2 more points to calculate area'}
            {coordinates.length === 2 && 'Add 1 more point to calculate area'}
            {coordinates.length >= 3 && '✓ Area calculated!'}
          </small>
        </div>
        <div className={`info-card ${area > 0 ? 'highlight' : ''}`}>
          <h3>Area (Acres)</h3>
          <p className="info-value">{area > 0 ? area.toFixed(3) : '0.000'}</p>
          <small className="info-hint">acres</small>
        </div>
        <div className={`info-card ${areaInCents > 0 ? 'highlight' : ''}`}>
          <h3>Area (Cents)</h3>
          <p className="info-value">{areaInCents > 0 ? areaInCents.toFixed(2) : '0.00'}</p>
          <small className="info-hint">cents (1 acre = 100 cents)</small>
        </div>
      </div>

      {coordinates.length > 0 && (
        <div className="coordinates-list">
          <h3>Boundary Points:</h3>
          <div className="points-grid">
            {coordinates.map((coord, index) => (
              <div key={index} className="point-item">
                <span className="point-number">{index + 1}</span>
                <span className="point-coords">
                  {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="map-actions">
        <button type="button" className="btn-clear" onClick={clearMarkers}>
          Clear All Points
        </button>
        <button type="button" className="btn-secondary" onClick={handleSkip}>
          Skip for Now
        </button>
        <button 
          type="button" 
          className="btn-primary" 
          onClick={handleSave}
          disabled={coordinates.length < 3}
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}

export default LandMapping;
