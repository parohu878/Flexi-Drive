import { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import './CustomSelect.css';

export default function CustomSelect({ options, value, onChange, className = '', style = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const parsedOptions = options.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      return opt;
    }
    return { value: opt, label: opt };
  });

  const selectedOption = parsedOptions.find(opt => opt.value === value) || parsedOptions[0];

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div className={`custom-select-container ${className}`} ref={containerRef} style={style}>
      <button type="button" className={`custom-select-trigger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedOption ? selectedOption.label : value}</span>
        <span className="custom-select-arrow" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="10" height="10">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <ul className="custom-select-options fade-in">
          {parsedOptions.map((option) => (
            <li key={option.value} className={`custom-select-option ${option.value === value ? 'selected' : ''}`} onClick={() => handleSelect(option.value)}>
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
