import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LeafletMouseEvent, icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { listCards, listGames, getLiveParticipants, declareWinner, createCard } from '../api/client';

const defaultIcon = icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

function LocationMarker({ position, setPosition }: any) {
  useMapEvents({ click(e: LeafletMouseEvent) { setPosition(e.latlng); } });
  return position ? <Marker position={position} icon={defaultIcon}><Popup>Game Location</Popup></Marker> : null;
}

export function GamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  
  // Form State
  const [position, setPosition] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [rewardCardId, setRewardCardId] = useState('');

  // Live Polling
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
    const payload = {
      title, description: desc, startTime, endTime, rewardCardId,
      location: { type: 'Point', coordinates: [position.lng, position.lat] }
    };
    await fetch(`${import.meta.env.VITE_API_URL}/admin/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('propeller_admin_token')}` },
      body: JSON.stringify(payload)
    });
    alert('Game Created!');
    listGames().then(r => setGames(r.games));
  };

  return (
    <div style={{ display: 'flex', gap: 20, height: '85vh' }}>
      
      {/* LEFT: Create Game Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, background: '#151A22', padding: 20, borderRadius: 12, overflowY: 'auto' }}>
        <h1>Create Game</h1>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="Task" value={desc} onChange={e => setDesc(e.target.value)} />
        <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
        <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
        
        <label>Reward Card</label>
        <select value={rewardCardId} onChange={e => setRewardCardId(e.target.value)}>
          <option value="">Select a Card...</option>
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

      {/* RIGHT: Map */}
      <div style={{ flex: 2, borderRadius: 12, overflow: 'hidden' }}>
        <MapContainer center={[11.1271, 78.6569]} zoom={7} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker position={position} setPosition={setPosition} />
          
          {/* Show Existing Games */}
          {games.map(g => (
            <Marker key={g._id} position={[g.location.coordinates[1], g.location.coordinates[0]]} icon={defaultIcon}>
              <Popup>
                <b>{g.title}</b><br/>{g.status}
                <button style={{ marginTop: 10, display: 'block' }} onClick={() => setSelectedGame(g._id)}>View Live Users</button>
              </Popup>
            </Marker>
          ))}

          {/* Show Live Participants of selected game */}
          {selectedGame && participants.map(p => 
            p.liveLocation && p.liveLocation.coordinates[0] !== 0 && (
              <Marker key={p._id} position={[p.liveLocation.coordinates[1], p.liveLocation.coordinates[0]]}>
                <Popup>{p.userId?.displayName}</Popup>
              </Marker>
            )
          )}
        </MapContainer>
      </div>
    </div>
  );
}
