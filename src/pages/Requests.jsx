import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Send, Check, X, Undo2, Clock, Inbox, ChevronDown, CalendarClock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Requests = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableAssets, setAvailableAssets] = useState([]);

  const [newReq, setNewReq] = useState({
    assetType: 'Consumable',
    assetName: '',
    quantity: 1
  });

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
      toast.success('Request submitted successfully');
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
          return toast.error('Please manually select an asset to assign');
        }
        payload.assignedAssetId = selectEl.value;
      }
    }

    try {
      await api.put(`/requests/${id}/approve`, payload);
      toast.success('Request approved successfully');
      fetchRequests();
      fetchAvailableAssets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/requests/${id}/reject`, {});
      toast.success('Request rejected');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  const handleReturn = async (id) => {
    try {
      await api.post(`/requests/${id}/return`, {});
      toast.success('Return initiated. Pending admin confirmation.');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to initiate return');
    }
  };

  const handleConfirmReturn = async (id) => {
    try {
      await api.put(`/requests/${id}/confirm-return`, {});
      toast.success('Return confirmed successfully');
      fetchRequests();
      fetchAvailableAssets();
    } catch (error) {
      toast.error('Failed to confirm return');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {user?.role === 'Admin' || user?.role === 'Manager' ? 'Workspace Requests' : 'My Requests'}
          </h1>
          <p className="text-slate-500 mt-1">
            {user?.role === 'Employee' ? 'Track and manage your asset requests.' : 'Review and process employee requests.'}
          </p>
        </div>
        {user?.role === 'Employee' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20 font-medium"
          >
            <Send size={18} />
            New Request
          </motion.button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-5">Date</th>
                {(user?.role === 'Admin' || user?.role === 'Manager') && (
                  <th className="p-5">Requester</th>
                )}
                <th className="p-5">Asset Details</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <div className="animate-pulse flex flex-col items-center gap-3">
                      <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                      <div className="h-4 w-24 bg-slate-200 rounded"></div>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500">
                    <Inbox className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-lg font-medium text-slate-700">No requests found</p>
                  </td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-5 min-w-[150px]">
                      <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2" title="Requested Date">
                          <Clock size={14} className="text-slate-400 shrink-0" />
                          <span><span className="font-medium">Req:</span> {new Date(req.requestDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        {req.expectedReturnDate && (
                          <div className="flex items-center gap-2 text-amber-700" title="Expected Return Date">
                            <CalendarClock size={14} className="text-amber-500 shrink-0" />
                            <span><span className="font-medium">Due:</span> {new Date(req.expectedReturnDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        )}
                        {req.assignedDate && (
                          <div className="flex items-center gap-2 text-emerald-700" title="Assigned Date">
                            <Check size={14} className="text-emerald-500 shrink-0" />
                            <span>
                              <span className="font-medium">Assigned:</span> {new Date(req.assignedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              {req.approvedBy && <span className="text-emerald-600/70 ml-1">by {req.approvedBy.name}</span>}
                            </span>
                          </div>
                        )}
                        {req.returnDate && (
                          <div className="flex items-center gap-2 text-purple-700" title="Returned Date">
                            <Undo2 size={14} className="text-purple-500 shrink-0" />
                            <span>
                              <span className="font-medium">Returned:</span> {new Date(req.returnDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              {req.returnConfirmedBy && <span className="text-purple-600/70 ml-1">by {req.returnConfirmedBy.name}</span>}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    {(user?.role === 'Admin' || user?.role === 'Manager') && (
                      <td className="p-5">
                        <div className="text-sm font-bold text-slate-800">{req.requester?.name}</div>
                        <div className="text-xs text-slate-500">{req.requester?.email}</div>
                      </td>
                    )}
                    <td className="p-5">
                      <div className="text-sm font-bold text-slate-900">{req.assetName}</div>
                      <div className="text-xs font-medium text-slate-500 mt-0.5">
                        {req.assetType} {req.assetType === 'Consumable' && <span className="text-primary-600 ml-1">× {req.quantity}</span>}
                      </div>
                      {req.assignedAssetId && (
                        <div className="text-xs font-mono text-slate-400 mt-1 bg-slate-100 inline-block px-1.5 py-0.5 rounded">
                          SN: {req.assignedAssetId.serialNumber}
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-block ${req.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          req.status === 'Rejected' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                            req.status === 'Pending Return' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                              'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      {req.status === 'Pending' && (user?.role === 'Admin' || user?.role === 'Manager') ? (
                        <div className="flex justify-end gap-3">
                          <form onSubmit={(e) => handleApprove(req._id, req.assetType, e)} className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                            {req.assetType === 'Non-Consumable' && (!req.requestedAssetId || req.requestedAssetId.status !== 'Available') && (
                              <div className="relative">
                                <select name="assetSelect" className="text-xs border-none bg-transparent font-medium text-slate-700 focus:ring-0 appearance-none pr-6 pl-2 py-1 cursor-pointer max-w-[150px]">
                                  <option value="">{req.requestedAssetId ? 'Requested Item Unavailable. Select Alternative...' : 'Assign manually...'}</option>
                                  {availableAssets.filter(a => a.name.toLowerCase().includes(req.assetName.toLowerCase()) || req.assetName.toLowerCase().includes(a.name.toLowerCase())).map(a => (
                                    <option key={a._id} value={a._id}>{a.name} ({a.serialNumber})</option>
                                  ))}
                                  {availableAssets.length > 0 && <option disabled>──────────</option>}
                                  {availableAssets.map(a => (
                                    <option key={a._id} value={a._id}>{a.name} ({a.serialNumber})</option>
                                  ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1.5 text-slate-400 pointer-events-none" />
                              </div>
                            )}
                            <button type="submit" title="Approve" className="p-1.5 bg-emerald-500 text-white rounded-md shadow-sm hover:bg-emerald-600 transition-colors flex items-center gap-1 text-xs font-bold px-2">
                              <Check size={14} /> Approve
                            </button>
                          </form>
                          <button onClick={() => handleReject(req._id)} title="Reject" className="p-2 bg-white text-rose-500 border border-rose-200 rounded-lg shadow-sm hover:bg-rose-50 hover:border-rose-300 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      ) : req.status === 'Approved' && req.assetType === 'Non-Consumable' && user?.role === 'Employee' ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReturn(req._id)}
                          className="text-xs font-bold flex items-center justify-end w-full gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors ml-auto max-w-max"
                        >
                          <Undo2 size={14} /> Return Item
                        </motion.button>
                      ) : req.status === 'Pending Return' && (user?.role === 'Admin' || user?.role === 'Manager') ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleConfirmReturn(req._id)}
                          className="text-xs font-bold flex items-center justify-end w-full gap-1.5 text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors ml-auto max-w-max"
                        >
                          <Check size={14} /> Confirm Return
                        </motion.button>
                      ) : (
                        <span className="text-slate-300 text-sm font-medium">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* New Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
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
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmitRequest} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Asset Type</label>
                    <div className="relative">
                      <select className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow text-sm appearance-none" value={newReq.assetType} onChange={e => setNewReq({ ...newReq, assetType: e.target.value })}>
                        <option value="Consumable">Consumable (e.g., Markers, Notebook)</option>
                        <option value="Non-Consumable">Hardware (e.g., Laptop, Mouse)</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-3 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Asset Name</label>
                    <input required type="text" placeholder="What do you need?" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow text-sm" value={newReq.assetName} onChange={e => setNewReq({ ...newReq, assetName: e.target.value })} />
                  </div>

                  {newReq.assetType === 'Consumable' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity Required</label>
                      <input type="number" min="1" required className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow text-sm" value={newReq.quantity} onChange={e => setNewReq({ ...newReq, quantity: Number(e.target.value) })} />
                    </motion.div>
                  )}

                  <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                    <button type="submit" className="px-5 py-2.5 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">Submit Request</button>
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
