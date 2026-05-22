import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

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
      return toast.error('Cannot delete an allocated asset. Please have it returned first.');
    }
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await api.delete(`/assets/${id}`);
        toast.success('Asset deleted successfully');
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
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Inventory Manager</h1>
          <p className="text-slate-500 mt-1">Manage, audit, and track organization assets.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsSmartImportModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 rounded-xl shadow-md font-medium transition-all flex items-center space-x-2"
          >
            <SparklesIcon />
            <span>Smart Import</span>
          </button>
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl shadow-sm font-medium transition-colors flex items-center space-x-2 border border-indigo-200"
          >
            <UploadIcon />
            <span>Bulk Upload</span>
          </button>
          <button 
            onClick={openAddModal}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-md font-medium transition-colors flex items-center space-x-2"
          >
            <PlusIcon />
            <span>Add New Asset</span>
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 mb-6 gap-4">
        <div className="flex space-x-8">
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
        {(filterParam || conditionParam) && (
          <Link to="/admin/inventory" className="text-xs font-semibold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors flex items-center gap-1 mb-4 sm:mb-0">
            Clear Filters &times;
          </Link>
        )}
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
                  <tr key={asset._id} className="hover:bg-slate-50/50 transition-colors">
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
                    <td className="px-6 py-4 text-right flex items-center justify-end space-x-3">
                      <button onClick={() => openEditModal(asset)} className="text-slate-400 hover:text-indigo-600 transition-colors" title="Edit Asset">
                        <EditIcon />
                      </button>
                      <button onClick={() => handleDelete(asset._id, asset.status)} className="text-slate-400 hover:text-rose-600 transition-colors" title="Delete Asset">
                        <DeleteIcon />
                      </button>
                      <Link to={`/admin/inventory/${asset._id}`} className="text-indigo-600 hover:text-indigo-800 font-medium ml-2 border-l border-slate-200 pl-3 text-xs">History &rarr;</Link>
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
                      <td className="px-6 py-4 text-right flex items-center justify-end space-x-3">
                        {isLow ? (
                          <span className="inline-flex items-center space-x-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-md text-xs font-bold mr-2">
                            <WarningIcon />
                            <span>Low Stock</span>
                          </span>
                        ) : (
                          <span className="text-emerald-500 text-xs font-bold mr-2">Adequate</span>
                        )}
                        <button onClick={() => openEditModal(item)} className="text-slate-400 hover:text-indigo-600 transition-colors" title="Edit Asset">
                          <EditIcon />
                        </button>
                        <button onClick={() => handleDelete(item._id, item.status)} className="text-slate-400 hover:text-rose-600 transition-colors" title="Delete Asset">
                          <DeleteIcon />
                        </button>
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
                    <td className="px-6 py-4 text-right flex items-center justify-end space-x-3">
                      <span className="italic text-xs text-slate-400 max-w-[150px] truncate mr-2" title={asset.description}>{asset.description || 'No notes'}</span>
                      <button onClick={() => openEditModal(asset)} className="text-slate-400 hover:text-indigo-600 transition-colors" title="Edit Asset">
                        <EditIcon />
                      </button>
                      <button onClick={() => handleDelete(asset._id, asset.status)} className="text-slate-400 hover:text-rose-600 transition-colors" title="Delete Asset">
                        <DeleteIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
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
    name: '',
    type: 'Non-Consumable',
    description: '',
    quantity: '',
    threshold: '',
    serialNumber: '',
    condition: 'New'
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
    
    // Clean up payload to avoid Mongoose CastErrors for empty numbers
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
        toast.success('Asset updated successfully');
      } else {
        await api.post('/assets', payload);
        toast.success('Asset added successfully');
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'add'} asset`);
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
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{isEdit ? 'Edit Asset' : 'Add New Asset'}</h2>
            
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
                <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 outline-none">
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Under Repair">Under Repair</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Scrapped">Scrapped</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description / Notes (Optional)</label>
                <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 outline-none" />
              </div>

              {formData.type === 'Non-Consumable' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
                  <input type="text" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 outline-none" />
                  <p className="text-xs text-slate-500 mt-1">Leave blank if unknown.</p>
                </div>
              )}

              {formData.type === 'Consumable' && (
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Initial Quantity</label>
                    <input type="number" min="0" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Threshold</label>
                    <input type="number" min="0" required value={formData.threshold} onChange={e => setFormData({...formData, threshold: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 outline-none" />
                  </div>
                </div>
              )}
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-md disabled:opacity-70">
                  {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Asset')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SparklesIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function BulkUploadModal({ isOpen, onClose, onUploadSuccess }) {
// ... existing BulkUploadModal
// ... to not delete it I'll keep it as is
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file first');
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post('/assets/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(res.data.message || 'Assets uploaded successfully');
      if (res.data.errors && res.data.errors.length > 0) {
        toast.error(`Some rows had errors: ${res.data.errors.join(', ')}`, { duration: 5000 });
      }
      onUploadSuccess();
      setFile(null);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload assets');
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
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 z-10"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Bulk Upload Assets</h2>
            <p className="text-sm text-slate-500 mb-6">Upload a CSV or Excel (.xlsx) file to add multiple assets at once.</p>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors">
                <input 
                  type="file" 
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                  onChange={e => setFile(e.target.files[0])}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-700 mb-1">Required Columns:</p>
                <p>• <span className="font-mono">name</span> (e.g. Dell XPS 15)</p>
                <p>• <span className="font-mono">type</span> (Consumable or Non-Consumable)</p>
                <p className="font-semibold text-slate-700 mt-2 mb-1">Conditional Columns:</p>
                <p>• <span className="font-mono">serialNumber</span> (Required for Non-Consumable)</p>
                <p>• <span className="font-mono">quantity</span>, <span className="font-mono">threshold</span> (For Consumables)</p>
              </div>
              
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-emerald-200 disabled:opacity-70 flex items-center justify-center">
                  {loading ? 'Uploading...' : 'Upload File'}
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
    if (!file) return toast.error('Please select a file first');
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post('/assets/parse-bill', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setParsedAssets(res.data || []);
      setStep(2);
      toast.success('File parsed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    // Validate missing critical fields
    const hasErrors = parsedAssets.some(a => 
      !a.name || !a.type || (a.type === 'Non-Consumable' && !a.serialNumber)
    );
    if (hasErrors) {
      return toast.error('Please fix missing fields (highlighted in red) before confirming.');
    }

    setLoading(true);
    try {
      const res = await api.post('/assets/bulk-insert', { assets: parsedAssets });
      toast.success(res.data.message || 'Assets inserted successfully');
      onUploadSuccess();
      reset();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to insert assets');
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
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { reset(); onClose(); }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${step === 1 ? 'max-w-md' : 'max-w-4xl'} bg-white rounded-3xl shadow-2xl overflow-hidden z-10 transition-all duration-300 max-h-[90vh] flex flex-col`}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-500" />
            
            <div className="p-8 pb-4">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <SparklesIcon /> 
                {step === 1 ? 'AI Smart Import' : 'Verify Extracted Assets'}
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                {step === 1 
                  ? 'Upload an invoice (PDF) or list (Excel). AI will extract and structure the data automatically.'
                  : 'Review the extracted data. Fix any missing fields before confirming.'}
              </p>
            </div>

            {step === 1 && (
              <div className="p-8 pt-4">
                <form onSubmit={handleParse} className="space-y-6">
                  <div className="border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center hover:bg-purple-50/50 transition-colors">
                    <input 
                      type="file" 
                      accept=".pdf, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                      onChange={e => setFile(e.target.files[0])}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer transition-colors"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button type="button" onClick={() => { reset(); onClose(); }} className="flex-1 px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-purple-200 disabled:opacity-70 flex items-center justify-center">
                      {loading ? 'Extracting with AI...' : 'Parse Bill'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 2 && (
              <>
                <div className="flex-1 overflow-auto px-8 custom-scrollbar">
                  <table className="w-full text-left text-sm mt-4">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 font-semibold rounded-tl-lg">Name</th>
                        <th className="px-4 py-3 font-semibold">Type</th>
                        <th className="px-4 py-3 font-semibold">Serial No (Non-Cons)</th>
                        <th className="px-4 py-3 font-semibold">Qty (Cons)</th>
                        <th className="px-4 py-3 font-semibold rounded-tr-lg text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedAssets.map((asset, idx) => {
                        const typeError = !asset.type;
                        const serialError = asset.type === 'Non-Consumable' && !asset.serialNumber;
                        const nameError = !asset.name;
                        
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3">
                              <input 
                                value={asset.name || ''} 
                                onChange={e => updateAsset(idx, 'name', e.target.value)}
                                className={`w-full px-2 py-1 rounded border outline-none ${nameError ? 'border-red-400 bg-red-50' : 'border-transparent hover:border-slate-300 focus:border-purple-400'}`}
                                placeholder="Required"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <select 
                                value={asset.type || ''} 
                                onChange={e => updateAsset(idx, 'type', e.target.value)}
                                className={`w-full px-2 py-1 rounded border outline-none ${typeError ? 'border-red-400 bg-red-50' : 'border-transparent hover:border-slate-300 focus:border-purple-400'}`}
                              >
                                <option value="">Select...</option>
                                <option value="Non-Consumable">Non-Consumable</option>
                                <option value="Consumable">Consumable</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input 
                                value={asset.serialNumber || ''} 
                                onChange={e => updateAsset(idx, 'serialNumber', e.target.value)}
                                disabled={asset.type === 'Consumable'}
                                className={`w-full px-2 py-1 rounded border outline-none ${serialError ? 'border-red-400 bg-red-50' : 'border-transparent hover:border-slate-300 focus:border-purple-400'} disabled:bg-slate-100 disabled:opacity-50`}
                                placeholder={asset.type === 'Consumable' ? 'N/A' : 'Required'}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input 
                                type="number"
                                value={asset.quantity || 0} 
                                onChange={e => updateAsset(idx, 'quantity', Number(e.target.value))}
                                disabled={asset.type === 'Non-Consumable'}
                                className={`w-20 px-2 py-1 rounded border outline-none border-transparent hover:border-slate-300 focus:border-purple-400 disabled:bg-slate-100 disabled:opacity-50`}
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button 
                                onClick={() => setParsedAssets(parsedAssets.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 font-medium text-xs px-2 py-1 bg-red-50 rounded"
                              >
                                Drop
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {parsedAssets.length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-sm">
                      No assets extracted. Please try another file.
                    </div>
                  )}
                </div>
                
                <div className="p-8 pt-6 border-t border-slate-100 bg-slate-50 mt-4 flex space-x-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 px-4 py-3 text-slate-600 font-medium bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
                    Back to Upload
                  </button>
                  <button 
                    type="button" 
                    onClick={handleConfirm}
                    disabled={loading || parsedAssets.length === 0} 
                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center justify-center"
                  >
                    {loading ? 'Saving...' : `Confirm All (${parsedAssets.length} items)`}
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

function UploadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
