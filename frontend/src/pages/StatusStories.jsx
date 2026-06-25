import React, { useState, useEffect, useContext, useRef } from 'react';
import { LuArrowLeft, LuPlay, LuPause, LuX, LuSend, LuPlus } from 'react-icons/lu';
import moment from 'moment';
import { api } from '../Api';
import { GlobalContext } from '../context/Context';
import { toast } from 'react-hot-toast';

export default function StatusStories({ onClose, allUsers = [] }) {
  const { state } = useContext(GlobalContext);
  const [activeStoryList, setActiveStoryList] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [userStories, setUserStories] = useState([]);
  
  const fileInputRef = useRef(null);

  const fetchStatuses = async () => {
    try {
      const res = await api.get('/api/v1/status');
      setUserStories(res.data.statuses || []);
    } catch (e) {
      console.error("Failed to fetch statuses:", e);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  // Handle story progress timer
  useEffect(() => {
    if (!activeStoryList || !isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Go to next story or close
          if (activeStoryIndex < activeStoryList.stories.length - 1) {
            setActiveStoryIndex(prevIdx => prevIdx + 1);
            return 0;
          } else {
            // Close viewer
            setActiveStoryList(null);
            setActiveStoryIndex(0);
            return 0;
          }
        }
        return prev + 1.25; // Speed multiplier for ~5s duration
      });
    }, 60);

    return () => clearInterval(interval);
  }, [activeStoryList, activeStoryIndex, isPlaying]);

  const handleOpenViewer = (storyList) => {
    setActiveStoryList(storyList);
    setActiveStoryIndex(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (activeStoryIndex < activeStoryList.stories.length - 1) {
      setActiveStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      setActiveStoryList(null);
    }
  };

  const handlePrev = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    toast.success(`Reply sent to ${activeStoryList.userName}!`);
    setReplyText('');
    setIsPlaying(true);
  };

  // Upload status handler
  const handleStatusUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', 'Uploaded a status story! ✨');

    const uploadToast = toast.loading("Uploading status story...");
    try {
      await api.post('/api/v1/status', formData);
      toast.success("Status uploaded successfully", { id: uploadToast });
      fetchStatuses();
    } catch (err) {
      console.error("Status upload error:", err);
      toast.error("Failed to upload status", { id: uploadToast });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21]">
      {/* Title Header */}
      <header className="h-[100px] bg-[#008069] flex items-end px-6 pb-4 text-white gap-4 flex-shrink-0 shadow-md">
        <button onClick={onClose} className="text-white text-xl hover:scale-110 transition-transform">
          <LuArrowLeft />
        </button>
        <span className="font-semibold text-lg tracking-wide">Status</span>
      </header>

      {/* Stories Listing */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5 bg-panel">
        
        {/* My Status Container with upload button */}
        <div className="flex items-center justify-between bg-header border border-primary p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={state.user?.profile || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s"}
                alt="My profile"
                className="w-12 h-12 rounded-full object-cover border border-[#222d34]"
              />
              <button 
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-[#00a884] text-white font-bold rounded-full flex items-center justify-center text-xs border-2 border-panel shadow hover:scale-110 active:scale-95 transition"
                title="Add status update"
              >
                <LuPlus className="text-[10px] stroke-[3px]" />
              </button>
            </div>
            <div>
              <h4 className="text-sm font-semibold">My Status</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Click + to upload a story</p>
            </div>
          </div>
          
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleStatusUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        <h3 className="text-xs font-bold uppercase tracking-wider text-[#00a884] pl-1 pt-2">Recent Updates</h3>

        <div className="space-y-1">
          {userStories.length === 0 ? (
            <div className="py-12 text-center text-zinc-450 text-xs font-light leading-relaxed">
              No status updates within last 24 hours.<br />Be the first to share one!
            </div>
          ) : (
            userStories.map((us) => {
              const lastStory = us.stories[us.stories.length - 1];
              return (
                <div 
                  key={us.userId}
                  onClick={() => handleOpenViewer(us)}
                  className="flex items-center gap-4 p-3 hover:bg-[#202c33]/50 rounded-lg cursor-pointer transition-colors duration-150 border-b border-primary/20"
                >
                  <div className="status-ring flex-shrink-0">
                    <img 
                      src={us.profile || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s"} 
                      alt={us.userName} 
                      className="w-11 h-11 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{us.userName}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5 truncate">
                      {moment(lastStory.time).fromNow()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Full-Screen Stories Viewer Modal */}
      {activeStoryList && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
            
            {/* Top Stories Progress bar */}
            <div className="absolute top-3 left-4 right-4 flex gap-1 z-30">
              {activeStoryList.stories.map((s, idx) => (
                <div key={s.id} className="story-progress-bg">
                  <div 
                    className="story-progress-bar"
                    style={{ 
                      width: idx === activeStoryIndex 
                        ? `${progress}%` 
                        : idx < activeStoryIndex 
                          ? '100%' 
                          : '0%' 
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Story Viewer Header */}
            <div className="absolute top-6 left-4 right-4 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 to-transparent p-2 rounded-t-lg">
              <div className="flex items-center gap-3">
                <img 
                  src={activeStoryList.profile || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s"} 
                  alt={activeStoryList.userName} 
                  className="w-10 h-10 rounded-full border-2 border-accent object-cover"
                />
                <div>
                  <h3 className="text-sm font-semibold text-white">{activeStoryList.userName}</h3>
                  <span className="text-[10px] text-zinc-300">
                    {moment(activeStoryList.stories[activeStoryIndex].time).calendar()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-white text-lg">
                <button onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <LuPause /> : <LuPlay />}
                </button>
                <button onClick={() => setActiveStoryList(null)}>
                  <LuX />
                </button>
              </div>
            </div>

            {/* Tap Gestures for Next / Prev */}
            <div className="absolute inset-x-0 top-16 bottom-20 z-10 flex">
              <div onClick={handlePrev} className="w-1/3 h-full cursor-w-resize" />
              <div onClick={() => setIsPlaying(!isPlaying)} className="w-1/3 h-full" />
              <div onClick={handleNext} className="w-1/3 h-full cursor-e-resize" />
            </div>

            {/* Story Image Panel */}
            <div className="flex-1 flex items-center justify-center bg-black select-none">
              <img 
                src={activeStoryList.stories[activeStoryIndex].url} 
                alt="Story content" 
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Story Caption */}
            {activeStoryList.stories[activeStoryIndex].caption && (
              <div className="absolute bottom-20 inset-x-0 text-center px-6 py-4 bg-gradient-to-t from-black/90 to-transparent z-20">
                <p className="text-sm font-light text-white tracking-wide leading-relaxed">
                  {activeStoryList.stories[activeStoryIndex].caption}
                </p>
              </div>
            )}

            {/* Reply Composer Bar */}
            <form 
              onSubmit={handleSendReply}
              className="h-[70px] bg-zinc-900 border-t border-zinc-800 flex items-center px-4 gap-3 z-30"
            >
              <input 
                type="text" 
                placeholder="Reply to status..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => setIsPlaying(false)}
                onBlur={() => setIsPlaying(true)}
                className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-full px-5 py-2.5 outline-none text-xs placeholder-zinc-400"
              />
              <button 
                type="submit"
                className="w-10 h-10 rounded-full bg-accent hover:scale-105 active:scale-95 flex items-center justify-center text-white transition-all shadow-md"
              >
                <LuSend className="text-sm" />
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
