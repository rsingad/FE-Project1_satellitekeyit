import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TABS = ['Fixed Assets', 'Consumables', 'Repair & Disposed'];

export default function AssetInventory() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
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
    fetchAssets();
  }, []);

  const fixedAssets = assets.filter(a => a.type === 'Non-Consumable' && !['Scrapped', 'Under Repair'].includes(a.condition));
  const consumables = assets.filter(a => a.type === 'Consumable');
  const historyAssets = assets.filter(a => ['Scrapped', 'Under Repair'].includes(a.condition));

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Inventory Manager</h1>
          <p className="text-slate-500 mt-1">Manage, audit, and track organization assets.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-md font-medium transition-colors flex items-center space-x-2"
        >
          <PlusIcon />
          <span>Add New Asset</span>
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="flex space-x-8 border-b border-slate-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-medium relative transition-colors ${
              activeTab === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="inventory-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {activeTab === 'Fixed Assets' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Asset Name</th>
                  <th className="px-6 py-4 font-semibold">Serial Number</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Allocation</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fixedAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{asset.name}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{asset.serialNumber || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        asset.status === 'Allocated' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{asset.assignedTo ? asset.assignedTo.name : 'Unassigned'}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/admin/inventory/${asset._id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">Audit History &rarr;</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === 'Consumables' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Item Name</th>
                  <th className="px-6 py-4 font-semibold">Current Volume</th>
                  <th className="px-6 py-4 font-semibold">Minimum Threshold</th>
                  <th className="px-6 py-4 font-semibold text-right">Stock Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consumables.map((item) => {
                  const isLow = item.quantity < item.threshold;
                  return (
                    <tr key={item._id} className={`transition-colors ${isLow ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-700">{item.quantity}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono">{item.threshold}</td>
                      <td className="px-6 py-4 text-right">
                        {isLow ? (
                          <span className="inline-flex items-center space-x-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-md text-xs font-bold">
                            <WarningIcon />
                            <span>Low Stock</span>
                          </span>
                        ) : (
                          <span className="text-emerald-500 text-xs font-bold">Adequate</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === 'Repair & Disposed' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Asset Name</th>
                  <th className="px-6 py-4 font-semibold">State</th>
                  <th className="px-6 py-4 font-semibold">Date Logged</th>
                  <th className="px-6 py-4 font-semibold text-right">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyAssets.map((asset) => (
                  <tr key={asset._id} className="hover:bg-slate-50/50 transition-colors text-slate-500">
                    <td className="px-6 py-4 font-medium text-slate-700">{asset.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        asset.condition === 'Scrapped' ? 'bg-slate-200 text-slate-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(asset.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right italic text-xs">{asset.description || 'No notes'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      {/* Add Asset Modal */}
      <AddAssetModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAssetAdded={(newAsset) => setAssets([...assets, newAsset])} 
      />
    </div>
  );
}

function AddAssetModal({ isOpen, onClose, onAssetAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Non-Consumable',
    description: '',
    quantity: '',
    threshold: '',
    serialNumber: '',
    condition: 'New'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/assets', formData);
      onAssetAdded(res.data);
      toast.success('Asset added successfully');
      
      // Reset form
      setFormData({
        name: '', type: 'Non-Consumable', description: '', quantity: '', threshold: '', serialNumber: '', condition: 'New'
      });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 overflow-hidden z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Add New Asset</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Asset Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Asset Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 outline-none">
                  <option value="Non-Consumable">Fixed Asset (Non-Consumable)</option>
                  <option value="Consumable">Consumable Item</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description / Notes (Optional)</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 outline-none" />
              </div>

              {formData.type === 'Non-Consumable' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
                    <input type="text" required value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
                    <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 outline-none">
                      <option value="New">New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                    <input type="number" required min="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Threshold</label>
                    <input type="number" required min="1" value={formData.threshold} onChange={e => setFormData({...formData, threshold: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 outline-none" />
                  </div>
                </div>
              )}

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center justify-center">
                  {loading ? 'Adding...' : 'Add Asset'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Inline SVGs
function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
