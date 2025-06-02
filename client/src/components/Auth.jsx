// src/components/Auth.jsx - Replace with this enhanced version
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Auth = ({ setUser }) => {
    const { t } = useTranslation();
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setError('');
    }, [isSignup]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Client-side validation
        if (isSignup && !formData.username.trim()) {
            setIsLoading(false);
            return setError('Username is required');
        }
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            setIsLoading(false);
            return setError('Invalid email format');
        }
        if (formData.password.length < 6) {
            setIsLoading(false);
            return setError('Password must be at least 6 characters');
        }

        try {
            const endpoint = isSignup
                ? 'http://localhost:5000/api/auth/signup'
                : 'http://localhost:5000/api/auth/login';
            
            // Include selected language in the request
            const requestData = {
                ...formData,
                language: localStorage.getItem('selectedLanguage') || 'en'
            };
            
            const { data } = await axios.post(endpoint, requestData);
            
            if (!data.token) throw new Error('Authentication failed');
            
            localStorage.setItem('token', data.token);
            setUser(data.user);
        } catch (err) {
            const errorMessage = err.response?.data?.message ||
                        err.message ||
                        (isSignup ? 'Registration failed' : 'Login failed');
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>{isSignup ? t('createAccount') : t('welcome')}</h2>
            <form onSubmit={handleSubmit}>
                {isSignup && (
                    <input
                        type="text"
                        placeholder={t('username')}
                        value={formData.username}
                        onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        aria-label={t('username')}
                    />
                )}
                <input
                    type="email"
                    placeholder={t('email')}
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    aria-label={t('email')}
                    required
                />
                <input
                    type="password"
                    placeholder={t('password')}
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    aria-label={t('password')}
                    required
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className={isLoading ? 'loading' : ''}
                >
                    {isLoading ? 'Processing...' : (isSignup ? t('signup') : t('login'))}
                </button>
            </form>
            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}
            <p className="auth-toggle">
                {isSignup ? t('alreadyAccount') : t('noAccount')}
                <button
                    type="button"
                    className="auth-switch"
                    onClick={() => setIsSignup(!isSignup)}
                >
                    {isSignup ? t('login') : t('signup')}
                </button>
            </p>
        </div>
    );
};

export default Auth;
