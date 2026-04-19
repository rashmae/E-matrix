import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, FileText, Link as LinkIcon, BookOpen,
  Send, Sparkles, RefreshCw, Copy, ChevronRight, Loader2,
  FileUp, Globe, MessageSquare, X, Check, BookMarked
} from 'lucide-react';
import Sidebar from '@/src/components/layout/Sidebar';
import BottomNav from '@/src/components/layout/BottomNav';
import { User } from '@/src/types/index';
import { getSession } from '@/src/lib/session';
import { db } from '@/src/lib/firebase';
import { GlowCard } from '@/components/ui/spotlight-card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { askQuestion } from '@/src/services/gemini';

type SourceType = 'text' | 'url';
interface Source {
  id: string;
  type: SourceType;
  title: string;
  content: string;
  enabled: boolean;
  wordCount: number;
  addedAt: string;
}

interface Notebook {
  id: string;
  title: string;
  sources: Source[];
  guide: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  citations?: string[];
  timestamp: string;
}

const NOTEBOOKS_KEY = 'ie_matrix_notebooks';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function StudyNotebook() {
  const [user, setUser] = useState<User | null>(null);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null);
  const [activePanel, setActivePanel] = useState<'sources' | 'guide' | 'chat'>('guide');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSourceType, setNewSourceType] = useState<SourceType>('text');
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceContent, setNewSourceContent] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (!session) { navigate('/login'); return; }
    setUser(session as any);
    loadNotebooks();
  }, [navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const loadNotebooks = () => {
    const saved = localStorage.getItem(NOTEBOOKS_KEY);
    if (saved) {
      const nbs = JSON.parse(saved) as Notebook[];
      setNotebooks(nbs);
      if (nbs.length > 0) setActiveNotebook(nbs[0]);
    }
  };

  const saveNotebooks = (nbs: Notebook[]) => {
    localStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(nbs));
    setNotebooks(nbs);
  };

  const createNotebook = () => {
    const nb: Notebook = {
      id: generateId(),
      title: `Notebook ${notebooks.length + 1}`,
      sources: [],
      guide: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [nb, ...notebooks];
    saveNotebooks(updated);
    setActiveNotebook(nb);
    setChat([]);
  };

  const deleteNotebook = (id: string) => {
    const updated = notebooks.filter(n => n.id !== id);
    saveNotebooks(updated);
    if (activeNotebook?.id === id) {
      setActiveNotebook(updated[0] || null);
      setChat([]);
    }
  };

  const updateNotebook = (nb: Notebook) => {
    const updated = notebooks.map(n => n.id === nb.id ? { ...nb, updatedAt: new Date().toISOString() } : n);
    saveNotebooks(updated);
    setActiveNotebook({ ...nb, updatedAt: new Date().toISOString() });
  };

  const addSource = () => {
    if (!activeNotebook || !newSourceTitle.trim() || !newSourceContent.trim()) {
      toast.error('Please fill in title and content');
      return;
    }
    if (activeNotebook.sources.length >= 10) {
      toast.error('Maximum 10 sources per notebook');
      return;
    }

    const source: Source = {
      id: generateId(),
      type: newSourceType,
      title: newSourceTitle.trim(),
      content: newSourceContent.trim(),
      enabled: true,
      wordCount: newSourceContent.trim().split(/\s+/).length,
      addedAt: new Date().toISOString(),
    };

    const updated = { ...activeNotebook, sources: [...activeNotebook.sources, source] };
    updateNotebook(updated);
    setNewSourceTitle('');
    setNewSourceContent('');
    setShowAddSource(false);
    toast.success('Source added!');
  };

  const toggleSource = (sourceId: string) => {
    if (!activeNotebook) return;
    const updated = {
      ...activeNotebook,
      sources: activeNotebook.sources.map(s =>
        s.id === sourceId ? { ...s, enabled: !s.enabled } : s
      )
    };
    updateNotebook(updated);
  };

  const removeSource = (sourceId: string) => {
    if (!activeNotebook) return;
    const updated = { ...activeNotebook, sources: activeNotebook.sources.filter(s => s.id !== sourceId) };
    updateNotebook(updated);
  };

  const generateGuide = async () => {
    if (!activeNotebook) return;
    const enabledSources = activeNotebook.sources.filter(s => s.enabled);
    if (enabledSources.length === 0) {
      toast.error('Add at least one source to generate a guide');
      return;
    }

    setIsGeneratingGuide(true);
    setActivePanel('guide');

    try {
      const sourceSummary = enabledSources.map((s, i) =>
        `Source ${i + 1} - ${s.title}:\n${s.content.slice(0, 1000)}`
      ).join('\n\n---\n\n');

      const prompt = `You are a study guide generator. Based on the following sources, create a structured notebook guide with:
1. A brief overview summary (2-3 sentences)
2. Key Topics (bullet list of 5-8 main concepts)
3. Important Definitions (3-5 key terms with definitions)
4. Suggested Study Questions (3-5 questions to explore)

Sources:
${sourceSummary}

Format your response with clear section headers using ## for sections.`;

      const guide = await askQuestion(prompt, '');
      const updated = { ...activeNotebook, guide };
      updateNotebook(updated);
      toast.success('Notebook guide generated!');
    } catch (error) {
      toast.error('Failed to generate guide. Check your Gemini API key.');
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiTyping || !activeNotebook) return;

    const enabledSources = activeNotebook.sources.filter(s => s.enabled);
    if (enabledSources.length === 0) {
      toast.error('Add at least one source first');
      return;
    }

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };

    setChat(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiTyping(true);

    try {
      const context = enabledSources.map((s, i) =>
        `[Source ${i + 1}: ${s.title}]\n${s.content.slice(0, 800)}`
      ).join('\n\n');

      const answer = await askQuestion(
        `Answer this question based ONLY on the provided sources. If the answer cannot be found in the sources, say "Answer not found in sources." Include source references like [Source 1] when applicable.

Question: ${userMsg.content}

Sources:
${context}`,
        ''
      );

      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'ai',
        content: answer,
        timestamp: new Date().toISOString(),
      };
      setChat(prev => [...prev, aiMsg]);
    } catch (error) {
      toast.error('AI is unavailable. Check your Gemini API key.');
    } finally {
      setIsAiTyping(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renameNotebook = () => {
    if (!activeNotebook || !editTitle.trim()) return;
    const updated = { ...activeNotebook, title: editTitle.trim() };
    updateNotebook(updated);
    setIsEditingTitle(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
      <Sidebar user={user} />

      <main className="flex-1 flex flex-col overflow-hidden h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-foreground/5 bg-background/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/study')}
              className="p-2 rounded-xl neumorphic-raised hover:neumorphic-pressed transition-all shrink-0">
              <ArrowLeft size={16} />
            </button>

            <BookMarked size={18} className="text-emerald-400 shrink-0" />

            {isEditingTitle ? (
              <form onSubmit={e => { e.preventDefault(); renameNotebook(); }} className="flex items-center gap-2">
                <Input
                  autoFocus
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="h-8 text-sm font-bold border-none neumorphic-pressed rounded-xl w-44 sm:w-64"
                />
                <button type="submit" className="p-1.5 rounded-xl neumorphic-raised text-green-500">
                  <Check size={14} />
                </button>
                <button type="button" onClick={() => setIsEditingTitle(false)}
                  className="p-1.5 rounded-xl neumorphic-raised text-foreground/40">
                  <X size={14} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => { setEditTitle(activeNotebook?.title || ''); setIsEditingTitle(true); }}
                className="text-sm sm:text-base font-bold text-foreground hover:text-ctu-gold transition-colors truncate text-left"
              >
                {activeNotebook?.title || 'Select a Notebook'}
              </button>
            )}

            {activeNotebook && (
              <Badge className="bg-emerald-500/15 text-emerald-400 border-none text-[10px] font-bold shrink-0">
                {activeNotebook.sources.filter(s => s.enabled).length} sources
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={createNotebook}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl neumorphic-raised hover:neumorphic-pressed text-xs font-bold text-foreground/60 hover:text-foreground transition-all">
              <Plus size={14} /> New
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* ── Notebooks List (left sidebar on desktop) ── */}
          <div className="hidden lg:flex flex-col w-56 xl:w-64 border-r border-foreground/5 overflow-y-auto bg-background/50">
            <div className="p-4 space-y-2">
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider mb-3">Notebooks</p>
              {notebooks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-foreground/30 font-medium">No notebooks yet</p>
                  <button onClick={createNotebook}
                    className="mt-2 text-xs font-bold text-emerald-400 hover:underline">
                    Create one
                  </button>
                </div>
              ) : (
                notebooks.map(nb => (
                  <button key={nb.id} onClick={() => { setActiveNotebook(nb); setChat([]); }}
                    className={cn(
                      "w-full text-left p-3 rounded-xl transition-all group",
                      activeNotebook?.id === nb.id ? "neumorphic-pressed text-foreground" : "hover:neumorphic-raised text-foreground/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold truncate flex-1">{nb.title}</p>
                      <button onClick={e => { e.stopPropagation(); deleteNotebook(nb.id); }}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:text-ctu-maroon transition-all">
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <p className="text-[10px] text-foreground/30 mt-0.5">{nb.sources.length} sources</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Mobile Panel Tabs ── */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex lg:hidden border-b border-foreground/5 bg-background shrink-0">
              {(['sources', 'guide', 'chat'] as const).map(panel => (
                <button key={panel} onClick={() => setActivePanel(panel)}
                  className={cn(
                    "flex-1 py-3 text-xs font-bold capitalize transition-all",
                    activePanel === panel
                      ? "border-b-2 border-emerald-400 text-emerald-400"
                      : "text-foreground/40"
                  )}>
                  {panel}
                </button>
              ))}
            </div>

            <div className="flex flex-1 overflow-hidden">

              {/* ── Sources Panel ── */}
              <div className={cn(
                "flex-col border-r border-foreground/5 overflow-y-auto bg-background/30",
                "hidden lg:flex lg:w-72 xl:w-80",
                activePanel === 'sources' && "flex flex-1 lg:flex lg:flex-none"
              )}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                      Sources ({activeNotebook?.sources.length || 0}/10)
                    </p>
                    <button onClick={() => setShowAddSource(true)}
                      className="p-1.5 rounded-lg neumorphic-raised hover:neumorphic-pressed text-emerald-400 transition-all">
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Add Source Form */}
                  <AnimatePresence>
                    {showAddSource && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden">
                        <div className="neumorphic-card rounded-2xl p-4 space-y-3">
                          <div className="flex gap-2">
                            {([{type: 'text' as const, label: 'Text', icon: FileText}, {type: 'url' as const, label: 'URL', icon: Globe}]).map(t => (
                              <button key={t.type} onClick={() => setNewSourceType(t.type)}
                                className={cn(
                                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all",
                                  newSourceType === t.type ? "neumorphic-pressed text-emerald-400" : "neumorphic-raised text-foreground/40"
                                )}>
                                <t.icon size={12} /> {t.label}
                              </button>
                            ))}
                          </div>
                          <Input
                            placeholder="Source title"
                            value={newSourceTitle}
                            onChange={e => setNewSourceTitle(e.target.value)}
                            className="neumorphic-pressed border-none text-sm h-9 rounded-xl"
                          />
                          <textarea
                            placeholder={newSourceType === 'url' ? "Paste URL here" : "Paste or type content here..."}
                            value={newSourceContent}
                            onChange={e => setNewSourceContent(e.target.value)}
                            rows={4}
                            className="w-full bg-background neumorphic-pressed border-none rounded-xl p-3 text-xs resize-none focus:outline-none text-foreground placeholder:text-foreground/30"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => setShowAddSource(false)}
                              className="flex-1 py-2 rounded-xl neumorphic-raised text-xs font-bold text-foreground/40">
                              Cancel
                            </button>
                            <button onClick={addSource}
                              className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors">
                              Add Source
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Source Cards */}
                  {!activeNotebook || activeNotebook.sources.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <div className="w-10 h-10 rounded-full neumorphic-pressed flex items-center justify-center mx-auto">
                        <FileText size={16} className="text-foreground/20" />
                      </div>
                      <p className="text-xs text-foreground/30 font-medium">Add sources to get started</p>
                      <button onClick={() => setShowAddSource(true)}
                        className="text-xs font-bold text-emerald-400 hover:underline">
                        + Add Source
                      </button>
                    </div>
                  ) : (
                    activeNotebook.sources.map(source => (
                      <div key={source.id}
                        className={cn(
                          "p-3 rounded-xl border transition-all",
                          source.enabled ? "border-emerald-500/20 bg-emerald-500/5" : "border-foreground/5 opacity-50"
                        )}>
                        <div className="flex items-start gap-2">
                          <input type="checkbox" checked={source.enabled}
                            onChange={() => toggleSource(source.id)}
                            className="mt-0.5 accent-emerald-500 cursor-pointer" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{source.title}</p>
                            <p className="text-[10px] text-foreground/40 mt-0.5">{source.wordCount.toLocaleString()} words</p>
                          </div>
                          <button onClick={() => removeSource(source.id)}
                            className="p-1 rounded-lg hover:bg-ctu-maroon/10 hover:text-ctu-maroon text-foreground/30 transition-all shrink-0">
                            <X size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  {activeNotebook && activeNotebook.sources.length > 0 && (
                    <button onClick={generateGuide} disabled={isGeneratingGuide}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                      {isGeneratingGuide
                        ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
                        : <><Sparkles size={13} /> Generate Guide</>
                      }
                    </button>
                  )}
                </div>
              </div>

              {/* ── Guide Panel (Center) ── */}
              <div className={cn(
                "flex-col overflow-y-auto",
                "hidden lg:flex flex-1",
                activePanel === 'guide' && "flex flex-1 lg:flex lg:flex-none lg:flex-1"
              )}>
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-wider">Notebook Guide</h3>
                    {activeNotebook?.guide && (
                      <button onClick={generateGuide} disabled={isGeneratingGuide}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl neumorphic-raised hover:neumorphic-pressed text-xs font-bold text-foreground/50 hover:text-foreground transition-all">
                        <RefreshCw size={12} className={isGeneratingGuide ? "animate-spin" : ""} />
                        Regenerate
                      </button>
                    )}
                  </div>

                  {isGeneratingGuide ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <Loader2 size={32} className="text-emerald-400 animate-spin" />
                      <p className="text-sm font-medium text-foreground/50">Analyzing your sources...</p>
                    </div>
                  ) : activeNotebook?.guide ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="space-y-4">
                        {activeNotebook.guide.split('\n').map((line, i) => {
                          if (line.startsWith('## ')) {
                            return (
                              <h3 key={i} className="text-base font-bold text-foreground mt-6 mb-2 flex items-center gap-2">
                                <div className="w-1 h-5 bg-emerald-400 rounded-full" />
                                {line.replace('## ', '')}
                              </h3>
                            );
                          }
                          if (line.startsWith('- ') || line.startsWith('• ')) {
                            return (
                              <div key={i} className="flex gap-2 text-sm text-foreground/70">
                                <span className="text-emerald-400 mt-0.5 shrink-0">•</span>
                                <span>{line.replace(/^[-•]\s/, '')}</span>
                              </div>
                            );
                          }
                          if (line.trim()) {
                            return <p key={i} className="text-sm text-foreground/70 leading-relaxed">{line}</p>;
                          }
                          return <div key={i} className="h-2" />;
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full neumorphic-pressed flex items-center justify-center">
                        <Sparkles size={24} className="text-emerald-400/50" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-foreground/50">No Guide Yet</h4>
                        <p className="text-xs text-foreground/30 mt-1 max-w-xs">
                          Add sources and click "Generate Guide" to get an AI-powered summary, key topics, and study questions.
                        </p>
                      </div>
                      {(!activeNotebook || activeNotebook.sources.length === 0) && (
                        <button onClick={() => { setShowAddSource(true); setActivePanel('sources'); }}
                          className="px-4 py-2 rounded-xl neumorphic-raised text-xs font-bold text-emerald-400">
                          Add Your First Source
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Chat Panel (Right) ── */}
              <div className={cn(
                "flex-col border-l border-foreground/5 bg-background/30",
                "hidden lg:flex lg:w-80 xl:w-96",
                activePanel === 'chat' && "flex flex-1 lg:flex lg:flex-none"
              )}>
                <div className="px-4 py-3 border-b border-foreground/5 shrink-0">
                  <p className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare size={12} /> Ask Your Sources
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chat.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-12">
                      <div className="w-12 h-12 rounded-full neumorphic-pressed flex items-center justify-center">
                        <MessageSquare size={18} className="text-emerald-400/50" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground/40">Ask a question</p>
                        <p className="text-[10px] text-foreground/25 mt-0.5">Grounded on your enabled sources</p>
                      </div>
                    </div>
                  ) : (
                    chat.map(msg => (
                      <div key={msg.id} className={cn("flex gap-2", msg.role === 'user' && "flex-row-reverse")}>
                        <div className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed",
                          msg.role === 'user'
                            ? "bg-emerald-500 text-white rounded-tr-none"
                            : "neumorphic-pressed text-foreground/80 rounded-tl-none"
                        )}>
                          <p>{msg.content}</p>
                          {msg.role === 'ai' && (
                            <button onClick={() => copyToClipboard(msg.content, msg.id)}
                              className="mt-2 flex items-center gap-1 text-[10px] text-foreground/30 hover:text-foreground transition-colors">
                              {copiedId === msg.id ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {isAiTyping && (
                    <div className="flex gap-2">
                      <div className="neumorphic-pressed rounded-2xl rounded-tl-none px-4 py-3">
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={sendChat} className="p-3 border-t border-foreground/5 flex gap-2 shrink-0">
                  <Input
                    placeholder="Ask about your sources..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    className="flex-1 neumorphic-pressed border-none rounded-xl text-xs h-10"
                    disabled={isAiTyping}
                  />
                  <button type="submit" disabled={isAiTyping || !chatInput.trim()}
                    className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors disabled:opacity-40 shrink-0">
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
