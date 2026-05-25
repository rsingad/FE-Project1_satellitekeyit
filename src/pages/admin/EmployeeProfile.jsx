import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, MonitorSmartphone, ClipboardList, ShieldAlert, Database, Mail } from 'lucide-react';
import gsap from 'gsap';

export default function EmployeeProfile() {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const backgroundRef = useRef(null);

  // GSAP Background Animation
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.to(".blob1", { y: "random(-100, 100)", x: "random(-100, 100)", duration: 12, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".blob2", { y: "random(-150, 150)", x: "random(-100, 100)", duration: 15, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, backgroundRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setProfileData(res.data);
      } catch (err) {
        toast.error('Failed to load entity data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

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
      <div className="min-h-screen bg-[#030014] p-8 flex items-center justify-center relative overflow-hidden">
        <div className="bg-rose-500/10 border border-rose-500/30 p-8 rounded-3xl text-rose-400 font-mono text-center max-w-md shadow-[0_0_30px_rgba(244,63,94,0.2)]">
          <ShieldAlert size={48} className="mx-auto mb-4 text-rose-500" />
          <p>ENTITY NOT FOUND</p>
          <p className="text-xs text-rose-500/70 mt-2">The requested personnel profile could not be located in the central database.</p>
          <Link to="/admin/staff" className="mt-6 inline-block bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white hover:bg-white/10 transition-colors">Return to Matrix</Link>
        </div>
      </div>
    );
  }

  const { user, assets, requests, auditLogs } = profileData;

  const roleColor = 
    user.role === 'Admin' ? 'rose' :
    user.role === 'Manager' ? 'cyan' : 'indigo';

  return (
    <div ref={backgroundRef} className="min-h-screen bg-[#030014] text-slate-200 p-4 sm:p-6 lg:p-8 selection:bg-cyan-500/30 overflow-hidden relative">
      {/* Background Ambience */}
      <div className={`blob1 absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] pointer-events-none ${
        roleColor === 'rose' ? 'bg-rose-900/20' : roleColor === 'cyan' ? 'bg-cyan-900/20' : 'bg-indigo-900/20'
      }`} />
      <div className={`blob2 absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] pointer-events-none ${
        roleColor === 'rose' ? 'bg-orange-900/10' : roleColor === 'cyan' ? 'bg-blue-900/10' : 'bg-purple-900/10'
      }`} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        
        <div className="mb-10 flex flex-col md:flex-row md:items-center gap-6">
          <Link to="/admin/staff" className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/10 shadow-lg group shrink-0">
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 tracking-tight">
              Entity Profile Matrix
            </h1>
            <p className="text-slate-400 mt-2 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_currentColor] ${
                roleColor === 'rose' ? 'bg-rose-500 text-rose-500' : 
                roleColor === 'cyan' ? 'bg-cyan-500 text-cyan-500' : 'bg-indigo-500 text-indigo-500'
              }`}></span>
              Detailed intelligence on assets, requests, and activity footprints.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: User Details */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-full h-24 opacity-80 ${
                roleColor === 'rose' ? 'bg-gradient-to-b from-rose-500/20 to-transparent' : 
                roleColor === 'cyan' ? 'bg-gradient-to-b from-cyan-500/20 to-transparent' : 
                'bg-gradient-to-b from-indigo-500/20 to-transparent'
              }`} />
              
              <div className="relative mt-8 text-center mb-8">
                <div className="w-28 h-28 mx-auto bg-black/40 rounded-full p-2 mb-4 border border-white/10 group-hover:scale-105 transition-transform duration-500">
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
              </div>
              
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Mail size={12}/> Comms ID</p>
                  <p className="text-slate-300 font-mono text-sm truncate">{user.email}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Database size={12}/> Database Node</p>
                  <p className="text-slate-400 font-mono text-xs break-all">{user._id}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Status</p>
                  <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 font-black text-[10px] uppercase tracking-widest rounded border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    Active
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Assets and Requests */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Currently Assigned Assets */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
              
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <MonitorSmartphone size={20} />
                </div>
                Allocated Hardware
                <span className="ml-auto text-[10px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded shadow-inner">{assets.length}</span>
              </h3>
              
              {assets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assets.map((asset) => (
                    <Link to={`/admin/inventory/${asset._id}`} key={asset._id} className="block bg-black/40 rounded-2xl p-5 border border-white/5 hover:border-cyan-500/50 hover:bg-white/[0.02] transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-slate-200 group-hover:text-white transition-colors">{asset.name}</h4>
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/10 rounded text-slate-400 group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-colors">
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
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-black/20">
                  <p className="text-slate-500 font-mono text-sm">No hardware currently linked to this entity.</p>
                </div>
              )}
            </motion.div>

            {/* Request History */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
              
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <ClipboardList size={20} />
                </div>
                Requisition History
              </h3>

              {requests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/10 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                        <th className="p-4 rounded-tl-lg">Target Spec</th>
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">Integrity Status</th>
                        <th className="p-4 text-right rounded-tr-lg">Processing Node</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {requests.map((req) => (
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
                  <p className="text-slate-500 font-mono text-sm">No requisitions logged by this entity.</p>
                </div>
              )}
            </motion.div>

            {/* Administrative Activity Log (Only for Admins/Managers) */}
            {(user.role === 'Admin' || user.role === 'Manager') && auditLogs && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
                
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                    <ShieldAlert size={20} />
                  </div>
                  System Executions
                </h3>
                
                {auditLogs.length > 0 ? (
                  <div className="space-y-4">
                    {auditLogs.map((log, idx) => (
                      <div key={log._id} className="flex gap-4 items-start p-5 bg-black/40 rounded-2xl border border-white/5 hover:border-white/20 transition-colors group">
                        <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-bold text-slate-200 text-sm">
                              {log.action}
                              {log.assetId && <span className="ml-2 text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded text-[10px] border border-indigo-500/30">[{log.assetId.name}]</span>}
                            </p>
                            <span className="text-[9px] font-mono font-bold text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/10 uppercase tracking-widest group-hover:text-slate-400 transition-colors">
                              {new Date(log.timestamp).toLocaleString('en-GB')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 font-mono">{log.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-black/20">
                    <p className="text-slate-500 font-mono text-sm">No operational executions recorded.</p>
                  </div>
                )}
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
