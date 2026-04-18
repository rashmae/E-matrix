import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Star, 
  Link as LinkIcon, 
  Download, 
  Plus, 
  FileText, 
  Video, 
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Clock,
  Circle,
  X,
  AlertCircle,
  Youtube,
  FileBarChart,
  FilePieChart,
  Upload as UploadIcon
} from 'lucide-react';
import Sidebar from '@/src/components/layout/Sidebar';
import BottomNav from '@/src/components/layout/BottomNav';
import { User, Subject, SubjectStatus, Resource } from '@/src/types/index';
import { IE_SUBJECTS } from '@/src/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LiquidButton } from '@/components/ui/liquid-glass';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UploadResourceModal from '@/src/components/resources/UploadResourceModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle as ModalTitle,
  DialogDescription as ModalDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';

export default function SubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [status, setStatus] = useState<SubjectStatus>('not_yet');
  const [subjectStatusMap, setSubjectStatusMap] = useState<Record<string, SubjectStatus>>({});
  const [resources, setResources] = useState<Resource[]>([]);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [userRating, setUserRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('ie_matrix_session');
    if (!session) {
      navigate('/login');
    } else {
      setUser(JSON.parse(session));
    }

    const foundSubject = IE_SUBJECTS.find(s => s.id === id);
    if (foundSubject) {
      setSubject(foundSubject);
      
      // Load progress
      const savedProgress = localStorage.getItem('ie_matrix_progress');
      if (savedProgress) {
        const progressMap = JSON.parse(savedProgress);
        setSubjectStatusMap(progressMap);
        if (progressMap[foundSubject.id]) {
          setStatus(progressMap[foundSubject.id]);
        }
      }

      // Load resources for this subject
      const savedResources = localStorage.getItem('ie_matrix_resources');
      const allResources: Resource[] = savedResources ? JSON.parse(savedResources) : [];
      
      // Initial sample resources
      const sampleResources: Resource[] = [
        {
          id: `sample-notes-${foundSubject.id}`,
          subjectId: foundSubject.id,
          userId: 'faculty-1',
          userName: 'Faculty Dept',
          title: `IE ${foundSubject.code} Syllabus & Guide`,
          type: 'document',
          url: '#',
          isPublic: true,
          createdAt: new Date().toISOString()
        }
      ];

      const mergedResources = [...sampleResources];
      allResources.forEach(res => {
        if (res.subjectId === foundSubject.id && !mergedResources.find(m => m.id === res.id)) {
          mergedResources.push(res);
        }
      });

      setResources(mergedResources);

      // Add to search history
      const history = localStorage.getItem('ie_catalog_search_history');
      let searchHistory: string[] = history ? JSON.parse(history) : [];
      const filtered = searchHistory.filter(item => item !== foundSubject.name && item !== foundSubject.code);
      const newHistory = [foundSubject.name, ...filtered].slice(0, 3);
      localStorage.setItem('ie_catalog_search_history', JSON.stringify(newHistory));
    } else {
      toast.error('Subject not found');
      navigate('/catalog');
    }
  }, [id, navigate]);

  if (!user || !subject) return null;

  const prerequisites = IE_SUBJECTS.filter(s => subject.prerequisiteIds.includes(s.id));
  const unmetPrerequisites = prerequisites.filter(p => (subjectStatusMap[p.id] || 'not_yet') !== 'done');
  const arePrerequisitesMet = unmetPrerequisites.length === 0;

  const handleStatusChange = (newStatus: SubjectStatus) => {
    if (newStatus === 'done' && !arePrerequisitesMet) {
      toast.error('You cannot mark this subject as done until all prerequisites are completed.');
      return;
    }

    setStatus(newStatus);
    
    // Save to localStorage
    const newProgress = { ...subjectStatusMap, [subject.id]: newStatus };
    setSubjectStatusMap(newProgress);
    localStorage.setItem('ie_matrix_progress', JSON.stringify(newProgress));
    
    toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
  };

  const handleSubmitRating = () => {
    if (!arePrerequisitesMet) {
      toast.error('You cannot rate this subject until all prerequisites are completed.');
      return;
    }

    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    toast.success('Thank you for your feedback!');
    setIsRatingModalOpen(false);
    setUserRating(0);
    setFeedback('');
  };

  const handleUpload = (newResource: Resource) => {
    // Save to local storage
    const savedResources = localStorage.getItem('ie_matrix_resources');
    const allResources: Resource[] = savedResources ? JSON.parse(savedResources) : [];
    const updated = [newResource, ...allResources];
    localStorage.setItem('ie_matrix_resources', JSON.stringify(updated));

    // Update local state if it matches this subject
    if (newResource.subjectId === subject.id) {
      setResources(prev => [newResource, ...prev]);
    }

    toast.success('Resource shared successfully!');
    setIsUploadModalOpen(false);
    setSelectedFile(null);
  };

  const handleQuickUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File is too large. Please keep it under 2MB.');
        return;
      }
      setSelectedFile(file);
      setIsUploadModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      <Sidebar user={user} />
      
      <main className="flex-1 p-6 lg:p-10 pb-32 lg:pb-10 overflow-x-hidden">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/catalog')}
          className="flex items-center gap-2 text-foreground/40 hover:text-foreground mb-8 transition-colors group font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Catalog
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Subject Info */}
          <div className="lg:col-span-2 space-y-10">
            {/* Header Section */}
            <section>
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge className="bg-ctu-maroon text-white border-none px-4 py-1 rounded-full text-[10px] font-bold uppercase">{subject.yearLevel} Year</Badge>
                <Badge className="bg-ctu-gold text-white border-none px-4 py-1 rounded-full text-[10px] font-bold uppercase">{subject.semester} Semester</Badge>
                <Badge className="neumorphic-pressed text-foreground/60 border-none px-4 py-1 rounded-full text-[10px] font-bold uppercase">{subject.units} Units</Badge>
              </div>
              
              <h1 className="text-5xl frosted-header font-bold mb-4 tracking-tight leading-tight">{subject.name}</h1>
              <p className="text-ctu-gold font-bold text-2xl mb-8 tracking-wider">{subject.code}</p>

              <div className="flex flex-wrap items-center gap-8 p-6 neumorphic-card w-fit">
                <div className="flex items-center gap-3">
                  <Star size={28} className="text-ctu-gold fill-ctu-gold" />
                  <span className="text-3xl font-bold text-foreground">4.2</span>
                  <span className="text-foreground/40 text-xs font-bold uppercase tracking-widest">(34 ratings)</span>
                </div>
                <div className="hidden md:block w-px h-10 bg-foreground/5" />
                <div className="flex gap-3">
                  {[
                    { val: 'not_yet', icon: Circle, label: 'Not Yet' },
                    { val: 'in_progress', icon: Clock, label: 'In Progress' },
                    { val: 'done', icon: CheckCircle2, label: 'Done' }
                  ].map((s) => {
                    const isDisabled = s.val === 'done' && !arePrerequisitesMet;
                    return (
                      <button
                        key={s.val}
                        onClick={() => handleStatusChange(s.val as SubjectStatus)}
                        disabled={isDisabled}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all",
                          status === s.val 
                            ? "neumorphic-pressed text-ctu-gold" 
                            : "text-foreground/40 hover:text-foreground neumorphic-raised hover:neumorphic-pressed",
                          isDisabled && "opacity-50 cursor-not-allowed grayscale"
                        )}
                      >
                        <s.icon size={14} />
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!arePrerequisitesMet && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-start gap-3 p-5 rounded-2xl bg-ctu-maroon/5 border border-ctu-maroon/20"
                >
                  <AlertCircle size={20} className="text-ctu-maroon shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-ctu-maroon uppercase tracking-wider mb-1">Prerequisites Incomplete</p>
                    <p className="text-xs text-foreground/60 font-medium">
                      You must complete the following subjects before you can rate or mark this as done:
                      <span className="block mt-2 font-bold text-foreground">
                        {unmetPrerequisites.map(p => `${p.code} - ${p.name}`).join(', ')}
                      </span>
                    </p>
                  </div>
                </motion.div>
              )}
            </section>

            {/* Description */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Description</h2>
              <div className="neumorphic-card p-8">
                <p className="text-foreground/70 leading-relaxed text-lg font-medium">
                  {subject.description}
                </p>
                <div className="mt-8 space-y-4">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-ctu-gold rounded-full" />
                    Learning Outcomes:
                  </h3>
                  <ul className="space-y-3 ml-4">
                    {[
                      `Understand the core principles of ${subject.name.toLowerCase()}.`,
                      'Apply theoretical knowledge to real-world industrial problems.',
                      'Develop critical thinking and analytical skills relevant to IE.'
                    ].map((outcome, i) => (
                      <li key={i} className="flex items-start gap-3 text-foreground/60 font-medium">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-ctu-gold shrink-0" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Prerequisite Chain */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Prerequisite Chain</h2>
              {prerequisites.length > 0 ? (
                <div className="flex flex-wrap items-center gap-6">
                  {prerequisites.map((prereq, i) => (
                    <React.Fragment key={prereq.id}>
                      <Link to={`/catalog/${prereq.id}`}>
                        <Card className="neumorphic-card border-none hover:scale-[1.02] transition-all cursor-pointer group">
                          <CardContent className="p-6">
                            <p className="text-[10px] font-bold text-ctu-gold mb-1 uppercase tracking-widest">{prereq.code}</p>
                            <p className="text-sm font-bold text-foreground group-hover:text-ctu-gold transition-colors">{prereq.name}</p>
                          </CardContent>
                        </Card>
                      </Link>
                      {i < prerequisites.length - 1 && <ChevronRight className="text-foreground/20" />}
                    </React.Fragment>
                  ))}
                  <ChevronRight className="text-foreground/20" />
                  <Card className="neumorphic-pressed border-none bg-ctu-maroon/5">
                    <CardContent className="p-6">
                      <p className="text-[10px] font-bold text-ctu-gold mb-1 uppercase tracking-widest">{subject.code}</p>
                      <p className="text-sm font-bold text-foreground">{subject.name}</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="p-8 neumorphic-pressed rounded-3xl text-foreground/40 italic font-medium">
                  No prerequisites required for this subject.
                </div>
              )}
            </section>

            {/* Syllabus */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Syllabus</h2>
                <button className="px-6 py-3 neumorphic-raised hover:neumorphic-pressed rounded-2xl flex items-center gap-2 text-foreground font-bold text-sm transition-all">
                  <Download size={18} className="text-ctu-gold" />
                  Download PDF
                </button>
              </div>
              <div className="aspect-video neumorphic-pressed rounded-3xl flex flex-col items-center justify-center text-foreground/20">
                <FileText size={64} className="mb-4 opacity-10" />
                <p className="font-bold uppercase tracking-widest text-xs">PDF Preview Not Available</p>
                <p className="text-[10px] mt-2 font-bold">Uploaded by Faculty on Aug 15, 2025</p>
              </div>
            </section>
          </div>

          {/* Right Column: Resources & Reviews */}
          <div className="space-y-10">
            {/* Study Resources */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Resources</h2>
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png,.doc,.docx,.txt,.mp4"
                  />
                  <button 
                    onClick={handleQuickUploadClick}
                    className="p-3 neumorphic-raised hover:neumorphic-pressed rounded-xl text-ctu-maroon transition-all group relative"
                    title="Quick File Upload"
                  >
                    <UploadIcon size={20} />
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold uppercase tracking-widest pointer-events-none">Quick Upload</span>
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedFile(null);
                      setIsUploadModalOpen(true);
                    }}
                    className="p-3 neumorphic-raised hover:neumorphic-pressed rounded-xl text-ctu-gold transition-all group relative"
                    title="Add Custom Resource"
                  >
                    <Plus size={20} />
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold uppercase tracking-widest pointer-events-none">Add Resource</span>
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {resources.length > 0 ? (
                  resources.map((res) => (
                    <Card 
                      key={res.id} 
                      onClick={() => {
                        if (res.url && res.url !== '#') window.open(res.url, '_blank');
                        else toast.info('No direct link available');
                      }}
                      className="neumorphic-card border-none hover:scale-[1.02] transition-all cursor-pointer group"
                    >
                      <CardContent className="p-6 flex items-center gap-5">
                        <div className="p-3 rounded-2xl neumorphic-pressed text-foreground/40 group-hover:text-ctu-gold transition-colors">
                          {res.type === 'notes' ? <FileText size={20} /> : 
                           res.type === 'video' ? <Video size={20} /> : 
                           res.type === 'youtube' ? <Youtube size={20} /> :
                           res.type === 'presentation' ? <FilePieChart size={20} /> :
                           res.type === 'document' ? <FileBarChart size={20} /> :
                           <LinkIcon size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate group-hover:text-ctu-gold transition-colors">{res.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-4 h-4 rounded-full neumorphic-pressed flex items-center justify-center text-[7px] font-bold text-ctu-gold">
                              {res.userName[0]}
                            </div>
                            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">By {res.userName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {res.url && res.url.startsWith('data:') && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const link = document.createElement('a');
                                link.href = res.url;
                                link.download = res.fileName || 'resource';
                                link.click();
                              }}
                              className="p-2 rounded-lg text-ctu-gold hover:neumorphic-pressed transition-all"
                              title="Download"
                            >
                              <UploadIcon size={14} className="rotate-180" />
                            </button>
                          )}
                          <ExternalLink size={16} className="text-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="p-8 neumorphic-pressed rounded-3xl text-center text-foreground/20 italic text-sm font-medium">
                    No resources shared for this subject yet.
                  </div>
                )}
              </div>
            </section>

            {/* Ratings Summary */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Ratings</h2>
              <Card className="neumorphic-card border-none">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="text-5xl font-bold text-foreground">4.2</div>
                    <div className="flex flex-col">
                      <div className="flex text-ctu-gold">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill={i <= 4 ? "currentColor" : "none"} />)}
                      </div>
                      <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mt-1">Based on 34 reviews</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(stars => (
                      <div key={stars} className="flex items-center gap-4 text-[10px] font-bold">
                        <span className="w-4 text-foreground/40">{stars}</span>
                        <div className="flex-1 h-2 neumorphic-pressed rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-ctu-gold rounded-full shadow-[0_0_8px_rgba(212,160,23,0.4)]" 
                            style={{ width: `${stars === 5 ? 60 : stars === 4 ? 30 : 5}%` }} 
                          />
                        </div>
                        <span className="w-10 text-right text-foreground/40">{stars === 5 ? '60%' : stars === 4 ? '30%' : '5%'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10">
                    <button 
                      onClick={() => {
                        if (!arePrerequisitesMet) {
                          toast.error('You cannot rate this subject until all prerequisites are completed.');
                        } else {
                          setIsRatingModalOpen(true);
                        }
                      }}
                      className={cn(
                        "w-full py-4 neumorphic-raised hover:neumorphic-pressed rounded-2xl text-foreground font-bold transition-all",
                        !arePrerequisitesMet && "opacity-50 cursor-not-allowed grayscale hover:neumorphic-raised"
                      )}
                    >
                      Rate this Subject
                    </button>
                  </div>

                  <Dialog open={isRatingModalOpen} onOpenChange={setIsRatingModalOpen}>
                    <DialogContent className="neumorphic-card border-none text-foreground max-w-md p-0 overflow-hidden">
                      <div className="p-10 space-y-8">
                        <DialogHeader>
                          <ModalTitle className="text-3xl font-bold text-foreground">Rate {subject.name}</ModalTitle>
                          <ModalDescription className="text-foreground/60 font-medium">
                            Share your experience with this subject to help other IE students.
                          </ModalDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                          <div className="flex flex-col items-center gap-4">
                            <p className="text-[10px] font-bold text-ctu-gold uppercase tracking-[2px]">Your Rating</p>
                            <div className="flex gap-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setUserRating(star)}
                                  className="transition-transform hover:scale-110 active:scale-95 p-1"
                                >
                                  <Star 
                                    size={40} 
                                    className={cn(
                                      "transition-colors",
                                      star <= userRating ? "text-ctu-gold fill-ctu-gold" : "text-foreground/10"
                                    )} 
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Feedback (Optional)</p>
                            <Textarea 
                              placeholder="What did you think about the course content, difficulty, or faculty?"
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              className="neumorphic-pressed border-none text-foreground min-h-[140px] focus:ring-ctu-gold rounded-2xl p-5 placeholder:text-foreground/20"
                            />
                          </div>
                        </div>

                        <div className="pt-4">
                          <button 
                            onClick={handleSubmitRating}
                            className="w-full py-4 neumorphic-raised hover:neumorphic-pressed rounded-2xl text-foreground font-bold transition-all"
                          >
                            Submit Rating
                          </button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>

      <BottomNav />

      <UploadResourceModal 
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedFile(null);
        }}
        onUpload={handleUpload}
        initialSubjectId={subject.id}
        initialFile={selectedFile}
      />
    </div>
  );
}
