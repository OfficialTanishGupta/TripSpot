import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Users, Fingerprint, Check } from "lucide-react";
import { FloatingInput } from "../components/ui/floating-input";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { loginWithFingerprint } from "../lib/webauthn";

function fillFromSaved(slots, saved) {
  const byType = {
    Adult: saved.filter((p) => p.type === "Adult"),
    Child: saved.filter((p) => p.type === "Child"),
  };
  const cursor = { Adult: 0, Child: 0 };
  return slots.map((slot) => {
    const pool = byType[slot.type] || [];
    const i = cursor[slot.type] || 0;
    const match = pool[i];
    if (!match) return slot;
    cursor[slot.type] = i + 1;
    return {
      ...slot,
      name: match.name || slot.name,
      age: match.age ? String(match.age) : slot.age,
    };
  });
}

export default function BookingPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { email } = useAuth();
  const option = state?.option;
  const party = state?.party || { adults: 1, children: 0 };
  const travelDate = state?.travelDate;
  const cheapestAvailablePrice = state?.cheapestAvailablePrice ?? option?.price;

  const totalPassengers = party.adults + party.children;
  const initialPassengers = Array.from({ length: totalPassengers }, (_, i) => ({
    name: "",
    age: "",
    type: i < party.adults ? "Adult" : "Child",
  }));

  const [contact, setContact] = useState({ email: email || "", phone: "" });
  const [passengers, setPassengers] = useState(initialPassengers);

  const [profile, setProfile] = useState(null);
  const [promptChoice, setPromptChoice] = useState(null); // null | "auto" | "manual"
  const [fingerprintBusy, setFingerprintBusy] = useState(false);
  const [fingerprintError, setFingerprintError] = useState("");
  const [saveForNextTime, setSaveForNextTime] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/api/users/me/passenger-profile")
      .then(({ data }) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setProfile({ hasFingerprint: false, email: "", phone: "", passengers: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!option) {
    return (
      <div className="max-w-md mx-auto text-center py-20 text-mist">
        No option selected.
        <div className="mt-4">
          <Button onClick={() => navigate("/dashboard")}>Back to search</Button>
        </div>
      </div>
    );
  }

  const showAutofillBanner =
    profile?.hasFingerprint && profile.passengers?.length > 0 && promptChoice === null;

  const handleUseFingerprint = async () => {
    setFingerprintBusy(true);
    setFingerprintError("");
    try {
      const { data: options } = await api.post("/api/auth/webauthn/login/options", { email });
      const assertion = await loginWithFingerprint(options);
      await api.post("/api/auth/webauthn/login/verify", { email, ...assertion });

      setContact((c) => ({
        ...c,
        phone: profile.phone || c.phone,
        email: profile.email || c.email,
      }));
      setPassengers((prev) => fillFromSaved(prev, profile.passengers));
      setPromptChoice("auto");
    } catch (err) {
      setFingerprintError("Fingerprint check failed — you can fill the form manually instead.");
    } finally {
      setFingerprintBusy(false);
    }
  };

  const updatePassenger = (i, field) => (e) => {
    const next = [...passengers];
    next[i] = { ...next[i], [field]: e.target.value };
    setPassengers(next);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saveForNextTime) {
      try {
        await api.put("/api/users/me/passenger-profile", {
          phone: contact.phone,
          passengers: passengers.map((p) => ({
            name: p.name,
            age: Number(p.age) || null,
            type: p.type,
          })),
        });
      } catch (err) {
        /* non-blocking — booking proceeds even if saving the profile fails */
      }
    }
    navigate("/payment", {
      state: { option, party, travelDate, cheapestAvailablePrice, contact, passengers },
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-mist text-sm mb-6 hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to results
      </button>

      <div className="rounded-2xl border border-line bg-surface p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-mist-soft mb-1">
            {option.mode} · {option.providerName}
          </p>
          <p className="text-ink font-semibold text-lg">
            {option.origin} → {option.destination}
          </p>
          <p className="text-mist text-xs mt-1">
            {option.departureTime} – {option.arrivalTime} · {option.durationLabel} · {travelDate}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-mist-soft">Base fare / passenger</p>
          <p className="text-ink font-bold text-lg">₹{option.price.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {showAutofillBanner && (
        <div className="rounded-2xl border border-line bg-violet-soft/40 p-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-soft text-violet flex items-center justify-center shrink-0">
              <Fingerprint size={20} />
            </div>
            <div>
              <p className="text-ink font-semibold text-sm">Skip the form with your fingerprint</p>
              <p className="text-mist text-xs mt-0.5">We have your saved passenger details from last time.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              className="text-xs h-9"
              onClick={() => setPromptChoice("manual")}
            >
              Fill manually
            </Button>
            <Button
              type="button"
              className="text-xs h-9"
              onClick={handleUseFingerprint}
              disabled={fingerprintBusy}
            >
              <Fingerprint size={14} /> {fingerprintBusy ? "Checking…" : "Use fingerprint"}
            </Button>
          </div>
        </div>
      )}

      {fingerprintError && promptChoice === null && (
        <p className="text-red-500 text-xs mb-4 -mt-3">{fingerprintError}</p>
      )}

      {promptChoice === "auto" && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald/10 text-emerald text-xs font-medium px-4 py-2.5 mb-6">
          <Check size={14} /> Filled in from your saved fingerprint profile — double-check before continuing.
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-6">
        <div>
          <h3 className="text-ink font-semibold text-sm mb-3 flex items-center gap-2">
            <Users size={15} /> Passenger details ({totalPassengers})
          </h3>
          <div className="flex flex-col gap-3">
            {passengers.map((p, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_100px_110px] gap-2.5 rounded-xl border border-line p-3.5 bg-surface"
              >
                <FloatingInput
                  label={`${p.type} ${i + 1} — Full name`}
                  icon={User}
                  value={p.name}
                  onChange={updatePassenger(i, "name")}
                  required
                  className="h-11 text-sm"
                />
                <FloatingInput
                  label="Age"
                  type="number"
                  value={p.age}
                  onChange={updatePassenger(i, "age")}
                  required
                  className="h-11 text-sm"
                />
                <div className="flex items-center text-xs text-mist-soft font-medium">{p.type}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-ink font-semibold text-sm mb-3">Contact details</h3>
          <div className="grid grid-cols-2 gap-3">
            <FloatingInput
              label="Email address"
              type="email"
              icon={Mail}
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              required
              className="h-11 text-sm"
            />
            <FloatingInput
              label="Phone number"
              icon={Phone}
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              required
              className="h-11 text-sm"
            />
          </div>
          <p className="text-mist-soft text-xs mt-2">
            Booking confirmation and e-tickets will be sent here.
          </p>
        </div>

        {profile?.hasFingerprint && (
          <label className="flex items-center gap-2 text-xs text-mist -mt-2 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={saveForNextTime}
              onChange={(e) => setSaveForNextTime(e.target.checked)}
              className="accent-violet w-3.5 h-3.5"
            />
            Save these passenger details to my fingerprint profile for next time
          </label>
        )}

        <Button type="submit" className="w-full h-12 text-sm">
          Continue to payment
        </Button>
      </form>
    </div>
  );
}