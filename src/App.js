import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Marker } from 'react-leaflet';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet/dist/leaflet.css';

export default function LeafletMap() {
  const [points, setPoints] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef<LeafletMap | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query) {
      const coords = query.split('|').map(point => {
        const [lat, lon] = point.split(',');
        return { lat: parseFloat(lat), lon: parseFloat(lon) };
      });
      setPoints(coords);
    }
  }, []);
  useEffect(() => {
    if (mapRef.current && userLocation){
      mapRef.center = Object.values(userLocation)
    }
  },[mapRef?.current, userLocation])

  useEffect(() => {
    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      });
    };

    updateLocation();
    const intervalId = setInterval(updateLocation, 5000); 

    return () => clearInterval(intervalId); 
  }, []);

  const polylinePoints = points.map(point => [point.lat, point.lon]);

  return (
    <MapContainer ref={mapRef} center={[57.6872946, 11.9974029]} zoom={15} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      

      {points.length > 1 && <Polyline positions={polylinePoints} color="#4CAF50" />}

      {points.map((point, index) => (
        <CircleMarker key={index} center={[point.lat, point.lon]} radius={8} color="#FF5722" fillOpacity={0.8}>
          <Popup>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lon}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Navigate to this point
            </a>
          </Popup>
        </CircleMarker>
      ))}

      {/* Add user location marker */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lon]}>
          <Popup>
            Your location
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
