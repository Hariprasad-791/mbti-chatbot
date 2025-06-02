// src/components/LanguageSelector.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = ({ onLanguageSelect }) => {
    const { t, i18n } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' }
    ];

    const handleLanguageSelect = (langCode) => {
        setSelectedLanguage(langCode);
        i18n.changeLanguage(langCode);
    };

    const handleContinue = () => {
        localStorage.setItem('selectedLanguage', selectedLanguage);
        onLanguageSelect(selectedLanguage);
    };

    return (
        <div className="language-selector">
            <div className="language-content">
                <h2>{t('selectLanguage')}</h2>
                <p>{t('chooseLanguage')}</p>
                
                <div className="language-options">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            className={`language-btn ${selectedLanguage === lang.code ? 'selected' : ''}`}
                            onClick={() => handleLanguageSelect(lang.code)}
                        >
                            <span className="flag">{lang.flag}</span>
                            <span className="name">{lang.name}</span>
                        </button>
                    ))}
                </div>
                
                <button className="continue-btn" onClick={handleContinue}>
                    {t('continue')}
                </button>
            </div>
        </div>
    );
};

export default LanguageSelector;
