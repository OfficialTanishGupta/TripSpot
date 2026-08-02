import { useState } from "react";
import { MapPin, Calendar, ArrowLeftRight, BadgePercent } from "lucide-react";
import { FloatingInput } from "../components/ui/floating-input";
import { Button } from "../components/ui/button";
import { PartyPicker } from "../components/PartyPicker";
import { ModeTabBar } from "../components/ModeTabBar";
import PersonaCard from "../components/PersonaCard";
import DestinationGallery from "../components/DestinationGallery";
import ResultsBoard from "../components/ResultsBoard";
import api from "../api/client";
import {
  POPULAR_ROUTES,
  DESTINATION_GALLERY,
  SAMPLE_RESULTS,
  SAMPLE_PERSONA,
} from "../data/sampleData";

const FARE_TYPES = [
  "Regular",
  "Student",
  "Senior Citizen",
  "Armed Forces",
  "Doctors & Nurses",
];

export default function DashboardPage() {
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    travelDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    preferredMode: "",
    fareType: "Regular",
  });
  const [party, setParty] = useState({ adults: 1, children: 0 });
  const [results, setResults] = useState(SAMPLE_RESULTS);
  const [persona, setPersona] = useState(SAMPLE_PERSONA);
  const [loading, setLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(true);

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const search = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ Fixed: Single API request containing all payload arguments
      const { data } = await api.post("/api/search", {
        ...form,
        passengers: party.adults + party.children,
        adults: party.adults,
        children: party.children,
      });
      setResults(data);
      setIsDemo(false);
    } catch (err) {
      setResults(SAMPLE_RESULTS);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  const applyRoute = (route) =>
    setForm({ ...form, origin: route.from, destination: route.to });

  const handleBook = () => {
    /* wired once backend session is live */
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">Command Dashboard</h1>
        <p className="text-mist text-sm mt-1.5">
          Search once, compare every mode of transport at once.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4 mb-8 max-lg:grid-cols-1">
        <form
          onSubmit={search}
          className="rounded-2xl border border-line bg-surface p-5 flex flex-col gap-3.5"
        >
          <ModeTabBar
            value={form.preferredMode}
            onChange={(v) => setForm({ ...form, preferredMode: v })}
          />

          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
            <FloatingInput
              label="Leaving from"
              icon={MapPin}
              value={form.origin}
              onChange={update("origin")}
              required
            />
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  origin: form.destination,
                  destination: form.origin,
                })
              }
              title="Swap origin and destination"
              className="w-9 h-9 rounded-full border border-line bg-ink-soft text-mist hover:text-white hover:border-blue flex items-center justify-center shrink-0"
            >
              <ArrowLeftRight size={15} />
            </button>
            <FloatingInput
              label="Going to"
              icon={MapPin}
              value={form.destination}
              onChange={update("destination")}
              required
            />
          </div>

          <FloatingInput
            label="Travel date"
            type="date"
            icon={Calendar}
            value={form.travelDate}
            onChange={update("travelDate")}
            required
          />

          <div>
            <div className="flex items-center gap-1.5 text-[0.7rem] text-mist-soft uppercase tracking-wide mb-2">
              <BadgePercent size={13} /> Special fare
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FARE_TYPES.map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setForm({ ...form, fareType: f })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    form.fareType === f
                      ? "bg-blue text-ink"
                      : "bg-ink-soft text-mist hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Checking fares…" : "Compare fares"}
          </Button>
        </form>

        <PartyPicker
          adults={party.adults}
          children={party.children}
          onChange={setParty}
        />
      </div>

      <div className="mb-8">
        <PersonaCard
          persona={persona.persona}
          confidence={persona.confidence}
          insight={persona.insight}
        />
      </div>

      <section className="mb-9">
        <h3 className="text-white font-semibold text-sm mb-3.5">
          {" "}
          Popular routes{" "}
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {POPULAR_ROUTES.map((r, i) => (
            <button
              key={i}
              onClick={() => applyRoute(r)}
              className="relative shrink-0 w-56 h-36 rounded-2xl overflow-hidden group"
            >
              <img
                src={r.photo}
                alt={`${r.from} to ${r.to}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* ✅ Fixed: Tailwind v4 linear utility line */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/5 to-transparent" />
              <span
                className="absolute top-2.5 left-2.5 text-[0.68rem] font-bold text-white px-2 py-1 rounded-full"
                style={{ background: r.accent }}
              >
                from ₹{r.priceFrom}
              </span>
              <span className="absolute bottom-3 left-3.5 right-3 text-white font-semibold text-sm text-left">
                {r.from} <span className="text-white/60 font-normal">→</span>{" "}
                {r.to}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-9">
        <h3 className="text-white font-semibold text-sm mb-3.5">
          {" "}
          Explore India{" "}
        </h3>
        <DestinationGallery destinations={DESTINATION_GALLERY} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-white font-semibold text-sm">Fare board</h3>
          {isDemo && (
            <span className="text-xs font-semibold text-amber bg-amber-soft px-3 py-1 rounded-full">
              Sample data — connect the backend for live, AI-ranked fares
            </span>
          )}
        </div>
        <ResultsBoard
          options={results}
          onBook={handleBook}
          personalized={isDemo}
        />
      </section>
    </div>
  );
}
