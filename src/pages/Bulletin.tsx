import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, 
  Pin, 
  Calendar, 
  Clock,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';
import Sidebar from '@/src/components/layout/Sidebar';
import BottomNav from '@/src/components/layout/BottomNav';
import { User, Announcement, AnnouncementCategory } from '@/src/types/index';
import { ANNOUNCEMENTS } from '@/src/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/src/lib/utils';

export default function Bulletin() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AnnouncementCategory | 'All'>('All');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('ie_matrix_session');
    if (!session) {
      navigate('/login');
    } else {
      setUser(JSON.parse(session));
    }
  }, [navigate]);

  const filteredAnnouncements = ANNOUNCEMENTS.filter(a => 
    selectedCategory === 'All' || a.category === selectedCategory
  ).sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));

  const getCategoryColor = (cat: AnnouncementCategory) => {
    switch (cat) {
      case 'academic': return 'bg-brand-accent/20 text-brand-accent';
      case 'event': return 'bg-ctu-gold/20 text-ctu-gold';
      case 'holiday': return 'bg-ctu-maroon/20 text-ctu-maroon';
      case 'reminder': return 'bg-ctu-maroon/20 text-ctu-maroon';
      default: return 'bg-foreground/10 text-foreground/40';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      <Sidebar user={user} />
      
      <main className="flex-1 p-6 lg:p-10 pb-32 lg:pb-10 overflow-x-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl frosted-header font-bold tracking-tight">Bulletin Board</h1>
            <p className="text-foreground/60 mt-1 text-sm font-medium">Stay updated with the latest IE department news.</p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 md:pb-0 no-scrollbar scroll-smooth">
            {['All', 'academic', 'event', 'holiday', 'reminder'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={cn(
                  "px-6 py-2.5 rounded-2xl text-[10px] font-bold whitespace-nowrap transition-all uppercase tracking-widest",
                  selectedCategory === cat 
                    ? "neumorphic-pressed text-foreground" 
                    : "neumorphic-raised text-foreground/40 hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredAnnouncements.map((ann) => (
              <motion.div
                key={ann.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  onClick={() => setSelectedAnnouncement(ann)}
                  className={cn(
                    "neumorphic-card border-none hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden h-full flex flex-col",
                    ann.isPinned && "border-l-4 border-ctu-gold"
                  )}
                >
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <Badge variant="outline" className={cn("font-bold uppercase text-[10px] px-3 py-1 rounded-full border-none neumorphic-pressed", getCategoryColor(ann.category))}>
                        {ann.category}
                      </Badge>
                      {ann.isPinned && (
                        <div className="p-2 rounded-xl neumorphic-pressed text-ctu-gold">
                          <Pin size={16} className="fill-ctu-gold" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-ctu-gold transition-colors line-clamp-2 leading-tight">
                      {ann.title}
                    </h3>
                    
                    <p className="text-sm text-foreground/60 line-clamp-3 mb-8 flex-1 font-medium leading-relaxed">
                      {ann.content}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-foreground/5 text-[10px] font-bold uppercase text-foreground/40 tracking-widest">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        2 days ago
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Announcement Detail Modal */}
        <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
          <DialogContent className="neumorphic-card border-none text-foreground max-w-2xl p-0 overflow-hidden">
            {selectedAnnouncement && (
              <div className="p-10">
                <DialogHeader className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="outline" className={cn("font-bold uppercase text-[10px] px-4 py-1.5 rounded-full border-none neumorphic-pressed", getCategoryColor(selectedAnnouncement.category))}>
                      {selectedAnnouncement.category}
                    </Badge>
                    {selectedAnnouncement.isPinned && <Badge className="bg-ctu-gold text-navy-deep font-bold text-[10px] px-4 py-1.5 rounded-full">PINNED</Badge>}
                  </div>
                  <DialogTitle className="text-4xl font-display font-bold leading-tight text-foreground">
                    {selectedAnnouncement.title}
                  </DialogTitle>
                  <div className="flex items-center gap-6 text-xs text-foreground/40 pt-4 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Calendar size={16} className="text-ctu-gold" /> {new Date(selectedAnnouncement.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-2"><Clock size={16} className="text-ctu-gold" /> 10:30 AM</span>
                  </div>
                </DialogHeader>
                <div className="py-8 text-foreground/70 leading-relaxed whitespace-pre-wrap font-medium text-lg border-t border-foreground/5">
                  {selectedAnnouncement.content}
                </div>
                <div className="pt-8 border-t border-foreground/5 flex justify-end">
                  <button 
                    onClick={() => setSelectedAnnouncement(null)}
                    className="px-8 py-3 neumorphic-raised hover:neumorphic-pressed rounded-2xl font-bold transition-all text-foreground"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <BottomNav />
    </div>
  );
}
