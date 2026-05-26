import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Users, ShieldCheck, UserCheck, Database, Mail, MonitorSmartphone, Search, Filter, ChevronDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import gsap from 'gsap';

export default function EmployeeMatrix() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  let processedEmployees = employees;

  if (roleFilter !== 'All') {
    processedEmployees = processedEmployees.filter(emp => (emp.role || 'Employee') === roleFilter);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    processedEmployees = processedEmployees.filter(emp => 
      emp.name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.id?.toLowerCase().includes(q)
    );
  }

  const totalPages = Math.max(1, Math.ceil(processedEmployees.length / itemsPerPage));
  const paginatedEmployees = processedEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

        {/* Search & Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by name, email, or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
            </div>
            
            <div className="relative w-full sm:w-auto z-20">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full appearance-none pl-10 pr-8 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all cursor-pointer"
              >
                <option value="All" className="bg-slate-900">All Roles</option>
                <option value="Admin" className="bg-slate-900">Level 3: Admin</option>
                <option value="Manager" className="bg-slate-900">Level 2: Manager</option>
                <option value="Employee" className="bg-slate-900">Level 1: Employee</option>
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-t-rose-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : processedEmployees.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <Inbox className="mx-auto h-12 w-12 text-slate-600 mb-4 opacity-50" />
            <p className="font-mono text-sm text-slate-500">No personnel records found matching your criteria.</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {paginatedEmployees.map((emp, idx) => {
                const roleGroup = emp.role || 'Employee';
                return (
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
                            emp.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                          }`}>
                            {emp.status}
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
                );
              })}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl gap-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <span className="text-xs text-slate-400 font-mono">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, processedEmployees.length)} of {processedEmployees.length} personnel
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-white/5"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-bold text-rose-400 px-3 bg-rose-500/10 border border-rose-500/20 py-1 rounded-lg">
                    {currentPage} / {totalPages}
                  </span>
                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-white/5"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
