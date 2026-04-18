import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
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
        // Save user details to browser storage
        localStorage.setItem('userId', data.user_id);
        localStorage.setItem('userName', data.name);
        
        // Route new users to Onboarding, returning users to Dashboard
        if (isLogin) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      } else {
        setError(data.detail || 'Authentication failed');
      }
    } catch (err) {
      setError('Cannot connect to the server. Is Python running?');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center font-sans p-4">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-4" role="img" aria-label="brain">🧠</span>
        <h1 className="text-3xl font-extrabold text-slate-900">AI Roadmap Tracker</h1>
        <p className="text-slate-500 mt-2">Your path to becoming placement-ready.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-md">
        <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
            <input 
              type="email" 
              required 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="student@college.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#1e40af] text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-800 transition-colors mt-2 disabled:bg-blue-400"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In & Continue' : 'Register & Start Journey')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            className="text-blue-600 font-bold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;