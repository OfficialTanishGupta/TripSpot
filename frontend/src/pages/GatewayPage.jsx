import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Fingerprint, ShieldCheck, ArrowRight, Compass } from 'lucide-react';
import { FloatingInput } from '../components/ui/floating-input';
import { Button } from '../components/ui/button';
import { PhotoMarquee } from '../components/PhotoMarquee';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { registerFingerprint } from '../lib/webauthn';
import { MARQUEE_COLUMNS, STORY_SLIDES } from '../data/sampleData';

export default function GatewayPage() {
  const [mode, setMode] = useState('signup');
  const [step, setStep] = useState('form');
  const [slide, setSlide] = useState(0);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const finishAndEnter = (token, email) => {
    login(token || `demo-token-${Date.now()}`, email);
    navigate('/dashboard');
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const payload = mode === 'signup'
        ? { fullName: form.fullName, email: form.email, password: form.password }
        : { email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);
      if (mode === 'signup') {
        setStep('fingerprint-offer');
        setForm((f) => ({ ...f, _token: data.token }));
      } else {
        finishAndEnter(data.token, form.email);
      }
    } catch (err) {
      if (mode === 'signup') setStep('fingerprint-offer');
      else finishAndEnter(null, form.email);
    } finally {
      setLoading(false);
    }
  };

  const enableFingerprint = async () => {
    try {
      const { data: options } = await api.post('/api/auth/webauthn/register/options', { email: form.email });
      const attestation = await registerFingerprint(options);
      await api.post('/api/auth/webauthn/register/verify', {
        email: form.email, ...attestation, deviceLabel: navigator.platform || 'This device',
      });
    } catch (err) { /* demo fallback */ }
    finally { finishAndEnter(form._token, form.email); }
  };

  return (
    <div className="min-h-screen flex max-md:flex-col">
      {/* Visual side */}
      <div className="relative flex-1 overflow-hidden max-md:h-56 bg-ink">
        <PhotoMarquee columns={MARQUEE_COLUMNS} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/30 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-between p-9 max-md:p-5">
          <div className="flex items-center gap-2.5 font-display font-bold text-white">
            <span className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
              <Compass size={18} />
            </span>
            TripSpot
          </div>

          <div className="max-w-md max-md:hidden">
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              India, one board<br />of fares away.
            </h1>
            <p className="text-mist text-base leading-relaxed mb-6">
              Cabs, trains, buses and flights compared side by side — and ranked by a
              model trained on how <em className="not-italic text-white">you</em> actually travel.
            </p>
            <div className="flex gap-1.5">
              {STORY_SLIDES.map((_, i) => (
                <span key={i} className="h-1 w-8 rounded-full bg-white/25 overflow-hidden">
                  <span className="block h-full bg-white animate-shimmer" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="w-full md:max-w-md flex items-center justify-center p-8 max-md:p-6 bg-ink">
        <div className="w-full max-w-sm">
          {step === 'fingerprint-offer' ? (
            <div className="animate-fade-up">
              <div className="w-13 h-13 rounded-2xl bg-violet-soft text-violet flex items-center justify-center mb-5">
                <Fingerprint size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Want instant sign-in next time?</h2>
              <p className="text-mist text-sm leading-relaxed mb-6">
                Turn on fingerprint / Face ID sign-in for this device. Completely optional —
                your password always works too, and you can switch it off anytime in Settings.
              </p>
              <div className="flex flex-col gap-2.5">
                <Button className="w-full" onClick={enableFingerprint}>
                  <Fingerprint size={18} /> Enable fingerprint sign-in
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => finishAndEnter(form._token, form.email)}>
                  Skip for now
                </Button>
              </div>
              <div className="flex items-start gap-2 mt-5 p-3 rounded-xl bg-ink-soft text-mist-soft text-xs leading-relaxed">
                <ShieldCheck size={15} className="shrink-0 mt-0.5" />
                Uses your device's own biometric hardware. TripSpot never sees or stores your fingerprint.
              </div>
            </div>
          ) : (
            <div className="animate-fade-up">
              <div className="flex gap-1 bg-ink-soft rounded-xl p-1 mb-7">
                {['signup', 'login'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      mode === m ? 'bg-surface-raised text-white shadow' : 'text-mist-soft'
                    }`}
                  >
                    {m === 'signup' ? 'Create account' : 'Sign in'}
                  </button>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-white mb-1.5">
                {mode === 'signup' ? "Let's get you set up" : 'Welcome back'}
              </h2>
              <p className="text-mist text-sm mb-6">
                {mode === 'signup' ? 'One board for every way to get there.' : 'Sign in to see your saved trips.'}
              </p>

              <form onSubmit={submit} className="flex flex-col gap-3.5">
                {mode === 'signup' && (
                  <FloatingInput label="Full name" icon={User} value={form.fullName} onChange={update('fullName')} required />
                )}
                <FloatingInput label="Email address" type="email" icon={Mail} value={form.email} onChange={update('email')} required />
                <FloatingInput label="Password" type="password" icon={Lock} value={form.password} onChange={update('password')} required minLength={6} />

                <Button type="submit" className="w-full mt-1.5" disabled={loading}>
                  {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
                  <ArrowRight size={16} />
                </Button>
              </form>

              <p className="text-center text-mist text-sm mt-6">
                {mode === 'signup' ? 'Already have an account?' : 'New to TripSpot?'}{' '}
                <button className="text-violet font-semibold" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
                  {mode === 'signup' ? 'Sign in' : 'Create one'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
