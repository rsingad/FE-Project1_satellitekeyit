import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function EmployeeMatrix() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const res = await api.get('/users/matrix');
        setEmployees(res.data);
      } catch (err) {
        toast.error('Failed to load employee matrix');
      } finally {
        setLoading(false);
      }
    };
    fetchMatrix();
  }, []);
  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Employee Allocation Matrix</h1>
        <p className="text-slate-500 mt-1">System active members roster and current operational asset catalogs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((emp, idx) => (
          <motion.div
            key={emp.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow group flex flex-col h-full"
          >
            {/* Header Section */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 leading-tight">{emp.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{emp.role}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${
                emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                {emp.status}
              </span>
            </div>

            {/* Employee Meta Info */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Database ID:</span>
                <span className="font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded text-xs border border-slate-100">{emp.id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-600 truncate max-w-[150px]">{emp.email}</span>
              </div>
            </div>

            {/* Asset Allocation Section */}
            <div className="mt-auto pt-5 border-t border-slate-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Allocated Assets</span>
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
                  {emp.assets.length}
                </span>
              </div>
              
              {emp.assets.length > 0 ? (
                <ul className="space-y-2">
                  {emp.assets.map((asset, i) => (
                    <li key={i} className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 group-hover:bg-indigo-50/30 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2" />
                      <span className="truncate">{asset.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="text-xs text-slate-400">No operational assets allocated</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
