import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List as ListIcon,
  Star,
  Link as LinkIcon,
  ChevronRight,
  CheckCircle2,
  Clock,
  Circle,
  History,
  X
} from 'lucide-react';
import Sidebar from '@/src/components/layout/Sidebar';
import BottomNav from '@/src/components/layout/BottomNav';
import { User, Subject, YearLevel, Semester } from '@/src/types/index';
import { IE_SUBJECTS } from '@/src/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { GlowCard } from '@/components/ui/spotlight-card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function Catalog() {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<YearLevel | 'All'>('All');
  const [selectedSem, setSelectedSem] = useState<Semester | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('ie_matrix_session');
    if (!session) {
      navigate('/login');
    } else {
      setUser(JSON.parse(session));
    }

    // Read URL params
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    const year = params.get('year');

    if (query) setSearchQuery(query);
    if (year && (['1st', '2nd', '3rd', '4th'] as const).includes(year as any)) {
      setSelectedYear(year as YearLevel);
    }

    // Load search history
    const history = localStorage.getItem('ie_catalog_search_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, [navigate]);

  const addToHistory = (query: string) => {
    if (!query.trim()) return;
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== query.toLowerCase());
      const newHistory = [query, ...filtered].slice(0, 3);
      localStorage.setItem('ie_catalog_search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const removeFromHistory = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory(prev => {
      const newHistory = prev.filter(item => item !== query);
      localStorage.setItem('ie_catalog_search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const filteredSubjects = IE_SUBJECTS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = selectedYear === 'All' || s.yearLevel === selectedYear;
    const matchesSem = selectedSem === 'All' || s.semester === selectedSem;
    return matchesSearch && matchesYear && matchesSem;
  });

  const getYearBadgeColor = (year: YearLevel) => {
    switch (year) {
      case '1st': return 'bg-ctu-maroon';
      case '2nd': return 'bg-ctu-gold';
      case '3rd': return 'bg-brand-accent text-white';
      case '4th': return 'bg-ctu-gold text-white';
      default: return 'bg-foreground/10 text-foreground/60';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      <Sidebar user={user} />
      
      <main id="main-content" className="flex-1 p-6 lg:p-10 pb-32 lg:pb-10 overflow-x-hidden">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl frosted-header font-bold tracking-tight">Course Catalog</h1>
            <p className="text-foreground/60 mt-1 text-sm font-medium">Explore the CTU Industrial Engineering curriculum.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-background p-1.5 rounded-2xl neumorphic-raised">
              <button 
                onClick={() => setViewMode('grid')}
                aria-label="Grid View"
                className={cn("p-2.5 rounded-xl transition-all", viewMode === 'grid' ? "neumorphic-pressed text-ctu-gold" : "text-foreground/40")}
              >
                <Grid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                aria-label="List View"
                className={cn("p-2.5 rounded-xl transition-all", viewMode === 'list' ? "neumorphic-pressed text-ctu-gold" : "text-foreground/40")}
              >
                <ListIcon size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md py-4 mb-8 space-y-6 transition-colors duration-300">
          {/* Search History */}
          {searchHistory.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-2 mb-4"
            >
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-ctu-gold uppercase tracking-[2px] mr-1">
                <History size={12} />
                Recent
              </div>
              {searchHistory.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSearchQuery(item)}
                  className="group flex items-center gap-2 px-3 py-1 rounded-lg neumorphic-raised hover:neumorphic-pressed transition-all cursor-pointer bg-background/30 border border-white/5"
                >
                  <span className="text-[10px] font-bold text-foreground/50 group-hover:text-ctu-gold transition-colors">
                    {item}
                  </span>
                  <button 
                    onClick={(e) => removeFromHistory(item, e)}
                    aria-label={`Remove ${item} from search history`}
                    className="text-foreground/20 hover:text-ctu-maroon transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => {
                  setSearchHistory([]);
                  localStorage.removeItem('ie_catalog_search_history');
                }}
                className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest hover:text-ctu-maroon transition-colors ml-2"
              >
                Clear All
              </button>
            </motion.div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" size={18} />
              <Input 
                placeholder="Search subject name or code..." 
                aria-label="Search subjects"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addToHistory(searchQuery);
                  }
                }}
                onBlur={() => {
                  if (searchQuery.trim()) addToHistory(searchQuery);
                }}
                className="bg-background border-none neumorphic-pressed pl-12 pr-12 h-14 rounded-2xl focus:ring-ctu-gold text-foreground placeholder:text-foreground/30"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full hover:bg-foreground/5 text-foreground/40 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar scroll-smooth">
              {['All', '1st', '2nd', '3rd', '4th'].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year as any)}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all",
                    selectedYear === year 
                      ? cn(
                          "neumorphic-pressed",
                          year === '1st' ? "text-ctu-maroon" :
                          year === '2nd' ? "text-ctu-gold" :
                          year === '3rd' ? "text-brand-accent" :
                          year === '4th' ? "text-ctu-gold" :
                          "text-foreground"
                        )
                      : "neumorphic-raised text-foreground/60 hover:text-foreground"
                  )}
                >
                  {year === 'All' ? 'All Years' : `${year} Year`}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {['All', '1st', '2nd', 'Summer'].map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSem(sem as any)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    selectedSem === sem 
                      ? "neumorphic-pressed text-ctu-gold" 
                      : "neumorphic-raised text-foreground/40 hover:text-foreground"
                  )}
                >
                  {sem === 'All' ? 'All Semesters' : `${sem} Sem`}
                </button>
              ))}
            </div>
            <p className="text-xs text-foreground/40 font-bold uppercase tracking-wider">
              Showing {filteredSubjects.length} of {IE_SUBJECTS.length} subjects
            </p>
          </div>
        </div>

        {/* Results Grid */}
        <motion.div 
          layout
          className={cn(
            "grid gap-8",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredSubjects.map((subject, idx) => (
              <motion.div
                key={subject.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <GlowCard 
                  onClick={() => navigate(`/catalog/${subject.id}`)}
                  glowColor={idx % 2 === 0 ? 'gold' : 'maroon'}
                  customSize
                  className="w-full h-full border-none hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-ctu-maroon opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="p-4 flex flex-col h-full justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="border-ctu-gold text-ctu-gold font-bold bg-ctu-gold/5">{subject.code}</Badge>
                          <Badge className={cn("text-white border-none font-bold", getYearBadgeColor(subject.yearLevel))}>
                            {subject.yearLevel} Year
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-ctu-gold">
                          <Star size={14} fill="currentColor" />
                          <span className="text-xs font-bold">4.5</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-ctu-gold transition-colors leading-tight">
                        {subject.name}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-xs text-foreground/40 font-bold uppercase tracking-wider mb-6">
                        <span>{subject.units} Units</span>
                        <span>{subject.semester} Semester</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-foreground/5">
                      <div className="flex items-center gap-2">
                        {subject.prerequisiteIds.length > 0 ? (
                          <div className="flex items-center gap-1 text-ctu-gold text-[10px] font-bold uppercase tracking-widest">
                            <LinkIcon size={12} />
                            Prereq
                          </div>
                        ) : (
                          <span className="text-[10px] text-foreground/20 uppercase font-bold tracking-widest">No Prereq</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Circle size={12} className="text-foreground/20" />
                        <span className="text-[10px] font-bold uppercase text-foreground/20 tracking-widest">Not Yet</span>
                      </div>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-32">
            <div className="w-24 h-24 neumorphic-pressed rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-foreground/20" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">No subjects found</h3>
            <p className="text-foreground/40 font-medium">Try adjusting your search or filters.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
