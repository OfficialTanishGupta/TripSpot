import { Sparkles, TrendingUp, Users, Calendar, MapPin } from "lucide-react";
import { SAMPLE_PERSONA } from "../data/sampleData";

const STATS = [
  {
    label: "Trips this year",
    value: "14",
    icon: MapPin,
    color: "#4F9DFF",
    bg: "#EAF3FF",
  },
  {
    label: "Avg. group size",
    value: "2.3",
    icon: Users,
    color: "#1FB980",
    bg: "#E6F9F1",
  },
  {
    label: "Usual travel day",
    value: "Friday",
    icon: Calendar,
    color: "#FF9F1C",
    bg: "#FFF3E0",
  },
  {
    label: "Fare savings found",
    value: "₹8,240",
    icon: TrendingUp,
    color: "#7C6FFF",
    bg: "#EEECFF",
  },
];

const HABITS = [
  { label: "Prefers window seats", strength: 82 },
  { label: "Books 5–10 days ahead", strength: 68 },
  { label: "Weekend getaways", strength: 91 },
  { label: "Price-sensitive on trains", strength: 74 },
];

export default function TripInsightsPage() {
  const { persona, confidence, insight } = SAMPLE_PERSONA;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-7">
        <div className="flex items-center gap-2 text-violet text-xs font-semibold uppercase tracking-wide mb-2">
          <Sparkles size={14} /> Trip Insights
        </div>
        <h1 className="text-2xl font-bold text-ink">How you travel</h1>
        <p className="text-mist text-sm mt-1.5">
          Patterns TripSpot has picked up from your searches and bookings.
        </p>
      </div>

      {/* Persona hero card */}
      <div className="rounded-2xl border border-line bg-violet-soft p-6 mb-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white text-violet flex items-center justify-center shrink-0 shadow-sm">
          <Sparkles size={22} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-violet uppercase tracking-wide">
              {confidence}% confidence
            </span>
          </div>
          <h2 className="text-lg font-bold text-ink mb-1.5">{persona}</h2>
          <p className="text-mist text-sm leading-relaxed max-w-lg">
            {insight}
          </p>
        </div>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-4 gap-3 mb-8 max-md:grid-cols-2">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-line bg-surface p-4 shadow-sm"
          >
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: s.bg, color: s.color }}
            >
              <s.icon size={17} />
            </span>
            <div className="text-xl font-bold text-ink">{s.value}</div>
            <div className="text-xs text-mist-soft mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Habit strength bars */}
      <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <h3 className="text-ink font-semibold text-sm mb-4">Travel habits</h3>
        <div className="flex flex-col gap-4">
          {HABITS.map((h) => (
            <div key={h.label}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-mist">{h.label}</span>
                <span className="text-mist-soft text-xs font-mono">
                  {h.strength}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-canvas overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet transition-all duration-700"
                  style={{ width: `${h.strength}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
