import { useState } from "react";
import { Gift, Copy, Check, Users, Sparkles } from "lucide-react";

const OFFERS = [
  {
    id: 1,
    title: "Flat ₹200 off on your first flight",
    code: "FLYFIRST200",
    tag: "New user",
    color: "#4F9DFF",
    bg: "#EAF3FF",
    expires: "Valid till 31 Aug",
  },
  {
    id: 2,
    title: "10% cashback on train bookings",
    code: "RAILSAVE10",
    tag: "Cashback",
    color: "#1FB980",
    bg: "#E6F9F1",
    expires: "Valid till 15 Sep",
  },
  {
    id: 3,
    title: "₹150 off on cabs above ₹800",
    code: "RIDE150",
    tag: "Cabs",
    color: "#FF9F1C",
    bg: "#FFF3E0",
    expires: "Valid till 20 Aug",
  },
  {
    id: 4,
    title: "Buy 1 bus ticket, get 20% off the next",
    code: "BUSBUDDY20",
    tag: "Buses",
    color: "#FF6FA5",
    bg: "#FFEAF2",
    expires: "Valid till 10 Sep",
  },
];

export default function OffersPage() {
  const [copiedId, setCopiedId] = useState(null);

  const copyCode = (id, code) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-7">
        <div className="flex items-center gap-2 text-[#C026D3] text-xs font-semibold uppercase tracking-wide mb-2">
          <Gift size={14} /> Offers & Rewards
        </div>
        <h1 className="text-2xl font-bold text-ink">Deals worth grabbing</h1>
        <p className="text-mist text-sm mt-1.5">
          Handpicked offers across cabs, trains, buses and flights.
        </p>
      </div>

      {/* Referral banner */}
      <div className="rounded-2xl p-6 mb-8 flex items-center gap-4 max-md:flex-col max-md:text-center bg-[#FBEAFE] border border-line">
        <div className="w-14 h-14 rounded-2xl bg-white text-[#C026D3] flex items-center justify-center shrink-0 shadow-sm">
          <Users size={24} />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-ink mb-1">
            Invite friends, earn ₹250
          </h2>
          <p className="text-mist text-sm leading-relaxed">
            For every friend who books their first trip through TripSpot, you
            both get ₹250 in travel credit.
          </p>
        </div>
        <button className="shrink-0 h-11 px-5 rounded-xl text-sm font-semibold text-white bg-[#C026D3] hover:brightness-110 transition-all">
          Invite now
        </button>
      </div>

      {/* Offer cards */}
      <div className="grid grid-cols-2 gap-3.5 max-md:grid-cols-1">
        {OFFERS.map((o) => (
          <div
            key={o.id}
            className="relative bg-surface border border-line rounded-2xl p-4.5 shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className="text-[0.65rem] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full"
                style={{ background: o.bg, color: o.color }}
              >
                {o.tag}
              </span>
              <Sparkles
                size={15}
                style={{ color: o.color }}
                className="shrink-0 mt-0.5"
              />
            </div>

            <h3 className="font-semibold text-ink text-sm leading-snug">
              {o.title}
            </h3>

            <div className="flex items-center justify-between mt-auto pt-1">
              <button
                onClick={() => copyCode(o.id, o.code)}
                className="flex items-center gap-1.5 text-xs font-mono font-semibold px-3 py-1.5 rounded-lg border border-dashed border-line text-mist hover:text-ink hover:border-mist-soft transition-colors"
              >
                {copiedId === o.id ? (
                  <>
                    <Check size={13} className="text-emerald" /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} /> {o.code}
                  </>
                )}
              </button>
              <span className="text-[0.7rem] text-mist-soft whitespace-nowrap">
                {o.expires}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
