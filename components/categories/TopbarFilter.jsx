import React, { useState } from 'react';
import { LayoutGrid, Grid3X3, ChevronDown } from 'lucide-react';

const ProductTopBar = ({ totalProducts = 12, onGridChange, onSortChange }) => {
  const [activeGrid, setActiveGrid] = useState('four'); // 'three' or 'four'
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('Price: Low to High');

  const sortOptions = [
    'Price: Low to High',
    'Price: High to Low',
    'Alphabetical: A-Z',
    'Alphabetical: Z-A'
  ];

  const handleGridClick = (cols) => {
    setActiveGrid(cols);
    if (onGridChange) onGridChange(cols);
  };

  const handleSortClick = (option) => {
    setSelectedSort(option);
    setSortOpen(false);
    if (onSortChange) onSortChange(option);
  };

  return (
    <div className="w-full border-b border-gray-100 bg-white py-4 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: Product Count */}
        <div className="text-gray-500 font-medium text-sm md:text-base order-2 sm:order-1">
          Showing <span className="text-gray-800">{totalProducts}</span> elegant products
        </div>

        {/* Right: Controls Container */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end order-1 sm:order-2">
          
          {/* Grid Switcher (Hidden on small mobile) */}
          <div className="hidden lg:flex items-center bg-gray-50 p-1 rounded-lg">
            <button
              onClick={() => handleGridClick('three')}
              className={`p-1.5 rounded-md transition-all ${
                activeGrid === 'three' ? 'bg-white shadow-sm text-[#14532d]' : 'text-gray-400'
              }`}
            >
              <Grid3X3 size={20} />
            </button>
            <button
              onClick={() => handleGridClick('four')}
              className={`p-1.5 rounded-md transition-all ${
                activeGrid === 'four' ? 'bg-white shadow-sm text-[#14532d]' : 'text-gray-400'
              }`}
            >
              <LayoutGrid size={20} />
            </button>
          </div>

          {/* Custom Dropdown Filter */}
          <div className="relative w-full sm:w-64">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-[#14532d] rounded-xl text-sm font-medium text-gray-700 focus:outline-none transition-all"
            >
              {selectedSort}
              <ChevronDown 
                size={18} 
                className={`transition-transform duration-200 text-gray-400 ${sortOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {sortOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setSortOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
                  {sortOptions.map((option) => (
                    <div
                      key={option}
                      onClick={() => handleSortClick(option)}
                      className={`px-4 py-3 text-sm cursor-pointer transition-colors ${
                        selectedSort === option 
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTopBar;