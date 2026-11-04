import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Game Location</Popup>
    </Marker>
  );
}

export function GamesPage() {
  const [position, setPosition] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleCreate = async () => {
    if (!position) return alert('Please click on the map to select a location');
    // API call to backend
    const payload = {
      title, description: desc, startTime, endTime,
      location: { type: 'Point', coordinates: [position.lng, position.lat] },
      rewardCardId: "REPLACE_WITH_CARD_ID" // Later make this a dropdown
    };
    await fetch(`${import.meta.env.VITE_API_URL}/admin/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('propeller_admin_token')}` },
      body: JSON.stringify(payload)
    });
    alert('Game Created!');
  };

  return (
    <div style={{ display: 'flex', gap: 20, height: '80vh' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h1>Create Location Game</h1>
        <input placeholder="Game Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="Task Description" value={desc} onChange={e => setDesc(e.target.value)} />
        <label>Start Time</label>
        <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
        <label>End Time (Deadline)</label>
        <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
        <button className="primary" onClick={handleCreate}>Submit Game</button>
      </div>
      <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}>
        <MapContainer center={[11.1271, 78.6569]} zoom={7} style={{ height: '100%', width: '100%' }}>
          {/* Free OpenStreetMap Tiles - No API Key Required */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
    </div>
  );
}
