import { useEffect, useState } from 'react';
import { listCards, createCard } from '../api/client';

export function CardsManagerPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [cardId, setCardId] = useState('');
  const [name, setName] = useState('');
  const [level, setLevel] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadCards = () => {
    listCards().then(r => setCards(r.cards)).catch(e => setError(e.message));
  };

  useEffect(() => { loadCards(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    try {
      await createCard({ cardId, name, level, imageUrl, description });
      setSuccess(`Card "${name}" created successfully!`);
      setCardId(''); setName(''); setLevel(level + 1); setImageUrl(''); setDescription('');
      loadCards(); // Refresh list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* Form Section */}
      <div style={{ flex: 1, background: '#151A22', padding: 24, borderRadius: 12 }}>
        <h1>Add New Card</h1>
        <p style={{ color: '#8B96A5', fontSize: 14 }}>Add your 51 cards here. Level 1 to 51.</p>
        
        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <div>
            <label>Unique Card ID (e.g. card_01)</label>
            <input value={cardId} onChange={e => setCardId(e.target.value)} required />
          </div>
          <div>
            <label>Card Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label>Level (1 - 51)</label>
            <input type="number" min={1} max={51} value={level} onChange={e => setLevel(Number(e.target.value))} required />
          </div>
          <div>
            <label>Image URL (Cloudinary / Imgur)</label>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." required />
          </div>
          <div>
            <label>Description (Optional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>
          <button type="submit" className="primary" disabled={loading} style={{ marginTop: 10 }}>
            {loading ? 'Adding...' : 'Add Card'}
          </button>
        </form>
      </div>

      {/* Card List Section */}
      <div style={{ flex: 1, background: '#151A22', padding: 24, borderRadius: 12, maxHeight: '80vh', overflowY: 'auto' }}>
        <h2>Existing Cards ({cards.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
          {cards.map(c => (
            <div key={c._id} style={{ background: '#0F141B', padding: 12, borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
              <img src={c.imageUrl} alt={c.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                <div style={{ color: '#F59E0B', fontSize: 12 }}>Level {c.level}</div>
                <div style={{ color: '#8B96A5', fontSize: 10 }}>{c.cardId}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
