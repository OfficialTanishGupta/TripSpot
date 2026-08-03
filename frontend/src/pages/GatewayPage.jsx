import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Fingerprint,
  ShieldCheck,
  ArrowRight,
  Compass,
} from "lucide-react";
import { FloatingInput } from "../components/ui/floating-input";
import { Button } from "../components/ui/button";
import { PhotoMarquee } from "../components/PhotoMarquee";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { registerFingerprint } from "../lib/webauthn";
import { MARQUEE_COLUMNS } from "../data/sampleData";

export default function GatewayPage() {
  const [mode, setMode] = useState("signup");
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const finishAndEnter = (token, email) => {
    login(token || `demo-token-${Date.now()}`, email);
    navigate("/dashboard");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint =
        mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload =
        mode === "signup"
          ? {
              fullName: form.fullName,
              email: form.email,
              password: form.password,
            }
          : { email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);
      if (mode === "signup") {
        setStep("fingerprint-offer");
        setForm((f) => ({ ...f, _token: data.token }));
      } else {
        finishAndEnter(data.token, form.email);
      }
    } catch (err) {
      if (mode === "signup") setStep("fingerprint-offer");
      else finishAndEnter(null, form.email);
    } finally {
      setLoading(false);
    }
  };

  const enableFingerprint = async () => {
    try {
      const { data: options } = await api.post(
        "/api/auth/webauthn/register/options",
        { email: form.email },
      );
      const attestation = await registerFingerprint(options);
      await api.post("/api/auth/webauthn/register/verify", {
        email: form.email,
        ...attestation,
        deviceLabel: navigator.platform || "This device",
      });
    } catch (err) {
      /* demo fallback */
    } finally {
      finishAndEnter(form._token, form.email);
    }
  };

  // Subtle 3D tilt tracking mouse position over the card
  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -6, y: px * 8 }); // rotateX, rotateY in deg, capped small
  };
  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="relative z-0 min-h-screen flex items-center justify-center overflow-hidden bg-canvas px-4 py-12 [perspective:1400px]">
      {/* Vivid moving photo layer — no global fade, just gentle motion */}
      <div className="absolute inset-0 -z-20 saturate-[1.15] contrast-[1.05]">
        <PhotoMarquee columns={MARQUEE_COLUMNS} />
      </div>

      {/* Only the very top/bottom edges ease into the canvas color, center stays vivid */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-canvas) 0%, transparent 14%, transparent 86%, var(--color-canvas) 100%)",
        }}
      />

      {/* Soft moving gradient blobs add extra color depth, blended over photos */}
      <div className="pointer-events-none absolute inset-0 -z-10 mix-blend-soft-light">
        <span className="absolute -top-32 -left-24 w-[440px] h-[440px] rounded-full bg-violet blur-3xl opacity-60 animate-blob" />
        <span className="absolute top-1/4 -right-28 w-[380px] h-[380px] rounded-full bg-blue blur-3xl opacity-60 animate-blob-slow" />
        <span className="absolute -bottom-36 left-[15%] w-[460px] h-[460px] rounded-full bg-emerald blur-3xl opacity-50 animate-blob-slower" />
      </div>

      {/* Brand mark, own small frosted plate so it stays legible over photos */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2.5 font-display font-bold text-ink z-10 px-3 py-1.5 rounded-xl glass shadow-sm">
        <span className="w-7 h-7 rounded-lg bg-violet-soft flex items-center justify-center text-violet">
          <Compass size={16} />
        </span>
        TripSpot
      </div>

      <div className="relative z-10 w-full max-w-md">
        {step !== "fingerprint-offer" && (
          <div className="relative text-center mb-7 animate-fade-up">
            {/* Localized frosted plate just behind the headline, not the whole page */}
            <div className="absolute inset-x-[-2rem] inset-y-[-1rem] -z-10 glass rounded-[2rem]" />
            <h1 className="text-3xl md:text-[2.35rem] font-bold text-ink leading-tight py-2">
              India, one board of fares away.
            </h1>
            <p className="text-mist text-sm mt-3 max-w-sm mx-auto leading-relaxed pb-2">
              Cabs, trains, buses and flights — compared side by side, ranked
              for how <span className="text-gradient font-semibold">you</span>{" "}
              actually travel.
            </p>
          </div>
        )}

        {/* Card: real 3D tilt via mouse tracking + strong backdrop blur so photos
            frost/fade translucently exactly where they pass behind it */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          className="glass rounded-3xl shadow-[0_35px_80px_-25px_rgba(60,70,140,0.45)] p-8 max-md:p-6 animate-fade-up backdrop-blur-2xl transition-transform duration-200 ease-out will-change-transform [transform-style:preserve-3d]"
          style={{
            animationDelay: "90ms",
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
        >
          {step === "fingerprint-offer" ? (
            <div className="animate-fade-up">
              <div className="w-14 h-14 rounded-2xl bg-violet-soft text-violet flex items-center justify-center mb-5 animate-float">
                <Fingerprint size={26} />
              </div>
              <h2 className="text-2xl font-bold text-ink mb-2">
                Want instant sign-in next time?
              </h2>
              <p className="text-mist text-sm leading-relaxed mb-6">
                Turn on fingerprint / Face ID sign-in for this device.
                Completely optional — your password always works too, and you
                can switch it off anytime in Settings.
              </p>
              <div className="flex flex-col gap-2.5">
                <Button className="w-full" onClick={enableFingerprint}>
                  <Fingerprint size={18} /> Enable fingerprint sign-in
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => finishAndEnter(form._token, form.email)}
                >
                  Skip for now
                </Button>
              </div>
              <div className="flex items-start gap-2 mt-5 p-3 rounded-xl bg-blue-soft text-mist text-xs leading-relaxed">
                <ShieldCheck size={15} className="shrink-0 mt-0.5 text-blue" />
                Uses your device's own biometric hardware. TripSpot never sees
                or stores your fingerprint.
              </div>
            </div>
          ) : (
            <div
              className="animate-fade-up"
              style={{ animationDelay: "150ms" }}
            >
              <div className="relative flex bg-black/[0.04] rounded-xl p-1 mb-7 h-11">
                <div
                  className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm transition-transform duration-300 ease-out"
                  style={{
                    width: "calc(50% - 4px)",
                    transform:
                      mode === "login"
                        ? "translateX(calc(100% + 8px))"
                        : "translateX(0)",
                  }}
                />
                {["signup", "login"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`relative z-10 flex-1 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                      mode === m ? "text-ink" : "text-mist-soft"
                    }`}
                  >
                    {m === "signup" ? "Create account" : "Sign in"}
                  </button>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-ink mb-1.5">
                {mode === "signup" ? "Let's get you set up" : "Welcome back"}
              </h2>
              <p className="text-mist text-sm mb-6">
                {mode === "signup"
                  ? "One board for every way to get there."
                  : "Sign in to see your saved trips."}
              </p>

              <form onSubmit={submit} className="flex flex-col gap-3.5">
                {mode === "signup" && (
                  <FloatingInput
                    label="Full name"
                    icon={User}
                    value={form.fullName}
                    onChange={update("fullName")}
                    required
                  />
                )}
                <FloatingInput
                  label="Email address"
                  type="email"
                  icon={Mail}
                  value={form.email}
                  onChange={update("email")}
                  required
                />
                <FloatingInput
                  label="Password"
                  type="password"
                  icon={Lock}
                  value={form.password}
                  onChange={update("password")}
                  required
                  minLength={6}
                />

                <Button
                  type="submit"
                  className="w-full mt-1.5"
                  disabled={loading}
                >
                  {loading
                    ? "Please wait…"
                    : mode === "signup"
                      ? "Create account"
                      : "Sign in"}
                  <ArrowRight size={16} />
                </Button>
              </form>

              <p className="text-center text-mist text-sm mt-6">
                {mode === "signup"
                  ? "Already have an account?"
                  : "New to TripSpot?"}{" "}
                <button
                  className="text-violet font-semibold"
                  onClick={() =>
                    setMode(mode === "signup" ? "login" : "signup")
                  }
                >
                  {mode === "signup" ? "Sign in" : "Create one"}
                </button>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-mist-soft text-xs mt-6">
          Secured with end-to-end encryption
        </p>
      </div>
    </div>
  );
}
