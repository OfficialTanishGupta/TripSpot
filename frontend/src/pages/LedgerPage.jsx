import { useState, useMemo, useEffect } from 'react';
import { Train, Car, Bus, Plane, XCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/client';
import { SAMPLE_BOOKINGS } from '../data/sampleData';

const MODE_ICON = { TRAIN: Train, CAB: Car, BUS: Bus, FLIGHT: Plane };
const MODE_COLOR = { TRAIN: '#34E0A1', CAB: '#FFB84D', BUS: '#FF6FA5', FLIGHT: '#4F9DFF' };
const FILTERS = ['ALL', 'CONFIRMED', 'CANCELLED'];

export default function LedgerPage() {
  const [bookings, setBookings] = useState(SAMPLE_BOOKINGS);
  const [filter, setFilter] = useState('ALL');
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    api.get('/api/bookings')
      .then(({ data }) => { setBookings(data); setIsDemo(false); })
      .catch(() => { setBookings(SAMPLE_BOOKINGS); setIsDemo(true); });
  }, []);

  const filtered = useMemo(
    () => filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter),
    [bookings, filter]
  );

  const cancel = async (id) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'CANCELLED' } : b));
    try { await api.delete(`/api/bookings/${id}`); } catch (e) { /* demo mode */ }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Workspace</h1>
          <p className="text-mist text-sm mt-1.5">Every booking you've made, all in one ledger.</p>
        </div>
        {isDemo && <span className="text-xs font-semibold text-amber bg-amber-soft px-3 py-1 rounded-full whitespace-nowrap">Sample data</span>}
      </div>

      <div className="flex gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'bg-white text-ink' : 'bg-surface border border-line text-mist hover:text-white'
            }`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center text-mist-soft border border-dashed border-line rounded-2xl">No bookings match this filter yet.</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((b) => {
            const Icon = MODE_ICON[b.mode] || Car;
            return (
              <div key={b.id} className="flex items-center gap-4 bg-surface border border-line rounded-xl px-4.5 py-3.5">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: MODE_COLOR[b.mode] }}>
                  <Icon size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{b.origin} <span className="text-mist-soft">→</span> {b.destination}</div>
                  <div className="text-xs text-mist-soft font-mono mt-0.5">{b.providerName} · {b.departureTime}</div>
                </div>
                <div className="font-mono font-bold text-white text-sm">₹{b.price.toLocaleString('en-IN')}</div>
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                  b.status === 'CONFIRMED' ? 'text-emerald bg-emerald-soft' : 'text-mist-soft bg-white/5'
                }`}>
                  {b.status === 'CONFIRMED' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  {b.status}
                </div>
                {b.status === 'CONFIRMED' && (
                  <button onClick={() => cancel(b.id)} className="text-xs text-mist border border-line px-3 py-1.5 rounded-lg hover:border-pink hover:text-pink">
                    Cancel
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
