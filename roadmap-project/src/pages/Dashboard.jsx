import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const USER_ID = localStorage.getItem('userId') || 1;
  const userName = localStorage.getItem('userName') || "Student";

  const formatDomain = (dom) => dom === "Artificial Intelligence & ML" ? "AI/ML" : dom;
  const incomingDomain = location.state?.domain;
  
  const [userDomain, setUserDomain] = useState(formatDomain(incomingDomain) || "Data Science");
  const [skills, setSkills] = useState({ python: 0, ml: 0, projects: 0, certs: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  
  const [isPredicting, setIsPredicting] = useState(false);
  const [aiPrediction, setAiPrediction] = useState({ placement_ready: false, message: "Analyzing...", confidence: 0 });

  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [newClassInfo, setNewClassInfo] = useState({ title: '', time: '' });
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem(`schedule_${USER_ID}`);
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, title: "Data Structures", time: "10:00 AM", color: "emerald" },
      { id: 2, title: "Digital Electronics", time: "01:30 PM", color: "amber" }
    ];
  });

  // --- NEW: OPPORTUNITIES STATE ---
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [appliedRoles, setAppliedRoles] = useState([]);

  useEffect(() => {
    localStorage.setItem(`schedule_${USER_ID}`, JSON.stringify(schedule));
  }, [schedule, USER_ID]);

  const handleAddClass = () => {
    if (!newClassInfo.title || !newClassInfo.time) return;
    const colors = ['emerald', 'amber', 'indigo', 'rose', 'purple'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    setSchedule([...schedule, { 
      id: Date.now(), 
      title: newClassInfo.title, 
      time: newClassInfo.time, 
      color: randomColor 
    }]);
    setNewClassInfo({ title: '', time: '' });
  };

  const handleRemoveClass = (id) => {
    setSchedule(schedule.filter(item => item.id !== id));
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/user/${USER_ID}/load`);
        const data = await res.json();
        
        if (data.exists) {
          setSkills(data.skills);
          if (incomingDomain) {
            const finalDomain = formatDomain(incomingDomain);
            setUserDomain(finalDomain);
            await fetch(`http://127.0.0.1:8000/api/user/${USER_ID}/save`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                domain: finalDomain,
                year: data.year || "1st Year",
                skills: data.skills,
                tasks: data.tasks || []
              })
            });
          } else {
            setUserDomain(data.domain);
          }
        }
      } catch (err) { console.error(err); }
    };
    fetchUser();
  }, [USER_ID, incomingDomain]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data);
        }
      } catch (err) { console.error("Leaderboard fetch failed", err); }
    };
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (skills.python === 0 && skills.ml === 0 && skills.projects === 0) return;
      
      setIsPredicting(true);
      try {
        const res = await fetch('http://127.0.0.1:8000/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(skills) 
        });
        if (res.ok) {
          const data = await res.json();
          setTimeout(() => { 
            setAiPrediction(data); 
            setIsPredicting(false); 
          }, 800);
        }
      } catch (err) { setIsPredicting(false); }
    };
    fetchPrediction();
  }, [skills]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getDaysArray = () => {
    const days = [];
    const today = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = -2; i <= 2; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push({ name: dayNames[d.getDay()], date: d.getDate(), isToday: i === 0 });
    }
    return days;
  };
  const calendarDays = getDaysArray();

  const opportunitiesData = {
    "AI/ML": [
      { type: "HACKATHON", title: "Kaggle Comp", color: "indigo", btnColor: "text-indigo-600 bg-indigo-50" },
      { type: "INTERNSHIP", title: "OpenAI Intern", color: "emerald", btnColor: "text-emerald-600 bg-emerald-50" },
      { type: "JOB", title: "ML Engineer", color: "rose", btnColor: "text-rose-500 bg-rose-50" }
    ],
    "Full Stack Dev": [
      { type: "HACKATHON", title: "Reactathon", color: "indigo", btnColor: "text-indigo-600 bg-indigo-50" },
      { type: "INTERNSHIP", title: "Vercel Intern", color: "emerald", btnColor: "text-emerald-600 bg-emerald-50" },
      { type: "JOB", title: "SDE-1 Role", color: "rose", btnColor: "text-rose-500 bg-rose-50" }
    ],
    "Data Science": [
      { type: "HACKATHON", title: "Datathon", color: "indigo", btnColor: "text-indigo-600 bg-indigo-50" },
      { type: "INTERNSHIP", title: "IBM Data Intern", color: "emerald", btnColor: "text-emerald-600 bg-emerald-50" },
      { type: "JOB", title: "Data Scientist", color: "rose", btnColor: "text-rose-500 bg-rose-50" }
    ],
    "UI/UX Design": [
      { type: "CHALLENGE", title: "Figma Redesign", color: "purple", btnColor: "text-purple-600 bg-purple-50" },
      { type: "INTERNSHIP", title: "Airbnb Design Intern", color: "emerald", btnColor: "text-emerald-600 bg-emerald-50" },
      { type: "JOB", title: "Product Designer", color: "rose", btnColor: "text-rose-500 bg-rose-50" }
    ],
    "Cloud Computing": [
      { type: "CERTIFICATION", title: "AWS Solutions Architect", color: "amber", btnColor: "text-amber-600 bg-amber-50" },
      { type: "INTERNSHIP", title: "AWS DevOps Intern", color: "emerald", btnColor: "text-emerald-600 bg-emerald-50" },
      { type: "JOB", title: "Cloud Engineer", color: "rose", btnColor: "text-rose-500 bg-rose-50" }
    ],
    "Cybersecurity": [
      { type: "CTF Event", title: "DEFCON Qualifiers", color: "purple", btnColor: "text-purple-600 bg-purple-50" },
      { type: "INTERNSHIP", title: "CrowdStrike Intern", color: "emerald", btnColor: "text-emerald-600 bg-emerald-50" },
      { type: "JOB", title: "Security Analyst", color: "rose", btnColor: "text-rose-500 bg-rose-50" }
    ],
    "Default": [
      { type: "HACKATHON", title: "Google Hackathon", color: "indigo", btnColor: "text-indigo-600 bg-indigo-50" },
      { type: "INTERNSHIP", title: "Meta Intern", color: "emerald", btnColor: "text-emerald-600 bg-emerald-50" },
      { type: "JOB", title: "SDE-1 Role", color: "rose", btnColor: "text-rose-500 bg-rose-50" }
    ]
  };
  
  const opportunities = opportunitiesData[userDomain] || opportunitiesData["Default"];

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans pb-10">
      <nav className="bg-[#131b2f] text-white py-4 px-8 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold text-indigo-400 tracking-wide">ProPath OS</h1>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
          <span className="text-white font-bold cursor-pointer">Dashboard</span>
          <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/roadmap')}>Roadmap</span>
          <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/senior-project')}>Senior Project</span>
          <span className="cursor-pointer hover:text-white transition-colors" onClick={() => navigate('/domain-explore')}>Domain Explore</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-white">{userName}</div>
            <div className="text-xs text-slate-400">{userDomain}</div>
          </div>
          <button onClick={handleLogout} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">Welcome back, {userName} 👋</h2>
          <p className="text-slate-500 mt-1">Your Roadmap: <span className="text-indigo-500 font-medium">{userDomain}</span></p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-slate-800">Class Schedule</h3>
                  <button 
                    onClick={() => setIsEditingSchedule(!isEditingSchedule)}
                    className={`p-1.5 rounded-lg transition-colors ${isEditingSchedule ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                  </button>
                </div>
                <div className="flex gap-2">
                  {calendarDays.map((day, idx) => (
                    <div key={idx} className={`px-3 py-2 rounded-xl text-center text-xs font-bold hidden sm:block ${day.isToday ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200 block' : 'bg-slate-50 text-slate-400'}`}>
                      {day.name}<br/><span className="text-lg">{day.date}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Today's Lectures</p>
                 
                 {schedule.length === 0 && !isEditingSchedule && (
                   <div className="text-center py-6 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                     No classes scheduled for today! 🎉
                   </div>
                 )}

                 {schedule.map((item) => (
                   <div key={item.id} className={`flex items-center justify-between p-4 bg-${item.color}-50 rounded-2xl border border-${item.color}-100 transition-all`}>
                     <div className="flex items-center gap-4">
                       <div className={`text-${item.color}-500`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       </div>
                       <div>
                         <h4 className="font-bold text-slate-800">{item.title}</h4>
                         <p className={`text-xs text-${item.color}-600 font-medium`}>{item.time}</p>
                       </div>
                     </div>
                     {isEditingSchedule && (
                       <button onClick={() => handleRemoveClass(item.id)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                       </button>
                     )}
                   </div>
                 ))}

                 {isEditingSchedule && (
                   <div className="flex gap-2 pt-2">
                     <input 
                       type="text" 
                       placeholder="Class Title" 
                       className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-medium outline-none focus:border-indigo-400"
                       value={newClassInfo.title}
                       onChange={(e) => setNewClassInfo({...newClassInfo, title: e.target.value})}
                     />
                     <input 
                       type="text" 
                       placeholder="Time (e.g. 10:00 AM)" 
                       className="w-32 bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-medium outline-none focus:border-indigo-400"
                       value={newClassInfo.time}
                       onChange={(e) => setNewClassInfo({...newClassInfo, time: e.target.value})}
                     />
                     <button onClick={handleAddClass} className="bg-indigo-600 text-white font-bold px-5 rounded-xl hover:bg-indigo-700 transition">
                       Add
                     </button>
                   </div>
                 )}
              </div>
            </div>

            <div>
               <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">🚀 Opportunities for {userDomain}</h3>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 {opportunities.map((opp, idx) => (
                   <div key={idx} className={`bg-${opp.color}-50/50 p-6 rounded-3xl border border-${opp.color}-100 flex flex-col justify-between`}>
                     <div>
                       <p className={`text-[10px] font-bold text-${opp.color}-500 mb-1 tracking-widest uppercase`}>{opp.type}</p>
                       <h4 className="font-bold text-slate-800 mb-6 text-lg">{opp.title}</h4>
                     </div>
                     {/* --- UPDATED: INTERACTIVE APPLY BUTTON --- */}
                     {appliedRoles.includes(opp.title) ? (
                       <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                         Applied
                       </span>
                     ) : (
                       <button 
                         onClick={() => setSelectedOpportunity(opp)} 
                         className={`text-xs font-bold bg-white px-4 py-2 rounded-lg shadow-sm border w-max transition ${opp.btnColor} hover:scale-105 mt-2`}
                       >
                         Apply Now
                       </button>
                     )}
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div onClick={() => navigate('/domain-explore')} className="bg-gradient-to-br from-[#1ea2fb] to-[#1270e3] p-8 rounded-[2rem] text-white shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-[1.02] transition-transform text-center flex flex-col items-center justify-center min-h-[140px]">
              <h3 className="text-2xl font-bold mb-1 tracking-wide">Domain Explorer 🚀</h3>
              <p className="text-blue-100 text-sm font-medium">Find your perfect career path</p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                AI Readiness Analysis
              </h3>

              {isPredicting ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-indigo-600 mb-3"></div>
                  <p className="text-sm font-bold text-slate-400 animate-pulse">Running SVM Model...</p>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner ${aiPrediction.placement_ready ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {aiPrediction.placement_ready ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Status</p>
                      <h4 className={`text-lg font-black ${aiPrediction.placement_ready ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {aiPrediction.message}
                      </h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Confidence</p>
                    <p className="text-xl font-black text-slate-700">{aiPrediction.confidence}%</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">🎯 Skill Proficiency</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-bold mb-3">
                    <span className="text-slate-800">Domain Skill <span className="text-slate-400 font-normal ml-1">({userDomain})</span></span>
                    <span className="text-purple-500">{skills.python}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${skills.python}%` }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold mb-3">
                    <span className="text-slate-800">Specialization <span className="text-slate-400 font-normal ml-1">(Advanced)</span></span>
                    <span className="text-emerald-500">{skills.ml}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${skills.ml}%` }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold mb-3">
                    <span className="text-slate-800">Projects & Certs</span>
                    <span className="text-amber-500">{Math.max(skills.projects, skills.certs)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${Math.max(skills.projects, skills.certs)}%` }}></div></div>
                </div>
              </div>
            </div>

            <div onClick={() => navigate('/senior-project')} className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] p-8 rounded-[2rem] text-white shadow-lg shadow-purple-500/20 cursor-pointer hover:scale-[1.02] transition-transform text-center flex flex-col items-center justify-center min-h-[140px]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <h3 className="text-xl font-bold mb-1">Senior Project Portal</h3>
              <p className="text-purple-200 text-xs font-medium">Submit Final Documentation</p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">🏆 Top Performers</h3>
              
              <div className="space-y-3">
                {leaderboard.length > 0 ? leaderboard.map((user, idx) => {
                  let badgeClass = "bg-slate-100 text-slate-500";
                  if (idx === 0) badgeClass = "bg-amber-100 text-amber-600 shadow-sm border border-amber-200";
                  if (idx === 1) badgeClass = "bg-slate-200 text-slate-600 shadow-sm border border-slate-300";
                  if (idx === 2) badgeClass = "bg-orange-100 text-orange-700 shadow-sm border border-orange-200";

                  return (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${user.name === userName ? 'bg-indigo-50 border border-indigo-100 scale-[1.02] shadow-sm' : 'bg-slate-50 border border-slate-100 hover:bg-slate-100'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-xs ${badgeClass}`}>
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                            {user.name} {user.name === userName && <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full ml-1">YOU</span>}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user.domain}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-indigo-600">{user.score} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-0.5">pts</span></p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-sm text-slate-500 text-center py-6 animate-pulse">Loading Live Ranks...</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* --- NEW: OPPORTUNITY APPLICATION MODAL --- */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in-up">
            <button onClick={() => setSelectedOpportunity(null)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="p-8 border-b bg-slate-50 border-slate-100">
              <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-md bg-indigo-100 text-indigo-700">
                {selectedOpportunity.type}
              </span>
              <h3 className="text-2xl font-bold text-slate-800 mt-4">{selectedOpportunity.title}</h3>
            </div>
            <div className="p-8">
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                {selectedOpportunity.type === 'HACKATHON' && "Compete with top developers, solve real-world problems, and win amazing prizes to boost your portfolio."}
                {selectedOpportunity.type === 'INTERNSHIP' && "Gain industry experience, work on production-level code, and kickstart your engineering career."}
                {selectedOpportunity.type === 'JOB' && "Join a fast-paced tech team, build scalable applications, and take your career to the next level."}
                {selectedOpportunity.type !== 'HACKATHON' && selectedOpportunity.type !== 'INTERNSHIP' && selectedOpportunity.type !== 'JOB' && "Take the next step in your professional technical journey."}
              </p>

              <button
                onClick={() => {
                  setAppliedRoles([...appliedRoles, selectedOpportunity.title]);
                  setTimeout(() => setSelectedOpportunity(null), 800); 
                }}
                className="w-full py-3.5 text-white font-bold rounded-xl transition-colors shadow-lg bg-[#131b2f] hover:bg-slate-800 shadow-slate-900/20"
              >
                Submit Fast Application
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;