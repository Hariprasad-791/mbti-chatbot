// ChatInterface.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TextareaAutosize from 'react-textarea-autosize';

const BOT_AVATAR = '/bot-avatar.png';
const mbtiResponses = {
  'INTJ': [
    "I notice your analytical approach. INTJs like you often excel at strategic thinking and planning. Would you like to discuss your long-term goals?",
    "Your systematic thinking shows through! As an INTJ, you likely value efficiency and logical solutions. What complex problems are you working on?",
    "INTJs like you tend to be independent thinkers with deep insights. How do you usually approach difficult problems?"
  ],
  'INTP': [
    "I appreciate your logical analysis! INTPs often enjoy exploring theoretical concepts. What topics have you been researching lately?",
    "Your curiosity and problem-solving approach is typical of INTPs. Do you find yourself analyzing patterns and systems often?",
    "As an INTP, you likely enjoy understanding how things work at a deep level. What intellectual pursuits interest you most?"
  ],
  'ENTJ': [
    "I see that leadership quality in how you express yourself! ENTJs are natural organizers and strategic planners. What goals are you working toward?",
    "Your decisive approach suggests ENTJ qualities. How do you typically organize projects or lead others?",
    "ENTJs like you tend to be direct and efficiency-focused. How important is achievement and structure in your life?"
  ],
  'ENTP': [
    "Your inventive thinking stands out! ENTPs love generating new ideas and possibilities. What creative concepts have you been exploring?",
    "I notice that ENTP energy - always questioning and finding new angles. How do you approach debates and discussions?",
    "As an ENTP, you probably enjoy intellectual challenges. What interesting problems have captured your attention recently?"
  ],
  'INFJ': [
    "Your thoughtful perspective suggests INFJ traits. You likely have deep insights into people and situations. What insights have you had recently?",
    "INFJs like you often have a strong sense of purpose. What meaningful goals are you working toward?",
    "I notice your empathetic approach - typical of INFJs. How do you connect with others while maintaining your private inner world?"
  ],
  'INFP': [
    "Your authentic expression shows INFP qualities. What creative outlets or meaningful activities do you enjoy?",
    "As an INFP, you likely have strong personal values. What matters most to you in life?",
    "I sense that idealistic INFP nature in your words. How do you express your creativity and imagination?"
  ],
  'ENFJ': [
    "Your people-focused perspective suggests ENFJ traits. How do you help others grow and develop?",
    "ENFJs like you often have a gift for understanding others' needs. How do you support the important people in your life?",
    "I notice your warm, organized approach - typical of ENFJs. What communities or relationships are you nurturing?"
  ],
  'ENFP': [
    "Your enthusiasm comes through in your words! ENFPs like you often see exciting possibilities everywhere. What new ideas are inspiring you lately?",
    "You seem to have that ENFP spark - creative, warm, and people-oriented. Do you find yourself drawn to helping others realize their potential?",
    "As an ENFP, you likely value authenticity and meaningful connections. How important is it for you to express your true self?"
  ],
  'ISTJ': [
    "Your practical, detailed approach suggests ISTJ traits. How do you organize your responsibilities?",
    "ISTJs like you often value tradition and reliability. What principles guide your decisions?",
    "I notice your methodical thinking - typical of ISTJs. How do you ensure things are done correctly in your life?"
  ],
  'ISFJ': [
    "Your considerate nature suggests ISFJ qualities. How do you take care of the important people in your life?",
    "ISFJs like you often remember details about others and have a nurturing approach. What traditions or relationships do you value most?",
    "I notice your practical helpfulness - typical of ISFJs. How do you support others while meeting your own needs?"
  ],
  'ESTJ': [
    "Your organized approach suggests ESTJ traits. How do you maintain structure and efficiency in your life?",
    "ESTJs like you often excel at implementing practical systems. What methods do you use to stay productive?",
    "I notice your direct, practical style - typical of ESTJs. How do you balance maintaining order with adapting to change?"
  ],
  'ESFJ': [
    "Your people-focused comments suggest ESFJ traits. How do you build harmony in your relationships?",
    "ESFJs like you often excel at creating warm, supportive environments. What social connections are most important to you?",
    "I notice your cooperative approach - typical of ESFJs. How do you maintain traditions and care for others in your life?"
  ],
  'ISTP': [
    "I sense a practical, hands-on approach in your message. ISTPs like you often excel at solving concrete problems. Are you working on any projects?",
    "Your direct style suggests ISTP traits - analytical, reserved, yet action-oriented. Do you enjoy troubleshooting or fixing things?",
    "ISTPs typically prefer freedom and flexibility in their work and life. How important is independence to you?"
  ],
  'ISFP': [
    "Your authentic, in-the-moment style suggests ISFP traits. What creative or artistic interests do you enjoy?",
    "ISFPs like you often have a strong aesthetic appreciation. How do you express your creativity?",
    "I notice your gentle, individualistic approach - typical of ISFPs. What personal values guide your choices?"
  ],
  'ESTP': [
    "Your energetic, practical approach suggests ESTP traits. What active pursuits or challenges do you enjoy?",
    "ESTPs like you often excel in dynamic situations. How do you approach risk and immediate problem-solving?",
    "I notice your resourceful style - typical of ESTPs. How do you adapt to unexpected situations?"
  ],
  'ESFP': [
    "Your enthusiastic, people-oriented style suggests ESFP traits. How do you bring fun and engagement to your social circles?",
    "ESFPs like you often have a talent for enjoying the moment. What experiences do you find most energizing?",
    "I notice your warm, spontaneous approach - typical of ESFPs. How do you balance having fun with meeting responsibilities?"
  ]
};


const initialQuestions = [
  { q: "How do you prefer to spend your free time?", options: ["Reading", "Partying", "Hobbies", "Socializing"] },
  { q: "When solving problems, you rely more on:", options: ["Logic", "Feelings", "Experience", "Advice"] },
  { q: "You feel energized by:", options: ["Alone time", "Group activities", "New challenges", "Quiet reflection"] },
  { q: "In a team, you usually:", options: ["Lead", "Support", "Analyze", "Encourage"] },
  { q: "You make decisions based on:", options: ["Data", "Values", "Gut feeling", "Consensus"] },
  { q: "Routine tasks make you feel:", options: ["Comfortable", "Bored", "Efficient", "Trapped"] },
  { q: "When learning, you prefer:", options: ["Hands-on", "Theory", "Discussion", "Videos"] },
  { q: "In social settings, you:", options: ["Observe", "Engage", "Withdraw", "Adapt"] },
  { q: "Your desk is usually:", options: ["Organized", "Messy", "Balanced", "Flexible"] },
  { q: "You value most:", options: ["Truth", "Harmony", "Freedom", "Results"] },
];

const ChatInterface = ({ user }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      isUser: false,
      message: `Hi ${user?.username || 'there'}! 👋 I'm MindBot, your personality companion.`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [userMbti, setUserMbti] = useState(user?.mbti || null);
  const [messageCount, setMessageCount] = useState(0);
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState([]);
  const [isMcqCompleted, setIsMcqCompleted] = useState(!!user?.mbti);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

useEffect(() => {
  const fetchUserMbti = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const mbti = res.data?.psychology?.mbti;
      if (mbti) {
        setUserMbti(mbti);
        setIsMcqCompleted(true); // Skip MCQ if MBTI is already known
      }
    } catch (err) {
      console.error('Failed to fetch user MBTI:', err);
    }
  };

  fetchUserMbti();
}, []);


  const summarizeAndPredict = async (questions, answers) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/api/chat/summarize", {
        questions,
        answers
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const { summary, mbti } = response.data;

      setUserMbti(mbti);
      setChatHistory(prev => [
        ...prev,
        { isUser: false, message: `🧠 Summary: ${summary}`, timestamp: new Date().toISOString() },
        { isUser: false, message: `💡 MBTI Type Detected: ${mbti}`, timestamp: new Date().toISOString() }
      ]);
    } catch (err) {
      console.error("Summarization or MBTI failed:", err);
    }
  };

const handleSend = async () => {
  if (!message.trim()) return;

  const userMessage = message.trim();
  setMessage('');

  // Optimistically update UI
  const userEntry = {
    isUser: true,
    message: userMessage,
    timestamp: new Date().toISOString()
  };
  setChatHistory(prev => [...prev, userEntry]);
  setMessageCount(prev => prev + 1);

  try {
    const token = localStorage.getItem('token');

    // Store user message in DB
    await axios.post(
      'http://localhost:5000/api/chat/analyze',
      { message: userMessage },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Fetch last 5 messages for Gemini prompt context
    const historyRes = await axios.get('http://localhost:5000/api/chat/history', {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Defensive: if historyRes.data is not array or empty
    const recent = Array.isArray(historyRes.data) ? historyRes.data.slice(-5) : [];

    // Prepare chat_history format expected by Gemini API
    const chatHistoryForGemini = recent.map(entry => ({
      user: entry.message,
      bot: "" // Ideally extend this to fetch paired bot messages if available
    }));

    // Call Gemini generate API
    const geminiRes = await axios.post('http://localhost:5001/generate', {
      user_query: userMessage,
      user_personality: userMbti,
      chat_history: chatHistoryForGemini
    });

    const botMessage = geminiRes.data.response;

    // Add Gemini response to UI and DB
    const botEntry = {
      isUser: false,
      message: botMessage,
      timestamp: new Date().toISOString()
    };

    await axios.post(
      'http://localhost:5000/api/chat/analyze',
      { message: botMessage },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Optionally add MBTI personality template message
    let personalityMessage = '';
    if (userMbti && mbtiResponses[userMbti]) {
      const options = mbtiResponses[userMbti];
      personalityMessage = options[Math.floor(Math.random() * options.length)];
    }

    if (personalityMessage) {
      await axios.post(
        'http://localhost:5000/api/chat/analyze',
        { message: personalityMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    const personalityEntry = {
      isUser: false,
      message: personalityMessage,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [
      ...prev,
      botEntry,
      ...(personalityMessage ? [personalityEntry] : [])
    ]);
  } catch (err) {
    console.error('Gemini generation failed:', err.response?.data || err.message || err);

    setChatHistory(prev => [
      ...prev,
      {
        isUser: false,
        message: '⚠️ Failed to generate a thoughtful reply. Please try again.',
        timestamp: new Date().toISOString()
      }
    ]);
  }
};


  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // MCQ Phase
  if (!isMcqCompleted) {
    return (
      <div className="chat-container">
        <h3>{initialQuestions[mcqIndex].q}</h3>
        {initialQuestions[mcqIndex].options.map((opt, idx) => (
          <button key={idx} onClick={async () => {
            const updatedAnswers = [...mcqAnswers, opt];
            setMcqAnswers(updatedAnswers);

            if (mcqIndex === 9) {
              setIsMcqCompleted(true);
              await summarizeAndPredict(initialQuestions.map(q => q.q), updatedAnswers);
            } else {
              setMcqIndex(prev => prev + 1);
            }
          }}>
            {opt}
          </button>
        ))}
      </div>
    );
  }

  // Normal Chat UI
  return (
    <div className="chat-container">
      <div className="chat-header">
        <img src={BOT_AVATAR} alt="Bot Avatar" className="bot-avatar-header" />
        <h2>{user?.username || 'User'}'s Personality Insights</h2>
      </div>

      <div className="chat-history">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`message-bubble ${msg.isUser ? 'user' : 'bot'}`}>
            {!msg.isUser && (
              <div className="bot-meta">
                <img src={BOT_AVATAR} alt="Bot" className="bot-avatar" />
                {userMbti && <span className="mbti-badge">{userMbti}</span>}
              </div>
            )}
            <p className="message-text" dangerouslySetInnerHTML={{ __html: msg.message }} />
            <span className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="w-full border-t border-gray-300 p-4 bg-white">
        <div className="flex items-end gap-2">
          <TextareaAutosize
            minRows={1}
            maxRows={6}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            onKeyDown={handleInputKeyDown}
          />
          <button
            onClick={handleSend}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
