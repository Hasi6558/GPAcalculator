import React, { useState } from 'react';

const YearInput = ({ onSubmit, onClose, error }) => {
  const [year, setYear] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!year.trim()) {
      setLocalError('Year is required');
      return;
    }
    setLocalError('');
    onSubmit(year.trim());
    setYear('');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-80 flex flex-col items-center relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h3 className="text-2xl font-bold mb-4 text-[#547792]">Add Year</h3>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-3">
          <input
            type="text"
            className="border border-[#547792] rounded p-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-[#547792]"
            placeholder="Enter year (e.g. 3)"
            value={year}
            onChange={e => setYear(e.target.value)}
            autoFocus
          />
          {(localError || error) && <span className="text-red-500 text-sm">{localError || error}</span>}
          <button
            type="submit"
            className="bg-[#547792] hover:bg-[#36536b] text-white rounded px-4 py-2 font-bold w-full mt-2 transition"
          >
            Add Year
          </button>
        </form>
      </div>
    </div>
  );
};

export default YearInput;
