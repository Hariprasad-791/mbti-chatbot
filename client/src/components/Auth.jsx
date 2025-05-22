import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Auth = ({ setUser }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Clear errors when switching between auth modes
  useEffect(() => {
    setError('');
  }, [isSignup]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    // Client-side validation
    if (isSignup && !formData.username.trim()) {
      return setError('Username is required');
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      return setError('Invalid email format');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
  
    try {
      const endpoint = isSignup
      ? 'http://localhost:5000/api/auth/signup'
      : 'http://localhost:5000/api/auth/login';
    
      const { data } = await axios.post(endpoint, formData);
      
      if (!data.token) throw new Error('Authentication failed');
      
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         (isSignup ? 'Registration failed' : 'Login failed');
      setError(errorMessage);
    }
  };
  

  return (
    <div className="auth-container">
      <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
      
      <form onSubmit={handleSubmit}>
        {isSignup && (
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
            aria-label="Username"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
          aria-label="Email"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
          aria-label="Password"
          required
        />

        <button 
          type="submit" 
          disabled={isLoading}
          className={isLoading ? 'loading' : ''}
        >
          {isLoading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Login')}
        </button>
      </form>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <p className="auth-toggle">
        {isSignup ? 'Already have an account?' : "Don't have an account?"}
        <button 
          type="button"
          className="auth-switch"
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup ? 'Login' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
};

export default Auth;
