import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Onboarding() {
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  const domains = ['Data Science', 'Full Stack Dev', 'AI/ML', 'Testing', 'UI/UX Design', 'Cloud Computing'];
  const skills = ['Beginner', 'Intermediate', 'Advanced'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  const handleFinish = () => {
    if (selectedDomain && selectedSkill && selectedYear) {
      navigate('/dashboard', { 
        state: { 
          domain: selectedDomain, 
          skillLevel: selectedSkill,
          year: selectedYear
        } 
      });
    } else {
      alert("Please complete all three sections!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">Customize Your Journey</h2>
          <p className="mt-2 text-lg text-slate-600">Tell us what you want to learn so we can build your roadmap.</p>
        </div>

        <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">1. Select Your Target Domain 🎯</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {domains.map((domain) => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  selectedDomain === domain 
                    ? 'bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">2. Current Skill Level 📊</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            {skills.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                className={`flex-1 p-4 rounded-lg border text-center font-medium transition-all ${
                  selectedSkill === skill 
                    ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:bg-slate-50'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* NEW: Academic Year Selection */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">3. Current Academic Year 🎓</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`flex-1 p-4 rounded-lg border text-center font-medium transition-all ${
                  selectedYear === year 
                    ? 'bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-purple-300 hover:bg-slate-50'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center pt-4">
          <button 
            onClick={handleFinish}
            className="px-8 py-3 bg-[#1e40af] text-white text-lg font-bold rounded-lg shadow-md hover:bg-blue-800 transition-colors"
          >
            Generate My Roadmap 🚀
          </button>
        </div>

      </div>
    </div>
  );
}

export default Onboarding;