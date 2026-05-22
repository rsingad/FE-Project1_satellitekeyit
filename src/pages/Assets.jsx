import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { PackageSearch, Laptop, Smartphone, Monitor, Plus, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = ['My Assigned Hardware', 'Company Catalog'];

const Assets = () => {
  const { user } = useContext(AuthContext);
  const [allAssets, setAllAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  
  // Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestAsset, setRequestAsset] = useState(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      toast.success(`${requestAsset.name} requested successfully! Check 'Requests' tab for status.`);
      setIsRequestModalOpen(false);
      setRequestAsset(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  const myAssets = allAssets.filter(a => a.assignedTo?._id === user._id);
  const catalogAssets = allAssets; // Show both Consumable and Non-Consumable

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Asset Portal</h1>
          <p className="text-slate-500 mt-1">Manage your hardware and browse the company catalog.</p>
        </div>
      </div>

      {/* Tabs */}
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
                layoutId="asset-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : activeTab === 'My Assigned Hardware' ? (
        myAssets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
            <PackageSearch className="mx-auto h-16 w-16 text-slate-300 mb-6" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Hardware Assigned</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              You don't have any non-consumable assets assigned to you yet. If you need hardware, check the catalog and raise a requisition request.
            </p>
          </motion.div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myAssets.map(asset => (
              <motion.div 
                variants={item}
                key={asset._id} 
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                    <Laptop size={24} />
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
                    {asset.status}
                  </span>
                </div>
                
                <h4 className="font-bold text-xl text-slate-900 mb-1">{asset.name}</h4>
                <p className="text-slate-500 text-sm mb-6">{asset.description || 'No description provided'}</p>
                
                <div className="space-y-3 pt-5 border-t border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Serial Number</span>
                    <span className="font-mono text-slate-700 font-bold bg-slate-50 px-2 py-0.5 rounded">{asset.serialNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Condition</span>
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${asset.condition === 'New' ? 'bg-emerald-400' : asset.condition === 'Good' ? 'bg-blue-400' : 'bg-amber-400'}`}></span>
                      {asset.condition}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Assigned Date</span>
                    <span className="text-slate-700">{asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )
      ) : (
        /* Company Catalog View */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-5">Asset Model</th>
                  <th className="p-5">Type</th>
                  <th className="p-5">Availability Status</th>
                  <th className="p-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {catalogAssets.map(asset => {
                  const isConsumable = asset.type === 'Consumable';
                  const isAvailable = isConsumable ? asset.quantity > 0 : asset.status === 'Available';
                  
                  return (
                    <tr key={asset._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-5 font-bold text-slate-800">{asset.name}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isConsumable ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {asset.type}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider inline-block ${
                          isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isAvailable ? 'In Stock' : 'Currently Unavailable'}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openRequestModal(asset)}
                          className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-600 border border-primary-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary-600 hover:text-white transition-colors shadow-sm"
                        >
                          <Send size={14} />
                          Request
                        </motion.button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Quick Request Modal */}
      <AnimatePresence>
        {isRequestModalOpen && requestAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsRequestModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-100 p-1.5 rounded-lg text-primary-600">
                    <Send size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Request Asset</h2>
                </div>
                <button onClick={() => setIsRequestModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleQuickRequest} className="space-y-5">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                    <p className="text-sm text-slate-500 font-medium">You are requesting:</p>
                    <p className="text-lg font-bold text-slate-800 mt-1">{requestAsset.name}</p>
                    <p className="text-xs font-semibold text-primary-600 mt-1">{requestAsset.type}</p>
                  </div>

                  {requestAsset.type === 'Consumable' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity Required</label>
                      <input 
                        type="number" 
                        min="1" 
                        required 
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow text-sm" 
                        value={requestQuantity} 
                        onChange={e => setRequestQuantity(Number(e.target.value))} 
                      />
                    </motion.div>
                  )}

                  {requestAsset.type === 'Non-Consumable' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expected Return Date</label>
                      <input 
                        type="date" 
                        required 
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow text-sm" 
                        value={expectedReturnDate} 
                        onChange={e => setExpectedReturnDate(e.target.value)} 
                      />
                    </motion.div>
                  )}

                  <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-6">
                    <button type="button" onClick={() => setIsRequestModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-5 py-2.5 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20 disabled:opacity-50 flex items-center gap-2">
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
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
