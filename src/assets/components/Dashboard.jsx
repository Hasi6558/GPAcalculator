import React, { useEffect, useState } from 'react'
import PlusIcon from '../images/dashicons_plus-alt.png'
import { useNavigate } from 'react-router-dom';
import YearInput from './YearInput';


const Dashboard = () => { 

  const Navigate = useNavigate();

 
  const [yearBox, setYearBox] = useState(() => {
    const saved = localStorage.getItem('gpa_years');
    return saved ? JSON.parse(saved) : [];
  });
  const [showYearInput, setShowYearInput] = useState(false);
  const [yearInputError, setYearInputError] = useState('');
  const [showPredicted, setShowPredicted] = useState(false);

  const handleAddYear = () => {
    setShowYearInput(true);
  };

  const handleYearSubmit = (year) => {
    if (yearBox.some(y => y.year === year)) {
      setYearInputError('This year already exists!');
      return;
    }
    const updated = [...yearBox, { year: year, gpa: "0.0" }];
    setYearBox(updated);
    localStorage.setItem('gpa_years', JSON.stringify(updated));
    setShowYearInput(false);
    setYearInputError('');
  }

  // Helper: get all courses for a year (optionally filter by pending)
  const getCourses = (year, includePending = false) => {
    let completed = [];
    try {
      const cells = JSON.parse(localStorage.getItem(`gpa_cells_${year}`) || '{}');
      if (Array.isArray(cells)) completed = cells;
      else completed = Object.values(cells).flat();
    } catch { completed = []; }
    if (includePending) return completed;
    return completed.filter(c => !c.pending);
  };

  // GPA calculation helpers
  const calcGpa = (courses) => {
    const gradePoints = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0, '-': 0.0
    };
    let totalPoints = 0, totalCredits = 0;
    courses.forEach(c => {
      const credit = parseFloat(c.credit);
      const gp = gradePoints[c.grade];
      if (!isNaN(credit) && gp !== undefined && c.grade && c.grade !== '-') {
        totalPoints += credit * gp;
        totalCredits += credit;
      }
    });
    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : '--';
  };

  // Calculate current and predicted GPA for each year
  const gpaData = yearBox.map(y => {
    const current = calcGpa(getCourses(y.year, false));
    const predicted = calcGpa(getCourses(y.year, true));
    return { year: y.year, current, predicted };
  });
  const avgCurrentGpa = gpaData.length > 0
    ? (gpaData.map(y => parseFloat(y.current)).filter(g => !isNaN(g)).reduce((a, b) => a + b, 0) / gpaData.length).toFixed(2)
    : null;
  const avgPredictedGpa = gpaData.length > 0
    ? (gpaData.map(y => parseFloat(y.predicted)).filter(g => !isNaN(g)).reduce((a, b) => a + b, 0) / gpaData.length).toFixed(2)
    : null;

  useEffect(() => {
    localStorage.setItem('gpa_years', JSON.stringify(yearBox));
    console.log(yearBox);
  }, [yearBox]);
  return (
    <div className='h-screen bg-gradient-to-br from-[#547792] via-[#94B4C1] to-[#ECEFCA] text-[#222]'>
      <h2 className='text-center font-extrabold text-5xl p-[24px] tracking-wide text-[#ECEFCA] drop-shadow-lg'>GPA Calculator</h2>
      <div className='flex justify-center mb-6'>
        <button 
          className='flex items-center gap-2 font-bold text-2xl bg-[#ECEFCA] text-[#547792] px-6 py-3 rounded-full shadow-lg hover:bg-[#dbe6b7] transition duration-200 border-2 border-[#547792]'
          onClick={handleAddYear}
        >
          <img src={PlusIcon} alt="Add" className='w-7 h-7' />
          Add Year
        </button>
        <button
          className='ml-6 font-bold text-xl bg-gradient-to-r from-red-600 to-red-400 text-white px-6 py-3 rounded-full shadow-lg hover:from-red-700 hover:to-red-500 transition duration-200 border-2 border-red-700'
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all data? This will remove all years and their courses.')) {
              localStorage.clear();
              setYearBox([]);
            }
          }}
        >
          Reset All Data
        </button>
        <button
          className='ml-6 font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-3 rounded-full shadow-lg hover:from-blue-700 hover:to-blue-500 transition duration-200 border-2 border-blue-700'
          onClick={() => Navigate('/statistics')}
        >
          Show Statistics
        </button>
        <button
          className={`ml-6 font-bold text-xl px-6 py-3 rounded-full shadow-lg border-2 border-yellow-500 transition duration-200 ${showPredicted ? 'bg-yellow-500 text-white' : 'bg-[#ECEFCA] text-yellow-700'}`}
          onClick={() => setShowPredicted(v => !v)}
        >
          {showPredicted ? 'Hide Predicted GPA' : 'Show Predicted GPA'}
        </button>
      </div>
      {showYearInput && (
        <YearInput onSubmit={handleYearSubmit} onClose={() => { setShowYearInput(false); setYearInputError(''); }} error={yearInputError} />
      )}
      <div className='flex flex-wrap justify-center gap-8 mt-10'>
        {gpaData.map((item,index) => (
          <div key={index} className='bg-[#ECEFCA] shadow-2xl w-64 h-56 cursor-pointer rounded-2xl border-4 border-[#547792] hover:scale-105 hover:shadow-[#547792]/40 transition-transform duration-200 relative group flex flex-col items-center justify-center p-4'>
            <div onClick={() => Navigate(`/add-courses/${item.year}`)} className='w-full h-full flex flex-col justify-center items-center'>
              <h2 className='text-center font-extrabold text-3xl p-2 text-[#547792] group-hover:text-[#36506b] transition-colors duration-200'>Year {item.year}</h2>
              <h3 className='text-center text-xl font-semibold text-[#547792] mt-2'>Current GPA:</h3>
              <span className='text-2xl font-bold text-[#36506b] mt-1'>{item.current}</span>
              {showPredicted && item.predicted !== item.current && (
                <>
                  <h3 className='text-center text-xl font-semibold text-yellow-700 mt-2'>Predicted GPA:</h3>
                  <span className='text-2xl font-bold text-yellow-700 mt-1'>{item.predicted}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {avgCurrentGpa && (
        <div className='text-center font-bold text-2xl mt-6'>
          <span className='bg-[#547792] text-[#ECEFCA] px-6 py-2 rounded-full shadow-md'>
            Overall Current GPA: <span className='text-[#ECEFCA]'>{avgCurrentGpa}</span>
          </span>
        </div>
      )}
      {showPredicted && avgPredictedGpa && avgPredictedGpa !== avgCurrentGpa && (
        <div className='text-center font-bold text-2xl mt-6'>
          <span className='bg-yellow-500 text-white px-6 py-2 rounded-full shadow-md'>
            Overall Predicted GPA: <span className='text-white'>{avgPredictedGpa}</span>
          </span>
        </div>
      )}
     <div className='fixed bottom-2 right-6 opacity-40'>
          Developed by Hasindu Liyanage
      </div>
      
    </div>  
  )
}

export default Dashboard