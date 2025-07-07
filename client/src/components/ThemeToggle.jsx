import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    const themeClass = isDark ? 'dark-theme' : 'light-theme';
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(themeClass);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <button onClick={() => setIsDark(!isDark)} style={{
      position: 'absolute', top: '10px', right: '10px',
      padding: '0.5rem 1rem', borderRadius: '8px',
      border: 'none', cursor: 'pointer', backgroundColor: isDark ? '#444' : '#ddd'
    }}>
      {isDark ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
};

export default ThemeToggle;
