import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { Users, CheckCircle2, XCircle, LayoutDashboard, Mail, KeyRound, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

// --- Axios Interceptor to automatically inject JWT token ---
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Check if token exists on load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoadingAuth(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    toast.success('Logged out securely');
  };

  if (loadingAuth) return null;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#334155', color: '#fff' }
      }} />

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <LoginView key="login" onLogin={() => setIsAuthenticated(true)} />
        ) : (
          <DashboardView key="dashboard" onLogout={handleLogout} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Login View Component ---
function LoginView({ onLogin }) {
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!userid || !password) return;
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { userid, password });
      localStorage.setItem('auth_token', response.data.token);
      toast.success('Authentication successful!');
      onLogin();    
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-md mx-auto mt-20 p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl relative overflow-hidden"
    >
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
      
      <div className="text-center mb-8 relative z-10">
        <div className="mb-4 inline-flex p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <KeyRound className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">System Login</h2>
        <p className="text-sm text-slate-400 mt-2">Enter your credentials to manage payments</p>
      </div>

      <motion.form onSubmit={handleAuth} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 relative z-10">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">User ID</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Users className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={userid}
              onChange={(e) => setUserid(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-700 bg-slate-800/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="admin"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-4 py-3 border border-slate-700 bg-slate-800/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="••••••••"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 mt-2 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Authenticating...' : 'Secure Login'}
        </button>
      </motion.form>
    </motion.div>
  );
}

// --- Original Dashboard Component ---
function DashboardView({ onLogout }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${API_URL}/members`);
      setMembers(response.data.members || []);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        onLogout(); // Session expired
      } else {
        toast.error('Failed to load members.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/members/${id}/status`, { status: newStatus });
      setMembers(members.map(m => m.id === id ? { ...m, payment_status: newStatus } : m));
      toast.success(`Marked as ${newStatus}`);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        onLogout();
      } else {
        toast.error('Failed to update status.');
      }
    }
  };

  const totalMembers = members.length;
  const paidMembers = members.filter(m => m.payment_status === 'Paid').length;
  const pendingMembers = members.filter(m => m.payment_status === 'Not Paid').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-6xl mx-auto space-y-8">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                <LayoutDashboard className="w-8 h-8 text-blue-400" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Payment Tracker</h1>
                <p className="text-slate-400 mt-1">Manage monthly subscriptions securely.</p>
            </div>
        </div>
        <button onClick={onLogout} className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Total Members" value={totalMembers} icon={<Users className="w-6 h-6 text-indigo-400" />} bg="bg-indigo-500/10 border-indigo-500/20" />
        <SummaryCard title="Paid Members" value={paidMembers} icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />} bg="bg-emerald-500/10 border-emerald-500/20" />
        <SummaryCard title="Pending Members" value={pendingMembers} icon={<XCircle className="w-6 h-6 text-rose-400" />} bg="bg-rose-500/10 border-rose-500/20" />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2 text-slate-200">
          <span>Member Directory</span>
          <span className="bg-slate-800 text-xs px-2.5 py-1 rounded-full border border-slate-700">{totalMembers}</span>
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {[...members]
                .sort((a, b) => {
                  if (a.payment_status === 'Not Paid' && b.payment_status === 'Paid') return -1;
                  if (a.payment_status === 'Paid' && b.payment_status === 'Not Paid') return 1;
                  return 0;
                })
                .map(member => (
                  <MemberCard key={member.id} member={member} onUpdate={updateStatus} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function SummaryCard({ title, value, icon, bg }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5 }} transition={{ duration: 0.3 }} className={`p-6 rounded-3xl border backdrop-blur-sm ${bg} flex items-center justify-between shadow-xl`}>
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <p className="text-4xl font-bold text-white">{value}</p>
      </div>
      <div className="p-4 bg-slate-900/50 rounded-2xl">{icon}</div>
    </motion.div>
  );
}

function MemberCard({ member, onUpdate }) {
  const isPaid = member.payment_status === 'Paid';
  const photoUrl = `/photos/${member.name.replace(/ /g, '_')}.jpeg`;

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ scale: 1.02, translateY: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className={`p-5 rounded-3xl border backdrop-blur-md relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow-lg ${isPaid ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-slate-900/50 border-slate-800'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4">
          <img 
            src={photoUrl} 
            onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${member.name}&backgroundColor=1e293b&textColor=cbd5e1`; 
            }}
            alt={member.name}
            className={`w-16 h-16 rounded-full border-2 object-cover ${isPaid ? 'border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'border-slate-700'}`}
          />
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">{member.name}</h3>
            <p className="text-xs text-slate-400 mt-1 capitalize">Month: {member.month}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 shrink-0 ${isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          <span>{member.payment_status}</span>
        </div>
      </div>

      <div className="flex space-x-3 mt-auto">
        <button onClick={() => onUpdate(member.id, 'Paid')} disabled={isPaid} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isPaid ? 'opacity-50 cursor-not-allowed bg-emerald-500/5 text-emerald-500/50 border border-emerald-500/10' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-400/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}>Mark Paid</button>
        <button onClick={() => onUpdate(member.id, 'Not Paid')} disabled={!isPaid} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${!isPaid ? 'opacity-50 cursor-not-allowed bg-rose-500/5 text-rose-500/50 border border-rose-500/10' : 'bg-slate-800 text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]'}`}>Revoke</button>
      </div>

      {isPaid && <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />}
    </motion.div>
  );
}

export default App;
