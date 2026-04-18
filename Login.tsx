import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LiquidButton, GlassFilter } from '@/components/ui/liquid-glass';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SplineScene } from '@/components/ui/splite';
import { Spotlight } from '@/components/ui/spotlight';
import { auth, db, signInWithGoogle, getGoogleRedirectResult, getCurrentDomain } from '@/src/lib/firebase';
import { setSession, getSession } from '@/src/lib/session';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { LogIn, ChevronDown } from 'lucide-react';
import ThemeToggle from '@/src/components/ThemeToggle';

const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'] as const;
type YearLevelOption = typeof YEAR_LEVELS[number];

const PENDING_KEY = 'ie_matrix_pending_login';

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
          const domain = getCurrentDomain();
          toast.error(
            `Domain not authorized. Add "${domain}" to Firebase Console → Authentication → Settings → Authorized Domains.`,
            { duration: 10000 }
          );
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const saveUserAndNavigate = async (
    user: any,
    name: string,
    id: string,
    level: string
  ) => {
    const ADMIN_EMAIL = 'rashmae26@gmail.com';
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
        const domain = getCurrentDomain();
        toast.error(
          `Domain "${domain}" is not authorized. Go to Firebase Console → Authentication → Settings → Authorized Domains and add it.`,
          { duration: 10000 }
        );
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in was cancelled. Please try again.');
      } else {
        toast.error(error.message || 'Failed to sign in');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-background relative transition-colors duration-500">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 z-0 bg-background opacity-50" />
      <GlassFilter />

      {/* Left Panel: Branding & 3D Scene */}
      <div className="hidden md:flex flex-1 items-center justify-center relative overflow-hidden z-10">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />

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
          className="z-10 text-center pointer-events-none"
        >
          <div className="relative w-32 h-32 mx-auto mb-8 group">
            <div className="absolute inset-0 bg-ctu-gold/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-full h-full neumorphic-raised rounded-full p-1 flex items-center justify-center bg-background overflow-hidden border border-white/10">
              <div className="absolute inset-0 border-2 border-ctu-gold/30 rounded-full animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-2 border border-ctu-maroon/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-ctu-gold via-ctu-maroon to-navy-deep flex items-center justify-center shadow-inner overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)]" />
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-12 h-12 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] flex items-center justify-center"
                >
                  <div className="w-6 h-6 rounded-full bg-navy-deep flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-ctu-gold animate-ping" />
                  </div>
                </motion.div>
                <div className="absolute inset-0 w-full h-1 bg-white/20 blur-sm animate-[scan_4s_linear_infinite]" />
              </div>
            </div>
          </div>

          <h1 className="text-7xl frosted-header font-bold mb-2 tracking-tighter drop-shadow-lg text-foreground">IE MATRIX</h1>
          <p className="text-foreground/80 text-xl font-medium max-w-md mx-auto">
            Interactive 3D Curriculum Intelligence.
          </p>
        </motion.div>
      </div>

      {/* Mobile Branding */}
      <div className="md:hidden pt-12 pb-4 text-center z-10 space-y-6">
        <div className="relative w-24 h-24 mx-auto group">
          <div className="absolute inset-0 bg-ctu-gold/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-full h-full neumorphic-raised rounded-full p-1 flex items-center justify-center bg-background overflow-hidden border border-white/10 scale-75">
            <div className="absolute inset-0 border-2 border-ctu-gold/30 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-ctu-gold via-ctu-maroon to-navy-deep flex items-center justify-center shadow-inner overflow-hidden">
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-8 h-8 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] flex items-center justify-center"
              >
                <div className="w-4 h-4 rounded-full bg-navy-deep flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-ctu-gold animate-ping" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        <h1 className="text-4xl frosted-header font-bold tracking-tighter">IE MATRIX</h1>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex items-start md:items-center justify-center p-6 md:p-6 z-10">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md neumorphic-card p-6 md:p-10"
        >
          <div className="mb-6 md:mb-8 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl frosted-header font-bold mb-1">Welcome Back</h2>
            <p className="text-sm md:text-base text-foreground/60 font-medium">CTU Industrial Engineering Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-xs md:text-sm text-foreground/70 font-bold ml-1">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-background border-none neumorphic-pressed h-12 md:h-14 rounded-2xl focus:ring-ctu-gold text-foreground placeholder:text-foreground/30 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber" className="text-xs md:text-sm text-foreground/70 font-bold ml-1">ID Number</Label>
              <Input
                id="idNumber"
                placeholder="XX-XXXXX-XXX"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="bg-background border-none neumorphic-pressed h-12 md:h-14 rounded-2xl focus:ring-ctu-gold text-foreground placeholder:text-foreground/30 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearLevel" className="text-xs md:text-sm text-foreground/70 font-bold ml-1">Year Level</Label>
              <div className="relative">
                <select
                  id="yearLevel"
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value as YearLevelOption)}
                  className="w-full bg-background border-none neumorphic-pressed h-12 md:h-14 rounded-2xl focus:ring-ctu-gold text-foreground text-sm appearance-none pl-4 pr-10 cursor-pointer"
                >
                  <option value="" disabled>Select your year level</option>
                  {YEAR_LEVELS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
              </div>
            </div>

            <div className="pt-4 md:pt-6">
              <LiquidButton
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-ctu-gold to-ctu-maroon hover:opacity-90 shadow-[0_10px_30px_rgba(146,93,252,0.3)] transition-all duration-300 rounded-2xl md:rounded-3xl min-h-[64px] md:min-h-[76px] w-full border-none"
              >
                <div className="flex items-center justify-center gap-3 md:gap-4 w-full h-full">
                  {loading ? (
                    <span className="animate-pulse text-white font-bold text-base md:text-lg">Connecting...</span>
                  ) : (
                    <>
                      <LogIn size={20} className="text-white md:w-6 md:h-6" />
                      <span className="text-white font-bold text-lg md:text-2xl tracking-tight">Enter Matrix</span>
                    </>
                  )}
                </div>
              </LiquidButton>
              <p className="text-[9px] md:text-[10px] text-foreground/40 text-center mt-6 font-bold uppercase tracking-widest whitespace-nowrap">
                * Requires Google Auth
              </p>
            </div>
          </form>

          <p className="mt-8 md:mt-10 text-center text-[9px] font-bold uppercase tracking-widest text-foreground/20">
            © 2026 CTU IE Dept.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
