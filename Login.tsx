import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LiquidButton, GlassFilter } from '@/components/ui/liquid-glass';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SplineScene } from '@/components/ui/splite';
import { Spotlight } from '@/components/ui/spotlight';
import { db, signInWithGoogle, getGoogleRedirectResult, getCurrentDomain } from '@/src/lib/firebase';
import { setSession, getSession } from '@/src/lib/session';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { LogIn, ChevronDown, Copy, Check, AlertTriangle, ExternalLink } from 'lucide-react';
import ThemeToggle from '@/src/components/ThemeToggle';

const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'] as const;
type YearLevelOption = typeof YEAR_LEVELS[number];

const PENDING_KEY = 'ie_matrix_pending_login';
const ADMIN_EMAIL = 'rashmae26@gmail.com';

function storePendingLogin(data: { fullName: string; idNumber: string; yearLevel: string }) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(data));
}

function getPendingLogin() {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (raw) return JSON.parse(raw) as { fullName: string; idNumber: string; yearLevel: string };
  } catch {}
  return null;
}

function clearPendingLogin() {
  sessionStorage.removeItem(PENDING_KEY);
}

export default function Login() {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [yearLevel, setYearLevel] = useState<YearLevelOption | ''>('');
  const [loading, setLoading] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getSession()) {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    getGoogleRedirectResult()
      .then(async (user) => {
        if (!user) return;
        const pending = getPendingLogin();
        if (!pending) {
          toast.error('Session expired. Please fill in your details and try again.');
          return;
        }
        await saveUserAndNavigate(user, pending.fullName, pending.idNumber, pending.yearLevel);
        clearPendingLogin();
      })
      .catch((error: any) => {
        if (error.code === 'auth/unauthorized-domain') {
          setDomainError(getCurrentDomain());
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const saveUserAndNavigate = async (user: any, name: string, id: string, level: string) => {
    const userRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userRef);

    const baseData = {
      uid: user.uid,
      email: user.email,
      photoURL: user.photoURL ?? null,
      lastLogin: serverTimestamp(),
    };

    const userData = existing.exists()
      ? { ...baseData }
      : {
          ...baseData,
          fullName: name.trim(),
          idNumber: id.trim(),
          yearLevel: level,
          role: user.email === ADMIN_EMAIL ? 'admin' : 'student',
          createdAt: serverTimestamp(),
        };

    await setDoc(userRef, userData, { merge: true });

    setSession({
      uid: user.uid,
      fullName: existing.exists() ? existing.data().fullName : name.trim(),
      idNumber: existing.exists() ? existing.data().idNumber : id.trim(),
      yearLevel: existing.exists() ? (existing.data().yearLevel ?? level) : level,
      email: user.email,
      role: existing.exists()
        ? existing.data().role
        : user.email === ADMIN_EMAIL ? 'admin' : 'student',
      photoURL: user.photoURL ?? null,
      loginTime: new Date().toISOString(),
    });

    toast.success('Welcome to IE Matrix!');
    navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !idNumber.trim() || !yearLevel) {
      toast.error('Please fill in all fields');
      return;
    }

    const idRegex = /^(\d{2}-\d{5}-\d{3}|\d{5,10})$/;
    if (!idRegex.test(idNumber.trim())) {
      toast.error('Invalid ID format. Use XX-XXXXX-XXX or your numeric ID');
      return;
    }

    setLoading(true);
    setDomainError(null);

    try {
      storePendingLogin({ fullName, idNumber, yearLevel });
      const user = await signInWithGoogle();
      if (user) {
        await saveUserAndNavigate(user, fullName, idNumber, yearLevel);
        clearPendingLogin();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      clearPendingLogin();

      if (error.code === 'auth/unauthorized-domain') {
        setDomainError(getCurrentDomain());
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in was cancelled. Please try again.');
      } else {
        toast.error(error.message || 'Failed to sign in');
      }
      setLoading(false);
    }
  };

  const handleCopyDomain = async () => {
    if (!domainError) return;
    await navigator.clipboard.writeText(domainError);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-background relative transition-colors duration-500">
      <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-50">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 z-0 bg-background opacity-50" />
      <GlassFilter />

      {/* ── Left Panel: Branding & 3D Scene (md+) ── */}
      <div className="hidden md:flex flex-1 items-center justify-center relative overflow-hidden z-10">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

        <div className="absolute inset-0 z-0">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="z-10 text-center pointer-events-none px-8"
        >
          <AILogo size="lg" />
          <h1 className="text-6xl lg:text-7xl frosted-header font-bold mb-2 tracking-tighter drop-shadow-lg text-foreground">
            IE MATRIX
          </h1>
          <p className="text-foreground/80 text-lg lg:text-xl font-medium max-w-xs mx-auto">
            Interactive 3D Curriculum Intelligence.
          </p>
        </motion.div>
      </div>

      {/* ── Mobile/Tablet Header (below md) ── */}
      <div className="md:hidden flex items-center justify-center gap-3 pt-10 pb-2 px-6 z-10">
        <AILogo size="sm" />
        <div className="text-left">
          <h1 className="text-3xl sm:text-4xl frosted-header font-bold tracking-tighter leading-none">
            IE MATRIX
          </h1>
          <p className="text-xs text-foreground/50 font-semibold tracking-wider uppercase mt-0.5">
            CTU · Industrial Engineering
          </p>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-0 z-10">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="w-full max-w-sm sm:max-w-md neumorphic-card p-5 sm:p-8 md:p-10"
        >
          <div className="mb-5 sm:mb-7 text-center md:text-left">
            <h2 className="text-xl sm:text-2xl md:text-3xl frosted-header font-bold mb-0.5">
              Welcome Back
            </h2>
            <p className="text-xs sm:text-sm text-foreground/55 font-medium">
              CTU Industrial Engineering Portal
            </p>
          </div>

          {/* Domain Error Banner */}
          {domainError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2.5"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold leading-snug">
                  Domain not authorized in Firebase. Add it in Firebase Console to enable login.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <code className="flex-1 text-[10px] bg-background/60 rounded-xl px-2.5 py-1.5 text-foreground/70 font-mono truncate border border-foreground/10">
                  {domainError}
                </code>
                <button
                  onClick={handleCopyDomain}
                  className="shrink-0 p-1.5 rounded-xl neumorphic-raised hover:neumorphic-pressed transition-all"
                  title="Copy domain"
                >
                  {copied
                    ? <Check size={13} className="text-green-500" />
                    : <Copy size={13} className="text-foreground/50" />
                  }
                </button>
              </div>

              <a
                href={`https://console.firebase.google.com/project/gen-lang-client-0017068472/authentication/settings`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-bold text-ctu-gold hover:underline w-fit"
              >
                <ExternalLink size={11} />
                Open Firebase Console → Auth Settings
              </a>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-[11px] sm:text-xs text-foreground/65 font-bold ml-1 uppercase tracking-wider">
                Full Name
              </Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-background border-none neumorphic-pressed h-11 sm:h-12 md:h-13 rounded-xl sm:rounded-2xl focus:ring-ctu-gold text-foreground placeholder:text-foreground/30 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="idNumber" className="text-[11px] sm:text-xs text-foreground/65 font-bold ml-1 uppercase tracking-wider">
                ID Number
              </Label>
              <Input
                id="idNumber"
                placeholder="XX-XXXXX-XXX"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="bg-background border-none neumorphic-pressed h-11 sm:h-12 md:h-13 rounded-xl sm:rounded-2xl focus:ring-ctu-gold text-foreground placeholder:text-foreground/30 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="yearLevel" className="text-[11px] sm:text-xs text-foreground/65 font-bold ml-1 uppercase tracking-wider">
                Year Level
              </Label>
              <div className="relative">
                <select
                  id="yearLevel"
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value as YearLevelOption)}
                  className="w-full bg-background border-none neumorphic-pressed h-11 sm:h-12 md:h-13 rounded-xl sm:rounded-2xl focus:ring-ctu-gold text-foreground text-sm appearance-none pl-4 pr-10 cursor-pointer"
                >
                  <option value="" disabled>Select your year level</option>
                  {YEAR_LEVELS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
              </div>
            </div>

            <div className="pt-2 sm:pt-3">
              <LiquidButton
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-ctu-gold to-ctu-maroon hover:opacity-90 shadow-[0_8px_24px_rgba(146,93,252,0.25)] transition-all duration-300 rounded-xl sm:rounded-2xl md:rounded-3xl min-h-[56px] sm:min-h-[64px] md:min-h-[72px] w-full border-none"
              >
                <div className="flex items-center justify-center gap-2.5 sm:gap-3 w-full h-full">
                  {loading ? (
                    <span className="animate-pulse text-white font-bold text-sm sm:text-base">
                      Connecting...
                    </span>
                  ) : (
                    <>
                      <LogIn size={18} className="text-white sm:w-5 sm:h-5" />
                      <span className="text-white font-bold text-base sm:text-lg md:text-xl tracking-tight">
                        Enter Matrix
                      </span>
                    </>
                  )}
                </div>
              </LiquidButton>

              <p className="text-[9px] text-foreground/35 text-center mt-4 font-bold uppercase tracking-widest">
                * Requires Google Auth
              </p>
            </div>
          </form>

          <p className="mt-6 sm:mt-8 text-center text-[9px] font-bold uppercase tracking-widest text-foreground/20">
            © 2026 CTU IE Dept.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function AILogo({ size }: { size: 'sm' | 'lg' }) {
  const outer = size === 'lg' ? 'w-28 h-28' : 'w-12 h-12';
  const inner = size === 'lg' ? 'w-18 h-18' : 'w-8 h-8';
  const pulse = size === 'lg' ? 'w-10 h-10' : 'w-4 h-4';
  const dot = size === 'lg' ? 'w-5 h-5' : 'w-2 h-2';
  const ping = size === 'lg' ? 'w-2 h-2' : 'w-1 h-1';
  const mb = size === 'lg' ? 'mb-6' : '';

  return (
    <div className={`relative ${outer} mx-auto ${mb} shrink-0`}>
      <div className="absolute inset-0 bg-ctu-gold/20 rounded-full blur-2xl animate-pulse" />
      <div className="relative w-full h-full neumorphic-raised rounded-full p-1 flex items-center justify-center bg-background overflow-hidden border border-white/10">
        <div className="absolute inset-0 border-2 border-ctu-gold/30 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className={`relative ${size === 'lg' ? 'w-[72px] h-[72px]' : 'w-8 h-8'} rounded-full bg-gradient-to-br from-ctu-gold via-ctu-maroon to-navy-deep flex items-center justify-center shadow-inner overflow-hidden`}>
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className={`${pulse} rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] flex items-center justify-center`}
          >
            <div className={`${dot} rounded-full bg-navy-deep flex items-center justify-center`}>
              <div className={`${ping} rounded-full bg-ctu-gold animate-ping`} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
