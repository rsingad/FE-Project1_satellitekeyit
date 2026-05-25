import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

export const AuthContext = createContext();
const ENDPOINT = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5000';
let socket;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [globalSocket, setGlobalSocket] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  // Global Socket Connection
  useEffect(() => {
    if (user) {
      socket = io(ENDPOINT);
      setGlobalSocket(socket);

      socket.emit('setup', user);

      socket.on('online_users', (usersList) => {
        setOnlineUsers(usersList);
      });

      socket.on('message_received', (newMessageReceived) => {
        // Show a global toast if not on the chat page, or even if on the chat page
        // If they are on chat page, Chat.jsx also listens to this or we handle it there.
        // Actually, let Chat.jsx handle appending to the chat window.
        // The context handles the toast notification!
        
        // Only show toast if the path is NOT /chat, OR if the message is from someone else than the currently selected user
        if (window.location.pathname !== '/chat') {
          toast.success('New Secure Message Received', {
            icon: '💬',
            style: { borderRadius: '10px', background: '#334155', color: '#fff', border: '1px solid #475569' }
          });
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Logged in successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser, socket: globalSocket, onlineUsers }}>
      {children}
    </AuthContext.Provider>
  );
};
