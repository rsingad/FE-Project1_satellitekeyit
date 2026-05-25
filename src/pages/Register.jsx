import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Package, ArrowRight, UserPlus, Lock, User, ShieldCheck, Fingerprint, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const { setUser, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const backgroundRef = useRef(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Voice Synthesis Function (Returns a Promise)
  const speak = (text) => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop any current speech
        const utterance = new SpeechSynthesisUtterance(text);
        
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB'));
        if (enVoice) {
          utterance.voice = enVoice;
        }
        
        utterance.pitch = 0.8; 
        utterance.rate = 1.05; 
        
        utterance.onend = () => resolve();
        utterance.onerror = (e) => {
          console.error("Voice playback error:", e);
          resolve(); 
        };
        
        window.speechSynthesis.speak(utterance);
        
        setTimeout(resolve, 3000); // fallback
      } else {
        console.error("Text-to-Speech is not supported in this browser.");
        resolve();
      }
    });
  };

  // GSAP Background Animation & Parallax
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.to(".blob1", { y: "random(-100, 100)", x: "random(-100, 100)", duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".blob2", { y: "random(-150, 150)", x: "random(-100, 100)", duration: 12, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".blob3", { scale: 1.2, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });

      // Mouse Parallax Effect on the Right Hero Section
      const moveHero = (e) => {
        if (focusedField) return;
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 40;
        const yPos = (clientY / window.innerHeight - 0.5) * 40;

        gsap.to(".hero-parallax", {
          rotateY: xPos,
          rotateX: -yPos,
          duration: 1,
          ease: "power2.out"
        });
      };

      window.addEventListener("mousemove", moveHero);
      return () => window.removeEventListener("mousemove", moveHero);
    }, backgroundRef);
    return () => ctx.revert();
  }, [focusedField]);

  useEffect(() => {
    if (!token) {
      toast.error('Note: No token provided in URL. Form is in preview mode.', {
        style: { borderRadius: '12px', background: '#334155', color: '#fff', border: '1px solid #475569' }
      });
      // navigate('/login'); // Temporarily disabled so you can preview the UI
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Voice prompt for verification
    speak("Welcome to the system. Security check is in progress. If you are valid, access will be granted.");
    
    try {
      const { data } = await api.post(`/auth/register/${token}`, { 
        name, 
        email,
        password 
      });
      
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Registration Protocol Complete', {
        style: { borderRadius: '12px', background: '#064e3b', color: '#fff', border: '1px solid #059669' }
      });
      
      // Voice prompt for success - WE AWAIT THIS BEFORE NAVIGATING
      await speak(`Identity verified. Welcome to the system, ${data.name || name}.`);
      
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      speak("Registration failed. Invalid or expired token.");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: "easeOut" } }
  };

  const lookRotation = Math.min(Math.max((name.length * 2) - 20, -30), 30);

  return (
    <div ref={backgroundRef} className="min-h-screen flex bg-[#030014] overflow-hidden relative selection:bg-cyan-500/30 text-slate-200">
      {/* Background Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob1 absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-600/20 blur-[120px] mix-blend-screen" />
        <div className="blob2 absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-600/20 blur-[130px] mix-blend-screen" />
        <div className="blob3 absolute top-[30%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-teal-600/10 blur-[100px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] opacity-50" />
      </div>

      {/* Left Side - Form Container */}
      <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 z-10 relative">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

            <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mb-8">
              <div className="bg-gradient-to-br from-cyan-500 to-emerald-600 p-2.5 rounded-2xl shadow-[0_0_15px_rgba(34,211,238,0.4)] border border-white/10">
                <UserPlus size={28} className="text-white" />
              </div>
              <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
                Profile Setup
              </h1>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center mb-10">
              <h2 className="text-xl font-semibold text-white mb-2">Establish Identity</h2>
              <p className="text-sm text-slate-400">Configure your credentials to join the secure workspace.</p>
            </motion.div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Entity Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:bg-black/40 transition-all text-sm font-mono"
                    placeholder="E.g. Alan Turing"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Assigned Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:bg-black/40 transition-all text-sm font-mono"
                    placeholder="E.g. admin@system.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Encryption Key (Password)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:bg-black/40 transition-all text-sm font-mono"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.01, boxShadow: "0px 0px 20px rgba(16, 185, 129, 0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 border border-emerald-400/30 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />

                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Initializing Profile...
                      </span>
                    ) : (
                      <>
                        Initialize Connection <ArrowRight size={18} />
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>
          </div>
          
          <motion.p variants={itemVariants} className="text-center text-slate-500 text-xs mt-8 font-medium">
            Identity verification protocols active.
          </motion.p>
        </motion.div>
      </div>

      {/* Right Side - Interactive 3D Core */}
      <div className="hidden lg:flex relative w-0 flex-1 items-center justify-center z-10 overflow-hidden" style={{ perspective: '1000px' }}>

        {/* Glow effect that changes color based on focus */}
        <motion.div
          animate={{
            backgroundColor: focusedField === 'password' ? 'rgba(16, 185, 129, 0.4)' : focusedField === 'email' ? 'rgba(168, 85, 247, 0.4)' : focusedField === 'name' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(20, 184, 166, 0.3)',
            scale: focusedField === 'password' ? 0.8 : 1.2
          }}
          transition={{ duration: 0.8 }}
          className="absolute w-96 h-96 rounded-full blur-[100px] z-0"
        />

        <motion.div
          className="hero-parallax relative z-10 flex flex-col items-center justify-center w-full h-full"
          animate={{
            rotateX: focusedField === 'name' ? 10 : focusedField === 'email' ? -10 : focusedField === 'password' ? -20 : 0,
            rotateY: focusedField === 'name' ? lookRotation : focusedField === 'email' ? lookRotation : focusedField === 'password' ? 0 : 0,
            scale: focusedField === 'password' ? 0.9 : 1
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
        >

          {/* Outer Ring - Spins constantly, but stops/shields when typing password */}
          <motion.div
            animate={{
              rotateZ: focusedField === 'password' ? 90 : 360,
              rotateX: focusedField === 'password' ? 80 : 0,
              borderColor: focusedField === 'password' ? 'rgba(16, 185, 129, 0.8)' : 'rgba(20, 184, 166, 0.3)'
            }}
            transition={{
              rotateZ: focusedField === 'password' ? { duration: 0.5 } : { duration: 20, repeat: Infinity, ease: "linear" },
              rotateX: { duration: 0.8, type: "spring" }
            }}
            className="absolute w-72 h-72 rounded-full border-4 border-dashed z-20"
            style={{ transformStyle: 'preserve-3d' }}
          />

          {/* Middle Ring */}
          <motion.div
            animate={{
              rotateZ: focusedField === 'password' ? -90 : -360,
              rotateY: focusedField === 'password' ? 80 : 0,
              borderColor: focusedField === 'password' ? 'rgba(16, 185, 129, 0.6)' : 'rgba(6, 182, 212, 0.4)'
            }}
            transition={{
              rotateZ: focusedField === 'password' ? { duration: 0.5 } : { duration: 15, repeat: Infinity, ease: "linear" },
              rotateY: { duration: 0.8, type: "spring" }
            }}
            className="absolute w-56 h-56 rounded-full border-2 border-solid z-10"
            style={{ transformStyle: 'preserve-3d' }}
          />

          {/* Inner Core */}
          <motion.div
            className="relative flex items-center justify-center w-32 h-32 rounded-full bg-black/50 backdrop-blur-md border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-30"
            animate={{
              boxShadow: focusedField === 'password' ? "0 0 80px rgba(16, 185, 129, 0.6)" : focusedField === 'name' ? "0 0 80px rgba(6, 182, 212, 0.6)" : "0 0 40px rgba(20, 184, 166, 0.4)"
            }}
          >
            <AnimatePresence mode="wait">
              {focusedField === 'password' ? (
                <motion.div
                  key="lock"
                  initial={{ scale: 0, opacity: 0, rotateY: 180 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  exit={{ scale: 0, opacity: 0, rotateY: -180 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <Lock size={48} className="text-emerald-400" />
                </motion.div>
              ) : focusedField === 'email' ? (
                <motion.div
                  key="mail"
                  initial={{ scale: 0, opacity: 0, rotateY: 180 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  exit={{ scale: 0, opacity: 0, rotateY: -180 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <Mail size={48} className="text-purple-400" />
                </motion.div>
              ) : focusedField === 'name' ? (
                <motion.div
                  key="user"
                  initial={{ scale: 0, opacity: 0, rotateY: 180 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  exit={{ scale: 0, opacity: 0, rotateY: -180 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <User size={48} className="text-cyan-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="fingerprint"
                  initial={{ scale: 0, opacity: 0, rotateY: 180 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  exit={{ scale: 0, opacity: 0, rotateY: -180 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <Fingerprint size={56} strokeWidth={1} className="text-teal-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </motion.div>

        {/* Helper Text below the core */}
        <motion.div
          className="absolute bottom-20 text-center"
          animate={{ opacity: focusedField ? 0 : 1, y: focusedField ? 20 : 0 }}
        >
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
            <ShieldCheck size={16} className="text-teal-400" />
            Initialization Core Ready
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Register;
