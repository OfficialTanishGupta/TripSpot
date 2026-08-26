import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/tour-guide.svg";
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

const HEADLINES = [
  "Map out your budget. Unlock the world.",
  "The economy tickets often lead to the richest stories.",
  "Travel light on spending, heavy on experiences.",
  "Compare the fares, live the adventures.",
];

export default function GatewayPage() {
  const [mode, setMode] = useState("signup");
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setHeadlineIndex((i) => (i + 1) % HEADLINES.length);
        setFading(false);
      }, 450); // matches transition duration below
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  // Switches sign-up/sign-in and clears the form so a password (or anything
  // else) typed on one side never leaks into the other.
  const switchMode = (m) => {
    setMode(m);
    setError("");
    setForm({ fullName: "", email: "", password: "" });
  };

  const finishAndEnter = (token, email) => {
    login(token || `demo-token-${Date.now()}`, email);
    navigate("/dashboard");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
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
      if (mode === "signup") {
        setStep("fingerprint-offer");
      } else {
        setError(err.response?.data?.error || "Invalid email or password");
      }
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
    <div className="relative z-0 h-screen w-screen flex flex-col items-center justify-center overflow-hidden bg-canvas px-4 [perspective:1400px]">
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

      {/* Brand mark — no box, just logo + wordmark with a drop-shadow for legibility over photos */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 font-display font-semibold text-ink z-10 [text-shadow:0_1px_12px_rgba(255,255,255,0.9)]">
        <img
          src={logo}
          alt="TripSpot"
          className="w-6 h-6 drop-shadow-[0_1px_6px_rgba(255,255,255,0.9)]"
        />
        <span className="text-[1.05rem] tracking-[-0.01em]">TripSpot</span>
      </div>

      {/* Main Unified Interactive Layout Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col justify-center items-center h-full max-h-[85vh] gap-y-4 md:gap-y-6">
        {step !== "fingerprint-offer" && (
          <div className="relative text-center w-full animate-fade-up px-4">
            <div className="absolute inset-x-0 inset-y-[-0.75rem] -z-10 glass rounded-2xl opacity-90 backdrop-blur-md" />

            <p className="text-mist-soft text-[11px] font-semibold tracking-[0.14em] uppercase mb-2">
              India, one board of fares away
            </p>

            <h1
              className={`font-display text-[1.7rem] md:text-[2.1rem] font-semibold tracking-[-0.02em] text-ink leading-[1.15] min-h-[4.5rem] md:min-h-[3.6rem] flex items-center justify-center transition-all duration-500 ease-out ${
                fading
                  ? "opacity-0 -translate-y-1.5"
                  : "opacity-100 translate-y-0"
              }`}
            >
              {HEADLINES[headlineIndex]}
            </h1>

            <div className="flex items-center justify-center gap-1.5 mt-3">
              {HEADLINES.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === headlineIndex ? "w-5 bg-ink" : "w-1 bg-ink/20"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Card: real 3D tilt via mouse tracking */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          className="glass w-full rounded-2xl shadow-[0_25px_60px_-15px_rgba(60,70,140,0.35)] p-5 md:p-6 animate-fade-up backdrop-blur-3xl transition-transform duration-200 ease-out will-change-transform [transform-style:preserve-3d]"
          style={{
            animationDelay: "90ms",
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
        >
          {step === "fingerprint-offer" ? (
            <div className="animate-fade-up">
              <div className="w-12 h-12 rounded-xl bg-violet-soft text-violet flex items-center justify-center mb-4 animate-float">
                <Fingerprint size={24} />
              </div>
              <h2 className="text-xl font-bold text-ink mb-1">
                {" "}
                Want instant sign-in next time?{" "}
              </h2>
              <p className="text-mist text-xs leading-relaxed mb-4">
                {" "}
                Turn on fingerprint / Face ID sign-in for this device.{" "}
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  className="w-full text-xs h-10"
                  onClick={enableFingerprint}
                >
                  <Fingerprint size={16} /> Enable fingerprint sign-in
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-xs h-10"
                  onClick={() => finishAndEnter(form._token, form.email)}
                >
                  Skip for now
                </Button>
              </div>
              <div className="flex items-start gap-2 mt-4 p-2.5 rounded-lg bg-blue-soft text-mist text-[11px] leading-relaxed">
                <ShieldCheck size={14} className="shrink-0 mt-0.5 text-blue" />{" "}
                Uses your device's biometric hardware.
              </div>
            </div>
          ) : (
            <div
              className="animate-fade-up"
              style={{ animationDelay: "150ms" }}
            >
              <div className="relative flex bg-black/[0.04] rounded-xl p-1 mb-4 h-9">
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
                    onClick={() => switchMode(m)}
                    className={`relative z-10 flex-1 rounded-lg text-xs font-bold transition-colors duration-200 ${mode === m ? "text-ink" : "text-mist-soft"}`}
                  >
                    {m === "signup" ? "Create account" : "Sign in"}
                  </button>
                ))}
              </div>
              <h2 className="text-xl font-bold text-ink mb-1">
                {mode === "signup" ? "Let's get you set up" : "Welcome back"}
              </h2>
              <p className="text-mist text-xs mb-4">
                {mode === "signup"
                  ? "One board for every way to get there."
                  : "Sign in to see your saved trips."}
              </p>

              <form onSubmit={submit} className="flex flex-col gap-2.5">
                {mode === "signup" && (
                  <FloatingInput
                    label="Full name"
                    icon={User}
                    value={form.fullName}
                    onChange={update("fullName")}
                    required
                    className="h-10 text-sm"
                  />
                )}
                <FloatingInput
                  label="Email address"
                  type="email"
                  icon={Mail}
                  value={form.email}
                  onChange={update("email")}
                  required
                  className="h-10 text-sm"
                />
                <FloatingInput
                  label="Password"
                  type="password"
                  icon={Lock}
                  value={form.password}
                  onChange={update("password")}
                  required
                  minLength={6}
                  className="h-10 text-sm"
                />
                <Button
                  type="submit"
                  className="w-full mt-2 h-10 text-sm"
                  disabled={loading}
                >
                  {loading
                    ? "Please wait…"
                    : mode === "signup"
                      ? "Create account"
                      : "Sign in"}
                  <ArrowRight size={14} />
                </Button>
              </form>

              {error && (
                <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
              )}

              <p className="text-center text-mist text-xs mt-4">
                {mode === "signup"
                  ? "Already have an account?"
                  : "New to TripSpot?"}{" "}
                <button
                  className="text-violet font-semibold"
                  onClick={() =>
                    switchMode(mode === "signup" ? "login" : "signup")
                  }
                >
                  {mode === "signup" ? "Sign in" : "Create one"}
                </button>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-mist-soft text-[10px] tracking-wide uppercase font-semibold">
          Secured with end-to-end encryption
        </p>
      </div>
    </div>
  );
}
