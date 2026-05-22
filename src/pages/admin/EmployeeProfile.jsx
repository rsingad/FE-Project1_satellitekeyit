import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function EmployeeProfile() {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setProfileData(res.data);
      } catch (err) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto min-h-screen flex items-center justify-center">
        <div className="text-slate-400 font-medium animate-pulse">Loading profile...</div>
      </div>
    );
  }

  if (!profileData || !profileData.user) {
    return (
      <div className="p-8 max-w-5xl mx-auto min-h-screen flex items-center justify-center">
        <div className="text-rose-500 font-medium">User not found.</div>
      </div>
    );
  }

  const { user, assets, requests, auditLogs } = profileData;

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="mb-10 flex items-center gap-4">
        <Link to="/admin/staff" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 shadow-sm transition-colors border border-slate-100">
          &larr;
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Employee Profile</h1>
          <p className="text-slate-500 mt-1">Detailed view of user assets, requests, and activities.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: User Details */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600" />
            <div className="relative mt-8 text-center mb-6">
              <div className="w-24 h-24 mx-auto bg-white rounded-full p-2 shadow-lg mb-4">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 text-3xl font-black">
                  {user.name.charAt(0)}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
              <p className="text-slate-500 font-medium">{user.role}</p>
            </div>
            
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-slate-700 font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Database ID</p>
                <p className="text-slate-700 font-mono text-sm bg-slate-50 px-2 py-1 rounded w-fit border border-slate-100">{user._id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Account Status</p>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 font-bold text-xs uppercase tracking-wider rounded-full border border-emerald-100">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Assets and Requests */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Currently Assigned Assets */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">💻</span>
              Currently Assigned Assets
              <span className="ml-auto text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{assets.length}</span>
            </h3>
            
            {assets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {assets.map((asset) => (
                  <Link to={`/admin/inventory/${asset._id}`} key={asset._id} className="block bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{asset.name}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-500">
                        {asset.type}
                      </span>
                    </div>
                    {asset.type === 'Non-Consumable' && (
                      <p className="text-xs text-slate-500 font-mono mb-2">SN: {asset.serialNumber}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`w-2 h-2 rounded-full ${asset.condition === 'Good' || asset.condition === 'New' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="font-medium text-slate-600">{asset.condition}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                <p className="text-slate-400 font-medium">No assets currently assigned to this user.</p>
              </div>
            )}
          </div>

          {/* Request History */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">📋</span>
              Request History
            </h3>

            {requests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-4">Asset Requested</th>
                      <th className="pb-4">Date</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {requests.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4">
                          <p className="font-bold text-slate-700">{req.assetName}</p>
                          <p className="text-xs text-slate-500">{req.requestedAssetId?.type || 'Unknown'}</p>
                        </td>
                        <td className="py-4 text-sm font-medium text-slate-600">
                          {new Date(req.requestDate).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            req.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            req.status === 'Pending Return' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            req.status === 'Returned' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-4 text-right text-xs text-slate-500">
                          {req.assignedAssetId && (
                            <span className="block font-mono mb-1">SN: {req.assignedAssetId.serialNumber}</span>
                          )}
                          {req.approvedBy && (
                            <span>Processed by {req.approvedBy.name}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                <p className="text-slate-400 font-medium">No requests made by this user yet.</p>
              </div>
            )}
          </div>

          {/* Administrative Activity Log (Only for Admins/Managers) */}
          {(user.role === 'Admin' || user.role === 'Manager') && auditLogs && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">🛡️</span>
                Administrative Activity Log
              </h3>
              
              {auditLogs.length > 0 ? (
                <div className="space-y-4">
                  {auditLogs.map((log, idx) => (
                    <div key={log._id} className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="mt-1 w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-slate-800 text-sm">
                            {log.action}
                            {log.assetId && <span className="ml-2 text-indigo-600">[{log.assetId.name}]</span>}
                          </p>
                          <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                  <p className="text-slate-400 font-medium">No administrative actions recorded yet.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
