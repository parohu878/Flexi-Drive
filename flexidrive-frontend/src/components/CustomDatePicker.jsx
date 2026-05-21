import { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import './CustomDatePicker.css';

export default function CustomDatePicker({ value, onChange, className = '', style = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    return value ? new Date(value) : new Date();
  });
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

  const handleDaySelect = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    onChange({ target: { value: dateStr } });
    setIsOpen(false);
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // 0: Mon, 6: Sun
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthNames = [
    'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
    'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'
  ];

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  // Previous month days to fill starting offset
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const days = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }
  
  // Next month fill days to make it multiples of 7
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }

  // Format active date for display
  const formatDateDisplay = (dateVal) => {
    if (!dateVal) return 'Selecciona data';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return d.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { value: '' } });
    setIsOpen(false);
  };

  const handleToday = (e) => {
    e.stopPropagation();
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    onChange({ target: { value: `${y}-${m}-${d}` } });
    setIsOpen(false);
  };

  return (
    <div className={`custom-datepicker-container ${className}`} ref={containerRef} style={style}>
      <button type="button" className={`custom-datepicker-trigger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span>{formatDateDisplay(value)}</span>
        <Icon name="calendar" size={13} className="datepicker-icon" color="var(--td)" />
      </button>

      {isOpen && (
        <div className="datepicker-popover fade-in">
          <div className="datepicker-header">
            <button type="button" className="dp-nav-btn" onClick={() => changeMonth(-1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="dp-month-year">{monthNames[month]} de {year}</div>
            <button type="button" className="dp-nav-btn" onClick={() => changeMonth(1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          <div className="dp-weekdays">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((w, idx) => (
              <span key={idx} className="dp-weekday">{w}</span>
            ))}
          </div>

          <div className="dp-days-grid">
            {days.map((item, index) => {
              const isSelected = item.isCurrentMonth && value && (() => {
                const valD = new Date(value);
                return valD.getDate() === item.day && valD.getMonth() === month && valD.getFullYear() === year;
              })();
              
              return (
                <button
                  type="button"
                  key={index}
                  disabled={!item.isCurrentMonth}
                  className={`dp-day-btn ${!item.isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleDaySelect(item.day)}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          <div className="datepicker-footer">
            <button type="button" className="btn-ghost-sm" style={{ padding: '4px 10px', fontSize: 11 }} onClick={handleClear}>Borrar</button>
            <button type="button" className="btn-ghost-sm" style={{ padding: '4px 10px', fontSize: 11 }} onClick={handleToday}>Avui</button>
          </div>
        </div>
      )}
    </div>
  );
}
