// @ts-nocheck
import { useEffect, useState } from 'react';
import { listCards, createCard } from '../api/client';

// --- HTML மெமரியிலிருந்து எடுக்கப்பட்ட கார்ட்ஸ் டேட்டா & டிராயிங் லாஜிக் ---
const eye = (x, y, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x-1}" cy="${y}" r="${r/2}" fill="#111"/>`;
const R = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join("");
const ART = {
shark:(c,o)=>`<path d="M15 82Q80 28 150 68L188 40 176 80 188 116 150 92Q80 122 15 82Z" fill="${c}"/><path d="M80 52 105 14 122 60Z" fill="${c}"/><path d="M30 86Q80 102 140 88Q80 110 30 86Z" fill="#fff" opacity=".85"/>${o=="h"?`<rect x="14" y="54" width="14" height="56" rx="7" fill="${c}"/>${eye(21,58,4)}${eye(21,106,4)}`:eye(48,70,4)}<path d="M26 88l5 8 5-8 5 8 5-8 5 8" fill="#fff" stroke="#fff"/>`,
fish:c=>`<path d="M30 65Q90 15 150 65Q90 115 30 65Z" fill="${c}"/><path d="M150 65 190 35 182 65 190 95Z" fill="${c}"/><path d="M80 32Q100 6 122 36Z" fill="${c}" opacity=".8"/>${eye(55,58)}<path d="M32 70q8 4 14 0" stroke="#000" fill="none"/>`,
spiny:c=>ART.fish(c)+R(8,i=>`<path d="M${66+i*10} ${38-Math.sin(i/2.3)*12}l${-3} ${-22}" stroke="#fff" stroke-width="2.5"/>`),
sword:c=>ART.fish(c)+`<path d="M34 62 2 64 34 68Z" fill="#ccd"/>`,
puffer:c=>R(18,i=>{const a=i*Math.PI/9;return `<path d="M${100+40*Math.cos(a)} ${65+40*Math.sin(a)}L${100+58*Math.cos(a)} ${65+58*Math.sin(a)}" stroke="#fff" stroke-width="3"/>`}).concat(`<circle cx="100" cy="65" r="42" fill="${c}"/><path d="M60 85Q100 110 140 85Z" fill="#fff" opacity=".7"/><path d="M142 60 175 45 175 85 142 72Z" fill="${c}"/>${eye(75,52,7)}<ellipse cx="62" cy="72" rx="6" ry="4" fill="#d33"/>`),
ray:c=>`<path d="M100 18Q192 60 100 100Q8 60 100 18Z" fill="${c}"/><path d="M100 96 104 128" stroke="${c}" stroke-width="5"/><path d="M100 28Q150 60 100 90" stroke="#0003" fill="none" stroke-width="3"/>${eye(84,46,4)}${eye(116,46,4)}`,
eel:c=>`<path d="M14 92Q50 28 92 80T168 58" stroke="${c}" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M14 92Q50 28 92 80T168 58" stroke="#0004" stroke-width="18" fill="none" stroke-dasharray="4 12"/>${eye(170,52)}<path d="M176 64l10 6M172 68l8 10" stroke="#fff" stroke-width="2"/>`,
snake:(c)=>`<path d="M14 100Q50 36 92 90T168 56" stroke="${c}" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M14 100Q50 36 92 90T168 56" stroke="#111" stroke-width="14" fill="none" stroke-dasharray="7 15" opacity=".7"/><circle cx="172" cy="52" r="10" fill="${c}"/>${eye(175,49,3)}<path d="M182 56l10 2-10 2" stroke="#e22" fill="none"/>`,
jelly:(c,o)=>`<path d="M${o=="box"?"55 80 55 30Q55 14 100 14T145 30L145 80Z":"50 72Q50 14 100 14T150 72Z"}" fill="${c}" opacity=".85"/><circle cx="85" cy="42" r="6" fill="#fff6"/>`+R(o=="box"?4:8,i=>{const n=o=="box"?4:8,x=o=="box"?62+i*25:55+i*13;return `<path d="M${x} ${o=="box"?80:72}q-8 16 0 30t0 22" stroke="${c}" stroke-width="3" fill="none" opacity=".8"/>`}),
war:c=>`<ellipse cx="100" cy="36" rx="48" ry="18" fill="${c}" opacity=".9"/><path d="M80 24 105 4 125 28Z" fill="#f9a8d4"/>`+R(7,i=>`<path d="M${62+i*13} 50q-10 20 0 38t0 40" stroke="#4f46e5" stroke-width="3" fill="none"/>`),
octo:(c,o)=>`<ellipse cx="100" cy="46" rx="42" ry="32" fill="${c}"/>`+R(8,i=>`<path d="M${60+i*11} 70q${i%2?-14:14} 24 0 36q-8 14 ${i%2?-10:10} 16" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round"/>`)+R(6,i=>`<circle cx="${72+(i%3)*28}" cy="${30+Math.floor(i/3)*24}" r="7" fill="none" stroke="#38bdf8" stroke-width="3"/>`)+eye(84,58,6)+eye(116,58,6),
squid:c=>`<path d="M100 4Q134 40 118 78L82 78Q66 40 100 4Z" fill="${c}"/>`+R(7,i=>`<path d="M${84+i*5} 78q${i-3} 22 ${(i-3)*2} 44" stroke="${c}" stroke-width="4" fill="none"/>`)+eye(88,78,6)+eye(112,78,6),
snail:c=>`<path d="M45 108 150 108 118 24Z" fill="${c}"/><path d="M55 90 140 90M63 70 132 70M72 50 124 50" stroke="#5a3a22" stroke-width="3"/><ellipse cx="95" cy="112" rx="55" ry="10" fill="#e8b4c8"/><path d="M150 108Q176 90 186 62" stroke="#e8b4c8" stroke-width="5" fill="none"/>`,
star:c=>{let p="";for(let i=0;i<10;i++){const r=i%2?22:58,a=-Math.PI/2+i*Math.PI/5;p+=`${100+r*Math.cos(a)},${68+r*Math.sin(a)} `}return `<polygon points="${p}" fill="${c}" stroke="#fff" stroke-width="2"/>`+R(10,i=>{const a=-Math.PI/2+i*Math.PI/5*2;return `<circle cx="${100+34*Math.cos(a)}" cy="${68+34*Math.sin(a)}" r="3" fill="#fff"/>`})},
urchin:c=>R(26,i=>{const a=i*Math.PI/13;return `<path d="M${100+22*Math.cos(a)} ${68+22*Math.sin(a)}L${100+58*Math.cos(a)} ${68+58*Math.sin(a)}" stroke="${c}" stroke-width="3"/>`})+`<circle cx="100" cy="68" r="26" fill="${c}"/><circle cx="92" cy="60" r="6" fill="#fff4"/>`,
anemone:c=>`<rect x="78" y="86" width="44" height="30" rx="10" fill="#7c4a2d"/>`+R(15,i=>`<path d="M${82+i*2.7} 90Q${40+i*8} 40 ${30+i*10} 22" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="${30+i*10}" cy="22" r="4" fill="#fff"/>`),
worm:(c)=>R(13,i=>{const x=18+i*13,y=72+Math.sin(i/1.6)*20;return `<path d="M${x} ${y-10}l-3-8M${x+4} ${y-10}l2-8M${x} ${y+10}l-3 8M${x+4} ${y+10}l2 8" stroke="#fff8" /><circle cx="${x}" cy="${y}" r="10" fill="${c}" stroke="#0003"/>`})+`<path d="M184 52l10-10M184 56l12 0" stroke="#e22" stroke-width="3"/>`,
shrimp:c=>`<path d="M52 102Q30 40 100 34Q170 36 164 96" stroke="${c}" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M150 96 186 80 176 118Z" fill="${c}"/><circle cx="48" cy="106" r="16" fill="#ff6b6b"/>${eye(78,40,6)}${eye(94,38,6)}`,
coral:c=>`<path d="M100 124V78M100 100 58 60M100 100 142 54M58 60 44 26M58 60 74 24M142 54 128 22M142 54 160 24M100 78 100 30" stroke="${c}" stroke-width="10" stroke-linecap="round" fill="none"/>`+R(7,i=>`<circle cx="${[44,74,128,160,100,58,142][i]}" cy="${[26,24,22,24,30,60,54][i]}" r="7" fill="#ffd166"/>`),
dragon:c=>`<path d="M30 72Q100 44 170 72Q100 98 30 72Z" fill="${c}"/>`+R(6,i=>`<path d="M${52+i*18} 62Q${44+i*18} 28 ${56+i*18} 14M${52+i*18} 80Q${44+i*18} 112 ${56+i*18} 124" stroke="#7dd3fc" stroke-width="7" stroke-linecap="round" fill="none"/>`)+eye(40,70,3),
seal:c=>`<ellipse cx="105" cy="82" rx="68" ry="32" fill="${c}"/><circle cx="52" cy="54" r="26" fill="${c}"/><path d="M168 86 196 66 196 108Z" fill="${c}"/><ellipse cx="85" cy="108" rx="22" ry="8" fill="${c}"/>${eye(44,50,4)}<circle cx="30" cy="60" r="4" fill="#111"/><path d="M26 66h-16M26 70l-14 6" stroke="#fff"/><path d="M62 62q10 4 16 0" stroke="#fff" fill="none"/><path d="M60 64 66 74 72 64" fill="#fff"/>`,
orca:c=>`<path d="M10 80Q50 40 120 55Q170 60 190 32 184 80 190 112 160 96 120 102Q50 120 10 80Z" fill="${c}"/><path d="M96 100Q130 110 152 97 130 88 96 100Z" fill="#fff"/><path d="M95 54 112 14 130 58Z" fill="${c}"/><ellipse cx="56" cy="66" rx="13" ry="6" fill="#fff"/>${eye(38,76,3)}`,
croc:c=>`<path d="M8 76 118 60Q150 40 176 56L192 60 178 72 192 80 172 90Q130 102 100 96L8 92Z" fill="${c}"/>`+R(8,i=>`<path d="M${30+i*14} 78l4-8 4 8" fill="${c}" stroke="#0005"/>`)+`<path d="M150 66l6 8 6-8 6 8 6-8" fill="#fff" stroke="#fff"/>${eye(134,52,5)}`
};

const D=[["Sea Urchin","urchin","#6a3d9a"],["Sea Anemone","anemone","#ff7f50"],["Lionfish","spiny","#c0392b"],["Bristle Worm","worm","#e67e22"],["Crown-of-thorns Starfish","star","#d35400"],["Weever Fish","spiny","#a1887f"],["Scorpionfish","spiny","#8d6e63"],["Lemon Shark","shark","#d4b84a"],["Blacktip Shark","shark","#7b8a99"],["Blue Shark","shark","#3b6fb6"],["Wobbegong Shark","shark","#9c7a4d"],["Sand Tiger Shark","shark","#9aa5ad"],["Stargazer","fish","#8e7f6a"],["Titan Triggerfish","fish","#3f8f6b"],["Striped Eel Catfish","fish","#555"],["Pufferfish","puffer","#d8c36a"],["Stingray","ray","#8a7a63"],["Electric Ray","ray","#4a6fa5"],["Moray Eel","eel","#6b8e23"],["Great Barracuda","fish","#9fb3c0"],["Swordfish","sword","#5d7fa3"],["Blue Marlin","sword","#1f78d1"],["Giant Trevally","fish","#7e9aa8"],["Grouper","fish","#a0522d"],["Mantis Shrimp","shrimp","#1abc9c"],["Bobbit Worm","worm","#8e44ad"],["Fire Coral","coral","#e74c3c"],["Flower Urchin","urchin","#e84393"],["Sea Nettle","jelly","#e17055"],["Lion\u2019s Mane Jellyfish","jelly","#d68910"],["Blue Dragon","dragon","#2e86de"],["Portuguese Man o\u2019 War","war","#6c5ce7"],["Humboldt Squid","squid","#c0392b"],["Shortfin Mako Shark","shark","#2c6fbb"],["Great Hammerhead Shark","shark","#8a96a3","h"],["Leopard Seal","seal","#7f8c8d"],["Beaked Sea Snake","snake","#c9a227"],["Banded Sea Krait","snake","#3498db"],["Yellow-bellied Sea Snake","snake","#f1c40f"],["Oceanic Whitetip Shark","shark","#b0b7bd"],["Stonefish","spiny","#7d6b5a"],["Cone Snail","snail","#c8956d"],["Orca","orca","#111"],["Bull Shark","shark","#6d7b86"],["Tiger Shark","shark","#5b7e8c"],["Saltwater Crocodile","croc","#4a6b2f"],["Blue-ringed Octopus","octo","#e6b800"],["Irukandji Jellyfish","jelly","#8fd3f4"],["Great White Shark","shark","#8d9aa5"],["Box Jellyfish","jelly","#74b9ff","box"]];
const KIND={urchin:"Sea Urchin",anemone:"Anemone",spiny:"Venom Fish",worm:"Sea Worm",star:"Starfish",shark:"Shark",fish:"Fish",puffer:"Pufferfish",ray:"Ray",eel:"Eel",sword:"Billfish",shrimp:"Crustacean",coral:"Coral",jelly:"Jellyfish",dragon:"Sea Slug",war:"Siphonophore",squid:"Squid",seal:"Mammal",snake:"Sea Snake",snail:"Mollusc",orca:"Whale",croc:"Reptile",octo:"Octopus"};

const hs=n=>[...n].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);

export function CardsManagerPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
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

  const handleGenerateSeaCards = async () => {
    if (!window.confirm("This will generate and add 50 Sea Danger Cards to your database. Proceed?")) return;
    setLoading(true); setError(null); setSuccess(null);
    
    try {
      for (let i = 0; i < D.length; i++) {
        const d = D[i];
        const L = i + 1;
        const h = hs(d[0]);
        
        // Generate SVG String
        const svg = `<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg">${R(7,k=>`<circle cx="${(h*(k+3))%190+5}" cy="${(h*(k+5))%110+10}" r="${2+k%3}" fill="#fff" opacity=".25"/>`)}${ART[d[1]](d[2],d[3])}</svg>`;
        
        // Convert to Base64 Data URI for easy rendering
        const base64Svg = btoa(unescape(encodeURIComponent(svg)));
        const dataUri = `data:image/svg+xml;base64,${base64Svg}`;

        await createCard({
          cardId: `sea_${L}`,
          name: d[0],
          level: L,
          imageUrl: dataUri,
          description: KIND[d[1]]
        });
      }
      setSuccess("Successfully generated 50 Sea Danger Cards!");
      loadCards();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    try {
      await createCard({ cardId, name, level, imageUrl, description });
      setSuccess(`Card "${name}" created successfully!`);
      setCardId(''); setName(''); setLevel(level + 1); setImageUrl(''); setDescription('');
      loadCards(); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <div style={{ flex: 1, background: '#151A22', padding: 24, borderRadius: 12 }}>
        <h1>Cards Manager</h1>
        
        <button 
          className="primary" 
          onClick={handleGenerateSeaCards} 
          disabled={loading}
          style={{ width: '100%', marginBottom: 20, background: '#06B6D4', color: '#000' }}
        >
          {loading ? 'Generating...' : 'Auto-Generate 50 Sea Danger Cards'}
        </button>

        <h2>Manually Add Card</h2>
        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <div>
            <label>Unique Card ID</label>
            <input value={cardId} onChange={e => setCardId(e.target.value)} required />
          </div>
          <div>
            <label>Card Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label>Level</label>
            <input type="number" min={1} max={51} value={level} onChange={e => setLevel(Number(e.target.value))} required />
          </div>
          <div>
            <label>Image URL / Data URI</label>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." required />
          </div>
          <div>
            <label>Description (Optional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>
          <button type="submit" className="primary" disabled={loading} style={{ marginTop: 10 }}>
            Add Card
          </button>
        </form>
      </div>

      <div style={{ flex: 1, background: '#151A22', padding: 24, borderRadius: 12, maxHeight: '80vh', overflowY: 'auto' }}>
        <h2>Existing Cards ({cards.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
          {cards.map(c => (
            <div key={c._id} style={{ background: '#0F141B', padding: 12, borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
              <img src={c.imageUrl} alt={c.name} style={{ width: 50, height: 50, objectFit: 'contain', background: '#222', borderRadius: 6 }} />
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
