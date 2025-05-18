import React from 'react';
import { useNavigate } from 'react-router-dom';
// We'll use chart.js for the pie chart
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

const Statistics = () => {
  const navigate = useNavigate();
  const yearBox = JSON.parse(localStorage.getItem('gpa_years')) || [];

  // Pie chart: each slice is a year, value is its GPA
  const pieData = {
    labels: yearBox.map(y => `Year ${y.year}`),
    datasets: [
      {
        label: 'Year GPA',
        data: yearBox.map(y => parseFloat(y.gpa) || 0),
        backgroundColor: [
          '#4ade80', '#60a5fa', '#facc15', '#f87171', '#a78bfa', '#f472b6', '#38bdf8', '#fbbf24', '#a3e635', '#f87171'
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };
  const hasPieData = pieData.datasets[0].data.some(v => v > 0);

  // Helper to get total credits for a year (include pending by default)
  const getYearCredits = (year, includePending = true) => {
    const cells = JSON.parse(localStorage.getItem(`gpa_cells_${year}`) || '{}');
    let total = 0;
    let allCourses = [];
    if (Array.isArray(cells)) {
      allCourses = cells;
    } else {
      allCourses = Object.values(cells).flat();
    }
    allCourses.forEach(course => {
      // Defensive: check for valid credit and not empty string
      const c = parseFloat(course.credit);
      if (!isNaN(c) && course.credit !== '' && (includePending || !course.pending)) total += c;
    });
    return total;
  };

  // Helper to get semester breakdown for a year
  const getSemesters = (year) => {
    const cells = JSON.parse(localStorage.getItem(`gpa_cells_${year}`) || '{}');
    // If cells is an array (old format), treat as one semester
    if (Array.isArray(cells)) {
      return [{ name: 'Semester 1', courses: cells }];
    }
    // Otherwise, treat as object: { semesterName: [courses] }
    return Object.entries(cells).map(([sem, courses], i) => ({
      name: sem,
      courses: Array.isArray(courses) ? courses : []
    }));
  };

  // Helper: get all courses for a year (optionally filter by pending)
  const getCourses = (year, includePending = false) => {
    let completed = [];
    try {
      const cells = JSON.parse(localStorage.getItem(`gpa_cells_${year}`) || '{}');
      let allCourses = [];
      if (Array.isArray(cells)) allCourses = cells;
      else allCourses = Object.values(cells).flat();
      if (includePending) return allCourses;
      return allCourses.filter(c => !c.pending);
    } catch { return []; }
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

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#ECEFCA] via-[#94B4C1] to-[#547792] text-[#222] p-6'>
      <h2 className='text-center font-extrabold text-4xl p-6 text-[#547792] drop-shadow-lg'>Statistics</h2>
      <div className='flex justify-center mb-8'>
        <button
          className='font-bold text-lg bg-[#547792] text-[#ECEFCA] px-6 py-2 rounded-full shadow-lg hover:bg-[#36506b] transition duration-200 border-2 border-[#547792]'
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </button>
      </div>
      <div className='flex flex-col items-center'>
        <div className='w-full max-w-md bg-white rounded-xl shadow-lg p-6 mb-8'>
          <h3 className='text-xl font-bold text-[#547792] mb-4 text-center'>GPA Distribution by Year</h3>
          {hasPieData ? <Pie data={pieData} /> : <div className='text-center text-gray-500'>No GPA data to display.</div>}
        </div>
        <div className='flex gap-4'>
            {avgCurrentGpa && (
          <div className='w-full max-w-md bg-white rounded-xl shadow-lg p-6 mb-8'>
            <h3 className='text-xl font-bold text-[#547792] mb-4 text-center'>Current GPA (Completed Courses Only)</h3>
            <div className='flex flex-col gap-2'>
              {gpaData.map((y, i) => (
                <div key={y.year} className='flex justify-between items-center border-b border-[#ECEFCA] py-1'>
                  <span className='font-semibold text-[#547792]'>Year {y.year}</span>
                  <span className='text-lg font-bold text-[#38bdf8]'>{y.current}</span>
                </div>
              ))}
              <div className='flex justify-between items-center mt-2 pt-2 border-t border-[#ECEFCA]'>
                <span className='font-bold text-[#36506b]'>Overall Current GPA</span>
                <span className='text-xl font-bold text-[#fbbf24]'>{avgCurrentGpa}</span>
              </div>
            </div>
          </div>
        )}
        {avgPredictedGpa && avgPredictedGpa !== avgCurrentGpa && (
          <div className='w-full max-w-md bg-white rounded-xl shadow-lg p-6 mb-8'>
            <h3 className='text-xl font-bold text-[#547792] mb-4 text-center'>Predicted GPA (Including Pending)</h3>
            <div className='flex flex-col gap-2'>
              {gpaData.map((y, i) => (
                <div key={y.year} className='flex justify-between items-center border-b border-[#ECEFCA] py-1'>
                  <span className='font-semibold text-[#547792]'>Year {y.year}</span>
                  <span className='text-lg font-bold text-yellow-600'>{y.predicted}</span>
                </div>
              ))}
              <div className='flex justify-between items-center mt-2 pt-2 border-t border-[#ECEFCA]'>
                <span className='font-bold text-[#36506b]'>Overall Predicted GPA</span>
                <span className='text-xl font-bold text-yellow-600'>{avgPredictedGpa}</span>
              </div>
            </div>
          </div>
        )}

        </div>
        
        <div className='flex flex-wrap justify-center gap-8 w-full'>
          {yearBox.length === 0 && (
            <div className='text-center text-xl font-semibold text-[#547792]'>No data available.</div>
          )}
          {yearBox.map((item, idx) => (
            <div key={item.year} className="bg-[#ECEFCA] border-2 border-[#547792] rounded-2xl shadow-lg p-6 w-full max-w-2xl mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                <h3 className="text-2xl font-bold text-[#547792]">Year {item.year}</h3>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <span className="text-lg font-semibold text-[#36506b]">GPA: <span className="text-2xl font-bold text-[#38bdf8]">{item.gpa}</span></span>
                  <span className="text-lg font-semibold text-[#36506b] ml-0 md:ml-6">Total Credits: <span className="text-xl font-bold text-[#fbbf24]">{getYearCredits(item.year)}</span></span>
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                {getSemesters(item.year).map((sem, sidx) => (
                  <div key={sem.name} className="bg-white border border-[#94B4C1] rounded-xl shadow p-4 flex-1 min-w-[220px] max-w-xs">
                    <h4 className="text-lg font-bold text-[#547792] mb-2">{sem.name}</h4>
                    {sem.courses.length === 0 ? (
                      <div className="text-gray-400 italic">No courses</div>
                    ) : (
                      <ul className="divide-y divide-[#ECEFCA]">
                        {sem.courses.map((course, cidx) => (
                          <li key={cidx} className={`py-1 flex flex-col ${course.pending ? 'bg-yellow-100 border-l-4 border-yellow-500' : ''}`}>
                            <span className="font-semibold text-[#36506b]">{course.name}</span>
                            <div className="flex flex-row gap-4 text-sm">
                              <span className="text-[#547792]">Credits: <span className="font-bold">{course.credit}</span></span>
                              <span className="text-[#547792]">Grade: <span className="font-bold">{course.grade}</span></span>
                              {course.pending && <span className="text-yellow-700 font-bold ml-2">Pending</span>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
