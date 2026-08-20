import { useState } from "react";
import { Heart, MapPin, Train, Car, Bus, Plane } from "lucide-react";

const MODE_ICON = { TRAIN: Train, CAB: Car, BUS: Bus, FLIGHT: Plane };
const MODE_COLOR = {
  TRAIN: "#1FB980",
  CAB: "#FF9F1C",
  BUS: "#FF6FA5",
  FLIGHT: "#4F9DFF",
};

const SAMPLE_WISHLIST = [
  {
    id: 1,
    origin: "Bengaluru",
    destination: "Coorg",
    mode: "CAB",
    priceFrom: 1450,
  },
  {
    id: 2,
    origin: "Delhi",
    destination: "Manali",
    mode: "BUS",
    priceFrom: 890,
  },
  {
    id: 3,
    origin: "Chennai",
    destination: "Pondicherry",
    mode: "TRAIN",
    priceFrom: 210,
  },
  {
    id: 4,
    origin: "Mumbai",
    destination: "Udaipur",
    mode: "FLIGHT",
    priceFrom: 3200,
  },
];

export default function WishlistPage() {
  const [saved, setSaved] = useState(SAMPLE_WISHLIST);

  const remove = (id) => setSaved((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-7">
        <div className="flex items-center gap-2 text-pink text-xs font-semibold uppercase tracking-wide mb-2">
          <Heart size={14} /> Saved
        </div>
        <h1 className="text-2xl font-bold text-ink">Your wishlist</h1>
        <p className="text-mist text-sm mt-1.5">
          Routes you've bookmarked — pick up right where you left off.
        </p>
      </div>

      {saved.length === 0 ? (
        <div className="p-14 text-center text-mist-soft border border-dashed border-line rounded-2xl">
          <Heart size={28} className="mx-auto mb-3 text-mist-soft" />
          Nothing saved yet. Tap the heart on any fare to bookmark it here.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 max-md:grid-cols-1">
          {saved.map((s) => {
            const Icon = MODE_ICON[s.mode] || Car;
            return (
              <div
                key={s.id}
                className="relative bg-surface border border-line rounded-2xl p-4.5 shadow-sm flex items-center gap-3.5"
              >
                <span
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ background: MODE_COLOR[s.mode] }}
                >
                  <Icon size={19} />
                </span>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink text-sm flex items-center gap-1">
                    <MapPin size={12} className="text-mist-soft shrink-0" />
                    {s.origin} <span className="text-mist-soft">→</span>{" "}
                    {s.destination}
                  </div>
                  <div className="text-xs text-mist-soft font-mono mt-0.5">
                    from ₹{s.priceFrom.toLocaleString("en-IN")}
                  </div>
                </div>

                <button
                  onClick={() => remove(s.id)}
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-pink hover:bg-pink-soft transition-colors"
                  title="Remove from saved"
                >
                  <Heart size={16} fill="currentColor" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
