import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } }
};

export default function AssetTimeline() {
  const { id } = useParams();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get(`/assets/${id}/audit-logs`);
        setAuditLogs(res.data);
      } catch (err) {
        toast.error('Failed to fetch audit logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [id]);

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <div className="mb-10">
        <Link to="/admin/inventory" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center mb-4 transition-colors">
          &larr; Back to Inventory
        </Link>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Asset Audit Timeline</h1>
        <p className="text-slate-500 mt-1">Chronological history for device ID: <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{id}</span></p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <motion.div 
          className="relative pl-8 border-l-2 border-slate-100 space-y-12"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {auditLogs.map((log, idx) => (
            <motion.div key={log._id} variants={itemVariants} className="relative">
              {/* Timeline Dot */}
              <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white bg-indigo-500 shadow-sm" />
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between group">
                <div className="max-w-xl">
                  <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center space-x-2">
                    <span>{log.action}</span>
                    <ActionBadge action={log.action} />
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{log.details}</p>
                  
                  <div className="mt-3 flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {log.performedBy?.name?.charAt(0) || '?'}
                    </div>
                    <span className="text-xs font-medium text-slate-500">Action by {log.performedBy?.name || 'Unknown'}</span>
                  </div>
                </div>
                
                <div className="mt-2 sm:mt-0 text-left sm:text-right">
                  <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function ActionBadge({ action }) {
  let colorClass = 'bg-slate-100 text-slate-600';
  
  if (action === 'Created') colorClass = 'bg-emerald-100 text-emerald-700';
  if (action === 'Allocated') colorClass = 'bg-blue-100 text-blue-700';
  if (action === 'Returned') colorClass = 'bg-purple-100 text-purple-700';
  if (action === 'ConditionUpdated') colorClass = 'bg-amber-100 text-amber-700';

  return (
    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
      {action}
    </span>
  );
}
