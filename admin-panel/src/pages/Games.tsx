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
  const [selectedGame, setSelectedGame] = useState<any | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  
  const [position, setPosition] = useState<any>(null);
  const [address, setAddress] = useState({ country: 'Click map', state: 'to load', district: 'address' });
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [rewardCardId, setRewardCardId] = useState('');

  useEffect(() => {
    listGames().then(r => setGames(r.games)).catch(console.error);
    listCards().then(r => setCards(r.cards)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedGame) return;
    const interval = setInterval(() => {
      getLiveParticipants(selectedGame._id).then(r => setParticipants(r.participants)).catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedGame]);

  const handleCreateGame = async () => {
    if (!position || !rewardCardId || !startTime) return alert('Fill all fields');
    
    const payload = {
      title, description: desc, startTime, durationMinutes, rewardCardId, address,
      location: { type: 'Point', coordinates: [position.lng, position.lat] as [number, number] }
    };
    
    try {
      await createGame(payload);
      alert('Game Created!');
      listGames().then(r => setGames(r.games));
    } catch (err: any) {
      alert(err.message || 'Failed');
    }
  };

  const getGameStatus = (g: any) => {
    if (g.winnerId) return <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>🏆 FINISHED (WINNER DECLARED)</span>;
    const now = new Date().getTime();
    const start = new Date(g.startTime).getTime();
    const end = new Date(g.endTime).getTime();
    if (now < start) return <span style={{ color: '#06B6D4' }}>⏳ UPCOMING</span>;
    if (now > end) return <span style={{ color: '#EF4444' }}>⚠️ EXPIRED</span>;
    return <span style={{ color: '#10B981' }}>🟢 ACTIVE</span>;
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

        <label>Start Date & Time</label>
        <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />

        <label>Duration (Minutes)</label>
        <input type="number" min={1} value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} />
        
        <label>Reward Card</label>
        <select value={rewardCardId} onChange={e => setRewardCardId(e.target.value)}>
          <option value="">Select Reward Card...</option>
          {cards.map(c => <option key={c._id} value={c._id}>Lvl {c.level} - {c.name}</option>)}
        </select>
        <button className="primary" onClick={handleCreateGame}>Create Game</button>
        
        <hr style={{ borderColor: '#333', width: '100%' }} />
        
        {selectedGame && (
          <>
            <h2>Game Details: {selectedGame.title}</h2>
            <div style={{ marginBottom: 10 }}>{getGameStatus(selectedGame)}</div>
            
            {selectedGame.winnerId && (
              <div style={{ padding: 10, background: '#F59E0B33', borderRadius: 8, border: '1px solid #F59E0B' }}>
                🏆 Winner: <b>{participants.find(p => p.isWinner)?.userId?.displayName || 'Declared'}</b>
              </div>
            )}

            <h3>Participants</h3>
            {participants.map(p => (
              <div key={p._id} style={{ background: '#0F141B', padding: 15, marginBottom: 10, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b>{p.userId?.displayName}</b> <span>({p.status})</span>
                  </div>
                  {!p.isWinner && p.status !== 'winner' && !selectedGame.winnerId && (
                    <button onClick={() => declareWinner(selectedGame._id, p._id)}>Mark Winner</button>
                  )}
                </div>
                {p.submittedAnswer && (
                  <div style={{ marginTop: 10, padding: 10, background: '#1F2937', borderRadius: 6 }}>
                    <b>Answer:</b> {p.submittedAnswer}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{ flex: 2, borderRadius: 12, overflow: 'hidden' }}>
        <MapContainer center={[11.1271, 78.6569]} zoom={7} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} />
          
          {games.map(g => (
            <Marker key={g._id} position={[g.location.coordinates[1], g.location.coordinates[0]]} icon={defaultIcon}>
              <Popup>
                <b>{g.title}</b><br/>
                {getGameStatus(g)}
                <button onClick={() => setSelectedGame(g)}>View Details</button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
