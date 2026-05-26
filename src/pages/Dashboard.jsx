import { useState, useContext, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Users, Mail, Laptop, Cpu, AlertCircle, ArrowUpRight, Activity, Zap, ShieldCheck, PlusCircle, Clock, CheckCircle, ClipboardList, Database } from 'lucide-react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Custom Animated Counter Component
const AnimatedCounter = ({ from = 0, to }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime;
    const duration = 1500; // 1.5 seconds

    const updateCounter = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function (easeOutQuart)
      const easeOut = 1 - Math.pow(1 - percentage, 4);
      setCount(Math.floor(from + (to - from) * easeOut));

      if (progress < duration) {
        requestAnimationFrame(updateCounter);
      } else {
        setCount(to);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [from, to]);

  return <span>{count}</span>;
};

// Colors for Recharts
const PIE_COLORS = ['#22d3ee', '#818cf8', '#c084fc', '#f43f5e'];
const BAR_COLORS = ['#22d3ee', '#818cf8', '#c084fc', '#f43f5e'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <p className="text-slate-300 text-xs font-semibold mb-1">{payload[0].name || payload[0].payload.name}</p>
        <p className="text-cyan-400 font-bold text-lg">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Employee');
  const [isInviting, setIsInviting] = useState(false);
  const [assets, setAssets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live Time
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'Employee') {
          const meRes = await api.get('/users/me');
          setAssets(meRes.data.assets || []);
          setRequests(meRes.data.requests || []);
        } else {
          const [assetRes, reqRes] = await Promise.all([
            api.get('/assets'),
            api.get('/requests')
          ]);
          setAssets(assetRes.data || []);
          setRequests(reqRes.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const myAssets = useMemo(() => {
    if (user.role === 'Employee') return assets;
    return assets.filter(a => a.assignedTo?._id === user._id || a.assignedTo === user._id);
  }, [assets, user._id, user.role]);
  
  // Stats for Admin
  const totalAssets = assets.length;
  const hardwareCount = assets.filter(a => a.type === 'Non-Consumable').length;
  const consumableCount = assets.filter(a => a.type === 'Consumable').length;
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const lowStock = assets.filter(a => a.type === 'Consumable' && a.quantity < a.threshold);

  const pieData = [
    { name: 'Available', value: assets.filter(a => a.type === 'Non-Consumable' && a.status === 'Available').length || 1 }, // Fallback to 1 for demo if 0
    { name: 'Allocated', value: assets.filter(a => a.type === 'Non-Consumable' && a.status === 'Allocated').length },
    { name: 'Maintenance', value: assets.filter(a => a.type === 'Non-Consumable' && a.status === 'Maintenance').length },
  ].filter(d => d.value > 0);

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      await api.post('/auth/invite', { email: inviteEmail, role: inviteRole });
      toast.success('Invitation link generated successfully', {
        style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
      });
      setInviteEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invite', {
        style: { background: '#1e293b', color: '#fff', border: '1px solid #ef4444' }
      });
    } finally {
      setIsInviting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };
  
  const itemVariants = { 
    hidden: { opacity: 0, y: 20, scale: 0.95 }, 
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } } 
  };

  if (loading) return (
    <div className="min-h-screen bg-[#030014] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-end mb-8">
          <div className="w-64 h-10 bg-white/5 rounded-lg animate-pulse border border-white/10"></div>
          <div className="w-48 h-10 bg-white/5 rounded-lg animate-pulse border border-white/10"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1,2,3,4].map(n => (
            <div key={n} className="bg-white/5 border border-white/10 rounded-3xl p-6 h-32 animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 h-96 animate-pulse"></div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-96 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
  
  const myPendingReqs = requests.filter(r => r.status === 'Pending').length;
  const myFulfilledReqs = requests.filter(r => ['Approved', 'Returned', 'Pending Return'].includes(r.status)).length;
  const topRecentReqs = requests.slice(0, 3);

  let returnBehavior = { label: "No Returns", color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/30" };
  const returned = requests.filter(r => r.status === 'Returned');
  if (returned.length > 0) {
    let lateCount = 0;
    returned.forEach(r => {
      if (r.expectedReturnDate && new Date(r.returnDate) > new Date(r.expectedReturnDate)) {
        lateCount++;
      }
    });
    if (lateCount === 0) {
      returnBehavior = { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" };
    } else if (lateCount <= returned.length / 2) {
      returnBehavior = { label: "Average", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" };
    } else {
      returnBehavior = { label: "Poor", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" };
    }
  } else if (requests.length > 0) {
    returnBehavior = { label: "Active", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30" };
  }

  return (
    <div className="min-h-screen bg-[#030014] text-slate-200 p-4 sm:p-6 lg:p-8 selection:bg-cyan-500/30 overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-30 pointer-events-none" />

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Header Module */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-cyan-400" size={28} />
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 tracking-tight">
                Command Center
              </h1>
            </div>
            <p className="text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
              Welcome back, <strong className="text-white">{user?.name}</strong>. System is fully operational.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md flex items-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <Activity size={16} className="text-cyan-400" />
              <span className="text-sm font-mono text-cyan-100">{time}</span>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl backdrop-blur-md flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-300">Access Level:</span>
              <span className="text-sm font-bold text-white">{user?.role}</span>
            </div>
          </div>
        </motion.div>

        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <>
            {/* Bento Grid: Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: 'Total Assets', val: totalAssets, icon: <Laptop />, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-500/30', shadow: 'shadow-[0_0_15px_rgba(34,211,238,0.15)]' },
                { label: 'Hardware Units', val: hardwareCount, icon: <Cpu />, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-500/30', shadow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]' },
                { label: 'Pending Requests', val: pendingRequests, icon: <AlertCircle />, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-500/30', shadow: 'shadow-[0_0_15px_rgba(251,191,36,0.15)]' },
                { label: 'Critical Stock', val: lowStock.length, icon: <Zap />, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-500/30', shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]' },
              ].map((stat, i) => (
                <motion.div variants={itemVariants} key={i} className={`relative overflow-hidden bg-white/5 backdrop-blur-xl p-6 rounded-3xl border ${stat.border} ${stat.shadow} group hover:bg-white/10 transition-colors duration-300`}>
                  {/* Glow effect on hover */}
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500"></div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{stat.label}</p>
                      <h3 className="text-4xl font-black text-white font-mono tracking-tight">
                        <AnimatedCounter to={stat.val} />
                      </h3>
                    </div>
                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} border border-white/5`}>
                      {stat.icon}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bento Grid: Charts & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Allocation Chart */}
              <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                  <Activity size={18} className="text-cyan-400" />
                  Hardware Allocation Status
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pieData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Secure Invite Terminal */}
              <motion.div variants={itemVariants} className="bg-gradient-to-b from-[#0f172a] to-[#020617] border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.1)] flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-[50px] pointer-events-none"></div>
                
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-500/30">
                      <Users size={20} className="text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Secure Onboarding</h3>
                  </div>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    Generate encrypted access links for new personnel. Links are logged in the system registry.
                  </p>
                  
                  <form onSubmit={handleInvite} className="space-y-4 mt-auto">
                    <div className="group">
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Identity (Email)</label>
                      <input
                        type="email"
                        required
                        placeholder="operator@system.com"
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Clearance Level</label>
                      <select
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                      >
                        <option value="Employee" className="bg-slate-900 text-white">Employee (Standard)</option>
                        {user?.role === 'Admin' && <option value="Manager" className="bg-slate-900 text-white">Manager (Elevated)</option>}
                      </select>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(99, 102, 241, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isInviting}
                      className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-50 relative overflow-hidden group/btn"
                    >
                      <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                      <span className="relative z-10 flex items-center gap-2">
                        {isInviting ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Mail size={16} /> Transmit Invite
                          </>
                        )}
                      </span>
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            </div>
          </>
        )}

        {/* Employee Specific View (or Manager's personal view) */}
        {(user?.role === 'Employee' || user?.role === 'Manager') && (
          <div className="space-y-6 mt-6">
            
            {/* Employee Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: 'My Hardware', val: myAssets.length, icon: <Laptop />, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-500/30' },
                { label: 'Pending Requisitions', val: myPendingReqs, icon: <AlertCircle />, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-500/30' },
                { label: 'Fulfilled Requests', val: myFulfilledReqs, icon: <CheckCircle />, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/30' },
              ].map((stat, i) => (
                <motion.div variants={itemVariants} key={i} className={`relative overflow-hidden bg-white/5 backdrop-blur-xl p-6 rounded-3xl border ${stat.border} group hover:bg-white/10 transition-colors duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{stat.label}</p>
                      <h3 className="text-4xl font-black text-white font-mono tracking-tight">
                        <AnimatedCounter to={stat.val} />
                      </h3>
                    </div>
                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} border border-white/5`}>
                      {stat.icon}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <motion.div variants={itemVariants} className={`relative overflow-hidden bg-white/5 backdrop-blur-xl p-6 rounded-3xl border ${returnBehavior.border} group hover:bg-white/10 transition-colors duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Return Score</p>
                    <span className={`inline-block mt-2 px-3 py-1 font-black text-[10px] uppercase tracking-widest rounded border ${returnBehavior.bg} ${returnBehavior.color} ${returnBehavior.border}`}>
                      {returnBehavior.label}
                    </span>
                  </div>
                  <div className={`p-3 rounded-2xl bg-white/5 text-slate-400 border border-white/5`}>
                    <Activity />
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Quick Actions */}
              <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#0f172a] to-[#020617] border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.1)] flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-500/30">
                      <Zap size={20} className="text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Quick Actions</h3>
                  </div>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    Need new hardware or software? Submit a new requisition request directly to the Admin queue.
                  </p>
                </div>
                <Link to="/employee/requests">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(34, 211, 238, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white py-4 rounded-xl text-sm font-bold shadow-lg transition-all relative overflow-hidden group/btn"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                    <span className="relative z-10 flex items-center gap-2">
                      <PlusCircle size={18} /> Request New Asset
                    </span>
                  </motion.button>
                </Link>
              </motion.div>

              {/* Recent Requisitions */}
              <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <ClipboardList size={18} className="text-purple-400" />
                    Recent Requisitions
                  </h3>
                  <Link to="/employee/requests" className="text-xs font-bold text-purple-400 hover:text-purple-300 uppercase tracking-widest transition-colors flex items-center gap-1">
                    View All <ArrowUpRight size={12} />
                  </Link>
                </div>
                
                {topRecentReqs.length > 0 ? (
                  <div className="space-y-3">
                    {topRecentReqs.map(req => (
                      <div key={req._id} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5 hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="font-bold text-slate-200">{req.assetName}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest">{new Date(req.requestDate).toLocaleDateString('en-GB')}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-black rounded border shadow-inner ${
                          req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          req.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                          req.status === 'Pending Return' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                          req.status === 'Returned' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl bg-black/20">
                    <p className="text-slate-500 text-sm font-mono">No recent activity detected.</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* My Assigned Hardware */}
            <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl mt-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Laptop className="text-slate-300" size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">My Assigned Hardware</h3>
              </div>
              
              {myAssets.length === 0 ? (
                <div className="text-center py-16 px-4 border border-dashed border-white/10 rounded-2xl bg-black/20">
                  <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Laptop className="h-8 w-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-300">No Hardware Detected</h3>
                  <p className="text-slate-500 mt-2 text-sm max-w-sm mx-auto">You do not currently have any registered hardware assets assigned to your biometric identity.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {myAssets.map(asset => (
                    <motion.div 
                      whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(34,211,238,0.2)" }}
                      key={asset._id} 
                      className="group relative overflow-hidden bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 transition-all duration-300"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-bl-full -z-10 blur-xl transition-transform duration-500 group-hover:scale-150"></div>
                      
                      <div className="flex justify-between items-start mb-6">
                        <div className="bg-cyan-500/20 p-3 rounded-xl border border-cyan-500/30 text-cyan-400">
                          <Laptop size={24} />
                        </div>
                        <span className="text-[10px] font-mono border border-green-500/30 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                          {asset.status}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-xl text-white mb-2">{asset.name}</h4>
                      
                      <div className="space-y-3 mt-6 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Serial Number</span>
                          <span className="font-mono text-cyan-100 bg-black/40 px-2 py-1 rounded border border-white/5">{asset.serialNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Condition</span>
                          <span className="text-slate-300">{asset.condition}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default Dashboard;
