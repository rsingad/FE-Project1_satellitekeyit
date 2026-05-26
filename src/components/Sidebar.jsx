import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const adminRoutes = [
  { name: 'Dashboard Overview', path: '/admin/dashboard', icon: DashboardIcon },
  { name: 'Inventory Manager', path: '/admin/inventory', icon: InventoryIcon },
  { name: 'Requests Queue', path: '/admin/requests', icon: QueueIcon },
  { name: 'Staff Matrix', path: '/admin/staff', icon: StaffIcon },
  { name: 'My Profile', path: '/profile', icon: UserIcon },
];

const employeeRoutes = [
  { name: 'Dashboard Overview', path: '/employee/dashboard', icon: DashboardIcon },
  { name: 'My Assigned Assets', path: '/employee/assets', icon: HomeIcon },
  { name: 'Requisition & History', path: '/employee/requests', icon: FormIcon },
  { name: 'My Profile', path: '/profile', icon: UserIcon },
];

export default function Sidebar({ role = 'Admin', closeMobileMenu }) {
  // Using useLocation from react-router-dom to highlight the active route
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const routes = role === 'Admin' ? adminRoutes : employeeRoutes;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-full h-full bg-[#0f172a] text-slate-300 flex flex-col border-r border-slate-800 shadow-2xl z-50">
      {/* Brand Logo Header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
        <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 to-purple-500">
          Nexus<span className="font-light text-slate-400">Assets</span>
        </h1>
      </div>

      {/* Navigation Routes */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {routes.map((route) => {
          // Check if current URL matches the route's path
          const isActive = location.pathname === route.path || location.pathname.startsWith(route.path + '/');

          return (
            <Link
              key={route.path}
              to={route.path}
              onClick={() => closeMobileMenu && closeMobileMenu()}
              className={`relative flex items-center px-4 py-3.5 rounded-xl transition-colors duration-200 group ${isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
            >
              {/* Active Indicator Sliding Line */}
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute left-0 w-1.5 h-7 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Active Background using Shared Layout Animation */}
              {isActive && (
                <motion.div
                  layoutId="active-nav-background"
                  className="absolute inset-0 bg-slate-800/80 rounded-xl z-0"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <span className="mr-3.5 z-10 relative">
                <route.icon isActive={isActive} />
              </span>
              <span className="text-sm font-medium z-10 relative tracking-wide">
                {route.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-800/50">
        <div className="flex items-center space-x-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
            {role === 'Admin' ? 'AD' : 'EM'}
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-sm font-semibold text-white tracking-wide">{role === 'Admin' ? 'Administrator' : 'Employee'}</span>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              Online Status
            </span>
          </div>
          <button 
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

// --------------------------------------------------------
// Custom SVG Icons ensuring no external icon library deps
// --------------------------------------------------------

function DashboardIcon({ isActive }) {
  return (
    <svg className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function InventoryIcon({ isActive }) {
  return (
    <svg className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function QueueIcon({ isActive }) {
  return (
    <svg className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function StaffIcon({ isActive }) {
  return (
    <svg className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function HomeIcon({ isActive }) {
  return (
    <svg className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function FormIcon({ isActive }) {
  return (
    <svg className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function HistoryIcon({ isActive }) {
  return (
    <svg className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function UserIcon({ isActive }) {
  return (
    <svg className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
