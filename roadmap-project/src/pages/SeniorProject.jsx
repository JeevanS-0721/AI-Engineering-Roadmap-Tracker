import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function SeniorProject() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || "Student";
  const location = useLocation();
  const [file, setFile] = useState(null);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="bg-[#131b2f] text-white py-4 px-8 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold text-indigo-400 tracking-wide cursor-pointer" onClick={() => navigate('/dashboard')}>ProPath OS</h1>
        
        <div className="hidden md:flex space-x-8 text-sm font-medium">
          <span className={`cursor-pointer transition-colors ${isActive('/dashboard') ? 'text-white font-bold' : 'text-slate-400 hover:text-white'}`} onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span className={`cursor-pointer transition-colors ${isActive('/roadmap') ? 'text-white font-bold' : 'text-slate-400 hover:text-white'}`} onClick={() => navigate('/roadmap')}>Roadmap</span>
          <span className={`cursor-pointer transition-colors ${isActive('/senior-project') ? 'text-white font-bold' : 'text-slate-400 hover:text-white'}`} onClick={() => navigate('/senior-project')}>Senior Project</span>
          <span className={`cursor-pointer transition-colors ${isActive('/domain-explore') ? 'text-white font-bold' : 'text-slate-400 hover:text-white'}`} onClick={() => navigate('/domain-explore')}>Domain Explore</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-white">{userName}</div>
            <div className="text-xs text-slate-400">Not Selected</div>
          </div>
          <button onClick={handleLogout} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-indigo-600 font-bold mb-8 hover:text-indigo-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </button>

        <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-200">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Senior Project Portal</h2>
          <p className="text-slate-500 mb-8">Upload your final documentation and source code for review.</p>

          <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl p-12 text-center hover:bg-indigo-50 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleFileChange}
              accept=".pdf,.zip,.docx"
            />
            <div className="text-indigo-500 mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">
              {file ? file.name : "Drag & Drop files here"}
            </h3>
            <p className="text-slate-400 text-sm">Support PDF, ZIP, or DOCX (Max 50MB)</p>
          </div>

          <div className="mt-8">
            <h4 className="font-bold text-slate-800 mb-3">Submission Requirements:</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-slate-600 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Abstract & Introduction
              </li>
              <li className="flex items-center text-slate-600 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Source Code Repository
              </li>
            </ul>
          </div>

          <button 
            className={`w-full mt-8 py-4 rounded-xl font-bold text-white transition-all shadow-lg ${file ? 'bg-[#131b2f] hover:bg-slate-800 shadow-slate-900/20' : 'bg-slate-300 cursor-not-allowed'}`}
            disabled={!file}
          >
            {file ? "Submit Project" : "Please select a file to submit"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default SeniorProject;