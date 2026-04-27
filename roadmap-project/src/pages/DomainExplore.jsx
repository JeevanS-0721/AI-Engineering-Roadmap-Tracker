import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function DomainExplore() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || "Student";
  const location = useLocation();

  const [currentStep, setCurrentStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [scores, setScores] = useState({ aiml: 0, web: 0, data: 0, design: 0, cloud: 0, cyber: 0 });
  // NEW: State to track the domain the user actually wants to select
  const [selectedDomainKey, setSelectedDomainKey] = useState(null);

  const isActive = (path) => location.pathname === path;

  // Dynamic Quiz Questions mapped to domains
  const questions = [
    { text: "Do you like extracting insights from raw numbers?", domains: ['data', 'aiml'] },
    { text: "Are you fascinated by training models to recognize patterns?", domains: ['aiml'] },
    { text: "Do you enjoy designing and building user interfaces?", domains: ['design', 'web'] },
    { text: "Do you prefer architecting scalable servers and databases?", domains: ['web', 'cloud'] },
    { text: "Are you interested in ethical hacking and securing networks?", domains: ['cyber'] },
    { text: "Do you like automating deployments and managing infrastructure?", domains: ['cloud'] }
  ];

  const resultsDB = {
    aiml: { title: "Artificial Intelligence & ML", jobs: "ML Engineer, AI Researcher", package: "$110k - $180k", score: "9.8/10 (High Growth)" },
    web: { title: "Full Stack Dev", jobs: "Frontend Architect, Backend Engineer", package: "$90k - $150k", score: "9.2/10 (Stable)" },
    data: { title: "Data Science", jobs: "Data Analyst, Data Scientist", package: "$100k - $160k", score: "9.5/10 (High Demand)" },
    design: { title: "UI/UX Design", jobs: "Product Designer, UX Researcher", package: "$85k - $140k", score: "8.9/10 (Creative)" },
    cloud: { title: "Cloud Computing", jobs: "Cloud Architect, DevOps Engineer", package: "$105k - $170k", score: "9.6/10 (High Demand)" },
    cyber: { title: "Cybersecurity", jobs: "Security Analyst, Ethical Hacker", package: "$95k - $160k", score: "9.7/10 (Critical Need)" }
  };

  const handleAnswer = (isYes) => {
    let newScores = { ...scores };
    
    if (isYes) {
      const currentDomains = questions[currentStep].domains;
      currentDomains.forEach(d => newScores[d] += 1);
      setScores(newScores);
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate winner on the final step
      const winnerKey = Object.keys(newScores).reduce((a, b) => newScores[a] > newScores[b] ? a : b);
      const finalWinner = newScores[winnerKey] === 0 ? 'aiml' : winnerKey;
      
      // Set both the AI's result AND the user's selected choice to the winner initially
      setSelectedDomainKey(finalWinner);
      setShowResult(true);
    }
  };

  const saveAndReturn = () => {
    // Save whatever the user actively selected at the end
    const winningDomain = resultsDB[selectedDomainKey].title;
    navigate('/dashboard', { state: { domain: winningDomain } });
  };

  // The data for the currently selected card
  const activeResult = selectedDomainKey ? resultsDB[selectedDomainKey] : null;

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-slate-300">
      <nav className="py-4 px-8 flex justify-between items-center border-b border-slate-800">
        <h1 className="text-2xl font-bold text-indigo-400 tracking-wide cursor-pointer" onClick={() => navigate('/dashboard')}>ProPath OS</h1>
        <div className="hidden md:flex space-x-8 text-sm font-medium">
          <span className={`cursor-pointer transition-colors ${isActive('/dashboard') ? 'text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`} onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span className={`cursor-pointer transition-colors ${isActive('/roadmap') ? 'text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`} onClick={() => navigate('/roadmap')}>Roadmap</span>
          <span className={`cursor-pointer transition-colors ${isActive('/senior-project') ? 'text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`} onClick={() => navigate('/senior-project')}>Senior Project</span>
          <span className={`cursor-pointer transition-colors ${isActive('/domain-explore') ? 'text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`} onClick={() => navigate('/domain-explore')}>Domain Explore</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-200">{userName}</div>
            <div className="text-xs text-slate-500">Exploring</div>
          </div>
          <button onClick={() => navigate('/login')} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center pt-20 px-4 pb-20">
        <div className="text-indigo-500 mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        </div>

        {!showResult ? (
          <div className="bg-[#1e293b] p-10 rounded-[2rem] border border-slate-700/50 shadow-2xl w-full max-w-lg text-center animate-fade-in-up">
            <p className="text-indigo-400 text-sm font-bold tracking-wider mb-6">Question {currentStep + 1} / {questions.length}</p>
            <h2 className="text-2xl font-bold text-white mb-10 leading-relaxed">
              {questions[currentStep].text}
            </h2>
            <div className="flex gap-4 justify-center">
              <button onClick={() => handleAnswer(true)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                Yes
              </button>
              <button onClick={() => handleAnswer(false)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2">
                No
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-lg text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold text-white mb-2">AI Career Analysis</h2>
            <p className="text-slate-400 mb-8">Based on your interests, we recommend:</p>

            <div className="bg-[#1e293b] p-8 md:p-10 rounded-[2rem] border border-slate-700/50 shadow-2xl text-left">
              <h3 className="text-2xl font-bold text-indigo-400 mb-8">{activeResult.title}</h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <div><span className="text-white font-bold block mb-1">Top Jobs:</span><span className="text-slate-400 text-sm">{activeResult.jobs}</span></div>
                </div>
                <div className="flex items-start gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div><span className="text-white font-bold block mb-1">Current Package:</span><span className="text-slate-400 text-sm">{activeResult.package}</span></div>
                </div>
                <div className="flex items-start gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  <div><span className="text-white font-bold block mb-1">Industry Score:</span><span className="text-slate-400 text-sm">{activeResult.score}</span></div>
                </div>
              </div>

              {/* NEW: Manual Override Grid */}
              <div className="pt-6 border-t border-slate-700/50 mb-8">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Or choose a different path:</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(resultsDB).map(([key, data]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedDomainKey(key)}
                      className={`p-3 rounded-xl text-xs font-bold transition-all border text-center ${
                        selectedDomainKey === key
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                          : 'bg-[#0f172a] border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                      }`}
                    >
                      {data.title}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={saveAndReturn} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
                Confirm & Save to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DomainExplore;