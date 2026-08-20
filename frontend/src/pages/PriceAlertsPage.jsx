import { useState } from "react";
import { BellRing, MapPin, Plus, Trash2, TrendingDown } from "lucide-react";
import { FloatingInput } from "../components/ui/floating-input";
import { Button } from "../components/ui/button";

const MODE_COLOR = {
  CAB: "#FF9F1C",
  TRAIN: "#1FB980",
  BUS: "#FF6FA5",
  FLIGHT: "#4F9DFF",
};
const MODES = ["FLIGHT", "TRAIN", "BUS", "CAB"];

const SAMPLE_ALERTS = [
  {
    id: 1,
    origin: "Delhi",
    destination: "Goa",
    mode: "FLIGHT",
    targetPrice: 3500,
    currentPrice: 4200,
  },
  {
    id: 2,
    origin: "Mumbai",
    destination: "Pune",
    mode: "TRAIN",
    targetPrice: 300,
    currentPrice: 280,
  },
];

export default function PriceAlertsPage() {
  const [alerts, setAlerts] = useState(SAMPLE_ALERTS);
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    mode: "FLIGHT",
    targetPrice: "",
  });

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const addAlert = (e) => {
    e.preventDefault();
    if (!form.origin || !form.destination || !form.targetPrice) return;
    setAlerts((prev) => [
      ...prev,
      {
        id: Date.now(),
        origin: form.origin,
        destination: form.destination,
        mode: form.mode,
        targetPrice: Number(form.targetPrice),
        currentPrice: null,
      },
    ]);
    setForm({ origin: "", destination: "", mode: form.mode, targetPrice: "" });
  };

  const removeAlert = (id) =>
    setAlerts((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-7">
        <div className="flex items-center gap-2 text-amber text-xs font-semibold uppercase tracking-wide mb-2">
          <BellRing size={14} /> Price Alerts
        </div>
        <h1 className="text-2xl font-bold text-ink">Never miss a fare drop</h1>
        <p className="text-mist text-sm mt-1.5">
          Set a target price on any route and we'll let you know the moment
          fares hit it.
        </p>
      </div>

      <form
        onSubmit={addAlert}
        className="rounded-2xl border border-line bg-surface p-5 shadow-sm mb-8 flex flex-col gap-3.5"
      >
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <FloatingInput
            label="From"
            icon={MapPin}
            value={form.origin}
            onChange={update("origin")}
            required
          />
          <FloatingInput
            label="To"
            icon={MapPin}
            value={form.destination}
            onChange={update("destination")}
            required
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setForm({ ...form, mode: m })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                form.mode === m
                  ? "bg-amber text-white"
                  : "bg-canvas text-mist hover:text-ink"
              }`}
            >
              {m.charAt(0) + m.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-3 max-md:flex-col">
          <div className="flex-1">
            <FloatingInput
              label="Target price (₹)"
              type="number"
              value={form.targetPrice}
              onChange={update("targetPrice")}
              required
            />
          </div>
          <Button type="submit" className="shrink-0">
            <Plus size={16} /> Add alert
          </Button>
        </div>
      </form>

      {alerts.length === 0 ? (
        <div className="p-14 text-center text-mist-soft border border-dashed border-line rounded-2xl">
          No price alerts yet. Add one above to get started.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {alerts.map((a) => {
            const dropped =
              a.currentPrice !== null && a.currentPrice <= a.targetPrice;
            return (
              <div
                key={a.id}
                className="flex items-center gap-4 bg-surface border border-line rounded-xl px-4.5 py-3.5 shadow-sm"
              >
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ background: MODE_COLOR[a.mode] }}
                >
                  <BellRing size={16} />
                </span>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink text-sm">
                    {a.origin} <span className="text-mist-soft">→</span>{" "}
                    {a.destination}
                  </div>
                  <div className="text-xs text-mist-soft font-mono mt-0.5">
                    {a.mode.charAt(0) + a.mode.slice(1).toLowerCase()} · target
                    ₹{a.targetPrice.toLocaleString("en-IN")}
                  </div>
                </div>

                {a.currentPrice !== null && (
                  <div
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      dropped
                        ? "text-emerald bg-emerald-soft"
                        : "text-mist-soft bg-canvas"
                    }`}
                  >
                    {dropped && <TrendingDown size={13} />}₹
                    {a.currentPrice.toLocaleString("en-IN")}
                  </div>
                )}

                <button
                  onClick={() => removeAlert(a.id)}
                  className="text-mist-soft hover:text-pink shrink-0"
                  title="Remove alert"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
