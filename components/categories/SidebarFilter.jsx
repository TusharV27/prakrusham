import React, { useState, useEffect } from 'react';

const SidebarFilter = ({
  minPrice = '0',
  maxPrice = '',
  onMinChange,
  onMaxChange,
  selectedTag = null,
  onTagChange
}) => {
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isTagOpen, setIsTagOpen] = useState(true);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localSelectedTag, setLocalSelectedTag] = useState(selectedTag);
  const [tags, setTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);

  useEffect(() => {
    setLocalMinPrice(minPrice);
  }, [minPrice]);

  useEffect(() => {
    setLocalMaxPrice(maxPrice);
  }, [maxPrice]);

  useEffect(() => {
    setLocalSelectedTag(selectedTag);
  }, [selectedTag]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && data.data) {
          const allTags = data.data.flatMap(product => product.tags ? product.tags.split(',').map(tag => tag.trim()) : []);
          const uniqueTags = [...new Set(allTags)].filter(tag => tag);
          setTags(uniqueTags);
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      } finally {
        setLoadingTags(false);
      }
    };
    fetchTags();
  }, []);

  const handleMinChange = (e) => {
    const value = e.target.value;
    setLocalMinPrice(value);
    if (onMinChange) onMinChange(value);
  };

  const handleMaxChange = (e) => {
    const value = e.target.value;
    setLocalMaxPrice(value);
    if (onMaxChange) onMaxChange(value);
  };

  const handleTagChange = (tag) => {
    const newValue = localSelectedTag === tag ? null : tag;
    setLocalSelectedTag(newValue);
    if (onTagChange) onTagChange(newValue);
  };


  return (
    <div className="w-full font-sans px-4 sm:px-0">

      {/* Filter Header */}
      <div className="mb-5">
        
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900">
          Filter
        </h2>
        <div className="mb-5 pb-4 border-b border-slate-200"/>
      </div>

      {/* Price Range Filter */}
      <div className="border-b border-slate-200">
        <button
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="w-full flex items-center justify-between py-4 text-left"
        >
          <span className="uppercase tracking-wider text-xs sm:text-sm font-semibold text-slate-700">
            Price Range
          </span>

          <span className="text-lg text-slate-400">
            {isPriceOpen ? '−' : '+'}
          </span>
        </button>

        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isPriceOpen ? 'max-h-40 opacity-100 mb-6' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Min */}
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-slate-500 mb-1 uppercase">
                Min (₹)
              </label>
              <input
                type="number"
                placeholder="0"
                value={localMinPrice}
                onChange={handleMinChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-2 text-center text-sm font-medium outline-none"
              />
            </div>

            <div className="mt-5 text-slate-300">—</div>

            {/* Max */}
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-slate-500 mb-1 uppercase">
                Max (₹)
              </label>
              <input
                type="text"
                placeholder="MAX"
                value={localMaxPrice}
                onChange={handleMaxChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-2 text-center text-sm font-medium outline-none"
              />
            </div>

          </div>
        </div>
      </div>

      {/* Tag Filter */}
      <div className="border-b border-slate-200">
        <button
          onClick={() => setIsTagOpen(!isTagOpen)}
          className="w-full flex items-center justify-between py-4 text-left"
        >
          <span className="uppercase tracking-wider text-xs sm:text-sm font-semibold text-slate-700">
            Tags
          </span>

          <span className="text-lg text-slate-400">
            {isTagOpen ? '−' : '+'}
          </span>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isTagOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-3 pb-4">
            {loadingTags ? (
              <p className="text-slate-400 text-sm italic">Loading tags...</p>
            ) : tags && tags.length > 0 ? (
              tags.map((tag) => (
                <div key={tag} className="flex items-start">
                  <input
                    type="checkbox"
                    id={`tag-${tag}`}
                    checked={localSelectedTag === tag}
                    onChange={() => handleTagChange(tag)}
                    className="w-4 h-4 sm:w-5 sm:h-5 mt-1 rounded border-2 border-slate-200 bg-slate-50 cursor-pointer accent-green-600"
                  />

                  <label
                    htmlFor={`tag-${tag}`}
                    className="flex-1 ml-3 text-sm sm:text-base font-medium text-slate-700 cursor-pointer hover:text-slate-900 transition-colors wrap-break-word leading-relaxed"
                  >
                    {tag}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm italic">
                No tags available
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default SidebarFilter;