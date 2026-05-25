import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Sparkles, Upload, Plus, Edit, Trash2, AlertTriangle, X, Check, Copy, PackageSearch } from 'lucide-react';
import gsap from 'gsap';

const TABS = ['Fixed Assets', 'Consumables', 'Repair & Disposed'];

export default function AssetInventory() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filterParam = searchParams.get('filter');
  const conditionParam = searchParams.get('condition');
  
  const initialTab = searchParams.get('tab') === 'Consumables' ? TABS[1] : 
                     searchParams.get('tab') === 'Repair' ? TABS[2] : TABS[0];

  const [activeTab, setActiveTab] = useState(initialTab);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAssetFormModalOpen, setIsAssetFormModalOpen] = useState(false);
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isSmartImportModalOpen, setIsSmartImportModalOpen] = useState(false);
  const backgroundRef = useRef(null);

  // GSAP Background Animation
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.to(".blob1", { y: "random(-100, 100)", x: "random(-100, 100)", duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".blob2", { y: "random(-150, 150)", x: "random(-100, 100)", duration: 14, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".blob3", { scale: 1.2, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, backgroundRef);
    return () => ctx.revert();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data);
    } catch (err) {
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam === 'Consumables') setActiveTab(TABS[1]);
    else if (tabParam === 'Repair') setActiveTab(TABS[2]);
    else if (tabParam === 'Fixed') setActiveTab(TABS[0]);
  }, [location.search]);

  const handleDelete = async (id, status) => {
    if (status === 'Allocated') {
      return toast.error('Cannot delete an allocated asset. Please have it returned first.', {
        style: { borderRadius: '12px', background: '#7f1d1d', color: '#fff', border: '1px solid #dc2626' }
      });
    }
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await api.delete(`/assets/${id}`);
        toast.success('Asset deleted successfully', {
          style: { borderRadius: '12px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }
        });
        fetchAssets();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete asset');
      }
    }
  };

  const openEditModal = (asset) => {
    setSelectedAssetForEdit(asset);
    setIsAssetFormModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedAssetForEdit(null);
    setIsAssetFormModalOpen(true);
  };

  let fixedAssets = assets.filter(a => a.type === 'Non-Consumable' && !['Scrapped', 'Under Repair'].includes(a.condition));
  let consumables = assets.filter(a => a.type === 'Consumable');
  let historyAssets = assets.filter(a => ['Scrapped', 'Under Repair'].includes(a.condition));

  if (filterParam === 'LowStock') {
    consumables = consumables.filter(a => a.quantity < a.threshold);
  }

  if (conditionParam) {
    fixedAssets = fixedAssets.filter(a => a.condition === conditionParam);
    historyAssets = historyAssets.filter(a => a.condition === conditionParam);
  }

  return (
    <div ref={backgroundRef} className="min-h-screen bg-[#030014] text-slate-200 p-4 sm:p-6 lg:p-8 selection:bg-cyan-500/30 overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="blob1 absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="blob2 absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />
      <div className="blob3 absolute top-[30%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <PackageSearch className="text-cyan-400" size={28} />
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 tracking-tight">
                Inventory Core
              </h1>
            </div>
            <p className="text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
              Manage, audit, and track organization assets securely.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(168,85,247,0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSmartImportModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg font-bold transition-all flex items-center space-x-2 border border-white/10"
            >
              <Sparkles size={18} />
              <span>Smart Import</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(99,102,241,0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsBulkModalOpen(true)}
              className="px-5 py-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-xl font-bold transition-all flex items-center space-x-2 hover:bg-indigo-500/20"
            >
              <Upload size={18} />
              <span>Bulk Upload</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(34,211,238,0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={openAddModal}
              className="px-5 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl font-bold transition-all flex items-center space-x-2 hover:bg-white/20"
            >
              <Plus size={18} className="text-cyan-400" />
              <span>Add Asset</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs Layout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 mb-6 gap-4">
          <div className="flex space-x-8">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold tracking-wider uppercase relative transition-colors ${
                  activeTab === tab ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="inventory-tab-indicator-dark"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
          {(filterParam || conditionParam) && (
            <Link to="/admin/inventory" className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-md hover:bg-rose-500/20 transition-colors flex items-center gap-1 mb-4 sm:mb-0 uppercase tracking-widest">
              Clear Filters <X size={14} />
            </Link>
          )}
        </div>

        {/* Tab Content */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === 'Fixed Assets' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-white/[0.02] border-b border-white/10 text-slate-500 text-xs uppercase tracking-widest font-bold">
                      <tr>
                        <th className="px-6 py-4 font-mono">Asset Target</th>
                        <th className="px-6 py-4 font-mono">Serial Code</th>
                        <th className="px-6 py-4 font-mono">Status Node</th>
                        <th className="px-6 py-4 font-mono">Allocation</th>
                        <th className="px-6 py-4 font-mono text-right">Directives</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {fixedAssets.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-mono">No fixed assets found.</td></tr>}
                      {fixedAssets.map((asset) => (
                        <tr key={asset._id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4 font-bold text-slate-200">{asset.name}</td>
                          <td className="px-6 py-4 text-cyan-400/70 font-mono text-xs">{asset.serialNumber || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded border text-[10px] uppercase font-bold tracking-widest ${
                              asset.status === 'Allocated' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}>
                              {asset.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400">{asset.assignedTo ? asset.assignedTo.name : 'Unassigned'}</td>
                          <td className="px-6 py-4 text-right flex items-center justify-end space-x-3">
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEditModal(asset)} className="text-slate-500 hover:text-indigo-400 transition-colors bg-white/5 p-1.5 rounded" title="Edit Asset">
                              <Edit size={16} />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(asset._id, asset.status)} className="text-slate-500 hover:text-rose-400 transition-colors bg-white/5 p-1.5 rounded" title="Delete Asset">
                              <Trash2 size={16} />
                            </motion.button>
                            <Link to={`/admin/inventory/${asset._id}`} className="text-indigo-400 hover:text-indigo-300 font-bold ml-2 border-l border-white/10 pl-3 text-xs uppercase tracking-wider">History &rarr;</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === 'Consumables' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-white/[0.02] border-b border-white/10 text-slate-500 text-xs uppercase tracking-widest font-bold">
                      <tr>
                        <th className="px-6 py-4 font-mono">Stock Target</th>
                        <th className="px-6 py-4 font-mono">Volume</th>
                        <th className="px-6 py-4 font-mono">Threshold</th>
                        <th className="px-6 py-4 font-mono text-right">Integrity Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {consumables.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-mono">No consumables found.</td></tr>}
                      {consumables.map((item) => {
                        const isLow = item.quantity < item.threshold;
                        return (
                          <tr key={item._id} className={`transition-colors group ${isLow ? 'bg-rose-500/5' : 'hover:bg-white/[0.02]'}`}>
                            <td className="px-6 py-4 font-bold text-slate-200">{item.name}</td>
                            <td className="px-6 py-4 font-mono font-bold text-slate-300">{item.quantity}</td>
                            <td className="px-6 py-4 text-slate-500 font-mono">{item.threshold}</td>
                            <td className="px-6 py-4 text-right flex items-center justify-end space-x-3">
                              {isLow ? (
                                <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest mr-2 animate-pulse">
                                  <AlertTriangle size={12} />
                                  Critical Stock
                                </span>
                              ) : (
                                <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest mr-2 border border-emerald-500/30 px-2 py-1 rounded bg-emerald-500/10">Adequate</span>
                              )}
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEditModal(item)} className="text-slate-500 hover:text-indigo-400 transition-colors bg-white/5 p-1.5 rounded" title="Edit Asset">
                                <Edit size={16} />
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(item._id, item.status)} className="text-slate-500 hover:text-rose-400 transition-colors bg-white/5 p-1.5 rounded" title="Delete Asset">
                                <Trash2 size={16} />
                              </motion.button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === 'Repair & Disposed' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-white/[0.02] border-b border-white/10 text-slate-500 text-xs uppercase tracking-widest font-bold">
                      <tr>
                        <th className="px-6 py-4 font-mono">Asset Target</th>
                        <th className="px-6 py-4 font-mono">State</th>
                        <th className="px-6 py-4 font-mono">Date Logged</th>
                        <th className="px-6 py-4 font-mono text-right">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {historyAssets.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-mono">No history logs found.</td></tr>}
                      {historyAssets.map((asset) => (
                        <tr key={asset._id} className="hover:bg-white/[0.02] transition-colors text-slate-400 group">
                          <td className="px-6 py-4 font-bold text-slate-300">{asset.name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded border text-[10px] uppercase font-bold tracking-widest ${
                              asset.condition === 'Scrapped' ? 'bg-slate-500/20 text-slate-400 border-slate-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}>
                              {asset.condition}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">{new Date(asset.updatedAt).toLocaleDateString('en-GB')}</td>
                          <td className="px-6 py-4 text-right flex items-center justify-end space-x-3">
                            <span className="italic text-xs text-slate-500 max-w-[150px] truncate mr-2" title={asset.description}>{asset.description || 'No notes'}</span>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEditModal(asset)} className="text-slate-500 hover:text-indigo-400 transition-colors bg-white/5 p-1.5 rounded" title="Edit Asset">
                              <Edit size={16} />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(asset._id, asset.status)} className="text-slate-500 hover:text-rose-400 transition-colors bg-white/5 p-1.5 rounded" title="Delete Asset">
                              <Trash2 size={16} />
                            </motion.button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      <AssetFormModal 
        isOpen={isAssetFormModalOpen} 
        onClose={() => setIsAssetFormModalOpen(false)} 
        onSaveSuccess={fetchAssets} 
        existingAsset={selectedAssetForEdit}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onUploadSuccess={fetchAssets}
      />

      {/* Smart Import Modal */}
      <SmartImportModal
        isOpen={isSmartImportModalOpen}
        onClose={() => setIsSmartImportModalOpen(false)}
        onUploadSuccess={fetchAssets}
      />
    </div>
  );
}

function AssetFormModal({ isOpen, onClose, onSaveSuccess, existingAsset }) {
  const isEdit = !!existingAsset;
  
  const [formData, setFormData] = React.useState({
    name: '', type: 'Non-Consumable', description: '', quantity: '', threshold: '', serialNumber: '', condition: 'New'
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (existingAsset) {
      setFormData({
        name: existingAsset.name || '',
        type: existingAsset.type || 'Non-Consumable',
        description: existingAsset.description || '',
        quantity: existingAsset.quantity ?? '',
        threshold: existingAsset.threshold ?? '',
        serialNumber: existingAsset.serialNumber || '',
        condition: existingAsset.condition || 'New'
      });
    } else {
      setFormData({
        name: '', type: 'Non-Consumable', description: '', quantity: '', threshold: '', serialNumber: '', condition: 'New'
      });
    }
  }, [existingAsset, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...formData };
    if (payload.type === 'Non-Consumable') {
      delete payload.quantity;
      delete payload.threshold;
    } else {
      payload.quantity = Number(payload.quantity);
      payload.threshold = Number(payload.threshold);
    }

    try {
      if (isEdit) {
        await api.put(`/assets/${existingAsset._id}`, payload);
        toast.success('Hardware Registry Updated', {
          style: { borderRadius: '12px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }
        });
      } else {
        await api.post('/assets', payload);
        toast.success('Asset logged successfully', {
          style: { borderRadius: '12px', background: '#064e3b', color: '#fff', border: '1px solid #059669' }
        });
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || `Operation failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-gradient-to-b from-[#0f172a] to-[#020617] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden z-10 max-h-[90vh] overflow-y-auto custom-scrollbar border border-cyan-500/30"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-500" />
            <div className="p-8">
              <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-cyan-500/20 p-3 rounded-2xl text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <Edit size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">{isEdit ? 'Reconfigure Asset' : 'Log New Asset'}</h2>
                  <p className="text-sm text-slate-400 font-medium">Update network inventory parameters</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Asset Target Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none font-mono" />
                </div>
                
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Asset Class</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none font-mono appearance-none">
                    <option value="Non-Consumable" className="bg-slate-900">Fixed Hardware (Non-Consumable)</option>
                    <option value="Consumable" className="bg-slate-900">Consumable Stock</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Diagnostics / Condition</label>
                  <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none font-mono appearance-none">
                    <option value="New" className="bg-slate-900">Pristine (New)</option>
                    <option value="Good" className="bg-slate-900">Functional (Good)</option>
                    <option value="Under Repair" className="bg-slate-900">Maintenance (Under Repair)</option>
                    <option value="Damaged" className="bg-slate-900">Compromised (Damaged)</option>
                    <option value="Scrapped" className="bg-slate-900">Decommissioned (Scrapped)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Logs / Notes (Optional)</label>
                  <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none font-mono" />
                </div>

                {formData.type === 'Non-Consumable' && (
                  <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Serial Verification Code</label>
                    <input type="text" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none font-mono" />
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Leave blank for auto-generation (N/A).</p>
                  </div>
                )}

                {formData.type === 'Consumable' && (
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Initial Volume</label>
                      <input type="number" min="0" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none font-mono" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1 block">Low Stock Alert Level</label>
                      <input type="number" min="0" required value={formData.threshold} onChange={e => setFormData({...formData, threshold: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none font-mono" />
                    </div>
                  </div>
                )}
                
                <div className="pt-6 flex space-x-3">
                  <button type="button" onClick={onClose} className="flex-1 py-3.5 px-4 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">Abort</button>
                  <button type="submit" disabled={loading} className="flex-1 py-3.5 px-4 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-70 relative overflow-hidden group">
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                    <span className="relative z-10 flex justify-center items-center gap-2">
                      {loading ? 'Transmitting...' : (isEdit ? 'Sync Changes' : 'Execute Injection')}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function BulkUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Data source required');
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post('/assets/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message || 'Data injection successful', {
        style: { borderRadius: '12px', background: '#064e3b', color: '#fff', border: '1px solid #059669' }
      });
      if (res.data.errors && res.data.errors.length > 0) {
        toast.error(`Corruption in rows: ${res.data.errors.join(', ')}`, { duration: 5000 });
      }
      onUploadSuccess();
      setFile(null);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Injection protocol failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-gradient-to-b from-[#0f172a] to-[#020617] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 z-10 border border-indigo-500/30 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500" />
            <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-indigo-500/20 p-3 rounded-2xl text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Upload size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Mass Data Injection</h2>
                <p className="text-sm text-slate-400 font-medium">Upload .CSV or Excel source files</p>
              </div>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-indigo-500/30 rounded-2xl p-6 text-center hover:bg-indigo-500/10 transition-colors bg-black/20">
                <input 
                  type="file" 
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                  onChange={e => setFile(e.target.files[0])}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 cursor-pointer transition-colors"
                />
              </div>

              <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-xs text-slate-400 space-y-1 font-mono">
                <p className="font-bold text-indigo-400 mb-1 uppercase tracking-wider">Required Schema:</p>
                <p>• name <span className="text-slate-500">(e.g. Dell XPS 15)</span></p>
                <p>• type <span className="text-slate-500">(Consumable / Non-Consumable)</span></p>
                <p className="font-bold text-indigo-400 mt-3 mb-1 uppercase tracking-wider">Conditional Schema:</p>
                <p>• serialNumber <span className="text-slate-500">(For Non-Consumable)</span></p>
                <p>• quantity, threshold <span className="text-slate-500">(For Consumables)</span></p>
              </div>
              
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={onClose} className="flex-1 py-3.5 px-4 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">Abort</button>
                <button type="submit" disabled={loading} className="flex-1 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-70 relative overflow-hidden group">
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                  <span className="relative z-10">{loading ? 'Parsing...' : 'Execute Upload'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SmartImportModal({ isOpen, onClose, onUploadSuccess }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsedAssets, setParsedAssets] = useState([]);

  const handleParse = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Data source required');
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post('/assets/parse-bill', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setParsedAssets(res.data || []);
      setStep(2);
      toast.success('AI parsing complete', {
        style: { borderRadius: '12px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI parsing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    const hasErrors = parsedAssets.some(a => !a.name || !a.type || (a.type === 'Non-Consumable' && !a.serialNumber));
    if (hasErrors) return toast.error('Resolve critical schema errors before execution.');

    setLoading(true);
    try {
      const res = await api.post('/assets/bulk-insert', { assets: parsedAssets });
      toast.success(res.data.message || 'Assets inserted successfully');
      onUploadSuccess();
      reset();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Injection failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setFile(null);
    setParsedAssets([]);
  };

  const updateAsset = (index, field, value) => {
    const newAssets = [...parsedAssets];
    newAssets[index][field] = value;
    setParsedAssets(newAssets);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { reset(); onClose(); }} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${step === 1 ? 'max-w-md' : 'max-w-4xl'} bg-gradient-to-b from-[#0f172a] to-[#020617] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden z-10 transition-all duration-300 max-h-[90vh] flex flex-col border border-purple-500/30`}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            
            <div className="p-8 pb-4">
              <button onClick={() => { reset(); onClose(); }} className="absolute top-6 right-6 p-2 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-purple-500/20 p-3 rounded-2xl text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">{step === 1 ? 'AI Intelligence Import' : 'Data Integrity Verification'}</h2>
                  <p className="text-sm text-slate-400 font-medium">
                    {step === 1 ? 'Neural net extraction from invoices (PDF/CSV).' : 'Validate structural integrity before injection.'}
                  </p>
                </div>
              </div>
            </div>

            {step === 1 && (
              <div className="p-8 pt-4">
                <form onSubmit={handleParse} className="space-y-6">
                  <div className="border-2 border-dashed border-purple-500/30 rounded-2xl p-8 text-center hover:bg-purple-500/10 transition-colors bg-black/20">
                    <input 
                      type="file" 
                      accept=".pdf, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                      onChange={e => setFile(e.target.files[0])}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30 cursor-pointer transition-colors"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button type="button" onClick={() => { reset(); onClose(); }} className="flex-1 py-3.5 px-4 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">Abort</button>
                    <button type="submit" disabled={loading} className="flex-1 py-3.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-70 relative overflow-hidden group">
                      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                      <span className="relative z-10">{loading ? 'Extracting...' : 'Init Analysis'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 2 && (
              <>
                <div className="flex-1 overflow-auto px-8 custom-scrollbar">
                  <table className="w-full text-left text-sm mt-4 border-collapse">
                    <thead className="bg-white/[0.05] border-b border-white/10 text-slate-400 text-[10px] uppercase tracking-widest sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 font-bold rounded-tl-lg">Target Name</th>
                        <th className="px-4 py-3 font-bold">Class Type</th>
                        <th className="px-4 py-3 font-bold">Serial Code</th>
                        <th className="px-4 py-3 font-bold">Volume</th>
                        <th className="px-4 py-3 font-bold rounded-tr-lg text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {parsedAssets.map((asset, idx) => {
                        const typeError = !asset.type;
                        const serialError = asset.type === 'Non-Consumable' && !asset.serialNumber;
                        const nameError = !asset.name;
                        
                        return (
                          <tr key={idx} className="hover:bg-white/[0.02]">
                            <td className="px-4 py-3">
                              <input 
                                value={asset.name || ''} 
                                onChange={e => updateAsset(idx, 'name', e.target.value)}
                                className={`w-full px-3 py-1.5 rounded-lg border outline-none font-mono text-xs text-white ${nameError ? 'border-rose-500/50 bg-rose-500/10' : 'border-white/10 bg-black/40 focus:border-purple-500'}`}
                                placeholder="REQUIRED"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <select 
                                value={asset.type || ''} 
                                onChange={e => updateAsset(idx, 'type', e.target.value)}
                                className={`w-full px-3 py-1.5 rounded-lg border outline-none font-mono text-xs text-white appearance-none ${typeError ? 'border-rose-500/50 bg-rose-500/10' : 'border-white/10 bg-black/40 focus:border-purple-500'}`}
                              >
                                <option value="" className="bg-slate-900">Select...</option>
                                <option value="Non-Consumable" className="bg-slate-900">Non-Cons</option>
                                <option value="Consumable" className="bg-slate-900">Consumable</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input 
                                value={asset.serialNumber || ''} 
                                onChange={e => updateAsset(idx, 'serialNumber', e.target.value)}
                                disabled={asset.type === 'Consumable'}
                                className={`w-full px-3 py-1.5 rounded-lg border outline-none font-mono text-xs text-white ${serialError ? 'border-rose-500/50 bg-rose-500/10' : 'border-white/10 bg-black/40 focus:border-purple-500'} disabled:opacity-30`}
                                placeholder={asset.type === 'Consumable' ? 'N/A' : 'REQUIRED'}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input 
                                type="number"
                                value={asset.quantity || 0} 
                                onChange={e => updateAsset(idx, 'quantity', Number(e.target.value))}
                                disabled={asset.type === 'Non-Consumable'}
                                className={`w-20 px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 font-mono text-xs text-white outline-none focus:border-purple-500 disabled:opacity-30`}
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => setParsedAssets(parsedAssets.filter((_, i) => i !== idx))} className="text-rose-400 hover:text-rose-300 font-bold text-[10px] uppercase tracking-widest px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded">
                                Drop
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {parsedAssets.length === 0 && <div className="py-8 text-center text-slate-500 text-sm font-mono">No valid structs extracted.</div>}
                </div>
                
                <div className="p-8 pt-6 border-t border-white/10 bg-black/20 mt-4 flex space-x-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 px-4 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">Rewind Analysis</button>
                  <button type="button" onClick={handleConfirm} disabled={loading || parsedAssets.length === 0} className="flex-1 py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-70 relative overflow-hidden group">
                     <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                     <span className="relative z-10">Confirm & Inject</span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
