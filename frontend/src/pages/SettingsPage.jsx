import { useState } from "react";
import {
  User,
  Phone,
  MapPin,
  Fingerprint,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { FloatingInput } from "../components/ui/floating-input";
import { Button } from "../components/ui/button";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { registerFingerprint } from "../lib/webauthn";

const SEAT_OPTIONS = ["NONE", "WINDOW", "AISLE"];
const MODE_OPTIONS = ["ANY", "CAB", "TRAIN", "BUS", "FLIGHT"];

export default function SettingsPage() {
  const { email } = useAuth();
  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    homeCity: "",
  });
  const [preferredMode, setPreferredMode] = useState("ANY");
  const [seatPreference, setSeatPreference] = useState("NONE");
  const [devices, setDevices] = useState([]);
  const [saved, setSaved] = useState(false);

  const update = (field) => (e) =>
    setProfile({ ...profile, [field]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.put("/api/users/me/preferences", {
        ...profile,
        preferredMode,
        seatPreference,
      });
    } catch (err) {
      /* demo */
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const addFingerprint = async () => {
    try {
      const { data: options } = await api.post(
        "/api/auth/webauthn/register/options",
        { email },
      );
      const attestation = await registerFingerprint(options);
      await api.post("/api/auth/webauthn/register/verify", {
        email,
        ...attestation,
        deviceLabel: navigator.platform || "This device",
      });
      setDevices((d) => [
        ...d,
        { id: Date.now(), label: navigator.platform || "This device" },
      ]);
    } catch (err) {
      setDevices((d) => [
        ...d,
        {
          id: Date.now(),
          label: (navigator.platform || "This device") + " (demo)",
        },
      ]);
    }
  };

  const removeDevice = (id) =>
    setDevices((d) => d.filter((dev) => dev.id !== id));

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-ink">Consolidated Settings</h1>
      <p className="text-mist text-sm mt-1.5 mb-7">
        Your profile, travel preferences, and sign-in options.
      </p>

      <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
        <section className="bg-surface border border-line rounded-2xl p-6 shadow-sm">
          <h3 className="text-ink font-semibold text-sm mb-4.5">Profile</h3>
          <form onSubmit={save} className="flex flex-col gap-4">
            <FloatingInput
              label="Full name"
              icon={User}
              value={profile.fullName}
              onChange={update("fullName")}
              accentClass="peer-focus:text-violet"
              accentBorder="focus:border-violet"
            />
            <FloatingInput
              label="Phone number"
              icon={Phone}
              value={profile.phone}
              onChange={update("phone")}
              accentClass="peer-focus:text-violet"
              accentBorder="focus:border-violet"
            />
            <FloatingInput
              label="Home city"
              icon={MapPin}
              value={profile.homeCity}
              onChange={update("homeCity")}
              accentClass="peer-focus:text-violet"
              accentBorder="focus:border-violet"
            />

            <div>
              <label className="block text-[0.7rem] text-mist-soft uppercase tracking-wide mb-2">
                Preferred mode
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MODE_OPTIONS.map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setPreferredMode(m)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${preferredMode === m ? "bg-violet text-white" : "bg-canvas text-mist hover:text-ink"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[0.7rem] text-mist-soft uppercase tracking-wide mb-2">
                Seat preference
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SEAT_OPTIONS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSeatPreference(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${seatPreference === s ? "bg-violet text-white" : "bg-canvas text-mist hover:text-ink"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full">
              {saved ? "Saved ✓" : "Save changes"}
            </Button>
          </form>
        </section>

        <section className="bg-surface border border-line rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-3.5 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-violet-soft text-violet flex items-center justify-center shrink-0">
              <Fingerprint size={22} />
            </div>
            <div>
              <h3 className="text-ink font-semibold text-sm">
                Fingerprint sign-in
              </h3>
              <p className="text-mist text-xs mt-1 leading-relaxed">
                Optional. Skip it entirely if you'd rather always use your
                password.
              </p>
            </div>
          </div>

          {devices.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-mist-soft text-sm mb-3.5">
                No devices added yet.
              </p>
              <Button onClick={addFingerprint}>
                <Fingerprint size={16} /> Add this device
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {devices.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-2.5 bg-canvas rounded-xl px-3 py-2.5 text-sm"
                >
                  <ShieldCheck size={16} className="text-emerald shrink-0" />
                  <span className="flex-1 text-mist">{d.label}</span>
                  <button
                    onClick={() => removeDevice(d.id)}
                    className="text-mist-soft hover:text-pink"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <button
                onClick={addFingerprint}
                className="text-xs text-mist hover:text-ink text-left mt-1"
              >
                + Add another device
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
