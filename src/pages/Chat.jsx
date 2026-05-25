import React, { useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Send, Search, UserCircle, MessageSquare, ArrowLeft, Phone, Video, MoreVertical, Check, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function Chat() {
  const { user, socket, onlineUsers } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (newMessageReceived) => {
      setMessages((prev) => [...prev, newMessageReceived]);
      // If we are looking at the chat, do not show global toast from context? 
      // Context already checks window.location.pathname !== '/chat'.
    };

    socket.on('message_received', messageHandler);

    return () => {
      socket.off('message_received', messageHandler);
    };
  }, [socket]);

  // Fetch Users List
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/chat/users');
        setUsers(data);
      } catch (error) {
        toast.error('Failed to load contacts');
      }
    };
    if (user) fetchUsers();
  }, [user]);

  // Fetch Messages for Selected User
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      try {
        const { data } = await api.get(`/chat/${selectedUser._id}`);
        setMessages(data);
        socket.emit('join_chat', selectedUser._id); // optional typing room
      } catch (error) {
        toast.error('Failed to load chat history');
      }
    };
    fetchMessages();
  }, [selectedUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    
    const messageContent = newMessage;
    setNewMessage(''); // optimistic clear
    
    const newMsgObj = {
      sender: user._id,
      receiver: selectedUser._id,
      content: messageContent,
      createdAt: new Date().toISOString()
    };
    
    // Optimistic UI update
    setMessages([...messages, newMsgObj]);

    // Emit through socket
    socket.emit('new_message', newMsgObj);
  };

  const filteredUsers = users.filter(u => u?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  // Filter messages to only show those between current user and selected user
  const displayMessages = messages.filter(m => 
    (m.sender === user?._id && m.receiver === selectedUser?._id) ||
    (m.sender === selectedUser?._id && m.receiver === user?._id)
  );

  return (
    <div className="flex h-screen bg-[#030014] overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-600/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-30" />
      </div>

      {/* Main Layout */}
      <div className="flex w-full h-full relative z-10 max-w-[1600px] mx-auto sm:p-4">
        <div className="flex w-full h-full bg-white/[0.03] sm:border border-white/10 sm:rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Sidebar - Contacts */}
          <div className={`${selectedUser ? 'hidden sm:flex' : 'flex'} flex-col w-full sm:w-[350px] lg:w-[400px] border-r border-white/10 bg-black/40`}>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link to="/" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                  <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Secure Comms</h1>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                {user?.name?.charAt(0)}
              </div>
            </div>

            {/* Search */}
            <div className="p-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search personnel..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors font-mono"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {filteredUsers.map((u) => {
                const isOnline = onlineUsers.includes(u._id);
                const isSelected = selectedUser?._id === u._id;
                
                return (
                  <div 
                    key={u._id}
                    onClick={() => setSelectedUser(u)}
                    className={`flex items-center gap-4 p-4 cursor-pointer transition-colors border-l-2 ${isSelected ? 'bg-white/10 border-indigo-500' : 'border-transparent hover:bg-white/[0.05]'}`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-300 font-bold text-lg shadow-inner border border-white/5">
                        {u?.name ? u.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#030014] shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-200 truncate">{u?.name || 'Unknown'}</h3>
                      <div className="flex flex-col mt-0.5">
                        <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">{u?.role || 'User'}</p>
                        <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">{u?.email || 'No email'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="text-center p-8 text-slate-500 font-mono text-xs">No personnel found.</div>
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`${!selectedUser ? 'hidden sm:flex' : 'flex'} flex-col flex-1 bg-black/20 relative`}>
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="h-[72px] p-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md absolute top-0 w-full z-20">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedUser(null)} className="sm:hidden text-slate-400 p-2 -ml-2 rounded-lg hover:bg-white/10">
                      <ArrowLeft size={20} />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                      {selectedUser?.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-200">{selectedUser?.name || 'Unknown'}</h2>
                      <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        {onlineUsers.includes(selectedUser._id) ? (
                          <><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> Active Node</>
                        ) : (
                          <span className="text-slate-500">Offline</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <button className="p-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors"><Video size={20} /></button>
                    <button className="p-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors"><Phone size={20} /></button>
                    <button className="p-2 rounded-xl hover:bg-white/10 hover:text-white transition-colors"><MoreVertical size={20} /></button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-[90px] space-y-6 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed" style={{ backgroundSize: '150px' }}>
                  {displayMessages.map((msg, idx) => {
                    const isMe = msg.sender === user._id;
                    const time = msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : '';
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] sm:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-2.5 rounded-2xl shadow-lg relative ${
                            isMe 
                              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm border border-indigo-400/30' 
                              : 'bg-white/10 backdrop-blur-md text-slate-200 rounded-tl-sm border border-white/5'
                          }`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                          </div>
                          <div className="flex items-center gap-1 mt-1 px-1">
                            <span className="text-[10px] font-mono text-slate-500">{time}</span>
                            {isMe && <CheckCheck size={12} className="text-indigo-400" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 sm:p-6 bg-black/40 backdrop-blur-md border-t border-white/10">
                  <form onSubmit={sendMessage} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Transmit secure message..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-mono text-sm"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white disabled:opacity-50 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all shrink-0 group"
                    >
                      <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] mb-6">
                  <MessageSquare size={40} className="text-slate-400" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight mb-2">Secure Communications</h2>
                <p className="text-slate-400 max-w-sm">Select a contact from the matrix to initiate an end-to-end encrypted session.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
