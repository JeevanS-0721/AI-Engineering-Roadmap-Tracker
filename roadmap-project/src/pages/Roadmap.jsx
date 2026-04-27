import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Roadmap() {
  const navigate = useNavigate();
  const USER_ID = localStorage.getItem('userId') || 1;
  const userName = localStorage.getItem('userName') || "Keerthan";
  const location = useLocation();

  const [selectedSemester, setSelectedSemester] = useState(null);
  const [userDomain, setUserDomain] = useState("AI/ML");
  const [userYear, setUserYear] = useState("1st Year");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/user/${USER_ID}/load`);
        const data = await res.json();
        if (data.exists) {
          setUserDomain(data.domain);
          setUserYear(data.year);
        }
      } catch (err) { console.error(err); }
    };
    fetchUser();
  }, [USER_ID]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // FIXED: Complete Dynamic Roadmaps Dictionary
  const masterRoadmap = {
    "AI/ML": [
      { courses: ["Python Basics", "Linear Algebra", "Physics"], details: "Foundation in computational logic." },
      { courses: ["Data Structures", "Statistics", "C++"], details: "Core computer science concepts." },
      { courses: ["Machine Learning Math", "Algorithms", "Databases"], details: "Preparing for model architecture." },
      { courses: ["Neural Networks", "Data Mining", "Operating Systems"], details: "Deep dive into AI training." },
      { courses: ["Computer Vision", "NLP", "Cloud Computing"], details: "Advanced specializations." },
      { courses: ["MLOps & Deployment", "Big Data", "Elective"], details: "Deploying models to production." },
      { courses: ["AI Ethics", "Cyber Security", "Project Phase 1"], details: "Finalizing capstone ideas." },
      { courses: ["Industry Internship", "Major Project", "Placements"], details: "Transitioning to industry." }
    ],
    "Full Stack Dev": [
      { courses: ["HTML/CSS/JS", "Logic Design", "Physics"], details: "Foundation in web logic." },
      { courses: ["Data Structures", "Advanced JS", "C++"], details: "Core programming paradigms." },
      { courses: ["React & Frontend", "Algorithms", "Databases"], details: "Building client-side applications." },
      { courses: ["Node.js & Backend", "API Design", "OS"], details: "Server-side architecture." },
      { courses: ["System Design", "DevOps Basics", "Networks"], details: "Scaling web applications." },
      { courses: ["Cloud Computing (AWS)", "Microservices", "Elective"], details: "Deploying to the cloud." },
      { courses: ["Web Security", "Performance", "Project Phase 1"], details: "Securing systems." },
      { courses: ["Industry Internship", "Major Project", "Placements"], details: "Transitioning to industry." }
    ],
    "Cloud Computing": [
      { courses: ["Python & Bash", "Linux Fundamentals", "Physics"], details: "Foundation in scripting and OS." },
      { courses: ["Data Structures", "Networking Basics", "C++"], details: "Core communication protocols." },
      { courses: ["Virtualization", "Database Management", "Algorithms"], details: "Understanding hypervisors and storage." },
      { courses: ["Docker & Containers", "Operating Systems", "APIs"], details: "Modern application packaging." },
      { courses: ["AWS/Azure Basics", "CI/CD Pipelines", "Security"], details: "Introduction to public clouds." },
      { courses: ["Kubernetes", "Infrastructure as Code", "Elective"], details: "Orchestrating large scale systems." },
      { courses: ["Cloud Architecture", "Cost Optimization", "Project Phase 1"], details: "Designing enterprise solutions." },
      { courses: ["Industry Internship", "Major Project", "Placements"], details: "Transitioning to industry." }
    ],
    "Cybersecurity": [
      { courses: ["Python Scripting", "Discrete Math", "Physics"], details: "Foundation in logic and scripting." },
      { courses: ["C Programming", "Network Protocols", "Ethics"], details: "Understanding low-level memory and networks." },
      { courses: ["Cryptography", "Operating Systems", "Databases"], details: "Securing data at rest and in transit." },
      { courses: ["Ethical Hacking", "Web Security", "Algorithms"], details: "Offensive security principles." },
      { courses: ["Digital Forensics", "Network Defense", "Cloud Security"], details: "Investigating breaches and securing perimeters." },
      { courses: ["Malware Analysis", "Risk Management", "Elective"], details: "Advanced threat detection." },
      { courses: ["Incident Response", "Compliance", "Project Phase 1"], details: "Handling live enterprise attacks." },
      { courses: ["Industry Internship", "Major Project", "Placements"], details: "Transitioning to industry." }
    ],
    "Default": [
      { courses: ["Engineering Math I", "Physics", "Basic Programming"], details: "Core engineering foundation." },
      { courses: ["Engineering Math II", "Chemistry", "Data Structures"], details: "Advanced sciences and programming." },
      { courses: ["Algorithms", "Digital Logic", "Discrete Math"], details: "Intermediate computer science concepts." },
      { courses: ["Operating Systems", "Databases", "Computer Networks"], details: "Core systems architecture." },
      { courses: ["Software Engineering", "Web Tech", "Elective I"], details: "Building software applications." },
      { courses: ["Cloud Basics", "Security Basics", "Elective II"], details: "Modern infrastructure." },
      { courses: ["Project Phase 1", "Management", "Elective III"], details: "Capstone preparation." },
      { courses: ["Industry Internship", "Major Project", "Placements"], details: "Industry readiness and final review." }
    ]
  };

  const currentRoadmap = masterRoadmap[userDomain] || masterRoadmap["Default"];
  const yearToIndexMap = { "1st Year": 2, "2nd Year": 4, "3rd Year": 6, "4th Year": 8 };
  const activeSemLimit = yearToIndexMap[userYear] || 2;

  const semesters = currentRoadmap.map((sem, index) => {
    let status = "locked";
    if (index < activeSemLimit - 1) status = "completed";
    else if (index === activeSemLimit - 1) status = "active";
    
    return {
      id: index + 1,
      name: `SEMESTER ${index + 1}`,
      status: status,
      courses: sem.courses,
      details: sem.details
    };
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans pb-16 relative">
      <nav className="bg-[#131b2f] text-white py-4 px-8 flex justify-between items-center shadow-md relative z-10">
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
            <div className="text-xs text-slate-400">{userDomain}</div>
          </div>
          <button onClick={handleLogout} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12 text-center">
        <h2 className="text-4xl font-bold text-slate-800 mb-2">Your {userDomain} Journey</h2>
        <p className="text-slate-500">Dynamically generated based on your academic profile.</p>
      </div>

      <main className="max-w-7xl mx-auto px-6 relative z-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {semesters.map((sem) => {
            let cardStyle = "";
            let badgeStyle = "";
            let icon = null;
            let textStyle = "text-slate-600";

            if (sem.status === "completed") {
              cardStyle = "bg-emerald-50/50 border-emerald-100 hover:border-emerald-300 hover:shadow-md cursor-pointer";
              badgeStyle = "text-slate-500 font-bold";
              textStyle = "text-emerald-700 font-medium";
              icon = <div className="text-emerald-500 bg-emerald-100 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>;
            } else if (sem.status === "active") {
              cardStyle = "bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10 scale-105 z-10 hover:scale-[1.07] cursor-pointer";
              badgeStyle = "bg-indigo-500 text-white px-3 py-1 rounded-md font-bold shadow-sm";
              textStyle = "text-slate-700 font-medium";
              icon = <div className="text-amber-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></div>;
            } else {
              cardStyle = "bg-white border-slate-200 opacity-60 hover:opacity-100 hover:shadow-md cursor-pointer";
              badgeStyle = "text-slate-400 font-bold";
              textStyle = "text-slate-400";
              icon = <div className="text-slate-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>;
            }

            return (
              <div key={sem.id} onClick={() => setSelectedSemester(sem)} className={`p-6 rounded-[2rem] border transition-all transform ${cardStyle}`}>
                <div className="flex justify-between items-center mb-6">
                  <span className={`text-[10px] uppercase tracking-wider ${badgeStyle}`}>{sem.name}</span>
                  {icon}
                </div>
                <ul className="space-y-3">
                  {sem.courses.map((course, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <span className={`w-1.5 h-1.5 rounded-full ${sem.status === 'completed' ? 'bg-emerald-500' : sem.status === 'active' ? 'bg-indigo-500' : 'bg-slate-300'}`}></span>
                      <span className={`text-sm ${textStyle}`}>{course}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </main>

      {/* MODAL */}
      {selectedSemester && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden relative animate-fade-in-up">
            <button onClick={() => setSelectedSemester(null)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className={`p-8 border-b ${selectedSemester.status === 'active' ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
              <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-md ${selectedSemester.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : selectedSemester.status === 'active' ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>
                {selectedSemester.status}
              </span>
              <h3 className="text-3xl font-bold text-slate-800 mt-4">{selectedSemester.name}</h3>
            </div>
            <div className="p-8">
              <p className="text-slate-500 text-base mb-6 leading-relaxed">{selectedSemester.details}</p>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Core Curriculum</h4>
              <div className="space-y-3 mb-8">
                {selectedSemester.courses.map((course, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <div className={`p-1.5 rounded-md ${selectedSemester.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : selectedSemester.status === 'active' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{course}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelectedSemester(null)} className="w-full py-3.5 bg-[#131b2f] hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-lg shadow-slate-900/20">Close View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Roadmap;