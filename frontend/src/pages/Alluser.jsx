import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../Api';
import { GlobalContext } from '../context/Context';
import io from 'socket.io-client';
import moment from 'moment';
import { toast } from 'react-hot-toast';
import {
  LuMessageSquare,
  LuPhone,
  LuCircleDot,
  LuSettings,
  LuSun,
  LuMoon,
  LuLogOut,
  LuSearch,
  LuArrowLeft,
  LuCamera,
  LuPen,
  LuCheck,
  LuLock,
  LuVolume2,
  LuShieldAlert,
  LuCircleHelp,
  LuListFilter
} from 'react-icons/lu';
import CallLogsTab from './CallLogsTab';
import StatusStories from './StatusStories';

const Alluser = () => {
  const [allUser, setAllUser] = useState([]);
  const { state, dispatch } = useContext(GlobalContext);
  const [SearchUser, setSearchUser] = useState('');
  const [activeTab, setActiveTab] = useState('chats'); // 'chats', 'calls', 'status'
  const [filterPill, setFilterPill] = useState('all'); // 'all', 'unread', 'groups'
  const { id: activeChatId } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'dark');

  // Drawers sliding states
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  
  // Settings detail settings
  const [editBio, setEditBio] = useState(false);
  const [bioText, setBioText] = useState(state.user.bio || 'Available');
  const [editName, setEditName] = useState(false);
  const [firstNameText, setFirstNameText] = useState(state.user.firstName || '');
  const [lastNameText, setLastNameText] = useState(state.user.lastName || '');

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const [userStatuses, setUserStatuses] = useState({});
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    if (!state?.user?.user_id) return;

    const socket = io('http://localhost:5004', {
      query: { userId: state.user.user_id }
    });

    socket.on('connect', () => {
      console.log('Alluser socket connected');
      socket.emit('register', state.user.user_id);
    });

    socket.on('initial-statuses', (statuses) => {
      setUserStatuses(statuses);
    });

    socket.on('status-update', ({ userId, status, lastSeen }) => {
      setUserStatuses((prev) => ({
        ...prev,
        [userId]: { status, lastSeen }
      }));
    });

    socket.on('typing-status', ({ from, isTyping }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [from]: isTyping
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [state?.user?.user_id]);

  const fetchalluser = async () => {
    try {
      const res = await api.get('/api/v1/allusers');
      setAllUser(res.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchalluser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/api/v1/logout');
      dispatch({ type: "USER_LOGOUT", user: {} });
      toast.success("Logged out successfully");
      navigate('/login');
    } catch (error) {
      console.log("logout error", error);
      toast.error("Logout failed");
    }
  };

  // Upload Profile Avatar directly from Drawer
  const handleUploadPic = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    const uploadToast = toast.loading("Uploading picture...");
    try {
      const res = await api.put(`/api/v1/profile-pic/${state.user.user_id || state.user._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          withCredentials: true
        }
      });
      dispatch({ type: 'USER_LOGIN', user: { ...state.user, profile: res.data.profileUrl || res.data.profile } });
      toast.success("Profile Avatar Uploaded", { id: uploadToast });
    } catch (error) {
      console.log(error.response?.data || error.message);
      toast.error("Avatar Upload Failed", { id: uploadToast });
    }
  };

  // Save profile updates from drawer in real time
  const handleSaveProfileDetails = async () => {
    try {
      await api.put(`/api/v1/updateprofile/${state.user.user_id || state.user._id}`, {
        firstName: firstNameText,
        lastName: lastNameText,
        email: state.user.email,
        phoneNumber: state.user.phoneNumber,
        Bio: bioText
      });
      dispatch({
        type: 'USER_LOGIN',
        user: { ...state.user, firstName: firstNameText, lastName: lastNameText, bio: bioText }
      });
      toast.success("Profile saved");
      setEditBio(false);
      setEditName(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update details");
    }
  };

  // Filters logic
  const filteredUser = allUser.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(SearchUser.toLowerCase());
    
    if (!matchesSearch) return false;

    const userStatus = userStatuses[u._id];
    const isOnline = userStatus?.status === 'online';

    if (filterPill === 'unread') {
      // Mock unread filters online users for demonstration
      return isOnline;
    }
    if (filterPill === 'groups') {
      // Mock groups filter returns nothing since it's a mock tile
      return false;
    }

    return true;
  });

  return (
    <div className="w-full md:w-[420px] h-screen bg-[#111b21] border-r border-[#222d34] flex flex-row font-sans relative z-10 select-none overflow-hidden shadow-2xl">
      
      {/* ==========================================================================
         FAR-LEFT VERTICAL NAVIGATION TOOLBAR (DOCK)
         ========================================================================== */}
      <div className="w-[64px] h-full bg-[#202c33] border-r border-[#222d34]/60 flex flex-col items-center py-5 justify-between flex-shrink-0 z-20">
        
        {/* Profile and Main Navigation Icons */}
        <div className="flex flex-col items-center gap-6 w-full">
          <button 
            onClick={() => { setShowProfileDrawer(true); setShowSettingsDrawer(false); }}
            className="hover:scale-105 transition-transform"
            title="Profile details"
          >
            <img 
              src={state.user.profile || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s"} 
              className="w-10 h-10 rounded-full object-cover border border-[#222d34] shadow-md hover:brightness-90 transition" 
              alt="profile" 
            />
          </button>

          <div className="w-8 h-[1px] bg-[#222d34] my-1"></div>

          {/* Chats Tab */}
          <button 
            onClick={() => { setActiveTab('chats'); setShowSettingsDrawer(false); }}
            className={`p-3 rounded-xl transition-all relative flex items-center justify-center ${
              activeTab === 'chats' && !showSettingsDrawer
                ? 'bg-[#2a3942] text-[#00a884] shadow-inner'
                : 'text-[#8696a0] hover:text-white hover:bg-[#202c33]'
            }`}
            title="Chats"
          >
            <LuMessageSquare className="text-xl" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#00a884] rounded-full"></span>
          </button>

          {/* Calls Tab */}
          <button 
            onClick={() => { setActiveTab('calls'); setShowSettingsDrawer(false); }}
            className={`p-3 rounded-xl transition-all relative ${
              activeTab === 'calls' && !showSettingsDrawer
                ? 'bg-[#2a3942] text-[#00a884] shadow-inner'
                : 'text-[#8696a0] hover:text-white hover:bg-[#202c33]'
            }`}
            title="Calls"
          >
            <LuPhone className="text-xl" />
          </button>

          {/* Status Tab */}
          <button 
            onClick={() => { setActiveTab('status'); setShowSettingsDrawer(false); }}
            className={`p-3 rounded-xl transition-all ${
              activeTab === 'status' && !showSettingsDrawer
                ? 'bg-[#2a3942] text-[#00a884] shadow-inner'
                : 'text-[#8696a0] hover:text-white hover:bg-[#202c33]'
            }`}
            title="Status updates"
          >
            <LuCircleDot className="text-xl" />
          </button>

          {/* Settings Tab */}
          <button 
            onClick={() => setShowSettingsDrawer(true)}
            className={`p-3 rounded-xl transition-all ${
              showSettingsDrawer
                ? 'bg-[#2a3942] text-[#00a884] shadow-inner'
                : 'text-[#8696a0] hover:text-white hover:bg-[#202c33]'
            }`}
            title="Settings"
          >
            <LuSettings className="text-xl" />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-5 w-full">
          {/* Theme switcher */}
          <button 
            onClick={toggleTheme} 
            className="p-3 rounded-xl text-[#8696a0] hover:text-white hover:bg-[#202c33] transition-all" 
            title="Switch Theme"
          >
            {theme === 'dark' ? <LuSun className="text-xl text-yellow-400" /> : <LuMoon className="text-xl text-blue-400" />}
          </button>

          {/* Logout */}
          <button 
            onClick={handleLogout} 
            className="p-3 rounded-xl text-[#8696a0] hover:text-red-400 hover:bg-[#202c33] transition-all" 
            title="Sign Out"
          >
            <LuLogOut className="text-xl" />
          </button>
        </div>
      </div>

      {/* ==========================================================================
         MAIN SIDEBAR CONTENT PANE
         ========================================================================== */}
      <div className="flex-1 h-full flex flex-col min-w-0 bg-[#111b21] relative z-10">
        
        {/* Dynamic Header */}
        {activeTab === 'chats' && (
          <>
            <header className="h-[60px] bg-[#202c33] px-6 flex items-center justify-between flex-shrink-0 border-b border-[#222d34]/20 shadow-sm">
              <h2 className="text-lg font-bold text-[#e9edef] tracking-wide">Chats</h2>
              <div className="text-[#8696a0] flex items-center gap-1.5 text-xs font-mono bg-[#111b21] px-2.5 py-1 rounded-full border border-primary/20">
                <span className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-ping"></span>
                E2EE Secure
              </div>
            </header>

            {/* Search Input and Filter Pills */}
            <div className="bg-[#111b21] px-4 py-2.5 flex flex-col gap-2.5 flex-shrink-0 border-b border-[#222d34]/20">
              <div className="w-full bg-[#202c33] border border-[#222d34]/40 rounded-xl px-4 py-2 flex items-center gap-3 focus-within:border-[#00a884] transition shadow-sm">
                <LuSearch className="text-[#8696a0] text-base flex-shrink-0" />
                <input
                  type="text"
                  value={SearchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Search or start a new chat"
                  className="w-full bg-transparent text-xs text-[#e9edef] outline-none placeholder-[#8696a0] h-[22px]"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 text-xs">
                <button 
                  onClick={() => setFilterPill('all')}
                  className={`px-3 py-1 rounded-full border transition-all font-medium ${
                    filterPill === 'all' 
                      ? 'bg-[#00a884] text-[#111b21] border-[#00a884] shadow' 
                      : 'bg-[#202c33] text-[#8696a0] border-transparent hover:bg-[#2a3942] hover:text-white'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilterPill('unread')}
                  className={`px-3 py-1 rounded-full border transition-all font-medium ${
                    filterPill === 'unread' 
                      ? 'bg-[#00a884] text-[#111b21] border-[#00a884] shadow' 
                      : 'bg-[#202c33] text-[#8696a0] border-transparent hover:bg-[#2a3942] hover:text-white'
                  }`}
                >
                  Online
                </button>
                <button 
                  onClick={() => setFilterPill('groups')}
                  className={`px-3 py-1 rounded-full border transition-all font-medium ${
                    filterPill === 'groups' 
                      ? 'bg-[#00a884] text-[#111b21] border-[#00a884] shadow' 
                      : 'bg-[#202c33] text-[#8696a0] border-transparent hover:bg-[#2a3942] hover:text-white'
                  }`}
                >
                  Groups
                </button>
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#111b21]">
              
              {/* Mock Group Chat tile if Groups pill is selected or All is selected */}
              {(filterPill === 'groups' || filterPill === 'all') && (
                <div className="flex items-center gap-3.5 px-4 py-3.5 border-b border-[#222d34]/30 hover:bg-[#202c33]/40 transition duration-150 cursor-pointer">
                  <div className="relative flex-shrink-0 w-12 h-12 bg-emerald-700/20 text-[#00a884] rounded-full flex items-center justify-center font-bold text-sm border border-[#00a884]/20 shadow-inner">
                    DS
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#e9edef] truncate">Design System Guild</p>
                      <span className="text-[10px] text-[#00a884] font-semibold">Mock Group</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[#8696a0] text-xs truncate max-w-[200px]">Principal UI: Redesigned vertical dock & drawers...</p>
                      <span className="bg-[#00a884] text-[#111b21] font-bold text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0">3</span>
                    </div>
                  </div>
                </div>
              )}

              {filteredUser.length === 0 ? (
                <div className="h-64 flex flex-col justify-center items-center text-center p-6 opacity-45">
                  <LuMessageSquare className="text-4xl text-zinc-400 mb-2.5" />
                  <p className="text-sm text-[#e9edef] font-light">No active chats found</p>
                </div>
              ) : (
                filteredUser.map((u) => {
                  const isMe = state.user.user_id === u._id;
                  const isActive = activeChatId === u._id;
                  
                  const isTyping = typingUsers[u._id];
                  const userStatus = userStatuses[u._id];
                  const isOnline = userStatus?.status === 'online';
                  
                  return (
                    <Link
                      key={u._id}
                      to={`/chat/${u._id}`}
                      className={`flex items-center gap-3.5 px-4 py-3.5 border-b border-[#222d34]/20 transition-all ${
                        isActive
                          ? 'bg-[#2a3942] border-l-4 border-[#00a884]'
                          : 'hover:bg-[#202c33]/50'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={u.profile || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s'}
                          alt="avatar"
                          className="w-11 h-11 rounded-full object-cover shadow"
                        />
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00a884] border-2 border-[#111b21] rounded-full"></span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-[#e9edef] truncate">
                            {u.firstName} {u.lastName}
                          </p>
                          <span className="text-[10px] text-[#8696a0] font-light">
                            {userStatus?.lastSeen ? moment(userStatus.lastSeen).format('LT') : '12:34'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-[#8696a0] text-xs truncate max-w-[200px] font-light">
                            {isMe ? (
                              'Saved messages'
                            ) : isTyping ? (
                              <span className="text-[#00a884] font-medium animate-pulse">typing...</span>
                            ) : isOnline ? (
                              <span className="text-[#00a884] font-medium">Online</span>
                            ) : userStatus?.lastSeen ? (
                              `last seen ${moment(userStatus.lastSeen).calendar().toLowerCase()}`
                            ) : (
                              u.bio || 'Offline'
                            )}
                          </p>
                          
                          {isMe ? (
                            <span className="text-[9px] text-[#00a884] border border-[#00a884]/30 px-1 rounded flex-shrink-0">
                              You
                            </span>
                          ) : (
                            <span className="w-2 h-2 bg-[#00a884] rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </>
        )}

        {activeTab === 'calls' && (
          <div className="flex-1 h-full overflow-hidden">
            <CallLogsTab />
          </div>
        )}

        {activeTab === 'status' && (
          <div className="flex-1 h-full overflow-hidden">
            <StatusStories onClose={() => setActiveTab('chats')} allUsers={allUser} />
          </div>
        )}

        {/* ==========================================================================
           SLIDE-IN PROFILE DRAWER
           ========================================================================== */}
        {showProfileDrawer && (
          <div className="absolute inset-0 bg-[#111b21] z-30 drawer-slide-in flex flex-col">
            <header className="h-[100px] bg-[#008069] flex items-end px-6 pb-4 text-white gap-4 flex-shrink-0 shadow-md">
              <button 
                onClick={() => setShowProfileDrawer(false)}
                className="text-white text-xl hover:scale-110 transition-transform"
              >
                <LuArrowLeft />
              </button>
              <span className="font-semibold text-lg tracking-wide">Profile</span>
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-[#0b141a]">
              {/* Profile Pic Upload */}
              <div className="flex flex-col items-center justify-center gap-4 py-4">
                <div className="relative group cursor-pointer w-36 h-36 rounded-full overflow-hidden border-2 border-[#222d34] shadow-lg">
                  <img 
                    src={state.user.profile || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s"} 
                    alt="profile avatar"
                    className="w-full h-full object-cover group-hover:brightness-50 transition duration-300"
                  />
                  <label htmlFor="drawer-pic" className="absolute inset-0 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-300 bg-black/40 text-center p-2 cursor-pointer">
                    <LuCamera className="text-2xl mb-1" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Change photo</span>
                    <input 
                      id="drawer-pic"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadPic}
                    />
                  </label>
                </div>
              </div>

              {/* Detail Forms */}
              <div className="bg-[#111b21] rounded-2xl border border-[#222d34]/60 p-5 space-y-4 shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-[#00a884] uppercase tracking-wider block mb-1">Your Name</span>
                  {editName ? (
                    <div className="flex gap-2 mt-1">
                      <input 
                        type="text" 
                        value={firstNameText}
                        onChange={(e) => setFirstNameText(e.target.value)}
                        placeholder="First name"
                        className="bg-[#202c33] border border-[#222d34] text-white text-xs rounded px-3 py-1.5 flex-1 outline-none focus:border-[#00a884]"
                      />
                      <input 
                        type="text" 
                        value={lastNameText}
                        onChange={(e) => setLastNameText(e.target.value)}
                        placeholder="Last name"
                        className="bg-[#202c33] border border-[#222d34] text-white text-xs rounded px-3 py-1.5 flex-1 outline-none focus:border-[#00a884]"
                      />
                      <button 
                        onClick={handleSaveProfileDetails}
                        className="p-2 bg-[#00a884] text-[#111b21] rounded hover:opacity-90 active:scale-95 transition"
                      >
                        <LuCheck />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm font-semibold">{state.user.firstName} {state.user.lastName}</span>
                      <button 
                        onClick={() => { setFirstNameText(state.user.firstName); setLastNameText(state.user.lastName); setEditName(true); }}
                        className="text-[#8696a0] hover:text-[#00a884] transition"
                      >
                        <LuPen className="text-sm" />
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">This is not your username or pin. This name will be visible to your WhatsApp contacts.</p>
                </div>
              </div>

              <div className="bg-[#111b21] rounded-2xl border border-[#222d34]/60 p-5 space-y-4 shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-[#00a884] uppercase tracking-wider block mb-1">About (Bio)</span>
                  {editBio ? (
                    <div className="flex gap-2 mt-1">
                      <input 
                        type="text" 
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                        placeholder="Write a bio"
                        className="bg-[#202c33] border border-[#222d34] text-white text-xs rounded px-3 py-1.5 flex-1 outline-none focus:border-[#00a884]"
                      />
                      <button 
                        onClick={handleSaveProfileDetails}
                        className="p-2 bg-[#00a884] text-[#111b21] rounded hover:opacity-90 active:scale-95 transition"
                      >
                        <LuCheck />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-zinc-200">{state.user.bio || 'Available'}</span>
                      <button 
                        onClick={() => { setBioText(state.user.bio || 'Available'); setEditBio(true); }}
                        className="text-[#8696a0] hover:text-[#00a884] transition"
                      >
                        <LuPen className="text-sm" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#111b21] rounded-2xl border border-[#222d34]/60 p-5 space-y-4 shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block mb-0.5">Email address</span>
                  <span className="text-xs font-mono text-zinc-300">{state.user.email}</span>
                </div>
                {state.user.phoneNumber && (
                  <div>
                    <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block mb-0.5">Phone Number</span>
                    <span className="text-xs font-mono text-zinc-300">{state.user.phoneNumber}</span>
                  </div>
                )}
              </div>
            </main>
          </div>
        )}

        {/* ==========================================================================
           SLIDE-IN SETTINGS DRAWER
           ========================================================================== */}
        {showSettingsDrawer && (
          <div className="absolute inset-0 bg-[#111b21] z-30 drawer-slide-in flex flex-col">
            <header className="h-[100px] bg-[#008069] flex items-end px-6 pb-4 text-white gap-4 flex-shrink-0 shadow-md">
              <button 
                onClick={() => setShowSettingsDrawer(false)}
                className="text-white text-xl hover:scale-110 transition-transform"
              >
                <LuArrowLeft />
              </button>
              <span className="font-semibold text-lg tracking-wide">Settings</span>
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 bg-[#0b141a]">
              
              {/* Short User summary */}
              <div 
                onClick={() => { setShowProfileDrawer(true); setShowSettingsDrawer(false); }}
                className="flex items-center gap-4 bg-[#111b21] border border-[#222d34]/65 p-4 rounded-xl shadow-sm hover:bg-[#202c33] transition cursor-pointer"
              >
                <img 
                  src={state.user.profile || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s"} 
                  className="w-12 h-12 rounded-full object-cover border border-primary shadow" 
                  alt="avatar" 
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate">{state.user.firstName} {state.user.lastName}</h4>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{state.user.bio || 'Available'}</p>
                </div>
              </div>

              {/* Settings Card list */}
              <div className="bg-[#111b21] rounded-2xl border border-[#222d34]/60 overflow-hidden divide-y divide-[#222d34]/40 shadow-sm">
                
                <div className="p-4 flex items-center gap-3.5 hover:bg-[#202c33] transition cursor-pointer">
                  <LuLock className="text-lg text-emerald-500" />
                  <div className="flex-1">
                    <h5 className="text-xs font-semibold">Privacy Settings</h5>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Toggle Last Seen status, Profile picture exposure</p>
                  </div>
                </div>

                <div className="p-4 flex items-center gap-3.5 hover:bg-[#202c33] transition cursor-pointer">
                  <LuVolume2 className="text-lg text-blue-500" />
                  <div className="flex-1">
                    <h5 className="text-xs font-semibold">Notification Sound</h5>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Manage audio pings for new incoming messages</p>
                  </div>
                </div>

                <div className="p-4 flex items-center gap-3.5 hover:bg-[#202c33] transition cursor-pointer">
                  <LuShieldAlert className="text-lg text-red-500" />
                  <div className="flex-1">
                    <h5 className="text-xs font-semibold">Security & Keys</h5>
                    <p className="text-[10px] text-zinc-400 mt-0.5">View your cryptographical chat signatures</p>
                  </div>
                </div>

                <div className="p-4 flex items-center gap-3.5 hover:bg-[#202c33] transition cursor-pointer">
                  <LuCircleHelp className="text-lg text-amber-500" />
                  <div className="flex-1">
                    <h5 className="text-xs font-semibold">Help & About</h5>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Client version v1.2.0, connection status: online</p>
                  </div>
                </div>

              </div>

              {/* Encryption Banner */}
              <div className="p-4 rounded-2xl border border-dashed border-[#00a884]/30 bg-[#00a884]/5 text-center">
                <LuLock className="text-[#00a884] mx-auto text-xl mb-2" />
                <h5 className="text-[11px] font-semibold text-[#00a884] tracking-wide uppercase">End-to-End Encrypted</h5>
                <p className="text-[10px] text-zinc-400 mt-1 max-w-[240px] mx-auto leading-relaxed">Your personal chats are secured. Antigravity core seals all data logs.</p>
              </div>

            </main>
          </div>
        )}

      </div>
      
    </div>
  );
};

export default Alluser;