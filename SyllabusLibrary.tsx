import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Filter,
  FileText,
  CheckCircle,
  XCircle,
  X,
  ExternalLink,
  ChevronDown,
  GraduationCap,
  Calendar,
  Hash,
  Loader2,
  User,
  ListChecks,
  Link2,
  BookMarked,
} from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { buildStaticSubjects } from './syllabusData';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { User as UserType } from '@/src/types';

interface SyllabusSubject {
  id: string;
  subjectCode: string;
  subjectName: string;
  units: number;
  yearLevel: string;
  term: string;
  description: string;
  syllabusURL: string | null;
  isAvailable: boolean;
  uploadedAt: { seconds: number; nanoseconds: number } | null;
  prerequisites?: string;
  instructor?: string;
  outcomes?: string;
}

const YEAR_LEVELS = ['All', '1st', '2nd', '3rd', '4th'];
const TERMS = ['All', '1st Semester', '2nd Semester', 'Summer'];

export default function SyllabusLibrary() {
  const [user, setUser] = useState<UserType | null>(null);
  const [subjects, setSubjects] = useState<SyllabusSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [termFilter, setTermFilter] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState<SyllabusSubject | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [usingStatic, setUsingStatic] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ie_matrix_session');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const q = query(collection(db, 'subjects'), orderBy('yearLevel'), orderBy('term'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SyllabusSubject));
          setSubjects(data);
          setUsingStatic(false);
        } else {
          setSubjects(buildStaticSubjects() as SyllabusSubject[]);
          setUsingStatic(true);
        }
      } catch {
        setSubjects(buildStaticSubjects() as SyllabusSubject[]);
        setUsingStatic(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const filtered = subjects.filter(s => {
    const matchSearch =
      s.subjectCode.toLowerCase().includes(search.toLowerCase()) ||
      s.subjectName.toLowerCase().includes(search.toLowerCase());
    const matchYear = yearFilter === 'All' || s.yearLevel === yearFilter;
    const matchTerm = termFilter === 'All' || s.term === termFilter;
    return matchSearch && matchYear && matchTerm;
  });

  const available = filtered.filter(s => s.isAvailable).length;
  const missing = filtered.filter(s => !s.isAvailable).length;

  const grouped = YEAR_LEVELS.filter(y => y !== 'All').reduce<Record<string, SyllabusSubject[]>>((acc, year) => {
    if (yearFilter !== 'All' && yearFilter !== year) return acc;
    const inYear = filtered.filter(s => s.yearLevel === year);
    if (inYear.length > 0) acc[year] = inYear;
    return acc;
  }, {});

  const handleOpen = (subject: SyllabusSubject) => {
    setSelectedSubject(subject);
    setShowInfo(false);
  };

  return (
    <div className="min-h-screen bg-background flex transition-colors duration-300">
      <Sidebar user={user} />

      <main id="main-content" className="flex-1 min-h-screen overflow-y-auto pb-28 lg:pb-8">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-foreground/5 px-6 py-4 lg:px-10">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-ctu-gold to-ctu-maroon flex items-center justify-center shadow-lg">
                  <BookOpen size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-display font-extrabold text-foreground tracking-tight">
                    Syllabus Library
                  </h1>
                  <p className="text-xs text-foreground/40 font-bold uppercase tracking-wider">
                    IE Matrix — CTU
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="neumorphic-raised px-4 py-2 rounded-2xl flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-xs font-bold text-foreground">{available} Available</span>
              </div>
              <div className="neumorphic-raised px-4 py-2 rounded-2xl flex items-center gap-2">
                <XCircle size={14} className="text-red-400" />
                <span className="text-xs font-bold text-foreground">{missing} Missing</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8 space-y-8">
          {/* Search & Filters */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
                <input
                  type="text"
                  placeholder="Search by code or subject name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full neumorphic-raised bg-transparent pl-10 pr-4 py-3 rounded-2xl text-sm text-foreground placeholder:text-foreground/30 font-medium outline-none focus:ring-2 focus:ring-ctu-gold/30 transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(f => !f)}
                className={`neumorphic-raised px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold transition-all ${
                  showFilters ? 'neumorphic-pressed text-ctu-gold' : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                <Filter size={16} />
                <span className="hidden sm:inline">Filters</span>
                <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="neumorphic-raised rounded-2xl p-5 flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-foreground/40">Year Level</p>
                      <div className="flex flex-wrap gap-2">
                        {YEAR_LEVELS.map(y => (
                          <button
                            key={y}
                            onClick={() => setYearFilter(y)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              yearFilter === y
                                ? 'bg-gradient-to-r from-ctu-gold to-ctu-maroon text-white shadow-md'
                                : 'neumorphic-raised text-foreground/60 hover:text-foreground'
                            }`}
                          >
                            {y === 'All' ? 'All Years' : `${y} Year`}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-foreground/40">Semester</p>
                      <div className="flex flex-wrap gap-2">
                        {TERMS.map(t => (
                          <button
                            key={t}
                            onClick={() => setTermFilter(t)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              termFilter === t
                                ? 'bg-gradient-to-r from-ctu-gold to-ctu-maroon text-white shadow-md'
                                : 'neumorphic-raised text-foreground/60 hover:text-foreground'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {usingStatic && (
              <p className="text-xs text-foreground/30 font-medium px-1">
                Showing curriculum data. PDF availability reflects uploaded syllabi from Google Drive.
              </p>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={32} className="text-ctu-gold animate-spin" />
              <p className="text-sm text-foreground/40 font-bold">Loading syllabus library...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <BookOpen size={40} className="text-foreground/20" />
              <p className="text-foreground/40 font-bold text-sm">No subjects found</p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(grouped).map(([year, subs]) => (
                <div key={year} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <GraduationCap size={18} className="text-ctu-gold" />
                    <h2 className="text-base font-display font-extrabold text-foreground tracking-tight">
                      {year} Year
                    </h2>
                    <div className="flex-1 h-px bg-foreground/5" />
                    <span className="text-xs text-foreground/30 font-bold">{subs.length} subjects</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {subs.map((subject, i) => (
                      <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                      >
                        <SubjectCard
                          subject={subject}
                          onClick={() => handleOpen(subject)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* PDF Preview Modal */}
      <AnimatePresence>
        {selectedSubject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedSubject(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-4xl bg-background rounded-3xl neumorphic-raised overflow-hidden flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between p-5 border-b border-foreground/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-ctu-gold to-ctu-maroon flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-ctu-gold">
                      {selectedSubject.subjectCode}
                    </p>
                    <h3 className="text-base font-display font-extrabold text-foreground leading-tight">
                      {selectedSubject.subjectName}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-foreground/40 font-bold">{selectedSubject.yearLevel} Year</span>
                      <span className="text-foreground/20">·</span>
                      <span className="text-[10px] text-foreground/40 font-bold">{selectedSubject.term}</span>
                      <span className="text-foreground/20">·</span>
                      <span className="text-[10px] text-foreground/40 font-bold">{selectedSubject.units} units</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedSubject.isAvailable && (
                    <button
                      onClick={() => setShowInfo(v => !v)}
                      className={`neumorphic-raised p-2 rounded-xl transition-colors text-xs font-bold flex items-center gap-1 px-3 ${showInfo ? 'text-ctu-gold' : 'text-foreground/40 hover:text-foreground'}`}
                      title="Show subject info"
                    >
                      <BookMarked size={14} />
                      <span className="hidden sm:inline">Info</span>
                    </button>
                  )}
                  {selectedSubject.syllabusURL && (
                    <a
                      href={selectedSubject.syllabusURL.replace('/preview', '/view')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neumorphic-raised p-2 rounded-xl text-foreground/60 hover:text-ctu-gold transition-colors"
                      title="Open in Google Drive"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedSubject(null)}
                    className="neumorphic-raised p-2 rounded-xl text-foreground/60 hover:text-foreground transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {selectedSubject.isAvailable && selectedSubject.syllabusURL ? (
                  <>
                    {/* Collapsible info panel */}
                    <AnimatePresence>
                      {showInfo && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-b border-foreground/5"
                        >
                          <SubjectInfoPanel subject={selectedSubject} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="flex-1 min-h-0" style={{ height: '60vh' }}>
                      <iframe
                        src={selectedSubject.syllabusURL}
                        title={`${selectedSubject.subjectName} Syllabus`}
                        className="w-full h-full border-0"
                        allow="autoplay"
                      />
                    </div>
                  </>
                ) : (
                  <div className="overflow-y-auto p-6 space-y-5">
                    <div className="flex flex-col items-center gap-4 py-6 text-center">
                      <div className="w-14 h-14 rounded-3xl bg-red-500/10 flex items-center justify-center">
                        <XCircle size={28} className="text-red-400" />
                      </div>
                      <div>
                        <p className="font-display font-extrabold text-foreground text-base">Syllabus Not Yet Available</p>
                        <p className="text-xs text-foreground/40 mt-1">
                          The PDF for this subject hasn't been uploaded yet. Check back later or contact the IE Department.
                        </p>
                      </div>
                    </div>
                    <SubjectInfoPanel subject={selectedSubject} />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

function SubjectInfoPanel({ subject }: { subject: SyllabusSubject }) {
  return (
    <div className="p-5 space-y-4 bg-foreground/[0.01]">
      {subject.description && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <BookOpen size={13} className="text-ctu-gold" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Course Description</p>
          </div>
          <p className="text-sm text-foreground/70 leading-relaxed">{subject.description}</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {subject.prerequisites && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Link2 size={13} className="text-ctu-gold" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Prerequisites</p>
            </div>
            <p className="text-xs text-foreground/60 font-medium">{subject.prerequisites}</p>
          </div>
        )}
        {subject.instructor && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <User size={13} className="text-ctu-gold" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Instructor</p>
            </div>
            <p className="text-xs text-foreground/60 font-medium">{subject.instructor}</p>
          </div>
        )}
      </div>
      {subject.outcomes && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <ListChecks size={13} className="text-ctu-gold" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Course Outcomes</p>
          </div>
          <p className="text-xs text-foreground/60 leading-relaxed">{subject.outcomes}</p>
        </div>
      )}
    </div>
  );
}

function SubjectCard({ subject, onClick }: { subject: SyllabusSubject; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left neumorphic-raised hover:neumorphic-pressed rounded-2xl p-5 transition-all duration-200 group space-y-3"
    >
      {/* Top row: code + availability badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Hash size={12} className="text-ctu-gold shrink-0 mt-0.5" />
          <span className="text-xs font-bold text-ctu-gold tracking-wide">{subject.subjectCode}</span>
        </div>
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
            subject.isAvailable
              ? 'bg-green-500/10 text-green-500'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {subject.isAvailable ? (
            <>
              <CheckCircle size={10} />
              Available
            </>
          ) : (
            <>
              <XCircle size={10} />
              Missing
            </>
          )}
        </div>
      </div>

      {/* Subject name */}
      <p className="text-sm font-bold text-foreground group-hover:text-ctu-gold transition-colors leading-snug line-clamp-2">
        {subject.subjectName}
      </p>

      {/* Description snippet */}
      {subject.description && (
        <p className="text-[11px] text-foreground/40 leading-snug line-clamp-2">
          {subject.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-4 text-[11px] text-foreground/40 font-bold">
        <span className="flex items-center gap-1">
          <Calendar size={10} />
          {subject.term}
        </span>
        <span className="flex items-center gap-1">
          <BookOpen size={10} />
          {subject.units} units
        </span>
        {subject.prerequisites && subject.prerequisites !== 'None' && (
          <span className="flex items-center gap-1 text-ctu-gold/60">
            <Link2 size={10} />
            Has prereqs
          </span>
        )}
      </div>

      {/* CTA */}
      <div className={`flex items-center gap-2 text-xs font-bold pt-1 ${
        subject.isAvailable ? 'text-ctu-gold' : 'text-foreground/30'
      }`}>
        <FileText size={12} />
        {subject.isAvailable ? 'View Syllabus' : 'Not yet uploaded'}
      </div>
    </button>
  );
}
