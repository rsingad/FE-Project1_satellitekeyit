import { useState, useEffect, useContext, useRef } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Send, Check, X, Undo2, Clock, Inbox, ChevronDown, CalendarClock, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const Requests = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableAssets, setAvailableAssets] = useState([]);
  const backgroundRef = useRef(null);

  const [newReq, setNewReq] = useState({
    assetType: 'Consumable',
    assetName: '',
    quantity: 1
  });

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
    fetchRequests();
    if (user?.role === 'Admin' || user?.role === 'Manager') {
      fetchAvailableAssets();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/requests');
      // sort by date descending
      setRequests(data.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate)));
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableAssets = async () => {
    try {
      const { data } = await api.get('/assets');
      setAvailableAssets(data.filter(a => a.type === 'Non-Consumable' && a.status === 'Available'));
    } catch (error) {
      console.error('Failed to fetch assets for dropdown');
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests', newReq);
      toast.success('Request submitted successfully', {
        style: { borderRadius: '12px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }
      });
      setIsModalOpen(false);
      setNewReq({ assetType: 'Consumable', assetName: '', quantity: 1 });
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleApprove = async (id, reqType, e) => {
    e.preventDefault();
    const payload = {};

    if (reqType === 'Non-Consumable') {
      const selectEl = e.target.elements.assetSelect;
      if (selectEl) {
        if (!selectEl.value) {
          return toast.error('Please select an asset ID to assign');
        }
        payload.assignedAssetId = selectEl.value;
      }
    }

    try {
      await api.put(`/requests/${id}/approve`, payload);
      toast.success('Clearance Granted', {
        style: { borderRadius: '12px', background: '#064e3b', color: '#fff', border: '1px solid #059669' }
      });
      fetchRequests();
      fetchAvailableAssets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/requests/${id}/reject`, {});
      toast.error('Request Denied', {
        style: { borderRadius: '12px', background: '#7f1d1d', color: '#fff', border: '1px solid #dc2626' }
      });
      fetchRequests();
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  const handleReturn = async (id) => {
    try {
      await api.post(`/requests/${id}/return`, {});
      toast.success('Return initiated. Pending admin confirmation.', {
        style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
      });
      fetchRequests();
    } catch (error) {
      toast.error('Failed to initiate return');
    }
  };

  const handleConfirmReturn = async (id) => {
    try {
      await api.put(`/requests/${id}/confirm-return`, {});
      toast.success('Return confirmed securely');
      fetchRequests();
      fetchAvailableAssets();
    } catch (error) {
      toast.error('Failed to confirm return');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Rejected': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Pending Return': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Returned': return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

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
              <Inbox className="text-cyan-400" size={28} />
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 tracking-tight">
                {user?.role === 'Admin' || user?.role === 'Manager' ? 'Authorization Logs' : 'My Requisitions'}
              </h1>
            </div>
            <p className="text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
              {user?.role === 'Employee' ? 'Track and manage your asset requests.' : 'Review and process clearance requests.'}
            </p>
          </div>
          
          {user?.role === 'Employee' && (
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(6, 182, 212, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg font-bold border border-white/10"
            >
              <Send size={18} />
              New Requisition
            </motion.button>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-l-cyan-400 border-b-purple-500 border-t-transparent border-r-transparent rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] relative"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/10 text-slate-400 text-xs uppercase tracking-widest font-bold">
                    <th className="p-5 font-mono">Timeline / Dates</th>
                    {user?.role !== 'Employee' && <th className="p-5 font-mono">Identity</th>}
                    <th className="p-5 font-mono">Asset Target</th>
                    <th className="p-5 font-mono">Type / Qty</th>
                    <th className="p-5 font-mono">Clearance Status</th>
                    <th className="p-5 text-right font-mono">Directives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-16 text-center text-slate-500">
                        <Inbox className="mx-auto h-12 w-12 text-slate-600 mb-4 opacity-50" />
                        <p className="font-mono text-sm">No authorization logs found in registry.</p>
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req._id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-5 whitespace-nowrap text-slate-300 text-xs font-mono space-y-1.5">
                          <div className="flex items-center gap-2" title="Requested On">
                            <Clock size={12} className="text-cyan-500/50" />
                            Req: {new Date(req.requestDate).toLocaleDateString('en-GB')}
                          </div>
                          {req.expectedReturnDate && (
                            <div className="flex items-center gap-2 text-slate-400" title="Expected Return">
                              <CalendarClock size={12} className="text-amber-500/50" />
                              Exp: {new Date(req.expectedReturnDate).toLocaleDateString('en-GB')}
                            </div>
                          )}
                          {req.assignedDate && (
                            <div className="flex items-center gap-1.5 text-emerald-400/80" title={`Assigned/Approved by ${req.approvedBy?.name || 'System'}`}>
                              <Check size={12} className="text-emerald-500/50 shrink-0" />
                              Alloc: {new Date(req.assignedDate).toLocaleDateString('en-GB')}
                              <span className="text-[9px] uppercase tracking-wider opacity-80 bg-emerald-500/20 px-1.5 py-0.5 rounded ml-1 truncate max-w-[80px] border border-emerald-500/20">
                                BY {req.approvedBy?.name?.split(' ')[0] || 'ADMIN'}
                              </span>
                            </div>
                          )}
                          {req.returnDate && (
                            <div className="flex items-center gap-1.5 text-blue-400/80" title={`Return confirmed by ${req.returnConfirmedBy?.name || 'System'}`}>
                              <Undo2 size={12} className="text-blue-500/50 shrink-0" />
                              Ret: {new Date(req.returnDate).toLocaleDateString('en-GB')}
                              <span className="text-[9px] uppercase tracking-wider opacity-80 bg-blue-500/20 px-1.5 py-0.5 rounded ml-1 truncate max-w-[80px] border border-blue-500/20">
                                BY {req.returnConfirmedBy?.name?.split(' ')[0] || 'ADMIN'}
                              </span>
                            </div>
                          )}
                        </td>
                        
                        {user?.role !== 'Employee' && (
                          <td className="p-5">
                            <div className="font-bold text-white text-sm">{req.user?.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{req.user?.email}</div>
                          </td>
                        )}
                        
                        <td className="p-5">
                          <div className="font-bold text-slate-200">{req.assetName}</div>
                          {req.assignedAssetId && (
                            <div className="text-xs text-cyan-400 font-mono mt-1 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded inline-block">
                              ID: {req.assignedAssetId.serialNumber || req.assignedAssetId}
                            </div>
                          )}
                        </td>
                        
                        <td className="p-5">
                          <span className="text-xs text-slate-300 font-mono bg-white/5 px-2 py-1 rounded border border-white/10">
                            {req.assetType}
                          </span>
                          <span className="ml-2 text-sm text-slate-400 font-bold">x{req.quantity}</span>
                        </td>
                        
                        <td className="p-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(req.status)} shadow-sm`}>
                            {req.status === 'Pending' && <Clock size={10} />}
                            {req.status === 'Approved' && <Check size={10} />}
                            {req.status === 'Rejected' && <X size={10} />}
                            {req.status}
                          </span>
                        </td>
                        
                        <td className="p-5 text-right space-x-2">
                          {(user?.role === 'Admin' || user?.role === 'Manager') && req.status === 'Pending' && (
                            <form onSubmit={(e) => handleApprove(req._id, req.assetType, e)} className="inline-flex items-center gap-2">
                              {/* Only show "Link Hardware" if the user didn't request a specific asset from the catalog */}
                              {req.assetType === 'Non-Consumable' && !req.requestedAssetId && (
                                <div className="relative w-32">
                                  <select 
                                    name="assetSelect" 
                                    required
                                    className="w-full appearance-none bg-black/40 border border-white/10 text-white text-xs px-2 py-1.5 rounded focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                                    defaultValue=""
                                  >
                                    <option value="" disabled>Link Hardware</option>
                                    {availableAssets.map(a => (
                                      <option key={a._id} value={a._id}>{a.serialNumber}</option>
                                    ))}
                                  </select>
                                  <ChevronDown size={12} className="absolute right-2 top-2 text-slate-500 pointer-events-none" />
                                </div>
                              )}
                              {/* If requestedAssetId exists, show a badge indicating which asset will be approved */}
                              {req.assetType === 'Non-Consumable' && req.requestedAssetId && (
                                <div className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20" title="Auto-linking specific requested asset">
                                  Pre-Linked
                                </div>
                              )}
                              
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="submit" className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500/20" title="Authorize">
                                <Check size={16} />
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="button" onClick={() => handleReject(req._id)} className="p-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded hover:bg-rose-500/20" title="Deny">
                                <X size={16} />
                              </motion.button>
                            </form>
                          )}

                          {user?.role === 'Admin' && req.status === 'Pending Return' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => handleConfirmReturn(req._id)}
                              className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold hover:bg-emerald-500/20 uppercase tracking-wider flex items-center gap-1 ml-auto"
                            >
                              <Check size={14} /> Verify Return
                            </motion.button>
                          )}

                          {user?.role === 'Employee' && req.status === 'Approved' && req.assetType === 'Non-Consumable' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => handleReturn(req._id)}
                              className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded text-xs font-bold hover:bg-blue-500/20 uppercase tracking-wider flex items-center gap-1 ml-auto"
                            >
                              <Undo2 size={14} /> Init Return
                            </motion.button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Cyberpunk New Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-gradient-to-b from-[#0f172a] to-[#020617] w-full max-w-md rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border border-cyan-500/30"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-500"></div>
              
              <div className="p-6 sm:p-8">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-6 right-6 p-2 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-cyan-500/20 p-3 rounded-2xl text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Manual Requisition</h2>
                    <p className="text-sm text-slate-400 font-medium">Submit raw request to system</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitRequest} className="space-y-5">
                  <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Asset Class</label>
                    <select
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono appearance-none"
                      value={newReq.assetType}
                      onChange={(e) => setNewReq({ ...newReq, assetType: e.target.value })}
                    >
                      <option value="Consumable" className="bg-slate-900">Consumable (Stock)</option>
                      <option value="Non-Consumable" className="bg-slate-900">Non-Consumable (Hardware)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Target Identifier</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ThinkPad T14 / Wireless Mouse"
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                      value={newReq.assetName}
                      onChange={(e) => setNewReq({ ...newReq, assetName: e.target.value })}
                    />
                  </div>
                  {newReq.assetType === 'Consumable' && (
                    <div>
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                        value={newReq.quantity}
                        onChange={(e) => setNewReq({ ...newReq, quantity: Number(e.target.value) })}
                      />
                    </div>
                  )}

                  <div className="pt-6">
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(6, 182, 212, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg transition-all relative overflow-hidden group/submit"
                    >
                      <div className="absolute inset-0 -translate-x-full group-hover/submit:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                      <span className="relative z-10 flex items-center gap-2">
                        Transmit Request <Send size={16} />
                      </span>
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Requests;
