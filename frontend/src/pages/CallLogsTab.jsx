import React, { useState, useEffect, useContext } from 'react';
import { api } from '../Api';
import { GlobalContext } from '../context/Context';
import moment from 'moment';
import { 
  LuPhone, 
  LuVideo, 
  LuPhoneOff, 
  LuArrowDownLeft, 
  LuArrowUpRight,
  LuPhoneCall,
  LuTrash2
} from 'react-icons/lu';
import { toast } from 'react-hot-toast';

const CallLogsTab = () => {
  const { state } = useContext(GlobalContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/api/v1/calllogs');
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error("Failed to fetch call logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const clearAllLogs = async () => {
    try {
      await api.delete('/api/v1/calllogs'); // hypothetical endpoint or local state clear
      setLogs([]);
      toast.success("Call history cleared");
    } catch (e) {
      // Just clear locally if backend delete doesn't exist
      setLogs([]);
      toast.success("Call history cleared locally");
    }
  };

  const formatDuration = (sec) => {
    if (!sec) return "";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m > 0) {
      return `${m}m ${s}s`;
    }
    return `${s}s`;
  };

  const getCallStatusIcon = (log, currentUserId) => {
    const isOutgoing = log.caller?._id === currentUserId || log.caller === currentUserId;
    
    if (log.status === 'missed') {
      return (
        <span className="flex items-center gap-1 text-red-500 text-xs font-light">
          <LuArrowDownLeft className="text-sm text-red-500 stroke-[3px]" /> Missed
        </span>
      );
    } else if (log.status === 'rejected') {
      return (
        <span className="flex items-center gap-1 text-red-400 text-xs font-light">
          <LuPhoneOff className="text-xs text-red-400" /> Declined
        </span>
      );
    } else {
      return isOutgoing ? (
        <span className="flex items-center gap-1 text-[#00a884] text-xs font-light">
          <LuArrowUpRight className="text-sm text-[#00a884] stroke-[3px]" /> Outgoing
        </span>
      ) : (
        <span className="flex items-center gap-1 text-[#00a884] text-xs font-light">
          <LuArrowDownLeft className="text-sm text-[#00a884] stroke-[3px]" /> Incoming
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#111b21] h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00a884]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#111b21] border-r border-[#222d34]/60">
      <header className="h-[60px] flex items-center justify-between px-6 bg-[#202c33] text-white border-b border-[#222d34]/20 shadow-sm flex-shrink-0 select-none">
        <h2 className="text-lg font-bold tracking-wide">Call History</h2>
        {logs.length > 0 && (
          <button 
            onClick={clearAllLogs}
            className="text-zinc-400 hover:text-red-400 transition-colors p-1"
            title="Clear all logs"
          >
            <LuTrash2 className="text-lg" />
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-6 select-none opacity-40">
            <LuPhoneCall className="text-5xl mb-4 text-[#8696a0]" />
            <p className="text-sm font-semibold text-[#e9edef]">No calls recorded yet</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
              Any voice or video calls made in the conversation console will be logged here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#222d34]/40">
            {logs.map((log) => {
              const currentUserId = state?.user?.user_id;
              const isOutgoing = log.caller?._id === currentUserId || log.caller === currentUserId;
              const otherUser = isOutgoing ? log.receiver : log.caller;
              
              if (!otherUser) return null;

              return (
                <div 
                  key={log._id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-[#202c33]/40 transition duration-150 cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img 
                      src={otherUser.profile || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw3n-Kb2orGpTmaoHO7GOPX8_P-8-A6NO97Q&s'} 
                      alt="avatar" 
                      className="w-11 h-11 rounded-full object-cover border border-[#222d34] shadow-sm"
                    />
                    <div className="leading-tight min-w-0">
                      <h3 className="text-sm font-medium text-[#e9edef] truncate">
                        {otherUser.firstName} {otherUser.lastName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        {getCallStatusIcon(log, currentUserId)}
                        <span className="text-[10px] text-[#8696a0]">
                          • {moment(log.createdOn).calendar()}
                        </span>
                        {log.duration > 0 && (
                          <span className="text-[10px] text-zinc-400 font-mono">
                            ({formatDuration(log.duration)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-zinc-400 pl-2">
                    {log.type === 'video' ? (
                      <LuVideo className="text-lg text-zinc-400 group-hover:text-[#00a884] transition-colors" />
                    ) : (
                      <LuPhone className="text-base text-zinc-400 group-hover:text-[#00a884] transition-colors" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CallLogsTab;
