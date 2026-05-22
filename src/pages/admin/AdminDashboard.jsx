import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [metricsData, setMetricsData] = useState({
    totalAssets: 0,
    totalFixedAssets: 0,
    totalConsumables: 0,
    lowStockAlerts: 0,
    overdueReturns: 0,
    conditionBreakdown: [],
    recentActivity: [],
    recentRequests: []
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/assets/metrics');
        setMetricsData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetrics();
  }, []);

  const metrics = [
    { title: 'Total Assets', value: metricsData.totalAssets || 0, change: 'Entire catalog', icon: BoxIcon, color: 'from-blue-500 to-cyan-400', link: '/admin/inventory' },
    { title: 'Fixed Assets', value: metricsData.totalFixedAssets || 0, change: 'Non-consumable', icon: BoxIcon, color: 'from-indigo-500 to-purple-500', link: '/admin/inventory?tab=Fixed' },
    { title: 'Consumables', value: metricsData.totalConsumables || 0, change: 'Expendable items', icon: CheckIcon, color: 'from-emerald-400 to-teal-500', link: '/admin/inventory?tab=Consumables' },
    { title: 'Low Stock Alerts', value: metricsData.lowStockAlerts || 0, change: 'Requires restock', icon: AlertIcon, color: 'from-amber-400 to-orange-500', link: '/admin/inventory?tab=Consumables&filter=LowStock' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Master Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Operations overview and administrative control center.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setInviteModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-200 font-semibold flex items-center space-x-2"
        >
          <UserPlusIcon />
          <span>Generate Invite</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {metrics.map((metric, idx) => (
          <Link to={metric.link} key={metric.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 relative overflow-hidden group h-full cursor-pointer"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${metric.color} opacity-10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 font-medium text-sm mb-1">{metric.title}</p>
                  <h3 className="text-3xl font-bold text-slate-800">{metric.value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} text-white shadow-sm`}>
                  <metric.icon />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50">
                <span className="text-xs font-semibold text-slate-400">{metric.change}</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 min-h-[400px]">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><ActivityIcon className="text-indigo-500 w-6 h-6"/> Recent Activity</h3>
          <div className="space-y-6">
            {metricsData.recentActivity?.map(log => (
              <div key={log._id} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                  {log.performedBy?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-sm text-slate-800 font-medium">{log.details}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(log.timestamp).toLocaleString()} • {log.performedBy?.name}</p>
                </div>
              </div>
            ))}
            {(!metricsData.recentActivity || metricsData.recentActivity.length === 0) && (
              <p className="text-slate-500 text-sm">No recent activity.</p>
            )}
          </div>
        </div>

        {/* Condition Breakdown */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 min-h-[400px]">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Asset Health Breakdown</h3>
          <div className="space-y-4">
            {metricsData.conditionBreakdown?.map(cond => {
              const condTab = ['Scrapped', 'Under Repair'].includes(cond._id) ? 'Repair' : 'Fixed';
              return (
                <Link to={`/admin/inventory?tab=${condTab}&condition=${encodeURIComponent(cond._id)}`} key={cond._id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl cursor-pointer">
                  <span className="font-semibold text-slate-700">{cond._id || 'Unknown'}</span>
                  <span className="text-lg font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{cond.count}</span>
                </Link>
              );
            })}
            {(!metricsData.conditionBreakdown || metricsData.conditionBreakdown.length === 0) && (
              <p className="text-slate-500 text-sm">No condition data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-10">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Recent Workspace Requests</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-4">Employee</th>
                <th className="pb-4">Asset</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metricsData.recentRequests?.map(req => (
                <tr key={req._id}>
                  <td className="py-4 font-medium text-slate-800">{req.requester?.name || 'Unknown'}</td>
                  <td className="py-4 text-slate-600">{req.assetName}</td>
                  <td className="py-4">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase ${req.status === 'Pending' ? 'bg-amber-100 text-amber-700' : req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-slate-500">{new Date(req.requestDate).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!metricsData.recentRequests || metricsData.recentRequests.length === 0) && (
                <tr><td colSpan="4" className="py-6 text-center text-slate-500">No recent requests.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite User Modal */}
      <InviteModal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} />
    </div>
  );
}

function InviteModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Employee');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setInviteLink('');
    try {
      // Wiring up the backend endpoint we created earlier
      const res = await api.post('/auth/invite', { email, role });
      setInviteLink(res.data.registrationLink);
      toast.success('Invite generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Invite User</h2>
            <p className="text-slate-500 text-sm mb-6">Generate a secure 24-hour onboarding link for a new staff member.</p>

            {!inviteLink ? (
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-slate-50"
                    placeholder="colleague@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role Allocation</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-slate-50 appearance-none"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
                <div className="pt-2 flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center justify-center"
                  >
                    {loading ? 'Generating...' : 'Create Link'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckIcon />
                  </div>
                  <h3 className="font-bold text-emerald-800 mb-1">Link Generated!</h3>
                  <p className="text-xs text-emerald-600 mb-4">This token expires in exactly 24 hours.</p>

                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={inviteLink}
                      className="w-full px-4 py-3 pr-12 text-sm bg-white border border-emerald-200 rounded-lg text-slate-600 outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(inviteLink);
                        toast.success('Copied to clipboard');
                      }}
                      className="absolute right-2 top-2 p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors"
                    >
                      <CopyIcon />
                    </button>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-colors"
                >
                  Close Window
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Inline SVGs
function BoxIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function UserPlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );
}
function ActivityIcon() {
  return (
    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
