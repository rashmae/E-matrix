import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Grid, List as ListIcon, Star, Link as LinkIcon,
  ChevronRight, CheckCircle2, Clock, Circle, History, X, SlidersHorizontal,
  ArrowUpAZ, ArrowDownAZ, ChevronDown, Heart
} from 'lucide-react';
import Sidebar from '@/src/components/layout/Sidebar';
import BottomNav from '@/src/components/layout/BottomNav';
import { User, Subject, YearLevel, Semester } from '@/src/types/index';
import { IE_SUBJECTS } from '@/src/lib/constants';
import { Badge } from '@/components/ui/badge';
import { GlowCard } from '@/components/ui/spotlight-card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getSession } from '@/src/lib/session';

type SortOption = 'relevance' | 'az' | 'za' | 'units-asc' | 'units-desc';

const FAVORITES_KEY = 'ie_matrix_favorites';

export default function Catalog() {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYears, setSelectedYears] = useState<(YearLevel | 'All')[]>(['All']);
  const [selectedSem, setSelectedSem] = useState<Semester | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [unitsRange, setUnitsRange] = useState<[number, number]>([1, 6]);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (!session) { navigate('/login'); return; }
    setUser(session as any);

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const year = params.get('year');
    if (q) setSearchQuery(q);
    if (year && ['1st','2nd','3rd','4th'].includes(year)) {
      setSelectedYears([year as YearLevel]);
    }

    const h = localStorage.getItem('ie_catalog_search_history');
    if (h) setSearchHistory(JSON.parse(h));

    const favs = localStorage.getItem(FAVORITES_KEY);
    if (favs) setFavorites(JSON.parse(favs));
  }, [navigate]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const addToHistory = (query: string) => {
    if (!query.trim()) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(i => i.toLowerCase() !== query.toLowerCase());
      const next = [query, ...filtered].slice(0, 5);
      localStorage.setItem('ie_catalog_search_history', JSON.stringify(next));
      return next;
    });
  };

  const removeFromHistory = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory(prev => {
      const next = prev.filter(i => i !== query);
      localStorage.setItem('ie_catalog_search_history', JSON.stringify(next));
      return next;
    });
  };

  const toggleYear = (year: YearLevel | 'All') => {
    if (year === 'All') {
      setSelectedYears(['All']);
      return;
    }
    setSelectedYears(prev => {
      const withoutAll = prev.filter(y => y !== 'All');
      if (withoutAll.includes(year)) {
        const next = withoutAll.filter(y => y !== year);
        return next.length === 0 ? ['All'] : next;
      }
      return [...withoutAll, year];
    });
  };

  const filteredSubjects = useMemo(() => {
    let results = IE_SUBJECTS.filter(s => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s as any).professor?.toLowerCase().includes(q);
      const matchesYear = selectedYears.includes('All') || selectedYears.includes(s.yearLevel as YearLevel);
      const matchesSem = selectedSem === 'All' || s.semester === selectedSem;
      const matchesUnits = s.units >= unitsRange[0] && s.units <= unitsRange[1];
      const matchesFav = !showFavOnly || favorites.includes(s.id);
      return matchesSearch && matchesYear && matchesSem && matchesUnits && matchesFav;
    });

    switch (sortBy) {
      case 'az': results = [...results].sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'za': results = [...results].sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'units-asc': results = [...results].sort((a, b) => a.units - b.units); break;
      case 'units-desc': results = [...results].sort((a, b) => b.units - a.units); break;
    }
    return results;
  }, [searchQuery, selectedYears, selectedSem, sortBy, unitsRange, showFavOnly, favorites]);

  const activeFilterCount = [
    !selectedYears.includes('All'),
    selectedSem !== 'All',
    unitsRange[0] !== 1 || unitsRange[1] !== 6,
    showFavOnly,
  ].filter(Boolean).length;

  const clearAll = () => {
    setSearchQuery('');
    setSelectedYears(['All']);
    setSelectedSem('All');
    setUnitsRange([1, 6]);
    setShowFavOnly(false);
    setSortBy('relevance');
  };

  const getYearBadgeColor = (year: YearLevel) => {
    switch (year) {
      case '1st': return 'bg-ctu-maroon text-white';
      case '2nd': return 'bg-ctu-gold text-white';
      case '3rd': return 'bg-brand-accent text-white';
      case '4th': return 'bg-ctu-gold/80 text-white';
      default: return 'bg-foreground/10 text-foreground/60';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      <Sidebar user={user} />

      <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-10 pb-28 lg:pb-10 overflow-x-hidden">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl frosted-header font-bold tracking-tight">Course Catalog</h1>
            <p className="text-foreground/55 mt-1 text-xs sm:text-sm font-medium">
              CTU Industrial Engineering curriculum.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-background neumorphic-raised rounded-2xl pl-3 pr-8 py-2.5 text-xs font-bold text-foreground/70 cursor-pointer focus:outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
                <option value="units-asc">Units ↑</option>
                <option value="units-desc">Units ↓</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="flex bg-background p-1 rounded-2xl neumorphic-raised">
              <button onClick={() => setViewMode('grid')} aria-label="Grid View"
                className={cn("p-2 rounded-xl transition-all", viewMode === 'grid' ? "neumorphic-pressed text-ctu-gold" : "text-foreground/40")}>
                <Grid size={18} />
              </button>
              <button onClick={() => setViewMode('list')} aria-label="List View"
                className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? "neumorphic-pressed text-ctu-gold" : "text-foreground/40")}>
                <ListIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Filter Bar */}
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md pb-4 mb-6 space-y-3 transition-colors duration-300">
          {/* Search History */}
          {searchHistory.length > 0 && !searchQuery && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-bold text-ctu-gold uppercase tracking-[2px] flex items-center gap-1">
                <History size={11} /> Recent
              </span>
              {searchHistory.map((item, i) => (
                <div key={i} onClick={() => setSearchQuery(item)}
                  className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg neumorphic-raised hover:neumorphic-pressed cursor-pointer transition-all">
                  <span className="text-[10px] font-bold text-foreground/50 group-hover:text-ctu-gold transition-colors">{item}</span>
                  <button onClick={e => removeFromHistory(item, e)} className="text-foreground/20 hover:text-ctu-maroon transition-colors">
                    <X size={9} />
                  </button>
                </div>
              ))}
              <button onClick={() => { setSearchHistory([]); localStorage.removeItem('ie_catalog_search_history'); }}
                className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest hover:text-ctu-maroon transition-colors">
                Clear
              </button>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={16} />
              <Input
                placeholder="Search subject name, code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addToHistory(searchQuery); }}
                onBlur={() => { if (searchQuery.trim()) addToHistory(searchQuery); }}
                className="bg-background border-none neumorphic-pressed pl-11 pr-10 h-12 rounded-2xl text-sm text-foreground placeholder:text-foreground/30"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter toggle button */}
            <button
              onClick={() => setShowFilters(f => !f)}
              className={cn(
                "flex items-center gap-2 px-5 h-12 rounded-2xl text-sm font-bold transition-all shrink-0",
                showFilters ? "neumorphic-pressed text-ctu-gold" : "neumorphic-raised text-foreground/60 hover:text-foreground"
              )}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-ctu-gold text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Year Level Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {(['All', '1st', '2nd', '3rd', '4th'] as const).map(year => (
              <button key={year} onClick={() => toggleYear(year)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  (year === 'All' ? selectedYears.includes('All') : selectedYears.includes(year as YearLevel))
                    ? cn("neumorphic-pressed",
                        year === '1st' ? "text-ctu-maroon" :
                        year === '2nd' ? "text-ctu-gold" :
                        year === '3rd' ? "text-brand-accent" :
                        year === '4th' ? "text-ctu-gold" : "text-foreground")
                    : "neumorphic-raised text-foreground/50 hover:text-foreground"
                )}
              >
                {year === 'All' ? 'All Years' : `${year} Year`}
              </button>
            ))}
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="neumorphic-card p-4 sm:p-5 rounded-2xl space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Semester */}
                    <div>
                      <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-2">Semester</p>
                      <div className="flex flex-wrap gap-2">
                        {(['All', '1st', '2nd', 'Summer'] as const).map(sem => (
                          <button key={sem} onClick={() => setSelectedSem(sem)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                              selectedSem === sem ? "bg-ctu-gold text-white shadow-lg" : "neumorphic-raised text-foreground/50 hover:text-foreground"
                            )}>
                            {sem === 'All' ? 'All' : `${sem} Sem`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Units Range */}
                    <div>
                      <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-2">
                        Units: {unitsRange[0]}–{unitsRange[1]}
                      </p>
                      <div className="space-y-1">
                        <input type="range" min={1} max={6} value={unitsRange[0]}
                          onChange={e => setUnitsRange([+e.target.value, Math.max(+e.target.value, unitsRange[1])])}
                          className="w-full accent-ctu-gold" />
                        <input type="range" min={1} max={6} value={unitsRange[1]}
                          onChange={e => setUnitsRange([Math.min(unitsRange[0], +e.target.value), +e.target.value])}
                          className="w-full accent-ctu-gold" />
                      </div>
                    </div>

                    {/* Toggles */}
                    <div>
                      <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-2">Show Only</p>
                      <button
                        onClick={() => setShowFavOnly(f => !f)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                          showFavOnly ? "bg-ctu-maroon/15 text-ctu-maroon neumorphic-pressed" : "neumorphic-raised text-foreground/50"
                        )}
                      >
                        <Heart size={13} className={showFavOnly ? "fill-ctu-maroon" : ""} />
                        Favorites
                      </button>
                    </div>
                  </div>

                  {activeFilterCount > 0 && (
                    <button onClick={clearAll}
                      className="text-xs font-bold text-foreground/40 hover:text-ctu-maroon transition-colors">
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-foreground/40 font-bold">
              Showing <span className="text-foreground/70">{filteredSubjects.length}</span> of {IE_SUBJECTS.length} subjects
            </p>
            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="text-[10px] font-bold text-ctu-maroon hover:underline transition-colors">
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {filteredSubjects.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-20 h-20 neumorphic-pressed rounded-full flex items-center justify-center mx-auto mb-5">
                <Search size={28} className="text-foreground/20" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No subjects found</h3>
              <p className="text-sm text-foreground/40 font-medium mb-6">Try adjusting your search or filters.</p>
              <button onClick={clearAll} className="px-6 py-2.5 rounded-2xl neumorphic-raised text-sm font-bold text-ctu-gold hover:neumorphic-pressed transition-all">
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              layout
              className={cn(
                "grid gap-4 sm:gap-6 lg:gap-8",
                viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              )}
            >
              <AnimatePresence mode="popLayout">
                {filteredSubjects.map((subject, idx) => (
                  <motion.div
                    key={subject.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                  >
                    <GlowCard
                      onClick={() => navigate(`/catalog/${subject.id}`)}
                      glowColor={idx % 2 === 0 ? 'gold' : 'maroon'}
                      customSize
                      className={cn(
                        "w-full border-none hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden",
                        viewMode === 'list' ? "flex-row" : "flex flex-col justify-between"
                      )}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-ctu-gold opacity-0 group-hover:opacity-100 transition-opacity rounded-l-3xl" />
                      <div className="p-4 sm:p-5 flex flex-col h-full justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4 sm:mb-5">
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="outline" className="border-ctu-gold text-ctu-gold font-bold bg-ctu-gold/5 text-[10px]">
                                {subject.code}
                              </Badge>
                              <Badge className={cn("border-none font-bold text-[10px]", getYearBadgeColor(subject.yearLevel))}>
                                {subject.yearLevel} Year
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-ctu-gold">
                                <Star size={12} fill="currentColor" />
                                <span className="text-[11px] font-bold">4.5</span>
                              </div>
                              <button
                                onClick={e => { e.stopPropagation(); toggleFavorite(subject.id); }}
                                className="p-1 rounded-lg hover:bg-foreground/10 transition-colors"
                              >
                                <Heart size={13} className={favorites.includes(subject.id) ? "text-ctu-maroon fill-ctu-maroon" : "text-foreground/25"} />
                              </button>
                            </div>
                          </div>

                          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 group-hover:text-ctu-gold transition-colors leading-tight">
                            {subject.name}
                          </h3>

                          <div className="flex items-center gap-3 text-[11px] text-foreground/40 font-bold uppercase tracking-wider mb-4 sm:mb-5">
                            <span>{subject.units} Units</span>
                            <span>·</span>
                            <span>{subject.semester} Sem</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-foreground/5">
                          <div>
                            {subject.prerequisiteIds.length > 0 ? (
                              <div className="flex items-center gap-1 text-ctu-gold text-[10px] font-bold uppercase tracking-widest">
                                <LinkIcon size={11} /> Prereq
                              </div>
                            ) : (
                              <span className="text-[10px] text-foreground/20 uppercase font-bold">No Prereq</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Circle size={11} className="text-foreground/20" />
                            <span className="text-[10px] font-bold text-foreground/20 uppercase">Not Yet</span>
                          </div>
                        </div>
                      </div>
                    </GlowCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}
