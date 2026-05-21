import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Package, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-sm lg:w-96"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-2 rounded-xl text-white shadow-lg shadow-primary-600/30">
                <Package size={28} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AssetMaster</h1>
            </div>
            <h2 className="mt-8 text-3xl font-extrabold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">Sign in to manage your workspace inventory.</p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email address</label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    required
                    className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-shadow text-sm"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="mt-1 relative">
                  <input
                    type="password"
                    required
                    className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-shadow text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-600/30 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                  {!isLoading && <ArrowRight size={18} />}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Image/Graphic */}
      <div className="hidden lg:block relative w-0 flex-1 bg-primary-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-slate-900 opacity-90 z-0"></div>
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white px-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="glass-dark p-8 rounded-2xl max-w-md w-full"
          >
            <ShieldCheck size={48} className="text-primary-300 mb-6" />
            <h3 className="text-2xl font-bold mb-4">Secure & Centralized</h3>
            <p className="text-slate-300 leading-relaxed mb-6">
              Manage all your company's hardware and consumable assets in one place. Streamline requests, track assignments, and never run out of stock.
            </p>
            <div className="flex items-center gap-4 text-sm font-medium text-primary-200">
              <div className="h-1 flex-1 bg-primary-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary-400 w-2/3 rounded-full"></div>
              </div>
              Trusted by IT Teams
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
