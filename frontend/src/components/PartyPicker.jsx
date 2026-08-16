import { useState, useRef, useEffect } from "react";
import { Minus, Plus, Users, ChevronDown } from "lucide-react";

export function PartyPicker({ adults, children, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const step = (field, delta) => {
    const next = { adults, children };
    next[field] = Math.max(field === "adults" ? 1 : 0, next[field] + delta);
    onChange(next);
  };

  const total = adults + children;
  const label = `${total} traveler${total > 1 ? "s" : ""}`;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-[52px] flex items-center justify-between gap-2 rounded-xl border border-line bg-canvas px-3.5 text-sm text-ink hover:border-mist-soft transition-colors"
      >
        <span className="flex items-center gap-2">
          <Users size={16} className="text-mist-soft" />
          {label}
        </span>
        <ChevronDown size={15} className="text-mist-soft" />
      </button>

      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1.5 rounded-xl border border-line bg-surface shadow-lg p-3.5 flex flex-col gap-3">
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
