import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Mail, Lock, CheckCircle, Activity, MonitorSmartphone, ClipboardList, ShieldAlert, Save, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';
import gsap from 'gsap';

export default function UserProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const backgroundRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.to(".blob1", { y: "random(-100, 100)", x: "random(-100, 100)", duration: 12, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".blob2", { y: "random(-150, 150)", x: "random(-100, 100)", duration: 15, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, backgroundRef);
    return () => ctx.revert();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setProfileData(res.data);
      setFormData({
        name: res.data.user.name,
        email: res.data.user.email,
        password: '' // Don't fetch password
      });
    } catch (err) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: formData.name, email: formData.email };
      if (formData.password) {
        payload.password = formData.password;
      }
      const res = await api.put('/users/me', payload);
      toast.success('Profile updated successfully');
      setProfileData({ ...profileData, user: { ...profileData.user, name: res.data.name, email: res.data.email }});
      setIsEditing(false);
      setFormData({ ...formData, password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] p-8 flex items-center justify-center relative overflow-hidden">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!profileData || !profileData.user) {
    return (
      <div className="min-h-screen bg-[#030014] p-8 flex items-center justify-center text-rose-500 font-mono">
        Failed to load profile data.
      </div>
    );
  }

  const { user, assets, requests } = profileData;
  const roleColor = 
    user.role === 'Admin' ? 'rose' :
    user.role === 'Manager' ? 'cyan' : 'indigo';

  const totalReqs = requests.length;
  const fulfilledReqs = requests.filter(r => ['Approved', 'Pending Return', 'Returned'].includes(r.status)).length;
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
      returnBehavior = { label: "Excellent (Always on Time)", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" };
    } else if (lateCount <= returned.length / 2) {
      returnBehavior = { label: "Average (Occasional Delays)", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" };
    } else {
      returnBehavior = { label: "Poor (Frequently Late)", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" };
    }
  } else if (totalReqs > 0) {
    returnBehavior = { label: "Active (Holding Assets)", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30" };
  }

  const totalPages = Math.max(1, Math.ceil(requests.length / itemsPerPage));
  const paginatedRequests = requests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div ref={backgroundRef} className="min-h-screen bg-[#030014] text-slate-200 p-4 sm:p-6 lg:p-8 selection:bg-cyan-500/30 overflow-hidden relative">
      <div className={`blob1 absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] pointer-events-none ${
        roleColor === 'rose' ? 'bg-rose-900/20' : roleColor === 'cyan' ? 'bg-cyan-900/20' : 'bg-indigo-900/20'
      }`} />
      <div className={`blob2 absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] pointer-events-none ${
        roleColor === 'rose' ? 'bg-orange-900/10' : roleColor === 'cyan' ? 'bg-blue-900/10' : 'bg-purple-900/10'
      }`} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 tracking-tight">
            Personal Profile
          </h1>
          <p className="text-slate-400 mt-2">Manage your personal information and track your asset footprint.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Identity & Editing */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-24 opacity-80 ${
                roleColor === 'rose' ? 'bg-gradient-to-b from-rose-500/20 to-transparent' : 
                roleColor === 'cyan' ? 'bg-gradient-to-b from-cyan-500/20 to-transparent' : 
                'bg-gradient-to-b from-indigo-500/20 to-transparent'
              }`} />
              
              {!isEditing ? (
                <>
                  <div className="relative mt-8 text-center mb-8 group">
                    <div className="w-28 h-28 mx-auto bg-black/40 rounded-full p-2 mb-4 border border-white/10">
                      <div className={`w-full h-full rounded-full flex items-center justify-center text-white text-4xl font-black shadow-inner border border-white/20 ${
                        roleColor === 'rose' ? 'bg-gradient-to-br from-rose-500 to-orange-600' : 
                        roleColor === 'cyan' ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 
                        'bg-gradient-to-br from-indigo-500 to-purple-600'
                      }`}>
                        {user.name.charAt(0)}
                      </div>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">{user.name}</h2>
                    <p className={`text-xs font-bold uppercase tracking-widest mt-2 ${
                      roleColor === 'rose' ? 'text-rose-400' : 
                      roleColor === 'cyan' ? 'text-cyan-400' : 'text-indigo-400'
                    }`}>{user.role}</p>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="mt-6 px-5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest border border-white/10 transition-colors w-full"
                    >
                      Edit Profile
                    </button>
                  </div>
                  
                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Mail size={12}/> Comms ID</p>
                      <p className="text-slate-300 font-mono text-sm truncate">{user.email}</p>
                    </div>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdate} className="relative mt-8 text-left z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Update Details</h2>
                    <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5">
                      <X size={16}/>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block">Full Name</label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 flex items-center gap-2">
                        Email Address <span className="text-[8px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20">Immutable</span>
                      </label>
                      <div className="relative opacity-70 cursor-not-allowed">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="email" 
                          value={formData.email}
                          disabled
                          className="w-full bg-black/40 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-400 focus:outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block">New Password (Optional)</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="password" 
                          placeholder="Leave blank to keep current"
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={saving}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold border border-white/10 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50"
                  >
                    {saving ? 'Updating...' : <><Save size={16}/> Save Changes</>}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Behavioral Analytics Block */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
              
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Activity size={16} />
                </div>
                My Analytics
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2"><ClipboardList size={12}/> Total Requisitions</span>
                  <span className="text-slate-200 font-mono text-sm">{totalReqs}</span>
                </div>
                
                <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2"><CheckCircle size={12}/> Fulfilled Assets</span>
                  <span className="text-emerald-400 font-mono text-sm">{fulfilledReqs}</span>
                </div>
                
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2 mb-1"><Clock size={12}/> Return Score</span>
                  <span className={`inline-block px-3 py-1 font-black text-[10px] uppercase tracking-widest rounded border ${returnBehavior.bg} ${returnBehavior.color} ${returnBehavior.border}`}>
                    {returnBehavior.label}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Assets and Requests */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* My Assets */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
              
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <MonitorSmartphone size={20} />
                </div>
                My Allocated Hardware
                <span className="ml-auto text-[10px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded shadow-inner">{assets.length}</span>
              </h3>
              
              {assets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assets.map((asset) => (
                    <div key={asset._id} className="block bg-black/40 rounded-2xl p-5 border border-white/5">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-slate-200">{asset.name}</h4>
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/10 rounded text-slate-400">
                          {asset.type}
                        </span>
                      </div>
                      {asset.type === 'Non-Consumable' && (
                        <p className="text-xs text-slate-500 font-mono mb-3 bg-white/5 w-fit px-2 py-1 rounded">SN: <span className="text-slate-300">{asset.serialNumber}</span></p>
                      )}
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                        <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${asset.condition === 'Good' || asset.condition === 'New' ? 'bg-emerald-500 text-emerald-500' : 'bg-amber-500 text-amber-500'}`} />
                        <span className="text-slate-400">{asset.condition}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-black/20">
                  <p className="text-slate-500 font-mono text-sm">No hardware currently allocated to you.</p>
                </div>
              )}
            </motion.div>

            {/* My Request History */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
              
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <ClipboardList size={20} />
                </div>
                My Requisitions
              </h3>

              {requests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/10 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                        <th className="p-4 rounded-tl-lg">Target Spec</th>
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right rounded-tr-lg">Processing Node</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {paginatedRequests.map((req) => (
                        <tr key={req._id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="p-4">
                            <p className="font-bold text-slate-300">{req.assetName}</p>
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">{req.assetType || 'Unknown Class'}</p>
                          </td>
                          <td className="p-4 text-xs font-mono text-slate-400">
                            {new Date(req.requestDate).toLocaleDateString('en-GB')}
                          </td>
                          <td className="p-4">
                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border shadow-inner ${
                              req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' :
                              req.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]' :
                              req.status === 'Pending Return' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]' :
                              req.status === 'Returned' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' :
                              'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="p-4 text-right text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                            {req.assignedAssetId && (
                              <span className="block mb-1 text-slate-400">SN: {req.assignedAssetId.serialNumber}</span>
                            )}
                            {req.approvedBy && (
                              <span>Auth: <span className="text-slate-300">{req.approvedBy.name}</span></span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-black/20">
                  <p className="text-slate-500 font-mono text-sm">No requisitions logged by you yet.</p>
                </div>
              )}

              {!loading && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 p-4 bg-black/20 border border-white/10 rounded-2xl gap-4">
                  <span className="text-xs text-slate-400 font-mono">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, requests.length)} of {requests.length} logs
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-white/5"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold text-purple-400 px-3 bg-purple-500/10 border border-purple-500/20 py-1 rounded-lg">
                      {currentPage} / {totalPages}
                    </span>
                    <button 
                      disabled={currentPage === totalPages} 
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-white/5"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
