// components/LanguageSelector.jsx
import React, { useState } from 'react';
import axios from 'axios';

const LanguageSelector = ({ user, onLanguageSelected }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(user.language || 'en');
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'te', name: 'తెలుగు (Telugu)' }
  ];
  
  const handleLanguageSelect = async () => {
    try {
      await axios.post('/api/users/update-language', 
        { language: selectedLanguage },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      onLanguageSelected(selectedLanguage);
    } catch (error) {
      console.error('Failed to update language preference:', error);
    }
  };
  
  return (
    <div className="language-selector">
      <h2>Select Your Preferred Language</h2>
      <div className="language-options">
        {languages.map(lang => (
          <button
            key={lang.code}
            className={`language-btn ${selectedLanguage === lang.code ? 'selected' : ''}`}
            onClick={() => setSelectedLanguage(lang.code)}
          >
            {lang.name}
          </button>
        ))}
      </div>
      <button 
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition"
        onClick={handleLanguageSelect}
      >
        Continue
      </button>
    </div>
  );
};

export default LanguageSelector;
