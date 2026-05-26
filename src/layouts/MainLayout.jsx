import { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useContext(AuthContext);

  return (
    <div className="flex h-screen bg-[#030014] overflow-hidden font-sans relative selection:bg-indigo-500/30 text-slate-200">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar Wrapper */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex-shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar role={user?.role} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden flex flex-shrink-0 items-center justify-between bg-[#0f172a] p-4 text-white z-10 shadow-md">
          <h1 className="text-xl font-black tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-500">Nexus</span>
            <span className="font-light text-slate-400">Assets</span>
          </h1>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-slate-300 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-900/10 to-transparent -z-10"></div>
        <div className="absolute top-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/5 blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-600/5 blur-[130px] -z-10 pointer-events-none" />

        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
