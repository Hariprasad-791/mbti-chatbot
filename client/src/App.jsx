// src/App.jsx - Replace with this enhanced version
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Auth from './components/Auth';
import ChatInterface from './components/ChatInterface';
import LanguageSelector from './components/LangaugeSelector';
import './i18n'; // Import i18n configuration
import './index.css';

function App() {
    const { i18n } = useTranslation();
    const [user, setUser] = useState(null);
    const [languageSelected, setLanguageSelected] = useState(false);

    useEffect(() => {
        // Check if language was previously selected
        const savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage) {
            i18n.changeLanguage(savedLanguage);
            setLanguageSelected(true);
        }
    }, [i18n]);

    const handleLanguageSelect = (language) => {
        setLanguageSelected(true);
        i18n.changeLanguage(language);
    };

    // Language selection flow
    if (!languageSelected) {
        return <LanguageSelector onLanguageSelect={handleLanguageSelect} />;
    }

    // Authentication and chat flow
    return (
        <div>
            {!user ? <Auth setUser={setUser} /> : <ChatInterface user={user} />}
        </div>
    );
}

export default App;
