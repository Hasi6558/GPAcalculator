import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import YearInput from './YearInput';

const AddCources = () => {
  const { year } = useParams();
  const navigate = useNavigate();
  const [cells, setCells] = useState(() => {
    const saved = localStorage.getItem(`gpa_cells_${year}`);
    return saved ? JSON.parse(saved) : [{ id: Date.now(), name: '', credit: '', grade: '' }];
  });
  const [gpa, setGpa] = useState(() => {
    const saved = localStorage.getItem(`gpa_value_${year}`);
    return saved ? saved : null;
  });
  const [inputError, setInputError] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [currentGpa, setCurrentGpa] = useState(null);
  const [predictedGpa, setPredictedGpa] = useState(null);

  const gradePoints = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0, '-': 0.0
  };

  useEffect(() => {
    // Load from localStorage on mount
    const savedCells = localStorage.getItem(`gpa_cells_${year}`);
    const savedGpa = localStorage.getItem(`gpa_value_${year}`);
    if (savedCells) setCells(JSON.parse(savedCells));
    if (savedGpa) setGpa(savedGpa);
    // Update Dashboard's yearBox GPA in localStorage
    if (savedGpa) {
      const yearBox = JSON.parse(localStorage.getItem('gpa_years')) || [];
      const idx = yearBox.findIndex(y => y.year === year);
      if (idx !== -1) {
        yearBox[idx].gpa = savedGpa;
        localStorage.setItem('gpa_years', JSON.stringify(yearBox));
      }
    }
  }, [year, gpa]);

  // Add a pending property to each course row
  const handleAddCources = () => {
    const updatedCells = [...cells, { id: Date.now(), name: '', credit: '', grade: '', pending: false }];
    setCells(updatedCells);
    localStorage.setItem(`gpa_cells_${year}`, JSON.stringify(updatedCells));
  };

  // Toggle pending status for a course
  const handleTogglePending = (index) => {
    const updated = [...cells];
    updated[index].pending = !updated[index].pending;
    setCells(updated);
    localStorage.setItem(`gpa_cells_${year}`, JSON.stringify(updated));
  };

  const handleShow = () => {
    // Check for empty fields
    for (const cell of cells) {
      if (!cell.name.trim() || !cell.credit.trim() || !cell.grade.trim()) {
        setInputError('All fields are required for every course.');
        return;
      }
    }
    setInputError('');
    let totalPoints = 0, totalCredits = 0;
    let totalPointsAll = 0, totalCreditsAll = 0;
    cells.forEach(cell => {
      const credit = parseFloat(cell.credit);
      const gp = gradePoints[cell.grade];
      if (!isNaN(credit) && gp !== undefined && cell.grade !== '' && cell.grade !== '-') {
        if (!cell.pending) {
          totalPoints += credit * gp;
          totalCredits += credit;
        }
        totalPointsAll += credit * gp;
        totalCreditsAll += credit;
      }
    });
    const calculatedCurrentGpa = totalCredits ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    const calculatedPredictedGpa = totalCreditsAll ? (totalPointsAll / totalCreditsAll).toFixed(2) : '0.00';
    setCurrentGpa(calculatedCurrentGpa);
    setPredictedGpa(calculatedPredictedGpa);
    setGpa(calculatedPredictedGpa); // for legacy
    localStorage.setItem(`gpa_cells_${year}`, JSON.stringify(cells));
    localStorage.setItem(`gpa_value_${year}`, calculatedPredictedGpa);
    // Update Dashboard's yearBox GPA in localStorage
    const yearBox = JSON.parse(localStorage.getItem('gpa_years')) || [];
    const idx = yearBox.findIndex(y => y.year === year);
    if (idx !== -1) {
      yearBox[idx].gpa = calculatedPredictedGpa;
      localStorage.setItem('gpa_years', JSON.stringify(yearBox));
    }
    console.log('Current GPA:', calculatedCurrentGpa, 'Predicted GPA:', calculatedPredictedGpa);
  };

  return (
    <div className='h-screen text-[#94B4C1]'>
      <h2 className='text-center font-bold text-4xl p-[20px]'>GPA Calculator</h2>
      <h3 className='text-center font-bold text-2xl mb-4'>Year: {year}</h3>
      <div className='flex justify-center gap-2'>
        <button onClick={handleAddCources}>+ Add More Cources</button>
        <button
          className='ml-4 bg-red-600 hover:bg-red-700 text-white rounded px-4 py-2 font-bold'
          onClick={() => setShowDeletePopup(true)}
        >
          Delete This Year
        </button>
        <div className='flex justify-center gap-2'>
        <button className='ml-[20px] font-bold text-xl bg-[#547792] px-4 py-2 rounded' onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
      </div>
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-80 flex flex-col items-center relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
              onClick={() => setShowDeletePopup(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-4 text-[#547792]">Delete Year</h3>
            <p className="mb-4 text-center text-black">Are you sure you want to delete this year and all its courses?</p>
            <div className="flex gap-4 w-full">
              <button
                className="bg-red-600 hover:bg-red-700 text-white rounded px-4 py-2 font-bold w-full"
                onClick={() => {
                  // Remove year from yearBox in localStorage
                  const yearBox = JSON.parse(localStorage.getItem('gpa_years')) || [];
                  const updated = yearBox.filter(y => y.year !== year);
                  localStorage.setItem('gpa_years', JSON.stringify(updated));
                  // Remove year-specific course and GPA data
                  localStorage.removeItem(`gpa_cells_${year}`);
                  localStorage.removeItem(`gpa_value_${year}`);
                  // Navigate back to dashboard
                  setShowDeletePopup(false);
                  navigate('/');
                }}
              >
                Delete
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-black rounded px-4 py-2 font-bold w-full"
                onClick={() => setShowDeletePopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      

      {/* Make the course list scrollable if it overflows the screen */}
      <div className="max-h-[60vh] overflow-y-auto mt-8 px-2 scrollbar-thin scrollbar-thumb-[#547792] scrollbar-track-[#e5e7eb] flex flex-col items-center w-full">
        {cells.map((cell, index) => (
          <div key={cell.id} className={`flex flex-wrap md:flex-nowrap items-center rounded-xl shadow-md mb-4 px-4 py-3 w-full max-w-2xl border-2 ${cell.pending ? 'bg-yellow-100 border-yellow-500' : 'bg-[#ECEFCA] border-[#547792]'} hover:shadow-lg transition-all duration-200`}>
            <input
              type="text"
              name="Cource"
              placeholder="Course Name"
              className='m-2 p-2 text-black rounded-lg border border-[#547792] focus:outline-none focus:ring-2 focus:ring-[#547792] flex-1 min-w-[120px]'
              value={cell.name}
              required
              onChange={e => {
                const updated = [...cells];
                updated[index].name = e.target.value;
                setCells(updated);
                localStorage.setItem(`gpa_cells_${year}`, JSON.stringify(updated));
              }}
            />
            <input
              type="number"
              name="Credit"
              placeholder="Credits"
              className='m-2 p-2 text-black font-bold rounded-lg border border-[#547792] focus:outline-none focus:ring-2 focus:ring-[#547792] w-24'
              value={cell.credit}
              required
              min="0"
              onChange={e => {
                const updated = [...cells];
                updated[index].credit = e.target.value;
                setCells(updated);
                localStorage.setItem(`gpa_cells_${year}`, JSON.stringify(updated));
              }}
            />
            <select
              className='m-2 p-2 text-black font-bold rounded-lg border border-[#547792] focus:outline-none focus:ring-2 focus:ring-[#547792] w-32'
              value={cell.grade}
              required
              onChange={e => {
                const updated = [...cells];
                updated[index].grade = e.target.value;
                setCells(updated);
                localStorage.setItem(`gpa_cells_${year}`, JSON.stringify(updated));
              }}
            >
              <option value="">Grade</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B">B</option>
              <option value="B-">B-</option>
              <option value="C+">C+</option>
              <option value="C">C</option>
              <option value="C-">C-</option>
              <option value="D+">D+</option>
              <option value="D">D</option>
              <option value="D-">D-</option>
              <option value="F">F</option>
              <option value="-">-</option>
            </select>
            <label className="flex items-center ml-2">
              <input
                type="checkbox"
                checked={!!cell.pending}
                onChange={() => handleTogglePending(index)}
                className="mr-1 accent-yellow-500"
              />
              <span className="text-yellow-700 font-semibold">Pending</span>
            </label>
            <button
              className="ml-2 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-700 hover:to-red-900 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200"
              onClick={() => {
                const updated = cells.filter((_, i) => i !== index);
                setCells(updated);
                localStorage.setItem(`gpa_cells_${year}`, JSON.stringify(updated));
              }}
              aria-label="Delete course row"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <div>
        
        {inputError && (
          <div className="mt-2 text-center text-red-500 font-semibold">{inputError}</div>
        )}
      </div>

      {/* GPA bar always visible at the bottom */}
      <div className="fixed left-0 right-0 bottom-0 flex flex-col md:flex-row justify-center items-center w-full bg-[#ECEFCA] p-4 shadow-lg z-50 gap-4">
        <button 
          onClick={handleShow} 
          className='px-6 py-2 mr-4 rounded-lg bg-gradient-to-r from-green-600 to-green-400 text-white font-bold text-lg shadow-md hover:from-green-700 hover:to-green-500 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50'
        >
          Calculate
        </button>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <span className="text-lg text-black font-semibold">Current GPA:</span>
          <span className="text-2xl font-bold text-black">{currentGpa !== null && !inputError ? currentGpa : '--'}</span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <span className="text-lg text-yellow-700 font-semibold">Predicted GPA:</span>
          <span className="text-2xl font-bold text-yellow-700">{predictedGpa !== null && !inputError ? predictedGpa : '--'}</span>
        </div>
      </div>
    </div>
  );
}

export default AddCources