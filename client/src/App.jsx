import React, { useState } from 'react';
import Auth from './components/Auth';
import ChatInterface from './components/ChatInterface';
import './index.css';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      {!user ? <Auth setUser={setUser} /> : <ChatInterface user={user} />}
    </div>
  );
}

export default App;
