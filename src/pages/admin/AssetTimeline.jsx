import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Activity, History } from 'lucide-react';
import gsap from 'gsap';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } }
};

export default function AssetTimeline() {
  const { id } = useParams();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const backgroundRef = useRef(null);

  // GSAP Background Animation
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.to(".blob1", { y: "random(-100, 100)", x: "random(-100, 100)", duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".blob2", { y: "random(-150, 150)", x: "random(-100, 100)", duration: 14, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, backgroundRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get(`/assets/${id}/audit-logs`);
        setAuditLogs(res.data);
      } catch (err) {
        toast.error('Failed to fetch audit logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [id]);

  return (
    <div ref={backgroundRef} className="min-h-screen bg-[#030014] text-slate-200 p-4 sm:p-6 lg:p-8 selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="blob1 absolute top-[10%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="blob2 absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        
        <div className="mb-10">
          <Link to="/admin/inventory" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center mb-6 transition-colors uppercase tracking-widest w-fit bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-md">
            <ArrowLeft size={14} className="mr-2" /> Abort to Inventory
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <History className="text-indigo-400" size={32} />
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 tracking-tight">
              Asset Audit Timeline
            </h1>
          </div>
          <p className="text-slate-400 mt-2">
            Chronological history for device Target ID: <span className="font-mono text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(99,102,241,0.2)]">{id}</span>
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : (
            <motion.div 
              className="relative pl-8 border-l-2 border-white/10 space-y-12"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {auditLogs.map((log, idx) => (
                <motion.div key={log._id} variants={itemVariants} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-[#030014] bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] group-hover:scale-125 transition-transform" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between bg-black/40 border border-white/5 p-6 rounded-2xl hover:bg-white/[0.02] transition-colors shadow-lg">
                    <div className="max-w-xl">
                      <h3 className="text-lg font-black text-white mb-2 flex items-center space-x-3">
                        <span>{log.action}</span>
                        <ActionBadge action={log.action} />
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed font-mono">{log.details}</p>
                      
                      <div className="mt-4 flex items-center space-x-3 bg-white/5 w-fit pr-4 rounded-full border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                          {log.performedBy?.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Executed by <span className="text-slate-200">{log.performedBy?.name || 'SYSTEM'}</span></span>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 text-left sm:text-right">
                      <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 font-mono">
                        <Activity size={12} className="text-indigo-400" />
                        {new Date(log.timestamp).toLocaleString('en-GB')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-slate-500 font-mono text-center py-10">No chronological logs detected.</div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionBadge({ action }) {
  let colorClass = 'bg-slate-500/10 text-slate-400 border-slate-500/30 shadow-[0_0_10px_rgba(100,116,139,0.2)]';
  
  if (action === 'Created') colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
  if (action === 'Allocated') colorClass = 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
  if (action === 'Returned') colorClass = 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
  if (action === 'ConditionUpdated') colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]';

  return (
    <span className={`text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md border ${colorClass}`}>
      {action}
    </span>
  );
}
