import { useState, useEffect } from "react";
import PropTypes from 'prop-types';

const PrintOptions = ({ onOptionsSelected, isLoading = false, initialOptions = null }) => {
  const [options, setOptions] = useState({
    pages: "all",
    copies: 1,
    orientation: "portrait", // New state for orientation
  });

  useEffect(() => {
    if (initialOptions) {
      setOptions(initialOptions);
    }
  }, [initialOptions]);

  const handleChange = (name, value) => {
    setOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onOptionsSelected(options);
  };

  return (
<form 
  onSubmit={handleSubmit} 
  className="space-y-6 p-6 border rounded-lg bg-white shadow-md"
>
  <div className="space-y-2">
    <label htmlFor="pages" className="block text-sm font-medium text-gray-700">Pages:</label>
    <input
      type="text"
      id="pages"
      value={options.pages}
      onChange={(e) => handleChange('pages', e.target.value)}
      placeholder="e.g., 1-5, 8, 11-13 or 'all'"
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 transition"
    />
  </div>

  <div className="space-y-2">
    <label htmlFor="copies" className="block text-sm font-medium text-gray-700">Copies:</label>
    <input
      type="number"
      id="copies"
      min="1"
      max="99"
      value={options.copies}
      onChange={(e) => handleChange('copies', parseInt(e.target.value))}
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 transition"
    />
  </div>

  <div className="space-y-2">
    <label htmlFor="orientation" className="block text-sm font-medium text-gray-700">Orientation:</label>
    <select
      id="orientation"
      value={options.orientation}
      onChange={(e) => handleChange('orientation', e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 transition"
    >
      <option value="portrait">Portrait</option>
      <option value="landscape">Landscape</option>
    </select>
  </div>

  <button
    type="submit"
    disabled={isLoading}
    className={`
      w-full px-4 py-2 rounded-md text-white font-medium transition-colors
      ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}
    `}
  >
    {isLoading ? 'Printing...' : 'Print Document'}
  </button>
</form>
  );
};

PrintOptions.propTypes = {
  onOptionsSelected: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  initialOptions: PropTypes.shape({
    pages: PropTypes.string,
    copies: PropTypes.number,
    orientation: PropTypes.string,  // Added prop type for orientation
  })
};

export default PrintOptions;
