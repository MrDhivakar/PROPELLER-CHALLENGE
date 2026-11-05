import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LeafletMouseEvent, icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { listCards, listGames, getLiveParticipants, declareWinner, createGame } from '../api/client';

const defaultIcon = icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

function LocationMarker({ position, setPosition, setAddress }: any) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      setPosition(e.latlng);
      // Fetch Auto Address from OpenStreetMap (Free, No API Key)
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(res => res.json())
        .then(data => {
          const addr = data.address;
          setAddress({
            country: addr.country || 'Unknown',
            state: addr.state || 'Unknown',
            district: addr.state_district || addr.county || addr.city || 'Unknown'
          });
        })
        .catch(() => setAddress({ country: 'Unknown', state: 'Unknown', district: 'Unknown' }));
    }
  });
  return position ? <Marker position={position} icon={defaultIcon}><Popup>Game Location</Popup></Marker> : null;
}

export function GamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  
  const [position, setPosition] = useState<any>(null);
  const [address, setAddress] = useState({ country: 'Click map', state: 'to load', district: 'address' });
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [rewardCardId, setRewardCardId] = useState('');

  useEffect(() => {
    listGames().then(r => setGames(r.games)).catch(console.error);
    listCards().then(r => setCards(r.cards)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedGame) return;
    const interval = setInterval(() => {
      getLiveParticipants(selectedGame).then(r => setParticipants(r.participants)).catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedGame]);

  const handleCreateGame = async () => {
    if (!position || !rewardCardId) return alert('Select location and reward card');
    
    // FIXED TYPES: Casting coordinates to tuple
    const payload = {
      title, 
      description: desc, 
      startTime, 
      endTime, 
      rewardCardId, 
      address,
      location: { 
        type: 'Point', 
        coordinates: [position.lng, position.lat] as [number, number] 
      }
    };
    
    try {
      await createGame(payload);
      alert('Game Created!');
      listGames().then(r => setGames(r.games));
    } catch (err: any) {
      alert(err.message || 'Failed to create game');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 20, height: '85vh' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, background: '#151A22', padding: 20, borderRadius: 12, overflowY: 'auto' }}>
        <h1>Create Live Game</h1>
        <input placeholder="Game Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="Task Description" value={desc} onChange={e => setDesc(e.target.value)} />
        
        <div style={{ padding: 10, background: '#0F141B', borderRadius: 8, fontSize: 12 }}>
          <b>Auto Address:</b> {address.district}, {address.state}, {address.country}
        </div>

        <label>Start Time</label>
        <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
        
        <label>End Time</label>
        <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
        
        <label>Reward Card</label>
        <select value={rewardCardId} onChange={e => setRewardCardId(e.target.value)}>
          <option value="">Select Reward Card...</option>
          {cards.map(c => <option key={c._id} value={c._id}>Lvl {c.level} - {c.name}</option>)}
        </select>
        <button className="primary" onClick={handleCreateGame}>Create Game</button>
        
        <hr style={{ borderColor: '#333', width: '100%' }} />
        
        <h2>Live Participants</h2>
        {!selectedGame ? <p>Select a game from map to see live users</p> : (
          <div>
            {participants.map(p => (
              <div key={p._id} style={{ background: '#0F141B', padding: 10, marginBottom: 5, borderRadius: 8 }}>
                <b>{p.userId?.displayName}</b> ({p.status})
                {!p.isWinner && p.status !== 'winner' && (
                  <button style={{ marginLeft: 10, padding: '2px 8px' }} onClick={() => declareWinner(selectedGame, p._id)}>Mark Winner</button>
                )}
                {p.isWinner && <span style={{ color: 'gold', marginLeft: 10 }}>🏆 WINNER</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 2, borderRadius: 12, overflow: 'hidden' }}>
        <MapContainer center={[11.1271, 78.6569]} zoom={7} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} />
          
          {games.map(g => (
            <Marker key={g._id} position={[g.location.coordinates[1], g.location.coordinates[0]]} icon={defaultIcon}>
              <Popup>
                <b>{g.title}</b><br/>{g.address?.district}, {g.address?.country}
                <button style={{ marginTop: 10, display: 'block' }} onClick={() => setSelectedGame(g._id)}>View Live Users</button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
