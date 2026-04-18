import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

function Dashboard() {
  const { width, height } = useWindowSize();
  const location = useLocation();
  const USER_ID = localStorage.getItem('userId') || 1; 
  const userName = localStorage.getItem('userName') || "Student";

  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [userDomain, setUserDomain] = useState(location.state?.domain || "Data Science");
  const [tasks, setTasks] = useState([]);
  const [skills, setSkills] = useState({ python: 0, ml: 0, projects: 0, certs: 0 });
  
  const [isPredicting, setIsPredicting] = useState(false);
  const [aiPrediction, setAiPrediction] = useState({ placement_ready: true, message: "Evaluating...", confidence: 0 });

  // NEW: State to hold our dynamic projects
  const [recommendedProjects, setRecommendedProjects] = useState([]);

  // 1. Updated Database Loader
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/user/${USER_ID}/load`);
        const data = await response.json();

        // IMPORTANT: Check if the user just clicked "Generate" on the Onboarding page
        const hasNewOnboardingData = location.state?.domain ? true : false;

        // Only load the database IF they have tasks AND they didn't just come from Onboarding
        if (data.exists && data.tasks && data.tasks.length > 0 && !hasNewOnboardingData) {
          setUserDomain(data.domain);
          setSkills(data.skills);
          setTasks(data.tasks);
        } else {
          // Otherwise, build a fresh roadmap based on Onboarding!
          generateInitialSetup();
        }
      } catch (error) {
        generateInitialSetup(); 
      }
      setIsLoadingDB(false);
    };

    loadUserData();
  }, [USER_ID]); // Removed location.state from dependencies to prevent loops

  // 2. Updated Initial Setup
  const generateInitialSetup = () => {
    const domain = location.state?.domain || "Data Science";
    const level = location.state?.skillLevel || "Beginner";
    
    // Force the domain to update to the newly selected one!
    setUserDomain(domain);

    let initialTasks = [
      { id: 1, text: "Advanced Machine Learning", completed: false },
      { id: 2, text: "Build a Major Project", completed: false },
      { id: 3, text: "Participate in Hackathon", completed: false },
      { id: 4, text: "Earn Certification", completed: false }
    ];
    
    if (domain === "Full Stack Dev") {
      initialTasks = [
        { id: 1, text: "Advanced React Patterns", completed: false },
        { id: 2, text: "Build a Full-Stack E-Commerce App", completed: false },
        { id: 3, text: "Setup Docker Containers", completed: false },
        { id: 4, text: "Deploy to AWS", completed: false }
      ];
    } else if (domain === "AI/ML") {
      initialTasks = [
        { id: 1, text: "Master Neural Networks & PyTorch", completed: false },
        { id: 2, text: "Build a Computer Vision Model", completed: false },
        { id: 3, text: "Deploy Model with FastAPI", completed: false },
        { id: 4, text: "Publish Research Paper", completed: false }
      ];
    }
    
    setTasks(initialTasks);

    let base = level === 'Beginner' ? 25 : level === 'Intermediate' ? 50 : 80;
    setSkills({ 
      python: Math.min(base + 10, 100), 
      ml: base, 
      projects: Math.max(base - 10, 0), 
      certs: Math.max(base - 20, 0) 
    });
  };

  useEffect(() => {
    if (isLoadingDB) return; 
    const saveUserData = async () => {
      try {
        await fetch(`http://127.0.0.1:8000/api/user/${USER_ID}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: userDomain, skills: skills, tasks: tasks })
        });
      } catch (error) { console.error("Failed to save:", error); }
    };
    saveUserData();
  }, [tasks, skills, userDomain, USER_ID]); 

  useEffect(() => {
    if (isLoadingDB) return;
    const fetchPrediction = async () => {
      setIsPredicting(true);
      try {
        const response = await fetch('http://127.0.0.1:8000/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(skills) 
        });
        if (response.ok) {
          const data = await response.json();
          setTimeout(() => { setAiPrediction(data); setIsPredicting(false); }, 600);
        }
      } catch (error) { setIsPredicting(false); }
    };
    fetchPrediction();
  }, [skills, isLoadingDB]);

  // NEW: Fetch dynamic projects whenever the domain changes
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // We use encodeURIComponent to handle spaces in domains like "Full Stack Dev"
        const response = await fetch(`http://127.0.0.1:8000/api/projects/${encodeURIComponent(userDomain)}`);
        if (response.ok) {
          const data = await response.json();
          setRecommendedProjects(data);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };
    
    if (userDomain) {
      fetchProjects();
    }
  }, [userDomain]);

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const isNowCompleted = !task.completed;
        if (taskId === 2 && isNowCompleted) setSkills(prev => ({ ...prev, projects: Math.min(prev.projects + 30, 100) }));
        else if (taskId === 2 && !isNowCompleted) setSkills(prev => ({ ...prev, projects: Math.max(prev.projects - 30, 0) }));
        
        if (taskId === 4 && isNowCompleted) setSkills(prev => ({ ...prev, certs: Math.min(prev.certs + 40, 100) }));
        else if (taskId === 4 && !isNowCompleted) setSkills(prev => ({ ...prev, certs: Math.max(prev.certs - 40, 0) }));

        return { ...task, completed: isNowCompleted };
      }
      return task;
    }));
  };

  if (isLoadingDB) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#1e40af]"></div></div>;
  }

  const completedTasksCount = tasks.filter(t => t.completed).length;
  // Safety check to prevent dividing by zero (NaN)
  const progressPercentage = tasks.length === 0 ? 0 : Math.round((completedTasksCount / tasks.length) * 100);

  const generateSkillGaps = () => {
    const gaps = [];
    const mainSkillName = userDomain === "Full Stack Dev" ? "Advanced JavaScript" : "Advanced Python";
    const subSkillName = userDomain === "Full Stack Dev" ? "Backend Architecture" : "Deep Learning Math";

    if (skills.python < 75) gaps.push({ skill: mainSkillName, status: "Needed", color: "bg-[#ea580c]" });
    if (skills.ml < 65) gaps.push({ skill: subSkillName, status: "Review", color: "bg-amber-500" });
    if (skills.projects < 60) gaps.push({ skill: "Portfolio Projects", status: "Missing", color: "bg-red-500" });
    if (skills.certs < 50) gaps.push({ skill: "Industry Certifications", status: "Lacking", color: "bg-red-400" });

    if (gaps.length === 0) return [{ skill: "All Core Requirements", status: "On Track", color: "bg-green-500" }];
    return gaps;
  };

  const skillGaps = generateSkillGaps();

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      {progressPercentage === 100 && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      <header className="bg-[#1e40af] text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center space-x-3">
          <span className="text-3xl" role="img" aria-label="brain">🧠</span>
          <h1 className="text-2xl font-bold tracking-wide">AI Engineering Roadmap & Progress Tracker</h1>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto py-3 px-6 text-slate-700 font-medium flex items-center">
          <span>Welcome, <span className="text-[#1e40af] font-bold">{userName}!</span></span>
          <span className="text-slate-300 mx-3">|</span> 
          <span>Target: <span className="font-bold">{userDomain}</span></span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          <div className="lg:col-span-1 flex flex-col space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Your Journey</h2>
              <div className="space-y-3">
                <div className="p-3 bg-orange-500 text-white rounded-lg shadow-sm">
                  <div className="font-bold">1st Year</div>
                  <div className="text-sm opacity-90">Programming & Certificates</div>
                  <div className="text-xs mt-1 font-medium flex items-center gap-1"><span>✔️</span> Completed</div>
                </div>
                <div className="p-3 bg-blue-600 text-white rounded-lg shadow-md ring-2 ring-blue-300 ring-offset-1 relative overflow-hidden">
                  <div className="font-bold relative z-10">2nd Year</div>
                  <div className="text-sm opacity-90 relative z-10">Projects & Hackathons</div>
                  <div className="text-xs mt-1 font-medium flex items-center gap-1 relative z-10"><span>⚙️</span> In Progress</div>
                  <div className="absolute inset-0 bg-blue-500 animate-pulse opacity-50"></div>
                </div>
                <div className="p-3 bg-amber-400 text-white rounded-lg shadow-sm text-slate-800">
                  <div className="font-bold">3rd Year</div>
                  <div className="text-sm opacity-90">Internships & Skills</div>
                </div>
                <div className="p-3 bg-orange-600 text-white rounded-lg shadow-sm">
                  <div className="font-bold">4th Year</div>
                  <div className="text-sm opacity-90">Placement Preparation</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-3">
                 {isPredicting ? (
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e40af]"></div>
                 ) : (
                   <span className={`text-xl rounded-full p-2 leading-none flex items-center justify-center ${aiPrediction.placement_ready ? 'bg-green-100 text-green-500' : 'bg-orange-100 text-orange-500'}`}>
                     {aiPrediction.placement_ready ? '✔️' : '⏳'}
                   </span>
                 )}
                 <span className="font-medium text-slate-700 text-lg">
                   AI Prediction: 
                   {isPredicting ? (
                     <span className="text-blue-600 font-bold ml-1 animate-pulse">Analyzing Data...</span>
                   ) : (
                     <span className={`font-bold ml-1 ${aiPrediction.placement_ready ? "text-green-600" : "text-orange-600"}`}>
                       {aiPrediction.message}
                     </span>
                   )}
                 </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model Confidence</span>
                <span className="text-sm font-black text-[#1e40af]">{isPredicting ? '--' : `${aiPrediction.confidence}%`}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Current Semester Steps</h2>
              
              <div className="space-y-3">
                 {tasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => toggleTask(task.id)}
                      className={`flex items-center p-3 border rounded-lg transition-all duration-300 cursor-pointer shadow-sm transform hover:-translate-y-1
                        ${task.completed ? 'bg-green-50 border-green-200 hover:bg-green-100' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-blue-300'}`}
                    >
                       <div className={`rounded-full min-w-8 min-h-8 flex items-center justify-center font-bold mr-4 shadow-sm transition-colors duration-300
                         ${task.completed ? 'bg-green-500 text-white scale-110' : 'bg-blue-600 text-white'}`}>
                         {task.completed ? '✓' : task.id}
                       </div>
                       <span className={`font-medium transition-all ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                         {task.text}
                       </span>
                    </div>
                 ))}
              </div>

              <div className="mt-6 bg-slate-200 rounded-full h-6 w-full overflow-hidden shadow-inner relative">
                <div className={`h-full transition-all duration-700 ease-out ${progressPercentage === 100 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${progressPercentage}%` }}></div>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
                  Progress: {progressPercentage}% Done
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               
               {/* NEW: Dynamic Senior Projects Hub */}
               <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                 <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-lg font-bold text-slate-800">Senior Projects Hub</h2>
                    <span className="text-xs font-bold text-[#1e40af] bg-blue-100 px-2 py-1 rounded">For {userDomain}</span>
                 </div>
                 
                 <div className="space-y-3">
                    {recommendedProjects.length > 0 ? (
                      recommendedProjects.map((project, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                          <div className={`${project.color} text-white p-2 font-medium text-sm flex justify-between items-center`}>
                            {project.title}
                            <span className="text-[10px] uppercase bg-white/20 px-2 py-0.5 rounded">{project.tag}</span>
                          </div>
                          <div className="bg-slate-50 p-2 text-xs text-slate-600">By {project.author}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-500 text-center py-4">Loading project ideas...</div>
                    )}
                 </div>
               </div>

               <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col justify-between">
                 <div>
                   <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">AI Tutor Analysis</h2>
                   <div className="text-center text-xs text-slate-500 font-bold mb-3 uppercase tracking-wider">— Identified Gaps —</div>
                   <div className="space-y-2">
                      {skillGaps.map((gap, index) => (
                        <div key={index} className="flex justify-between items-center border border-slate-200 p-2.5 rounded-lg bg-slate-50 transition-all">
                          <span className="text-sm font-medium text-slate-700">{gap.skill}</span>
                          <span className={`${gap.color} text-white text-xs px-3 py-1 rounded font-bold shadow-sm`}>{gap.status}</span>
                        </div>
                      ))}
                   </div>
                 </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Skill Tracker</h2>
              <div className="space-y-5">
                {[
                  { name: "Main Domain Skill", val: skills.python, color: "bg-green-500", text: "text-green-600" },
                  { name: "Secondary Skill", val: skills.ml, color: "bg-blue-600", text: "text-blue-600" },
                  { name: "Projects", val: skills.projects, color: "bg-orange-500", text: "text-orange-500" },
                  { name: "Certifications", val: skills.certs, color: "bg-amber-400", text: "text-amber-500" }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1 text-slate-700 font-medium">
                      <span>{item.name}</span><span className={`${item.text} font-bold`}>{item.val}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                      <div className={`${item.color} h-full rounded-full transition-all duration-1000 ease-out`} style={{width: `${item.val}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;