import { useState, useContext, useEffect, useMemo } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Users, Mail, Laptop, Cpu, AlertCircle, ArrowUpRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Employee');
  const [isInviting, setIsInviting] = useState(false);
  const [assets, setAssets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetRes, reqRes] = await Promise.all([
          api.get('/assets'),
          user.role !== 'Employee' ? api.get('/requests') : Promise.resolve({ data: [] })
        ]);
        setAssets(assetRes.data);
        setRequests(reqRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const myAssets = useMemo(() => assets.filter(a => a.assignedTo?._id === user._id), [assets, user._id]);
  
  // Stats for Admin
  const totalAssets = assets.length;
  const hardwareCount = assets.filter(a => a.type === 'Non-Consumable').length;
  const consumableCount = assets.filter(a => a.type === 'Consumable').length;
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const lowStock = assets.filter(a => a.type === 'Consumable' && a.quantity < a.threshold);

  const pieData = [
    { name: 'Available', value: assets.filter(a => a.type === 'Non-Consumable' && a.status === 'Available').length },
    { name: 'Allocated', value: assets.filter(a => a.type === 'Non-Consumable' && a.status === 'Allocated').length },
    { name: 'Maintenance', value: assets.filter(a => a.type === 'Non-Consumable' && a.status === 'Maintenance').length },
    { name: 'Scrapped', value: assets.filter(a => a.type === 'Non-Consumable' && a.status === 'Scrapped').length },
  ];

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      await api.post('/auth/invite', { email: inviteEmail, role: inviteRole });
      toast.success('Invitation link generated (check backend console)');
      setInviteEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invite');
    } finally {
      setIsInviting(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (loading) return <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.name}. Here's what's happening.</p>
        </div>
        <div className="text-sm font-medium px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 text-slate-600">
          Role: <span className="text-primary-600">{user?.role}</span>
        </div>
      </div>

      {(user?.role === 'Admin' || user?.role === 'Manager') && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Assets', val: totalAssets, icon: <Laptop />, color: 'text-blue-600', bg: 'bg-blue-100' },
              { label: 'Hardware Items', val: hardwareCount, icon: <Cpu />, color: 'text-indigo-600', bg: 'bg-indigo-100' },
              { label: 'Pending Requests', val: pendingRequests, icon: <AlertCircle />, color: 'text-amber-600', bg: 'bg-amber-100' },
              { label: 'Low Stock Alerts', val: lowStock.length, icon: <ArrowUpRight />, color: 'text-rose-600', bg: 'bg-rose-100' },
            ].map((stat, i) => (
              <motion.div variants={item} key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">{stat.val}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Charts */}
            <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-2">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Hardware Status Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pieData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={40}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Invite Form */}
            <motion.div variants={item} className="bg-gradient-to-br from-primary-600 to-primary-800 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
              {/* decorative circle */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                    <Users size={24} />
                  </div>
                  <h3 className="text-xl font-bold">Invite Colleague</h3>
                </div>
                <p className="text-primary-100 text-sm mb-6 leading-relaxed">
                  Generate a secure registration link to onboard a new employee or manager to the system.
                </p>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      className="w-full px-4 py-3 bg-primary-900/40 border border-primary-500/50 rounded-xl text-sm text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 backdrop-blur-sm transition-all"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <select
                      className="w-full px-4 py-3 bg-primary-900/40 border border-primary-500/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-400 backdrop-blur-sm transition-all appearance-none"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                    >
                      <option value="Employee" className="text-slate-900">Employee</option>
                      {user?.role === 'Admin' && <option value="Manager" className="text-slate-900">Manager</option>}
                    </select>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isInviting}
                    className="w-full flex items-center justify-center gap-2 bg-white text-primary-700 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-80"
                  >
                    <Mail size={18} />
                    {isInviting ? 'Generating Link...' : 'Send Invite'}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Employee Specific View (or Manager's personal view) */}
      <motion.div variants={item} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">My Assigned Hardware</h3>
        </div>
        
        {myAssets.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
            <Laptop className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No hardware assigned</h3>
            <p className="text-slate-500 mt-1 mb-6">You don't have any non-consumable assets assigned to you yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myAssets.map(asset => (
              <motion.div 
                whileHover={{ y: -4 }}
                key={asset._id} 
                className="group border border-slate-200 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md hover:border-primary-200 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary-100 p-2.5 rounded-xl text-primary-600">
                    <Laptop size={20} />
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    {asset.status}
                  </span>
                </div>
                <h4 className="font-bold text-lg text-slate-900 mb-1">{asset.name}</h4>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Serial Number</span>
                    <span className="font-mono text-slate-700 font-medium">{asset.serialNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Condition</span>
                    <span className="text-slate-700 font-medium">{asset.condition}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

    </motion.div>
  );
};

export default Dashboard;
