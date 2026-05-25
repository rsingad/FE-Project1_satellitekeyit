import { useState, useEffect, useContext, useRef } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { PackageSearch, Laptop, Smartphone, Monitor, Plus, Send, X, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const TABS = ['My Assigned Hardware', 'Company Catalog'];

const Assets = () => {
  const { user } = useContext(AuthContext);
  const [allAssets, setAllAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const backgroundRef = useRef(null);
  
  // Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestAsset, setRequestAsset] = useState(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // GSAP Background Animation
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.to(".blob1", { y: "random(-100, 100)", x: "random(-100, 100)", duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".blob2", { y: "random(-150, 150)", x: "random(-100, 100)", duration: 12, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".blob3", { scale: 1.2, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, backgroundRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const { data } = await api.get('/assets');
      setAllAssets(data);
    } catch (error) {
      toast.error('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const openRequestModal = (asset) => {
    setRequestAsset(asset);
    setRequestQuantity(1);
    setExpectedReturnDate('');
    setIsRequestModalOpen(true);
  };

  const handleQuickRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/requests', {
        assetType: requestAsset.type,
        assetName: requestAsset.name,
        quantity: requestAsset.type === 'Consumable' ? requestQuantity : 1,
        requestedAssetId: requestAsset._id,
        expectedReturnDate: requestAsset.type === 'Non-Consumable' ? expectedReturnDate : null
      });
      toast.success(`${requestAsset.name} requested successfully! Check 'Requests' tab for status.`, {
        style: { borderRadius: '12px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }
      });
      setIsRequestModalOpen(false);
      setRequestAsset(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request', {
        style: { borderRadius: '12px', background: '#1e293b', color: '#fff', border: '1px solid #ef4444' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
  };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  const myAssets = allAssets.filter(a => a.assignedTo?._id === user._id);
  const catalogAssets = allAssets; 

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Allocated': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Maintenance': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Scrapped': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
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
              <PackageSearch className="text-cyan-400" size={28} />
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 tracking-tight">
                Asset Registry
              </h1>
            </div>
            <p className="text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
              Browse the catalog and manage your assigned equipment.
            </p>
          </div>
        </motion.div>

        {/* Custom Clean Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className="flex p-1 space-x-1 bg-white/5 backdrop-blur-md rounded-xl w-fit border border-white/10">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ease-out outline-none ${
                  activeTab === tab ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="active-tab-pill-dark"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-lg border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-l-cyan-400 border-b-purple-500 border-t-transparent border-r-transparent rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
            </div>
          </div>
        ) : activeTab === 'My Assigned Hardware' ? (
          myAssets.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center max-w-3xl mx-auto mt-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -z-10"></div>
              <div className="mx-auto w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.1)] mb-6">
                <Laptop className="h-10 w-10 text-cyan-400/50" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">No Hardware Detected</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
                You do not currently have any registered hardware assets assigned to your identity. Browse the Company Catalog to submit a requisition.
              </p>
            </motion.div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAssets.map(asset => (
                <motion.div 
                  variants={item}
                  key={asset._id} 
                  className="group relative overflow-hidden bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(34,211,238,0.2)] hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-bl-full -z-10 blur-xl transition-transform duration-500 group-hover:scale-150"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-cyan-500/20 p-3 rounded-xl border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                      <Laptop size={24} />
                    </div>
                    <span className={`text-[10px] border px-3 py-1.5 rounded-full font-bold uppercase tracking-widest ${getStatusColor(asset.status)} shadow-[0_0_10px_rgba(34,197,94,0.1)]`}>
                      {asset.status}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-xl text-white mb-1.5 tracking-tight">{asset.name}</h4>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">{asset.description || 'Standard company issue.'}</p>
                  
                  <div className="space-y-3 mt-6 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Serial Number</span>
                      <span className="font-mono text-cyan-100 bg-black/40 px-2 py-1 rounded border border-white/5">{asset.serialNumber}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Condition</span>
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${asset.condition === 'New' ? 'bg-emerald-500' : asset.condition === 'Good' ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                        {asset.condition}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogAssets.map(asset => (
              <motion.div 
                variants={item}
                key={asset._id} 
                className="group relative overflow-hidden bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.2)] hover:-translate-y-1 flex flex-col"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -z-10 blur-xl transition-transform duration-500 group-hover:scale-150"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md border ${asset.type === 'Consumable' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'}`}>
                    {asset.type}
                  </span>
                  {asset.type === 'Consumable' && (
                    <span className="text-xs font-semibold text-slate-400 bg-black/40 px-2 py-1 rounded-md border border-white/5">
                      Stock: <span className={asset.quantity > 0 ? "text-emerald-400" : "text-rose-400"}>{asset.quantity}</span>
                    </span>
                  )}
                </div>
                
                <h4 className="font-bold text-xl text-white mb-1.5 tracking-tight">{asset.name}</h4>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed flex-1">{asset.description || 'Standard company issue.'}</p>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openRequestModal(asset)}
                  disabled={asset.type === 'Consumable' && asset.quantity <= 0}
                  className="w-full mt-auto flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn relative overflow-hidden"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
                  <span className="relative z-10 flex items-center gap-2">
                    <Plus size={16} className="text-cyan-400" />
                    {asset.type === 'Consumable' && asset.quantity <= 0 ? 'Depleted' : 'Requisition'}
                  </span>
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Cyberpunk Request Modal */}
      <AnimatePresence>
        {isRequestModalOpen && requestAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="relative bg-gradient-to-b from-[#0f172a] to-[#020617] w-full max-w-lg rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border border-indigo-500/30"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-500"></div>
              
              <div className="p-6 sm:p-8 relative z-10">
                <button 
                  onClick={() => setIsRequestModalOpen(false)}
                  className="absolute top-6 right-6 p-2 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-indigo-500/20 p-3 rounded-2xl text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    {requestAsset.type === 'Consumable' ? <PackageSearch size={24} /> : <Laptop size={24} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Submit Requisition</h2>
                    <p className="text-sm text-slate-400 font-medium">Clearance required for <strong className="text-cyan-400">{requestAsset.name}</strong></p>
                  </div>
                </div>

                <form onSubmit={handleQuickRequest} className="space-y-5">
                  {requestAsset.type === 'Consumable' && (
                    <div className="group">
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Quantity Required</label>
                      <input
                        type="number"
                        min="1"
                        max={requestAsset.quantity}
                        required
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                        value={requestQuantity}
                        onChange={(e) => setRequestQuantity(e.target.value)}
                      />
                      <p className="text-xs text-slate-400 mt-2 font-medium flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-400" />
                        {requestAsset.quantity} units currently in network inventory
                      </p>
                    </div>
                  )}

                  {requestAsset.type === 'Non-Consumable' && (
                    <div className="group">
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Expected Return Date</label>
                      <input
                        type="date"
                        required
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono color-scheme-dark"
                        style={{ colorScheme: 'dark' }}
                        value={expectedReturnDate}
                        onChange={(e) => setExpectedReturnDate(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="pt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsRequestModalOpen(false)}
                      className="flex-1 py-3.5 px-4 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
                    >
                      Abort
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(6, 182, 212, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="flex-1 flex justify-center items-center gap-2 py-3.5 px-4 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-50 relative overflow-hidden group/submit"
                    >
                      <div className="absolute inset-0 -translate-x-full group-hover/submit:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                      <span className="relative z-10 flex items-center gap-2">
                        {submitting ? 'Transmitting...' : 'Authorize Request'}
                        {!submitting && <Send size={16} />}
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

export default Assets;
