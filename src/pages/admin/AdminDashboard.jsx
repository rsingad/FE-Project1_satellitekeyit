import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Box, Check, AlertTriangle, UserPlus, Activity, Copy, X, Server, Database, ShieldAlert } from 'lucide-react';
import gsap from 'gsap';

export default function AdminDashboard() {
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [metricsData, setMetricsData] = useState({
    totalAssets: 0,
    totalFixedAssets: 0,
    totalConsumables: 0,
    lowStockAlerts: 0,
    overdueReturns: 0,
    conditionBreakdown: [],
    recentActivity: [],
    recentRequests: []
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const backgroundRef = useRef(null);
  const fetchCalled = useRef(false);

  // GSAP Background Animation
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.to(".blob1", { y: "random(-100, 100)", x: "random(-100, 100)", duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".blob2", { y: "random(-150, 150)", x: "random(-100, 100)", duration: 14, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".blob3", { scale: 1.2, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, backgroundRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (fetchCalled.current) return;
    fetchCalled.current = true;

    const fetchMetrics = async () => {
      try {
        const res = await api.get('/assets/metrics');
        setMetricsData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const metrics = [
    { title: 'Total Assets', value: metricsData.totalAssets || 0, change: 'Entire catalog', icon: Database, color: 'from-blue-500 to-cyan-500', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]', link: '/admin/inventory' },
    { title: 'Fixed Assets', value: metricsData.totalFixedAssets || 0, change: 'Non-consumable', icon: Server, color: 'from-indigo-500 to-purple-500', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.5)]', link: '/admin/inventory?tab=Fixed' },
    { title: 'Consumables', value: metricsData.totalConsumables || 0, change: 'Expendable items', icon: Box, color: 'from-emerald-400 to-teal-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]', link: '/admin/inventory?tab=Consumables' },
    { title: 'Low Stock Alerts', value: metricsData.lowStockAlerts || 0, change: 'Requires restock', icon: ShieldAlert, color: 'from-rose-500 to-pink-500', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.5)]', link: '/admin/inventory?tab=Consumables&filter=LowStock' },
  ];

  return (
    <div ref={backgroundRef} className="min-h-screen bg-[#030014] text-slate-200 p-4 sm:p-6 lg:p-8 selection:bg-cyan-500/30 overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="blob1 absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="blob2 absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />
      <div className="blob3 absolute top-[30%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-cyan-400" size={28} />
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 tracking-tight">
                Master Command
              </h1>
            </div>
            <p className="text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
              Operations overview and administrative control center.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(99,102,241,0.4)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setInviteModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold flex items-center space-x-2 border border-white/10 shadow-lg transition-all"
          >
            <UserPlus size={18} />
            <span>Generate Invite Token</span>
          </motion.button>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {isLoading ? (
            Array(4).fill(0).map((_, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 h-[150px] animate-pulse shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div className="w-24 h-4 bg-slate-700/50 rounded mb-3"></div>
                <div className="w-16 h-10 bg-slate-700/50 rounded mb-6"></div>
                <div className="border-t border-white/5 pt-4">
                  <div className="w-32 h-3 bg-slate-700/30 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            metrics.map((metric, idx) => (
              <Link to={metric.link} key={metric.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 relative overflow-hidden group h-full cursor-pointer shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${metric.color} opacity-10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500`} />
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">{metric.title}</p>
                      <h3 className="text-4xl font-black text-white tracking-tighter">{metric.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} text-white ${metric.glow}`}>
                      <metric.icon size={24} />
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 relative z-10">
                    <span className="text-xs font-mono text-slate-500">{metric.change}</span>
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Recent Activity Feed */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 min-h-[400px] shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Activity className="text-cyan-400" size={24}/> Audit Trail</h3>
            <div className="space-y-6">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-slate-700/50 shrink-0" />
                    <div className="w-full">
                      <div className="w-3/4 h-4 bg-slate-700/50 rounded mb-2" />
                      <div className="w-1/2 h-3 bg-slate-700/30 rounded" />
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {metricsData.recentActivity?.map(log => (
                    <div key={log._id} className="flex gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.2)] group-hover:scale-110 transition-transform">
                        {log.performedBy?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm text-slate-300 font-medium leading-relaxed">{log.details}</p>
                        <p className="text-xs text-slate-500 mt-1 font-mono">{new Date(log.timestamp).toLocaleString('en-GB')} • {log.performedBy?.name}</p>
                      </div>
                    </div>
                  ))}
                  {(!metricsData.recentActivity || metricsData.recentActivity.length === 0) && (
                    <p className="text-slate-500 text-sm font-mono text-center mt-10">No recent activity detected.</p>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* Condition Breakdown */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 min-h-[400px] shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            <h3 className="text-xl font-bold text-white mb-6">Health Diagnostics</h3>
            <div className="space-y-4">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl animate-pulse">
                    <div className="w-24 h-5 bg-slate-700/50 rounded"></div>
                    <div className="w-10 h-8 bg-slate-700/50 rounded-lg"></div>
                  </div>
                ))
              ) : (
                metricsData.conditionBreakdown?.map(cond => {
                  const condTab = ['Scrapped', 'Under Repair'].includes(cond._id) ? 'Repair' : 'Fixed';
                  return (
                    <Link to={`/admin/inventory?tab=${condTab}&condition=${encodeURIComponent(cond._id)}`} key={cond._id} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 hover:bg-white/5 transition-all rounded-xl cursor-pointer group">
                      <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{cond._id || 'Unknown'}</span>
                      <span className="text-lg font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg">{cond.count}</span>
                    </Link>
                  );
                })
              )}
              {(!metricsData.conditionBreakdown || metricsData.conditionBreakdown.length === 0) && (
                <p className="text-slate-500 text-sm font-mono text-center mt-10">No diagnostic data available.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Requests */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden mb-10">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
          <h3 className="text-xl font-bold text-white mb-6">Recent Workspace Requests</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/10 text-slate-500 text-xs uppercase tracking-widest font-bold">
                  <th className="p-4 font-mono">Employee</th>
                  <th className="p-4 font-mono">Asset Target</th>
                  <th className="p-4 font-mono">Status</th>
                  <th className="p-4 font-mono">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {metricsData.recentRequests?.map(req => (
                  <tr key={req._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-slate-200">{req.requester?.name || 'Unknown'}</td>
                    <td className="p-4 text-slate-400">{req.assetName}</td>
                    <td className="p-4">
                      <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border ${
                        req.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 
                        req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                        'bg-slate-500/10 text-slate-400 border-slate-500/30'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500 font-mono">{new Date(req.requestDate).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
                {(!metricsData.recentRequests || metricsData.recentRequests.length === 0) && (
                  <tr><td colSpan="4" className="p-10 text-center text-slate-500 font-mono">No recent requests in queue.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Invite User Modal */}
      <InviteModal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} />
    </div>
  );
}

function InviteModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Employee');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setInviteLink('');
    try {
      const res = await api.post('/auth/invite', { email, role });
      setInviteLink(res.data.registrationLink);
      toast.success('Access Token Generated', {
        style: { borderRadius: '12px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed', {
        style: { borderRadius: '12px', background: '#7f1d1d', color: '#fff', border: '1px solid #dc2626' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative w-full max-w-md bg-gradient-to-b from-[#0f172a] to-[#020617] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 overflow-hidden border border-indigo-500/30"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="bg-indigo-500/20 p-3 rounded-2xl text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <UserPlus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Generate Token</h2>
                <p className="text-sm text-slate-400 font-medium">Create a secure 24-hour onboarding link</p>
              </div>
            </div>

            {!inviteLink ? (
              <form onSubmit={handleInvite} className="space-y-5">
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Email Target</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                    placeholder="agent@company.com"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Clearance Level</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono appearance-none"
                  >
                    <option value="Employee" className="bg-slate-900">Standard Employee</option>
                    <option value="Manager" className="bg-slate-900">Manager</option>
                    <option value="Admin" className="bg-slate-900">Administrator</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3.5 px-4 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-50 relative overflow-hidden group/btn"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? 'Processing...' : 'Init Link'}
                    </span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <Check size={24} />
                  </div>
                  <h3 className="font-bold text-white mb-1">Token Generated</h3>
                  <p className="text-xs text-emerald-400 mb-6 font-mono">Valid for exactly 24.00 hours</p>

                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={inviteLink}
                      className="w-full px-4 py-3 pr-12 text-sm bg-black/40 border border-emerald-500/30 rounded-xl text-emerald-100 outline-none font-mono"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(inviteLink);
                        toast.success('Copied to clipboard', {
                          style: { borderRadius: '12px', background: '#064e3b', color: '#fff', border: '1px solid #059669' }
                        });
                      }}
                      className="absolute right-2 top-2 p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 rounded-lg transition-colors border border-emerald-500/30"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 rounded-xl transition-colors"
                >
                  Close Window
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
