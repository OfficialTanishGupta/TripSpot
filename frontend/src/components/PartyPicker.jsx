import { Minus, Plus, User, Users } from "lucide-react";

export function PartyPicker({ adults, children, onChange }) {
  const isSolo = adults === 1 && children === 0;

  const setSolo = () => onChange({ adults: 1, children: 0 });
  const setGroup = () => {
    if (isSolo) onChange({ adults: 2, children: 0 });
  };
  const step = (field, delta) => {
    const next = { adults, children };
    next[field] = Math.max(field === "adults" ? 1 : 0, next[field] + delta);
    onChange(next);
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5 shadow-sm">
      <div className="flex gap-1.5 mb-3">
        <button
          type="button"
          onClick={setSolo}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            isSolo
              ? "bg-violet text-white"
              : "text-mist-soft hover:text-ink hover:bg-canvas"
          }`}
        >
          <User size={14} /> Solo
        </button>
        <button
          type="button"
          onClick={setGroup}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            !isSolo
              ? "bg-violet text-white"
              : "text-mist-soft hover:text-ink hover:bg-canvas"
          }`}
        >
          <Users size={14} /> Group
        </button>
      </div>

      {!isSolo && (
        <div className="flex flex-col gap-2.5">
          <Stepper
            label="Adults"
            value={adults}
            onDec={() => step("adults", -1)}
            onInc={() => step("adults", 1)}
          />
          <Stepper
            label="Children"
            value={children}
            onDec={() => step("children", -1)}
            onInc={() => step("children", 1)}
          />
        </div>
      )}
    </div>
  );
}

function Stepper({ label, value, onDec, onInc }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-mist">{label}</span>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onDec}
          className="w-6 h-6 rounded-md bg-canvas text-mist hover:text-ink flex items-center justify-center"
        >
          <Minus size={12} />
        </button>
        <span className="w-4 text-center text-sm text-ink font-mono">
          {value}
        </span>
        <button
          type="button"
          onClick={onInc}
          className="w-6 h-6 rounded-md bg-canvas text-mist hover:text-ink flex items-center justify-center"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}
