/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Settings, 
  Plus, 
  Folder as FolderIcon, 
  ExternalLink, 
  MoreVertical, 
  Trash2, 
  Clock, 
  X,
  Github,
  Youtube,
  MessageCircle,
  LayoutGrid,
  Palette,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Check,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { format } from 'date-fns';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Bookmark, Folder, UserSettings } from './types';
import { cn } from './lib/utils';

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: '1', name: 'WhatsApp', url: 'https://web.whatsapp.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg' },
  { id: '2', name: 'GitHub', url: 'https://github.com', icon: 'https://github.com/favicon.ico' },
  { id: '3', name: 'YouTube', url: 'https://youtube.com', icon: 'https://www.youtube.com/favicon.ico' },
  { id: '4', name: 'Mega', url: 'https://mega.nz', icon: 'https://mega.nz/favicon.ico' },
];

const DEFAULT_FOLDERS: Folder[] = [
  { 
    id: 'f1', 
    name: 'Office', 
    bookmarks: [
      { id: 'off1', name: 'Docs', url: 'https://docs.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/docs_2020q4_48dp.png' },
      { id: 'off2', name: 'Sheets', url: 'https://sheets.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png' },
      { id: 'off3', name: 'Slides', url: 'https://slides.google.com', icon: 'https://www.gstatic.com/images/branding/product/1x/slides_2020q4_48dp.png' },
      { id: 'off4', name: 'Outlook', url: 'https://outlook.live.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg' },
      { id: 'off5', name: 'Slack', url: 'https://slack.com', icon: 'https://cdn.brandfolder.io/5H075877/at/pl546j-7le8zk-6v51pa/Slack_Icon.png' },
    ] 
  },
  { id: 'f2', name: 'Social', bookmarks: [] },
  { 
    id: 'f3', 
    name: 'AI', 
    bookmarks: [
      { id: 'ai1', name: 'ChatGPT', url: 'https://chatgpt.com', icon: 'https://www.google.com/s2/favicons?domain=chatgpt.com&sz=64' },
      { id: 'ai2', name: 'Gemini', url: 'https://gemini.google.com', icon: 'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=64' },
      { id: 'ai3', name: 'Claude', url: 'https://claude.ai', icon: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=64' },
      { id: 'ai4', name: 'Perplexity', url: 'https://perplexity.ai', icon: 'https://www.google.com/s2/favicons?domain=perplexity.ai&sz=64' },
    ] 
  },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>('nebula-bookmarks', DEFAULT_BOOKMARKS);
  const [folders, setFolders] = useLocalStorage<Folder[]>('nebula-folders', DEFAULT_FOLDERS);
  const [dockIds, setDockIds] = useLocalStorage<string[]>('nebula-dock-ids', ['1', '2', '3']);
  const [recentBookmarks, setRecentBookmarks] = useLocalStorage<Bookmark[]>('nebula-recent', []);
  const [settings, setSettings] = useLocalStorage<UserSettings>('nebula-settings', {
    background: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop',
    themeColor: '#8b5cf6',
    searchEngine: 'https://google.com/search?q=',
    userName: 'User',
    dockSize: 48,
    widgetSize: 'medium',
    visibleSystemInfo: ['RAM', 'CPU', 'Resolution', 'Network'],
    sortingMode: 'manual',
    visibleWidgets: ['Clock', 'System'],
    showDesktopSearch: true
  });

  useEffect(() => {
    // Migration for settings
    if (!settings.visibleSystemInfo || !settings.widgetSize || !settings.sortingMode || !settings.visibleWidgets || settings.showDesktopSearch === undefined) {
      setSettings({
        ...settings,
        widgetSize: settings.widgetSize || 'medium',
        visibleSystemInfo: settings.visibleSystemInfo || ['RAM', 'CPU', 'Resolution', 'Network'],
        dockSize: settings.dockSize || 48,
        sortingMode: settings.sortingMode || 'manual',
        visibleWidgets: settings.visibleWidgets || ['Clock', 'System', 'Notes'],
        showDesktopSearch: settings.showDesktopSearch ?? true
      });
    }

    // Migration for AI icons in folders
    const hasOldIcons = folders.some(f => 
      f.name === 'AI' && f.bookmarks.some(b => b.icon.includes('favicon.ico') || b.icon.includes('gstatic.com'))
    );
    if (hasOldIcons) {
      setFolders(folders.map(f => {
        if (f.name !== 'AI') return f;
        return {
          ...f,
          bookmarks: f.bookmarks.map(b => ({
            ...b,
            icon: `https://www.google.com/s2/favicons?domain=${new URL(b.url).hostname}&sz=64`
          }))
        };
      }));
    }
  }, []);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [systemInfo, setSystemInfo] = useState({ cpu: 0, ram: '0', screen: '' });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Simple system info simulation
    setSystemInfo({
      cpu: navigator.hardwareConcurrency || 4,
      ram: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory}GB` : 'N/A',
      screen: `${window.screen.width}x${window.screen.height}`
    });

    return () => clearInterval(timer);
  }, []);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const trackVisit = (bookmark: Bookmark) => {
    setRecentBookmarks(prev => {
      const filtered = (prev || []).filter(b => b.url !== bookmark.url);
      return [bookmark, ...filtered].slice(0, 12);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(`${settings.searchEngine}${encodeURIComponent(searchQuery)}`, '_blank');
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const addBookmark = (name: string, url: string, icon?: string) => {
    const id = Math.random().toString(36).substring(7);
    const newBookmark: Bookmark = {
      id,
      name,
      url: url.startsWith('http') ? url : `https://${url}`,
      icon: icon || `https://www.google.com/s2/favicons?domain=${url}&sz=64`
    };
    if (activeFolderId) {
      setFolders(folders.map(f => f.id === activeFolderId ? { ...f, bookmarks: [...f.bookmarks, newBookmark] } : f));
    } else {
      setBookmarks([...bookmarks, newBookmark]);
    }
  };

  const toggleDockPin = (id: string) => {
    if (dockIds.includes(id)) {
      setDockIds(dockIds.filter(i => i !== id));
    } else {
      setDockIds([...dockIds, id]);
    }
  };

  const updateBookmark = (id: string, name: string, url: string, icon?: string) => {
    const updated = {
      name,
      url: url.startsWith('http') ? url : `https://${url}`,
      icon: icon || `https://www.google.com/s2/favicons?domain=${url}&sz=64`
    };
    setBookmarks(bookmarks.map(b => b.id === id ? { ...b, ...updated } : b));
    setFolders(folders.map(f => ({
      ...f,
      bookmarks: f.bookmarks.map(b => b.id === id ? { ...b, ...updated } : b)
    })));
  };

  const moveBookmark = (id: string, direction: 'left' | 'right') => {
    const index = bookmarks.findIndex(b => b.id === id);
    if (index === -1) return;
    const newBookmarks = [...bookmarks];
    const newPos = direction === 'left' ? index - 1 : index + 1;
    if (newPos < 0 || newPos >= newBookmarks.length) return;
    [newBookmarks[index], newBookmarks[newPos]] = [newBookmarks[newPos], newBookmarks[index]];
    setBookmarks(newBookmarks);
  };

  const deleteBookmark = (id: string, folderId?: string | null) => {
    if (folderId === 'recent-sites') {
      setRecentBookmarks(prev => (prev || []).filter(b => b.id !== id));
    } else if (folderId) {
      setFolders(folders.map(f => f.id === folderId ? { ...f, bookmarks: f.bookmarks.filter(b => b.id !== id) } : f));
    } else {
      setBookmarks(bookmarks.filter(b => b.id !== id));
      setDockIds(dockIds.filter(i => i !== id));
    }
  };

  const moveBookmarkToFolder = (bookmarkId: string, targetFolderId: string) => {
    if (bookmarkId === targetFolderId) return;
    
    // Find bookmark
    let draggedItem: Bookmark | undefined = bookmarks.find(b => b.id === bookmarkId);
    let sourceFolderId: string | null = null;

    if (!draggedItem) {
      for (const folder of folders) {
        const found = folder.bookmarks.find(b => b.id === bookmarkId);
        if (found) {
          draggedItem = found;
          sourceFolderId = folder.id;
          break;
        }
      }
    }

    if (!draggedItem) return;

    // Update state
    if (sourceFolderId) {
      setFolders(prev => prev.map(f => f.id === sourceFolderId ? { ...f, bookmarks: f.bookmarks.filter(b => b.id !== bookmarkId) } : f));
    } else {
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
      setDockIds(prev => prev.filter(id => id !== bookmarkId));
    }

    setFolders(prev => prev.map(f => f.id === targetFolderId ? { ...f, bookmarks: [...f.bookmarks, draggedItem!] } : f));
  };

  const moveBookmarkInFolder = (folderId: string, bookmarkId: string, direction: 'left' | 'right') => {
    setFolders(prev => prev.map(f => {
      if (f.id !== folderId) return f;
      const index = f.bookmarks.findIndex(b => b.id === bookmarkId);
      if (index === -1) return f;
      const newBookmarks = [...f.bookmarks];
      const newPos = direction === 'left' ? index - 1 : index + 1;
      if (newPos < 0 || newPos >= newBookmarks.length) return f;
      [newBookmarks[index], newBookmarks[newPos]] = [newBookmarks[newPos], newBookmarks[index]];
      return { ...f, bookmarks: newBookmarks };
    }));
  };

  const moveBookmarkToDesktop = (bookmarkId: string) => {
    if (bookmarks.find(b => b.id === bookmarkId)) return;

    let bookmarkToMove: Bookmark | undefined;
    let sourceFolderId: string | null = null;

    for (const folder of folders) {
      const found = folder.bookmarks.find(b => b.id === bookmarkId);
      if (found) {
        bookmarkToMove = found;
        sourceFolderId = folder.id;
        break;
      }
    }

    if (!bookmarkToMove || !sourceFolderId) return;

    setFolders(prev => prev.map(f => f.id === sourceFolderId ? { ...f, bookmarks: f.bookmarks.filter(b => b.id !== bookmarkId) } : f));
    setBookmarks(prev => [...prev, bookmarkToMove!]);
  };

  const createFolder = (name: string, icon?: string) => {
    const id = 'f' + Math.random().toString(36).substring(7);
    const newFolder: Folder = {
      id,
      name,
      bookmarks: [],
      icon
    };
    setFolders([...folders, newFolder]);
  };

  const updateFolder = (id: string, name: string, icon?: string) => {
    setFolders(folders.map(f => f.id === id ? { ...f, name, icon } : f));
  };

  const getSortedItems = <T extends { name: string }>(items: T[]): T[] => {
    if (settings.sortingMode === 'alphabetical') {
      return [...items].sort((a, b) => a.name.localeCompare(b.name));
    }
    return items;
  };

  const sortedBookmarks = getSortedItems<Bookmark>(bookmarks);
  const rawSortedFolders = getSortedItems<Folder>(folders).map(f => ({
    ...f,
    bookmarks: getSortedItems<Bookmark>(f.bookmarks)
  }));

  const sortedFolders: Folder[] = [
    { id: 'recent-sites', name: 'Recently Visited', bookmarks: recentBookmarks || [], icon: undefined },
    ...rawSortedFolders
  ];

  const activeFolder = sortedFolders.find(f => f.id === activeFolderId);
  const dockApps = bookmarks.filter(b => dockIds.includes(b.id));

  return (
    <div className="relative h-screen w-full flex overflow-hidden font-sans select-none">
      {/* Background Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${settings.background})` }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
      </div>

      {/* Main Content Area */}
      <div 
        className="relative z-10 flex-1 h-full flex flex-col p-8"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData('text/plain');
          if (id) moveBookmarkToDesktop(id);
        }}
      >
        
        {/* Empty area for search triggers */}
        {!isSearchOpen && settings.showDesktopSearch && (
          <div className="w-full flex justify-center pt-4 mb-8">
            <motion.button 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsSearchOpen(true)}
              className="px-6 py-3 glass rounded-2xl flex items-center gap-3 text-white/40 hover:text-white/60 hover:bg-white/5 transition-all text-sm font-medium lg:-translate-x-16"
            >
              <Search size={18} />
              <span>Press <kbd className="bg-white/10 px-1.5 rounded-md border border-white/10">⌘ K</kbd> to search</span>
            </motion.button>
          </div>
        )}

        {/* Desktop Icons (Left Side) */}
        <div className={cn(
          "flex-1 overflow-hidden grid grid-flow-col grid-rows-6 auto-cols-max gap-8 content-start p-4 transition-all",
          !settings.showDesktopSearch && "pt-0"
        )}>
          {sortedFolders.map((folder, i) => (
            <BookmarkCard 
              key={`folder-${folder.id}`} 
              item={{ ...folder, isFolder: true }} 
              index={i} 
              onClick={() => {
                if (isEditMode) {
                  setEditingFolder(folder);
                } else {
                  setActiveFolderId(folder.id);
                }
              }}
              onDelete={folder.id === 'recent-sites' ? undefined : () => setFolders(folders.filter(f => f.id !== folder.id))}
              isPinned={dockIds.includes(folder.id)}
              onPin={() => toggleDockPin(folder.id)}
              isEditMode={isEditMode}
              onDropBookmark={folder.id === 'recent-sites' ? undefined : (bookmarkId) => moveBookmarkToFolder(bookmarkId, folder.id)}
            />
          ))}
          {sortedBookmarks.map((item, i) => (
            <BookmarkCard 
              key={`bookmark-${item.id}`} 
              item={item} 
              index={i} 
              onClick={() => {
                if (isEditMode) {
                  setEditingBookmark(item);
                } else {
                  trackVisit(item);
                  window.open(item.url, '_blank');
                }
              }}
              onDelete={() => deleteBookmark(item.id)}
              isPinned={dockIds.includes(item.id)}
              onPin={() => toggleDockPin(item.id)}
              isEditMode={isEditMode}
              onMove={settings.sortingMode === 'manual' ? (dir) => moveBookmark(item.id, dir) : undefined}
              isFirst={i === 0}
              isLast={i === bookmarks.length - 1}
            />
          ))}
          
          {isEditMode && (
            <>
              <button 
                onClick={() => { setActiveFolderId(null); setIsAddingBookmark(true); }}
                className="flex flex-col items-center gap-2 group p-2 rounded-xl transition-all"
                id="add-bookmark-button"
              >
                <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center border-dashed border-accent bg-accent/5 shadow-lg shadow-accent/10">
                  <Plus size={24} className="text-accent group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-tighter text-accent/60 truncate w-16 text-center">Add</span>
              </button>
              <button 
                onClick={() => setIsCreatingFolder(true)}
                className="flex flex-col items-center gap-2 group p-2 rounded-xl transition-all"
                id="create-folder-button"
              >
                <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center border-dashed border-white/20 hover:border-accent/40 hover:bg-accent/5 transition-all">
                  <FolderIcon size={24} className="text-white/20 group-hover:text-accent transition-colors" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-tighter text-white/30 group-hover:text-white truncate w-16 text-center">Folder</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar: Widgets */}
      <div className="relative z-10 w-80 h-full p-8 flex flex-col gap-6">
        {/* Top Widget: Time & Weather */}
        { (settings.visibleWidgets || []).includes('Clock') && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "glass-morphed rounded-[32px] space-y-4 shadow-xl group/widget relative",
              settings.widgetSize === 'small' ? 'p-4' : settings.widgetSize === 'large' ? 'p-10' : 'p-6'
            )}
          >
            {isEditMode && (
              <button 
                onClick={() => setSettings({ ...settings, visibleWidgets: (settings.visibleWidgets || []).filter(w => w !== 'Clock') })}
                className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center bg-red-500 rounded-full text-white opacity-0 group-hover/widget:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            )}
            <div className="flex flex-col gap-1">
              <h2 className={cn(
                "font-display font-medium tracking-tight",
                settings.widgetSize === 'small' ? 'text-4xl' : settings.widgetSize === 'large' ? 'text-6xl' : 'text-5xl'
              )}>
                {format(currentTime, 'HH:mm')}
              </h2>
              <p className={cn(
                "text-white/50 font-medium",
                settings.widgetSize === 'small' ? 'text-xs' : 'text-sm'
              )}>
                {format(currentTime, 'EEEE, MMM do')}
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center gap-4">
              <div className={cn(
                "bg-accent/20 rounded-xl flex items-center justify-center",
                settings.widgetSize === 'small' ? 'w-10 h-10' : 'w-12 h-12'
              )}>
                <Clock className="text-accent" size={settings.widgetSize === 'small' ? 20 : 24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80 tracking-tight">London, UK</p>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest whitespace-nowrap">Mostly Clear • 21°C</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Middle Widget: Quick stats */}
        <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
          { (settings.visibleWidgets || []).includes('Calendar') && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-6 rounded-[32px] space-y-4 group/widget relative"
            >
              {isEditMode && (
                <button 
                  onClick={() => setSettings({ ...settings, visibleWidgets: (settings.visibleWidgets || []).filter(w => w !== 'Calendar') })}
                  className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center bg-red-500 rounded-full text-white opacity-0 group-hover/widget:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              )}
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-accent" />
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Calendar</p>
              </div>
              <div className="grid grid-cols-7 gap-1 text-[10px] text-white/40">
                {['S','M','T','W','T','F','S'].map((d, idx) => <div key={`calendar-header-${d}-${idx}`} className="text-center font-bold">{d}</div>)}
                {Array.from({length: 31}).map((_, i) => (
                  <div key={`calendar-day-${i}`} className={cn(
                    "text-center py-1 rounded-md",
                    i + 1 === currentTime.getDate() ? "bg-accent text-white font-bold" : ""
                  )}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          { (settings.visibleWidgets || []).includes('Notes') && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-6 rounded-[32px] space-y-4 group/widget relative"
            >
              {isEditMode && (
                <button 
                  onClick={() => setSettings({ ...settings, visibleWidgets: (settings.visibleWidgets || []).filter(w => w !== 'Notes') })}
                  className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center bg-red-500 rounded-full text-white opacity-0 group-hover/widget:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              )}
              <div className="flex items-center gap-2 mb-2">
                <Edit2 size={14} className="text-accent" />
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Quick Note</p>
              </div>
              <textarea 
                placeholder="Type a thought..."
                className="w-full bg-transparent border-none outline-none text-sm text-white/60 placeholder:text-white/10 resize-none h-24 custom-scrollbar"
              />
            </motion.div>
          )}
        </div>

        {/* Bottom Widget: System Info */}
        { (settings.visibleWidgets || []).includes('System') && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-6 rounded-[32px] space-y-4 group/widget relative"
          >
            {isEditMode && (
              <button 
                onClick={() => setSettings({ ...settings, visibleWidgets: (settings.visibleWidgets || []).filter(w => w !== 'System') })}
                className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center bg-red-500 rounded-full text-white opacity-0 group-hover/widget:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            )}
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4">System Monitor</p>
            <div className="space-y-4">
              {(settings.visibleSystemInfo || []).includes('RAM') && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40 font-medium">RAM USAGE</span>
                    <span className="text-xs font-bold text-white/80">{systemInfo.ram}</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-[30%] h-full bg-accent" />
                  </div>
                </>
              )}
              
              {(settings.visibleSystemInfo || []).includes('CPU') && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40 font-medium">CPU CORES</span>
                  <span className="text-xs font-bold text-white/80">{systemInfo.cpu}</span>
                </div>
              )}
              
              {(settings.visibleSystemInfo || []).includes('Resolution') && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40 font-medium">RESOLUTION</span>
                  <span className="text-xs font-bold text-white/80">{systemInfo.screen}</span>
                </div>
              )}
              
              {(settings.visibleSystemInfo || []).includes('Network') && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40 font-medium">NETWORK</span>
                  <span className="text-xs font-bold text-green-400">Stable</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Dock */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphed px-4 py-2 rounded-[32px] flex items-center gap-3"
        >
          {dockApps.map((app) => (
            <DockIcon 
              key={`dock-app-${app.id}`} 
              app={app} 
              onVisit={trackVisit}
              size={settings.dockSize}
            />
          ))}
          {sortedFolders.filter(f => dockIds.includes(f.id)).map((folder) => (
            <DockIcon 
              key={`dock-folder-${folder.id}`} 
              app={{ id: folder.id, name: folder.name, url: '#', icon: folder.icon || '' }} 
              isFolder
              folderBookmarks={folder.bookmarks}
              size={settings.dockSize}
              onClick={() => setActiveFolderId(folder.id)}
            />
          ))}
          <div className="w-px h-8 bg-white/10 mx-1" />
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={cn(
              "w-12 h-12 flex items-center justify-center rounded-2xl transition-all",
              isEditMode ? "bg-accent text-white shadow-lg shadow-accent/40" : "hover:bg-white/10 text-white/60"
            )}
            title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
          >
            {isEditMode ? <Check size={20} /> : <Edit2 size={20} />}
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white/10 transition-colors"
          >
            <Settings size={20} className="text-white/60" />
          </button>
        </motion.div>
      </div>

      {/* Modals... */}
      <AnimatePresence mode="wait">
        {isSettingsOpen && (
          <SettingsModal 
            key="settings-modal"
            settings={settings} 
            setSettings={setSettings} 
            onClose={() => setIsSettingsOpen(false)} 
          />
        )}
        {activeFolderId && activeFolder && (
          <FolderModal 
            key={`folder-modal-${activeFolder.id}`}
            folder={activeFolder} 
            onClose={() => setActiveFolderId(null)} 
            onDeleteBookmark={(id) => deleteBookmark(id, activeFolderId)}
            onAddShortcut={() => setIsAddingBookmark(true)}
            isEditMode={isEditMode}
            onMoveBookmark={settings.sortingMode === 'manual' ? (id, dir) => moveBookmarkInFolder(activeFolderId, id, dir) : undefined}
            onDropOut={(id) => moveBookmarkToDesktop(id)}
            onVisit={trackVisit}
          />
        )}
        {isAddingBookmark && (
          <AddBookmarkModal 
            key="add-bookmark-modal"
            onAdd={addBookmark}
            onClose={() => setIsAddingBookmark(false)} 
          />
        )}
        {isCreatingFolder && (
          <CreateFolderModal 
            key="create-folder-modal"
            onSave={createFolder}
            onClose={() => setIsCreatingFolder(false)} 
          />
        )}
        {editingFolder && (
          <EditFolderModal 
            key={`edit-folder-modal-${editingFolder.id}`}
            folder={editingFolder}
            onSave={(name, icon) => updateFolder(editingFolder.id, name, icon)}
            onClose={() => setEditingFolder(null)} 
          />
        )}
        {editingBookmark && (
          <EditBookmarkModal 
            key={`edit-bookmark-modal-${editingBookmark.id}`}
            bookmark={editingBookmark}
            onUpdate={(name, url, icon) => updateBookmark(editingBookmark.id, name, url, icon)}
            onClose={() => setEditingBookmark(null)} 
          />
        )}
        {isSearchOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="relative w-full max-w-2xl glass-morphed rounded-[32px] p-2 shadow-2xl overflow-hidden border border-white/10"
            >
              <form onSubmit={handleSearch} className="relative flex items-center">
                <Search className="absolute left-6 text-accent" size={24} />
                <input 
                  type="text" 
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are we looking for today?"
                  className="w-full bg-transparent py-6 pl-16 pr-6 text-2xl outline-none text-white placeholder:text-white/20 font-display"
                />
              </form>
              <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-widest">
                    <span className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10 text-white/50">ENTER</span>
                    <span>Search</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-widest">
                    <span className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10 text-white/50">ESC</span>
                    <span>Close</span>
                  </div>
                </div>
                <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                  Powered by {settings.searchEngine.includes('google') ? 'Google' : 'DuckDuckGo'}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BookmarkCard({ 
  item, 
  index,
  onDelete, 
  onClick, 
  isPinned, 
  onPin, 
  isEditMode, 
  onMove, 
  isFirst, 
  isLast,
  onDropBookmark
}: { 
  key?: string | number;
  item: any; 
  index: number; 
  onDelete: () => void; 
  onClick: () => void;
  isPinned?: boolean;
  onPin?: () => void;
  isEditMode?: boolean;
  onMove?: (dir: 'left' | 'right') => void;
  isFirst?: boolean;
  isLast?: boolean;
  onDropBookmark?: (id: string) => void;
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <motion.div
      whileHover={isEditMode ? { scale: 1.05 } : { y: -4 }}
      draggable={!item.isFolder}
      onDragStart={(e) => {
        if (item.isFolder) return;
        e.dataTransfer.setData('text/plain', item.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(e) => {
        if (item.isFolder && onDropBookmark) {
          e.preventDefault();
          setIsOver(true);
        }
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        if (item.isFolder && onDropBookmark) {
          e.preventDefault();
          setIsOver(false);
          const id = e.dataTransfer.getData('text/plain');
          if (id) onDropBookmark(id);
        }
      }}
      className={cn(
        "group relative flex flex-col items-center gap-2 cursor-pointer w-20 transition-all duration-300",
        isEditMode && "z-30",
        isOver && "scale-110"
      )}
    >
      {/* Move Buttons */}
      {isEditMode && !item.isFolder && onMove && (
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isFirst && (
            <button 
              onClick={(e) => { e.stopPropagation(); onMove('left'); }}
              className="p-1 glass rounded-lg hover:bg-accent hover:text-white transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>
      )}
      {isEditMode && !item.isFolder && onMove && (
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isLast && (
            <button 
              onClick={(e) => { e.stopPropagation(); onMove('right'); }}
              className="p-1 glass rounded-lg hover:bg-accent hover:text-white transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}

      <div 
        onClick={onClick}
        className={cn(
          "relative w-16 h-16 glass rounded-[24px] flex items-center justify-center p-3 shadow-sm transition-all duration-300 overflow-hidden",
          isEditMode ? "border-solid border-accent bg-accent/10 ring-2 ring-accent/30 shadow-accent/20 shadow-xl" : "group-hover:shadow-accent/30 group-hover:shadow-2xl",
          isOver && "ring-4 ring-accent bg-accent/20 scale-110 border-accent shadow-2xl"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {item.isFolder ? (
          <FolderIconPreview 
            icon={item.icon} 
            bookmarks={item.bookmarks} 
            size={64} 
          />
        ) : (
          <img 
            src={item.icon} 
            alt={item.name} 
            className="w-10 h-10 object-contain drop-shadow-md"
          />
        )}
        
        {isEditMode && (
          <div className="absolute inset-0 bg-accent/10 flex items-center justify-center">
            <Edit2 size={16} className="text-accent" />
          </div>
        )}
      </div>
      <span className="max-w-full truncate text-[10px] font-bold tracking-tight text-white/50 group-hover:text-white text-center transition-colors px-1 bg-black/10 rounded-lg group-hover:bg-black/20">
        {item.name}
      </span>
      
      {/* Quick Actions Overlay */}
      <div className={cn(
        "absolute -top-1 -right-1 flex gap-1 transition-all duration-300 scale-90",
        isEditMode ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 group-hover:scale-100"
      )}>
        {onPin && (
          <button 
            onClick={(e) => { e.stopPropagation(); onPin(); }}
            className={cn(
              "w-6 h-6 flex items-center justify-center backdrop-blur-md border border-white/10 rounded-full transition-colors",
              isPinned ? "bg-accent text-white" : "bg-white/10 text-white/40 hover:text-white"
            )}
          >
            <Plus size={12} className={cn(isPinned && "rotate-45")} />
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="w-6 h-6 flex items-center justify-center bg-white/10 hover:bg-red-500/80 backdrop-blur-md border border-white/10 rounded-full text-white/40 hover:text-white transition-all"
        >
          <X size={12} />
        </button>
      </div>
    </motion.div>
  );
}

function FolderModal({ folder, onClose, onDeleteBookmark, onAddShortcut, isEditMode, onMoveBookmark, onDropOut, onVisit }: { 
  key?: string | number;
  folder: Folder; 
  onClose: () => void; 
  onDeleteBookmark: (id: string) => void;
  onAddShortcut: () => void;
  isEditMode?: boolean;
  onMoveBookmark?: (id: string, dir: 'left' | 'right') => void;
  onDropOut?: (id: string) => void;
  onVisit?: (b: Bookmark) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData('text/plain');
          if (id && onDropOut) onDropOut(id);
        }}
        className="absolute inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center"
      >
        <div className="absolute top-10 text-white/40 text-xs font-bold font-mono tracking-widest animate-pulse pointer-events-none">
          DROP OUTSIDE TO MOVE TO DESKTOP
        </div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="relative w-full max-w-2xl glass-morphed rounded-[48px] p-10 overflow-hidden shadow-2xl"
      >
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-3xl font-display font-bold tracking-tight mb-1">{folder.name}</h3>
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">{folder.bookmarks.length} shortcuts</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-6 min-h-[200px] content-start">
          {folder.bookmarks.map((item, i) => (
            <BookmarkCard 
              key={`folder-bookmark-${item.id}`} 
              item={item} 
              index={i} 
              onClick={() => {
                if (isEditMode) {
                  window.alert("Edit feature in folders coming soon");
                } else {
                  if (onVisit) onVisit(item);
                  window.open(item.url, '_blank');
                }
              }}
              onDelete={() => onDeleteBookmark(item.id)}
              isEditMode={isEditMode}
              onMove={onMoveBookmark ? (dir) => onMoveBookmark(item.id, dir) : undefined}
              isFirst={i === 0}
              isLast={i === folder.bookmarks.length - 1}
            />
          ))}
          <button 
            onClick={onAddShortcut}
            className="flex flex-col items-center gap-2 group p-2 rounded-xl"
          >
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center border-dashed border-white/20 group-hover:bg-accent/10 transition-colors">
              <Plus size={20} className="text-white/20 group-hover:text-white" />
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function DockIcon({ app, isFolder, folderBookmarks, onClick, onVisit, size = 48 }: { 
  key?: string | number;
  app: Bookmark; 
  isFolder?: boolean; 
  folderBookmarks?: Bookmark[];
  onClick?: () => void;
  onVisit?: (b: Bookmark) => void;
  size?: number;
}) {
  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.2 }}
      className="relative flex items-center justify-center rounded-2xl hover:bg-accent/40 transition-colors group cursor-pointer"
      style={{ width: size, height: size }}
      onClick={() => {
        if (onClick) onClick();
        else if (app.url !== '#') {
          if (onVisit) onVisit(app);
          window.open(app.url, '_blank');
        }
      }}
    >
      {isFolder ? (
        <FolderIconPreview 
          icon={app.icon} 
          bookmarks={folderBookmarks || []} 
          size={size} 
          isDock 
        />
      ) : (
        <img 
          src={app.icon} 
          alt={app.name} 
          className="object-contain"
          style={{ width: size * 0.6, height: size * 0.6 }}
        />
      )}
      <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 glass rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {app.name}
      </span>
      <div className="absolute -bottom-1 w-1 h-1 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

function FolderIconPreview({ 
  icon, 
  bookmarks, 
  size, 
  isDock = false 
}: { 
  icon?: string; 
  bookmarks: Bookmark[]; 
  size: number;
  isDock?: boolean;
}) {
  if (icon) {
    const iconSize = isDock ? size * 0.6 : 40;
    return (
      <img 
        src={icon} 
        alt="" 
        className="object-contain"
        style={{ width: iconSize, height: iconSize }}
      />
    );
  }

  const displayBookmarks = (bookmarks || []).slice(0, 4);
  const containerSize = isDock ? size * 0.75 : 56;
  const gridGap = isDock ? 'gap-0.5' : 'gap-1';
  const padding = isDock ? 'p-0.5' : 'p-1';
  const iconPadding = isDock ? 'p-[1px]' : 'p-0.5';
  const roundedGrid = isDock ? 'rounded-xl' : 'rounded-2xl';
  const roundedIcon = isDock ? 'rounded-sm' : 'rounded-md';

  return (
    <div 
      className={cn(
        "grid grid-cols-2 bg-transparent transition-all",
        gridGap,
        padding,
        roundedGrid
      )}
      style={{ width: containerSize, height: containerSize }}
    >
      {displayBookmarks.map((b, i) => (
        <div key={i} className={cn("bg-white/5 overflow-hidden flex items-center justify-center", iconPadding, roundedIcon)}>
          <img 
            src={b.icon} 
            alt="" 
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${b.url}&sz=32`;
            }}
          />
        </div>
      ))}
      {displayBookmarks.length === 0 && (
        <div className="col-span-2 row-span-2 flex items-center justify-center opacity-20">
          <FolderIcon size={isDock ? size * 0.35 : 24} className="text-white" />
        </div>
      )}
      {displayBookmarks.length > 0 && displayBookmarks.length < 4 && Array.from({ length: 4 - displayBookmarks.length }).map((_, i) => (
        <div key={`empty-${i}`} className={cn("bg-white/0", roundedIcon)} />
      ))}
    </div>
  );
}

function SettingsModal({ settings, setSettings, onClose }: { 
  key?: string | number;
  settings: UserSettings; 
  setSettings: (s: UserSettings) => void; 
  onClose: () => void 
}) {
  const backgrounds = [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2671&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=2670&auto=format&fit=crop'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, background: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg glass-morphed rounded-[40px] p-8 overflow-hidden"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-display font-semibold">Customization</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
          <section>
            <label className="text-sm font-medium text-white/50 block mb-4">Desktop Settings</label>
            <div className="flex items-center justify-between p-4 glass rounded-2xl">
              <div>
                <p className="text-sm font-medium">Desktop Search Bar</p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Show search trigger on desktop</p>
              </div>
              <button 
                onClick={() => setSettings({ ...settings, showDesktopSearch: !settings.showDesktopSearch })}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative px-1 flex items-center",
                  settings.showDesktopSearch ? "bg-accent" : "bg-white/10"
                )}
              >
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full transition-transform",
                  settings.showDesktopSearch ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
            </div>
          </section>

          <section>
            <label className="text-sm font-medium text-white/50 block mb-4">Background Image</label>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input 
                    type="text"
                    placeholder="Paste image URL here..."
                    className="w-full glass py-2.5 pl-10 pr-4 rounded-xl outline-none focus:ring-1 ring-accent text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setSettings({ ...settings, background: (e.target as HTMLInputElement).value });
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">or</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <label className="group relative flex flex-col items-center justify-center h-24 glass border-dashed border-white/10 hover:border-accent/40 rounded-2xl cursor-pointer transition-all">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileUpload} 
                />
                <Upload size={20} className="text-white/20 group-hover:text-accent mb-2 transition-colors" />
                <span className="text-xs font-semibold text-white/40 group-hover:text-white transition-colors">Upload from computer</span>
              </label>
            </div>
          </section>

          <section>
            <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] block mb-4">Background Presets</label>
            <div className="grid grid-cols-2 gap-3">
              {backgrounds.map((bg, i) => (
                <button 
                  key={`bg-preset-${i}`}
                  onClick={() => setSettings({ ...settings, background: bg })}
                  className={cn(
                    "h-24 rounded-2xl bg-cover bg-center border-2 transition-all",
                    settings.background === bg ? "border-accent scale-[0.98]" : "border-transparent opacity-80 hover:opacity-100"
                  )}
                  style={{ backgroundImage: `url(${bg})` }}
                />
              ))}
            </div>
          </section>

          <section>
            <label className="text-sm font-medium text-white/50 block mb-4">Search Engine</label>
            <select 
              value={settings.searchEngine}
              onChange={(e) => setSettings({ ...settings, searchEngine: e.target.value })}
              className="w-full glass py-3 px-4 rounded-xl outline-none focus:ring-1 ring-accent"
            >
              <option value="https://google.com/search?q=">Google</option>
              <option value="https://duckduckgo.com/?q=">DuckDuckGo</option>
              <option value="https://www.bing.com/search?q=">Bing</option>
            </select>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium text-white/50">Dock Icon Size</label>
              <span className="text-xs font-bold text-accent">{settings.dockSize}px</span>
            </div>
            <input 
              type="range"
              min="32"
              max="80"
              step="4"
              value={settings.dockSize}
              onChange={(e) => setSettings({ ...settings, dockSize: parseInt(e.target.value) })}
              className="w-full accent-accent cursor-pointer"
            />
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Small</span>
              <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Large</span>
            </div>
          </section>

          <section>
            <label className="text-sm font-medium text-white/50 block mb-4">Widget Scale</label>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={`size-btn-${size}`}
                  onClick={() => setSettings({ ...settings, widgetSize: size })}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all",
                    settings.widgetSize === size 
                      ? "bg-accent border-accent text-white" 
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="text-sm font-medium text-white/50 block mb-4">Sorting Order</label>
            <div className="flex gap-2">
              {(['manual', 'alphabetical'] as const).map((mode) => (
                <button
                  key={`mode-btn-${mode}`}
                  onClick={() => setSettings({ ...settings, sortingMode: mode })}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all",
                    settings.sortingMode === mode 
                      ? "bg-accent border-accent text-white" 
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
            {settings.sortingMode === 'alphabetical' && (
              <p className="text-[10px] text-accent/60 mt-2 font-medium">alphabetical mode disables manual reordering</p>
            )}
          </section>

          <section>
            <label className="text-sm font-medium text-white/50 block mb-4">Widgets Visibility</label>
            <div className="grid grid-cols-2 gap-2">
              {['Clock', 'System', 'Notes', 'Calendar'].map((widget) => (
                <button
                  key={`widget-btn-${widget}`}
                  onClick={() => {
                    const visibleWidgetsArr = settings.visibleWidgets || [];
                    const next = visibleWidgetsArr.includes(widget)
                      ? visibleWidgetsArr.filter(w => w !== widget)
                      : [...visibleWidgetsArr, widget];
                    setSettings({ ...settings, visibleWidgets: next });
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                    (settings.visibleWidgets || []).includes(widget)
                      ? "bg-accent/10 border-accent/40 text-white"
                      : "bg-white/5 border-white/10 text-white/20 hover:bg-white/10"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    (settings.visibleWidgets || []).includes(widget) ? "bg-accent" : "bg-white/10"
                  )} />
                  <span className="text-xs font-semibold">{widget}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="text-sm font-medium text-white/50 block mb-4">System Information</label>
            <div className="grid grid-cols-2 gap-2">
              {['RAM', 'CPU', 'Resolution', 'Network'].map((item) => (
                <button
                  key={`sys-info-btn-${item}`}
                  onClick={() => {
                    const visibleInfo = settings.visibleSystemInfo || [];
                    const next = visibleInfo.includes(item)
                      ? visibleInfo.filter(i => i !== item)
                      : [...visibleInfo, item];
                    setSettings({ ...settings, visibleSystemInfo: next });
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                    (settings.visibleSystemInfo || []).includes(item)
                      ? "bg-accent/10 border-accent/40 text-white"
                      : "bg-white/5 border-white/10 text-white/20 hover:bg-white/10"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    (settings.visibleSystemInfo || []).includes(item) ? "bg-accent" : "bg-white/10"
                  )} />
                  <span className="text-xs font-semibold">{item}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}

function EditFolderModal({ folder, onSave, onClose }: { key?: string | number; folder: Folder; onSave: (name: string, icon?: string) => void; onClose: () => void }) {
  const [name, setName] = useState(folder.name);
  const [icon, setIcon] = useState(folder.icon || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), icon.trim() || undefined);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md glass-morphed rounded-[40px] p-8"
      >
        <h3 className="text-2xl font-display font-semibold mb-6">Edit Folder</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-white/40 block mb-2 px-1">FOLDER NAME</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass py-3 px-4 rounded-xl outline-none focus:ring-1 ring-accent text-white"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/40 block mb-2 px-1">ICON URL (OPTIONAL)</label>
            <input 
              type="text" 
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="e.g. https://example.com/icon.png"
              className="w-full glass py-3 px-4 rounded-xl outline-none focus:ring-1 ring-accent text-white"
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 font-medium text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-[2] py-3 bg-accent/80 hover:bg-accent rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-accent/40"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function CreateFolderModal({ onSave, onClose }: { key?: string | number; onSave: (name: string, icon?: string) => void; onClose: () => void }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), icon.trim() || undefined);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md glass-morphed rounded-[40px] p-8"
      >
        <h3 className="text-2xl font-display font-semibold mb-6">New Folder</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-white/40 block mb-2 px-1">FOLDER NAME</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Learning"
              className="w-full glass py-3 px-4 rounded-xl outline-none focus:ring-1 ring-accent text-white"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/40 block mb-2 px-1">ICON URL (OPTIONAL)</label>
            <input 
              type="text" 
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="e.g. https://example.com/icon.png"
              className="w-full glass py-3 px-4 rounded-xl outline-none focus:ring-1 ring-accent text-white"
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 font-medium text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-[2] py-3 bg-accent/80 hover:bg-accent rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-accent/40"
            >
              Create Folder
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function EditBookmarkModal({ bookmark, onUpdate, onClose }: { 
  key?: string | number;
  bookmark: Bookmark; 
  onUpdate: (name: string, url: string, icon?: string) => void; 
  onClose: () => void;
}) {
  const [name, setName] = useState(bookmark.name);
  const [url, setUrl] = useState(bookmark.url);
  const [icon, setIcon] = useState(bookmark.icon || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && url) {
      onUpdate(name, url, icon);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md glass-morphed rounded-[40px] p-8"
      >
        <h3 className="text-2xl font-display font-semibold mb-6">Edit Shortcut</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-white/40 block mb-2 px-1 text-accent">NAME</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass py-3 px-4 rounded-xl outline-none focus:ring-1 ring-accent text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/40 block mb-2 px-1 text-accent">URL</label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full glass py-3 px-4 rounded-xl outline-none focus:ring-1 ring-accent text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/40 block mb-2 px-1 text-accent">ICON URL (OPTIONAL)</label>
            <input 
              type="text" 
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="e.g. https://example.com/icon.png"
              className="w-full glass py-3 px-4 rounded-xl outline-none focus:ring-1 ring-accent text-white"
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 font-medium text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-[2] py-3 bg-accent/80 hover:bg-accent rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-accent/40"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function AddBookmarkModal({ onAdd, onClose }: { key?: string | number; onAdd: (name: string, url: string, icon?: string) => void; onClose: () => void }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && url) {
      onAdd(name, url, icon);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md glass-morphed rounded-[40px] p-8"
      >
        <h3 className="text-2xl font-display font-semibold mb-6">Add Shortcut</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-white/40 block mb-2 px-1">NAME</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. GitHub"
              className="w-full glass py-3 px-4 rounded-xl outline-none focus:ring-1 ring-accent text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/40 block mb-2 px-1">URL</label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="github.com"
              className="w-full glass py-3 px-4 rounded-xl outline-none focus:ring-1 ring-accent text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/40 block mb-2 px-1">ICON URL (OPTIONAL)</label>
            <input 
              type="text" 
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="e.g. https://example.com/icon.png"
              className="w-full glass py-3 px-4 rounded-xl outline-none focus:ring-1 ring-accent text-white"
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 font-medium text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-[2] py-3 bg-accent/80 hover:bg-accent rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-accent/20"
            >
              Add Shortcut
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
