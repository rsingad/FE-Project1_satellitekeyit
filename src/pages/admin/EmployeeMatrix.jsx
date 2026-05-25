import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Users, ShieldCheck, UserCheck, Database, Mail, MonitorSmartphone } from 'lucide-react';
import gsap from 'gsap';

export default function EmployeeMatrix() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const backgroundRef = useRef(null);

  // GSAP Background Animation
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.to(".blob1", { y: "random(-100, 100)", x: "random(-100, 100)", duration: 12, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".blob2", { y: "random(-150, 150)", x: "random(-100, 100)", duration: 16, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, backgroundRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const res = await api.get('/users/matrix');
        setEmployees(res.data);
      } catch (err) {
        toast.error('Failed to load personnel matrix');
      } finally {
        setLoading(false);
      }
    };
    fetchMatrix();
  }, []);

  return (
    <div ref={backgroundRef} className="min-h-screen bg-[#030014] text-slate-200 p-4 sm:p-6 lg:p-8 selection:bg-rose-500/30 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="blob1 absolute top-[20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-rose-900/10 blur-[120px] pointer-events-none" />
      <div className="blob2 absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-orange-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-rose-400" size={32} />
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 tracking-tight">
              Personnel Matrix
            </h1>
          </div>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]"></span>
            Complete roster of system entities and active asset allocations.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-t-rose-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          ['Admin', 'Manager', 'Employee'].map(roleGroup => {
            const roleUsers = employees.filter(emp => (emp.role || 'Employee').toLowerCase() === roleGroup.toLowerCase());
            
            if (roleUsers.length === 0) return null;

            return (
              <div key={roleGroup} className="mb-16">
                <h2 className="text-xl font-bold text-slate-300 mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                  {roleGroup === 'Admin' ? <ShieldCheck className="text-rose-500" size={24} /> : 
                   roleGroup === 'Manager' ? <UserCheck className="text-cyan-500" size={24} /> : 
                   <Users className="text-indigo-500" size={24} />}
                  <span className="uppercase tracking-widest">{roleGroup === 'Admin' ? 'Level 3: Administrators' : roleGroup === 'Manager' ? 'Level 2: Managers' : 'Level 1: Operatives'}</span>
                  <span className="text-[10px] font-bold bg-white/5 text-slate-400 border border-white/10 px-2 py-0.5 rounded-full ml-auto shadow-inner">{roleUsers.length}</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {roleUsers.map((emp, idx) => (
                    <Link to={`/admin/staff/${emp.id}`} key={emp.id}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.4, type: 'spring' }}
                        className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10 hover:border-white/20 transition-all hover:-translate-y-2 group flex flex-col h-full cursor-pointer relative overflow-hidden"
                      >
                        <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500 ${
                            roleGroup === 'Admin' ? 'bg-gradient-to-br from-rose-500 to-orange-500' :
                            roleGroup === 'Manager' ? 'bg-gradient-to-br from-cyan-500 to-blue-500' :
                            'bg-gradient-to-br from-indigo-500 to-purple-500'
                        }`} />
                        
                        {/* Header Section */}
                        <div className="flex items-start justify-between mb-8 relative z-10">
                          <div className="flex items-center space-x-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/20 ${
                              roleGroup === 'Admin' ? 'bg-gradient-to-br from-rose-500 to-orange-600' :
                              roleGroup === 'Manager' ? 'bg-gradient-to-br from-cyan-500 to-blue-600' :
                              'bg-gradient-to-br from-indigo-500 to-purple-600'
                            }`}>
                              {emp.name ? emp.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                              <h3 className="font-black text-xl text-white tracking-tight">{emp.name || 'Unknown'}</h3>
                              <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${
                                roleGroup === 'Admin' ? 'text-rose-400' :
                                roleGroup === 'Manager' ? 'text-cyan-400' :
                                'text-indigo-400'
                              }`}>{emp.role}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-[9px] uppercase tracking-widest font-black rounded border ${
                            emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {emp.status || 'Active'}
                          </span>
                        </div>

                        {/* Employee Meta Info */}
                        <div className="space-y-3 mb-8 relative z-10 bg-black/40 p-4 rounded-2xl border border-white/5">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 flex items-center gap-2 text-xs uppercase font-bold tracking-wider"><Database size={12}/> ID Node:</span>
                            <span className="font-mono text-slate-300 bg-white/5 px-2 py-1 rounded text-xs border border-white/10 shadow-inner">{emp.id ? emp.id.slice(-6).toUpperCase() : 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 flex items-center gap-2 text-xs uppercase font-bold tracking-wider"><Mail size={12}/> Comms:</span>
                            <span className="text-slate-300 truncate max-w-[140px] font-mono text-xs">{emp.email || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Asset Allocation Section */}
                        <div className="mt-auto relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <MonitorSmartphone size={12}/> Allocated Hardware
                            </span>
                            <span className={`flex items-center justify-center w-6 h-6 rounded-lg bg-white/5 text-white text-xs font-bold border border-white/10 shadow-inner ${
                              emp.assets && emp.assets.length > 0 ? (
                                roleGroup === 'Admin' ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' :
                                roleGroup === 'Manager' ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' :
                                'text-indigo-400 border-indigo-500/30 bg-indigo-500/10'
                              ) : ''
                            }`}>
                              {emp.assets ? emp.assets.length : 0}
                            </span>
                          </div>
                          
                          {emp.assets && emp.assets.length > 0 ? (
                            <ul className="space-y-2">
                              {emp.assets.map((asset, i) => (
                                <li key={i} className="flex items-center text-xs text-slate-300 bg-black/40 px-4 py-2.5 rounded-xl border border-white/5 group-hover:border-white/20 transition-colors font-mono">
                                  <div className={`w-2 h-2 rounded-full mr-3 shadow-[0_0_8px_currentColor] ${
                                    roleGroup === 'Admin' ? 'bg-rose-400 text-rose-400' :
                                    roleGroup === 'Manager' ? 'bg-cyan-400 text-cyan-400' :
                                    'bg-indigo-400 text-indigo-400'
                                  }`} />
                                  <span className="truncate">{asset.name}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="py-6 text-center border border-dashed border-white/10 rounded-2xl bg-black/20">
                              <span className="text-xs text-slate-500 font-mono">No operational hardware linked</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
