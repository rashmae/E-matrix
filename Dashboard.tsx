import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  FolderOpen,
  Megaphone,
  CalendarDays,
  Search,
  ChevronRight,
  ChevronLeft,
  Clock,
  Filter,
  X,
  Star,
  Heart,
  Calendar,
  Zap,
  History,
  SlidersHorizontal
} from 'lucide-react';
import Sidebar from '@/src/components/layout/Sidebar';
import BottomNav from '@/src/components/layout/BottomNav';
import { User, Subject, Announcement, CalendarEvent, YearLevel, Progress } from '@/src/types/index';
import { IE_SUBJECTS, ANNOUNCEMENTS, CALENDAR_EVENTS } from '@/src/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlowCard } from '@/components/ui/spotlight-card';
import { cn } from '@/lib/utils';
import { BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';
import { getSession } from '@/src/lib/session';

type QuickFilter = 'all' | 'favorites' | 'recent' | 'upcoming';

const YEAR_STORAGE_KEY = 'ie_matrix_year_filter';
const FAVORITES_KEY = 'ie_matrix_favorites';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<YearLevel | 'All'>(() => {
    return (localStorage.getItem(YEAR_STORAGE_KEY) as YearLevel | 'All') || 'All';
  });
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      navigate('/login');
    } else {
      setUser(session as any);
    }

    const savedProgress = localStorage.getItem('ie_matrix_progress_v2');
    if (savedProgress) setProgressMap(JSON.parse(savedProgress));

    const savedFavs = localStorage.getItem(FAVORITES_KEY);
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem(YEAR_STORAGE_KEY, selectedYear);
  }, [selectedYear]);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);

  const scrollBy = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector('[data-card]') as HTMLElement;
    const amount = card ? card.offsetWidth + 32 : 300;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const subjectsByYear = {
    '1st': IE_SUBJECTS.filter(s => s.yearLevel === '1st'),
    '2nd': IE_SUBJECTS.filter(s => s.yearLevel === '2nd'),
    '3rd': IE_SUBJECTS.filter(s => s.yearLevel === '3rd'),
    '4th': IE_SUBJECTS.filter(s => s.yearLevel === '4th'),
  };

  const getStats = () => {
    const total = IE_SUBJECTS.length;
    const items = Object.values(progressMap);
    const done = items.filter(s => s.status === 'done').length;
    const inProgress = items.filter(s => s.status === 'in_progress').length;
    let totalWeightedGrade = 0, gradedUnits = 0;
    IE_SUBJECTS.forEach(s => {
      const p = progressMap[s.id];
      if (p?.status === 'done' && p.grade) {
        totalWeightedGrade += p.grade * s.units;
        gradedUnits += s.units;
      }
    });
    const gwa = gradedUnits > 0 ? (totalWeightedGrade / gradedUnits).toFixed(2) : '0.00';
    return { total, done, inProgress, gwa };
  };

  const stats = getStats();

  // Filter recommended subjects
  const recommendedSubjects = IE_SUBJECTS.filter(s => {
    const notDone = !progressMap[s.id] || progressMap[s.id].status !== 'done';
    if (!notDone) return false;

    const matchesSearch = !debouncedSearch ||
      s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (s as any).professor?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (s as any).department?.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesYear = selectedYear === 'All' || s.yearLevel === selectedYear;

    let matchesQuick = true;
    if (quickFilter === 'favorites') matchesQuick = favorites.includes(s.id);
    if (quickFilter === 'recent') matchesQuick = !!progressMap[s.id];
    if (quickFilter === 'upcoming') matchesQuick = !progressMap[s.id];

    return matchesSearch && matchesYear && matchesQuick;
  });

  const hasActiveFilters = debouncedSearch || selectedYear !== 'All' || quickFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedYear('All');
    setQuickFilter('all');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      <Sidebar user={user} />

      <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-10 pb-28 lg:pb-10 overflow-x-hidden">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4 sm:gap-6"
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 hidden sm:block" aria-hidden="true">
              <div className="absolute inset-0 bg-ctu-gold/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-full h-full neumorphic-raised rounded-full p-1 flex items-center justify-center bg-background overflow-hidden border border-white/10">
                <div className="absolute inset-0 border-2 border-ctu-gold/30 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-ctu-gold via-ctu-maroon to-navy-deep flex items-center justify-center shadow-inner overflow-hidden">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-6 h-6 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] flex items-center justify-center"
                  >
                    <div className="w-3 h-3 rounded-full bg-navy-deep flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-ctu-gold animate-ping" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl frosted-header font-bold tracking-tight">
                {getGreeting()}, {user.fullName.split(' ')[0]} 👋
              </h1>
              <p className="text-foreground/55 mt-0.5 text-xs sm:text-sm font-medium">
                Navigate your IE journey. One subject at a time.
              </p>
            </div>
          </motion.div>

          {/* Search + Filters */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col gap-3 w-full md:w-auto md:min-w-[320px] lg:min-w-[380px]"
          >
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/35" size={15} />
              <input
                type="text"
                placeholder="Search subjects, codes..."
                aria-label="Search subjects"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border-none neumorphic-pressed rounded-2xl py-3 pl-10 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-ctu-gold/40 text-foreground placeholder:text-foreground/30"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full text-foreground/40 hover:text-foreground transition-colors"
                  >
                    <X size={13} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Year Level Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter size={11} className="text-ctu-gold shrink-0" />
              {(['All', '1st', '2nd', '3rd', '4th'] as const).map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                    selectedYear === year
                      ? "neumorphic-pressed text-ctu-gold"
                      : "text-foreground/30 hover:text-foreground/70"
                  )}
                >
                  {year === 'All' ? 'All' : `${year}Y`}
                </button>
              ))}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 rounded-lg text-[10px] font-bold text-ctu-maroon hover:bg-ctu-maroon/10 transition-all ml-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Filter Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'all', label: 'All Subjects', icon: BookOpen },
                { id: 'favorites', label: 'Favorites', icon: Heart },
                { id: 'upcoming', label: 'Upcoming', icon: Calendar },
                { id: 'recent', label: 'In Progress', icon: History },
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => setQuickFilter(chip.id as QuickFilter)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all",
                    quickFilter === chip.id
                      ? "bg-ctu-gold/15 text-ctu-gold neumorphic-pressed"
                      : "neumorphic-raised text-foreground/40 hover:text-foreground"
                  )}
                >
                  <chip.icon size={11} />
                  {chip.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {[
                { label: 'Total', value: stats.total.toString(), icon: BookOpen, color: 'text-foreground/40', bg: 'bg-foreground/5' },
                { label: 'Completed', value: stats.done.toString(), icon: TrendingUp, color: 'text-ctu-gold', bg: 'bg-ctu-gold/10' },
                { label: 'In Progress', value: stats.inProgress.toString(), icon: Clock, color: 'text-ctu-maroon', bg: 'bg-ctu-maroon/10' },
                { label: 'GWA', value: stats.gwa, icon: LayoutDashboard, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
              ].map((stat, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="neumorphic-card border-none overflow-hidden hover:scale-[1.02] transition-transform cursor-default">
                    <CardContent className="p-4 sm:p-5 lg:p-6">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3 sm:mb-4", stat.bg)}>
                        <stat.icon size={18} className={stat.color} />
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-foreground/40 uppercase tracking-[1px] font-bold">{stat.label}</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1 sm:mt-2">{stat.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Year Progress Grid */}
            <motion.div variants={itemVariants} className="neumorphic-card p-5 sm:p-6 lg:p-8">
              <h3 className="text-[11px] font-bold text-ctu-gold uppercase tracking-[2px] mb-5 sm:mb-6 lg:mb-8">
                Year Level Progress
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                {[
                  { id: '1st', year: '1st Year', subjects: subjectsByYear['1st'], gradient: 'from-ctu-maroon to-brand-accent', badge: 'bg-ctu-maroon' },
                  { id: '2nd', year: '2nd Year', subjects: subjectsByYear['2nd'], gradient: 'from-ctu-gold to-brand-accent', badge: 'bg-ctu-gold' },
                  { id: '3rd', year: '3rd Year', subjects: subjectsByYear['3rd'], gradient: 'from-brand-accent to-ctu-maroon', badge: 'bg-brand-accent' },
                  { id: '4th', year: '4th Year', subjects: subjectsByYear['4th'], gradient: 'from-ctu-gold to-brand-accent', badge: 'bg-ctu-gold' },
                ].map((yr, i) => {
                  const done = yr.subjects.filter(s => progressMap[s.id]?.status === 'done').length;
                  const pct = Math.round((done / Math.max(yr.subjects.length, 1)) * 100);
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedYear(yr.id as YearLevel)}
                      className={cn(
                        "neumorphic-pressed border-none p-4 sm:p-5 lg:p-6 rounded-2xl flex flex-col justify-between text-left transition-all hover:scale-[1.01]",
                        selectedYear === yr.id && "ring-2 ring-ctu-gold/40"
                      )}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={cn("text-[9px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider text-white", yr.badge)}>
                          {yr.year}
                        </span>
                        <span className="text-[10px] text-foreground/40 font-bold">{done}/{yr.subjects.length}</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-foreground mt-2 tracking-tighter">{pct}%</div>
                      <div className="h-2 bg-foreground/5 rounded-full mt-4 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                          className={cn("h-full rounded-full bg-gradient-to-r", yr.gradient)}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Recommended — Fixed Horizontal Scroll */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div>
                  <h3 className="text-lg sm:text-xl font-display font-bold">Recommended for You</h3>
                  {hasActiveFilters && (
                    <p className="text-[11px] text-foreground/40 font-medium mt-0.5">
                      {recommendedSubjects.length} subject{recommendedSubjects.length !== 1 ? 's' : ''} match your filters
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Arrow Nav — desktop only */}
                  <div className="hidden sm:flex items-center gap-1">
                    <button
                      onClick={() => scrollBy('left')}
                      disabled={!canScrollLeft}
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                        canScrollLeft
                          ? "neumorphic-raised hover:neumorphic-pressed text-foreground/60 hover:text-foreground"
                          : "text-foreground/15 cursor-not-allowed"
                      )}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => scrollBy('right')}
                      disabled={!canScrollRight}
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                        canScrollRight
                          ? "neumorphic-raised hover:neumorphic-pressed text-foreground/60 hover:text-foreground"
                          : "text-foreground/15 cursor-not-allowed"
                      )}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => navigate('/catalog')}
                    className="text-ctu-gold text-xs sm:text-sm font-bold flex items-center gap-1 hover:underline"
                  >
                    View All <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {recommendedSubjects.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 neumorphic-pressed rounded-3xl"
                >
                  <div className="w-16 h-16 rounded-full neumorphic-raised flex items-center justify-center mb-4">
                    <Search size={24} className="text-foreground/20" />
                  </div>
                  <h4 className="text-base font-bold text-foreground/60">No subjects found</h4>
                  <p className="text-xs text-foreground/35 mt-1">Try different search terms or filters</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-ctu-gold neumorphic-raised hover:neumorphic-pressed transition-all"
                  >
                    Clear Filters
                  </button>
                </motion.div>
              ) : (
                <div className="relative -mx-2 px-2">
                  <div
                    ref={scrollRef}
                    className="flex gap-4 sm:gap-6 overflow-x-scroll pb-4 scroll-smooth"
                    style={{
                      scrollSnapType: 'x mandatory',
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'none',
                    }}
                  >
                    {recommendedSubjects.slice(0, 10).map((subject, idx) => (
                      <div
                        key={subject.id}
                        data-card
                        className="shrink-0 w-64 sm:w-72"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <GlowCard
                          glowColor={idx % 2 === 0 ? 'gold' : 'maroon'}
                          customSize
                          className="w-full h-40 sm:h-44 hover:scale-[1.03] transition-all cursor-pointer border-none flex flex-col justify-between"
                          onClick={() => navigate(`/catalog/${subject.id}`)}
                        >
                          <div className="relative z-10 flex justify-between items-start">
                            <Badge variant="outline" className="border-ctu-gold text-ctu-gold text-[10px] font-bold bg-ctu-gold/5">
                              {subject.code}
                            </Badge>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(subject.id); }}
                              className="p-1 rounded-lg hover:bg-foreground/10 transition-colors"
                            >
                              <Heart
                                size={14}
                                className={favorites.includes(subject.id) ? "text-ctu-maroon fill-ctu-maroon" : "text-foreground/30"}
                              />
                            </button>
                          </div>
                          <div className="relative z-10">
                            <h4 className="font-bold text-foreground truncate text-base sm:text-lg">{subject.name}</h4>
                            <p className="text-xs text-foreground/55 font-medium mt-1">
                              {subject.units} Units · {subject.semester} Sem · {subject.yearLevel} Year
                            </p>
                          </div>
                        </GlowCard>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6 lg:space-y-8">
            <motion.div variants={itemVariants}>
              <Card className="neumorphic-card border-none">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2 font-bold">
                    <CalendarDays size={18} className="text-ctu-gold" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {CALENDAR_EVENTS.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={() => navigate('/calendar')}
                      className="flex gap-3 sm:gap-4 items-start p-3 sm:p-4 rounded-2xl neumorphic-raised hover:neumorphic-pressed transition-all cursor-pointer"
                    >
                      <div className="flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl neumorphic-pressed shrink-0">
                        <span className="text-[9px] font-bold uppercase text-foreground/40">
                          {new Date(event.date).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-base sm:text-lg font-bold text-foreground leading-none">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs sm:text-sm font-bold text-foreground truncate">{event.title}</h5>
                        <p className="text-[10px] sm:text-xs text-foreground/40 font-medium line-clamp-1">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="neumorphic-card border-none">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-[11px] font-bold text-ctu-gold uppercase tracking-[2px]">
                    Campus Bulletin
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {ANNOUNCEMENTS.slice(0, 4).map((ann) => (
                    <div
                      key={ann.id}
                      onClick={() => toast.info(`Bulletin: ${ann.title}`, { description: 'See registrar for full details.' })}
                      className={cn(
                        "p-3 sm:p-5 rounded-2xl neumorphic-raised hover:neumorphic-pressed transition-all cursor-pointer border-l-4",
                        ann.category === 'academic' ? 'border-ctu-maroon' :
                        ann.category === 'event' ? 'border-ctu-gold' :
                        ann.category === 'holiday' ? 'border-blue-600' : 'border-green-600'
                      )}
                    >
                      <h5 className="text-[12px] sm:text-[13px] font-bold text-foreground mb-1">{ann.title}</h5>
                      <p className="text-[10px] sm:text-[11px] text-foreground/40 font-bold uppercase tracking-wider">
                        {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {ann.category}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
