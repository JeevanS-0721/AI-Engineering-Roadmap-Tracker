import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  // Using email state to hold the "Student ID" so it matches our existing backend
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userId', data.user_id);
        localStorage.setItem('userName', data.name);
        
        // Everyone goes to dashboard in the new flow, Domain Explorer is accessed from there
        navigate('/dashboard');
      } else {
        setError(data.detail || 'Authentication failed');
      }
    } catch (err) {
      setError('Cannot connect to the server. Is Python running?');
    }
    setIsLoading(false);
  };

  return (
    // Dark background matching the ProPath OS design
    <div className="min-h-screen bg-[#131b2f] flex flex-col justify-center items-center font-sans p-4">
      
      {/* Main Login Card */}
      <div className="bg-[#1e273f] p-10 rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-md">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-500 p-3 rounded-xl mb-4 shadow-lg shadow-indigo-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">ProPath OS</h1>
         
        </div>
        
        {error && (
          <div className="bg-red-900/50 text-red-300 p-3 rounded-lg text-sm mb-6 border border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 tracking-wider uppercase">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full p-3 bg-[#131b2f] border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter Name..."
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 tracking-wider uppercase">Student ID (Email)</label>
            <input 
              type="text" 
              required 
              className="w-full p-3 bg-[#131b2f] border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter ID..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 tracking-wider uppercase">Password</label>
            <input 
              type="password" 
              required 
              className="w-full p-3 bg-[#131b2f] border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-indigo-600 transition-colors mt-4 disabled:bg-indigo-500/50 flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/25"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
            {!isLoading && <span>→</span>}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            className="hover:text-indigo-400 transition-colors"
          >
            {isLogin ? "Need an account? Register here" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;