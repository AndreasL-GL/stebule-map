import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Marker, useMap } from 'react-leaflet';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet/dist/leaflet.css';


function MapEventHandler({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center); 
    }
  }, [center, map]);

  return null; 
}

const colors = [
  '#8c510a', '#d8b3FF', '#f600c3',
  '#ff5502', '#00eae5', '#5ab4ac', '#01665e'
];

function getColorFromHash(hash) {
  const numericHash = typeof hash === 'number' ? hash : hash.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = numericHash % colors.length;
  return colors[index];
}

export default function LeafletMap() {
  const [points, setPoints] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isFromQ, setIsFromQ] = useState(true);
  const [tracks, setTracks] = useState([])
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
    else {
      const id = params.get('id');
      if (id){
        const url = `https://greenapps-prod.azurewebsites.net/StebuleMap?id=${id}`;
        fetch(url).then(d => d.json()).then(data => {
          const tracks = data.map(d => d.split('|').map(point => {
            const [lat,lon] = point.split(',')
            return {lat: parseFloat(lat), lon:parseFloat(lon)}
          }));
          setTracks(tracks);
          
          const coords = data.join('|').split('|').map(point => {
          const [lat, lon] = point.split(',');
          return { lat: parseFloat(lat), lon: parseFloat(lon) };
        });
        setPoints(coords);
        setIsFromQ(false);
      }).catch(e => console.log(e));
      }
    }
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
  const center = points.length > 0 ? [points[0].lat, points[0].lon] : [54.6872, 25.2797]; // Default to London if no points
  return (<>
    {/* {colors.map(c => <div style={{backgroundColor:c, borderRadius:"50%"}}>{c}</div>)} */}
    <MapContainer center={center} zoom={15} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      

      {points.length > 1 && isFromQ && <Polyline positions={polylinePoints} color="#4CAF50"/>}
      {tracks.map(t => <Polyline positions={t.map(tt => [tt.lat, tt.lon])} color={getColorFromHash(JSON.stringify(t))} width={8} stroke={8} weight={6} >
      </Polyline>)}

      {points.map((point, index) => (
        <CircleMarker key={index} center={[point.lat, point.lon]} radius={isFromQ ? 8 : 1} color="#7070AF" fillOpacity={0.8}>
          <Popup>
            <a
              href={`https://maps.apple.com/?daddr=${point.lat},${point.lon}&dirflg=d`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Navigate to this point
            </a>
          </Popup>
        </CircleMarker>
      ))}

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lon]}>
          <Popup>
            Your location
          </Popup>
        </Marker>
      )}
      <MapEventHandler center={points[Math.floor(points.length/2)]} />
    </MapContainer>
    </>
  );
}
