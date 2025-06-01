// ChatInterface.jsx - Replace the entire file
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TextareaAutosize from 'react-textarea-autosize';

const BOT_AVATAR = '/bot-avatar.png';

const EnhancedContextDetector = {
    detectContext: async (message) => {
        try {
            // Call the transformer-based emotion analysis
            const response = await axios.post('http://localhost:5001/analyze_emotion', {
                text: message
            });
            
            return {
                primary_context: response.data.primary_context,
                confidence: response.data.confidence,
                detected_emotions: response.data.emotions,
                all_contexts: response.data.all_contexts
            };
        } catch (error) {
            console.error('Emotion analysis failed:', error);
            // Fallback to simple keyword detection
            return {
                primary_context: 'normal',
                confidence: 0.0,
                detected_emotions: [['neutral', 0.5]],
                all_contexts: {}
            };
        }
    }
};

const ChatInterface = ({ user }) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        {
            isUser: false,
            message: `Hi ${user?.username || 'there'}! I'm your adaptive personality companion. Let's start by understanding your personality type through a quick assessment. 🌟`,
            timestamp: new Date().toISOString()
        }
    ]);
    const [userMbti, setUserMbti] = useState(user?.mbti || null);
    const [messageCount, setMessageCount] = useState(0);
    const [mcqIndex, setMcqIndex] = useState(0);
    const [mcqAnswers, setMcqAnswers] = useState([]);
    const [isMcqCompleted, setIsMcqCompleted] = useState(!!user?.mbti);
    const [previousContext, setPreviousContext] = useState('normal');
    // New state for context tracking
    const [currentContext, setCurrentContext] = useState('normal');
    const [isLoading, setIsLoading] = useState(false);
    
    const chatEndRef = useRef(null);

    // Complete MCQ Questions (12 questions as shown in your interface)
    const initialQuestions = [
        {
            q: "How do you prefer to spend your free time?",
            options: [
                "Attending social events or meeting new people",
                "Spending time alone or with a close friend",
                "Exploring nature or observing your surroundings",
                "Reflecting on abstract ideas or journaling"
            ]
        },
        {
            q: "In conversations, you tend to:",
            options: [
                "Talk about ideas and possibilities",
                "Focus on concrete facts and details",
                "Share personal experiences and feelings",
                "Discuss logical solutions to problems"
            ]
        },
        {
            q: "When problem-solving, you usually:",
            options: [
                "Brainstorm multiple creative solutions",
                "Follow a systematic, step-by-step approach",
                "Consider how it affects people involved",
                "Analyze data and logical connections"
            ]
        },
        {
            q: "You recall most easily:",
            options: [
                "The overall concepts and big picture",
                "Specific details and factual information",
                "How situations made you feel",
                "The logical structure of information"
            ]
        },
        {
            q: "You make decisions by:",
            options: [
                "Following your gut feeling and values",
                "Weighing pros and cons objectively",
                "Considering impact on relationships",
                "Using logical analysis and data"
            ]
        },
        {
            q: "In group work, you take on the role of someone who:",
            options: [
                "Generates ideas and motivates others",
                "Organizes tasks and ensures completion",
                "Mediates conflicts and supports team members",
                "Analyzes problems and provides solutions"
            ]
        },
        {
            q: "Your day is usually planned by:",
            options: [
                "Keeping it flexible for spontaneous activities",
                "Having a structured schedule with set times",
                "Balancing planned activities with free time",
                "Focusing on priority tasks without strict timing"
            ]
        },
        {
            q: "Your ideal work environment is:",
            options: [
                "Dynamic with variety and new challenges",
                "Organized with clear procedures and deadlines",
                "Collaborative with supportive colleagues",
                "Independent with minimal interruptions"
            ]
        },
        {
            q: "When plans change unexpectedly, you usually:",
            options: [
                "Adapt quickly and see it as an opportunity",
                "Feel stressed and prefer to stick to original plans",
                "Go with the flow if it doesn't hurt anyone",
                "Evaluate if the change makes logical sense"
            ]
        },
        {
            q: "In discussions, you:",
            options: [
                "Enjoy exploring different perspectives",
                "Prefer to have all the facts before contributing",
                "Focus on finding common ground",
                "Present logical arguments and evidence"
            ]
        },
        {
            q: "You're most productive when you:",
            options: [
                "Work in bursts of inspiration",
                "Follow a consistent routine",
                "Collaborate with others",
                "Have uninterrupted thinking time"
            ]
        },
        {
            q: "Your friends would say you're:",
            options: [
                "Enthusiastic and full of ideas",
                "Reliable and detail-oriented",
                "Caring and good at understanding others",
                "Logical and good at solving problems"
            ]
        }
    ];

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    useEffect(() => {
        const fetchUserMbti = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get('http://localhost:5000/api/user/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const mbti = res.data?.psychology?.mbti;
                if (mbti) {
                    setUserMbti(mbti);
                    setIsMcqCompleted(true);
                }
            } catch (err) {
                console.error('Failed to fetch user MBTI:', err);
            }
        };
        fetchUserMbti();
    }, []);

const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    setIsLoading(true); // Prevent duplicate requests
    const userMessage = message.trim();
    setMessage('');
    
    try {
        // Store previous context before updating
        setPreviousContext(currentContext);
        
        // Enhanced context detection using transformer
        const contextData = await EnhancedContextDetector.detectContext(userMessage);
        setCurrentContext(contextData.primary_context);
        
        const userEntry = {
            isUser: true,
            message: userMessage,
            timestamp: new Date().toISOString()
        };
        
        setChatHistory(prev => [...prev, userEntry]);
        setMessageCount(prev => prev + 1);

        const token = localStorage.getItem('token');
        
        // Store user message
        await axios.post(
            'http://localhost:5000/api/chat/analyze',
            { message: userMessage },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Get chat history
        const historyRes = await axios.get('http://localhost:5000/api/chat/history', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const recent = Array.isArray(historyRes.data) ? historyRes.data.slice(-5) : [];
        const chatHistoryForGemini = recent.map(entry => ({
            user: entry.message,
            bot: ""
        }));

        // Enhanced API call with emotion data
        const geminiRes = await axios.post('http://localhost:5001/enhanced_adaptive_generate', {
            user_query: userMessage,
            user_personality: userMbti,
            chat_history: chatHistoryForGemini,
            context_data: contextData // Send full emotion analysis
        });

        const botMessage = geminiRes.data.response;
        const adaptationInfo = geminiRes.data.adaptation_info;
        const emotionAnalysis = geminiRes.data.emotion_analysis;
        
        const botEntry = {
            isUser: false,
            message: botMessage,
            timestamp: new Date().toISOString(),
            adaptationInfo: adaptationInfo,
            emotionAnalysis: emotionAnalysis
        };

        // Store bot response
        await axios.post(
            'http://localhost:5000/api/chat/analyze',
            { message: botMessage },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setChatHistory(prev => [...prev, botEntry]);

    // Only show adaptation messages for significant changes
     if (contextData.primary_context !== 'normal' && 
    contextData.confidence > 0.7 && // Increase threshold
    contextData.primary_context !== previousContext &&
    contextData.primary_context !== 'academic_pressure') { // Don't show for academic pressure (too common)
    
    const adaptationEntry = {
        isUser: false,
        message: `🔄 Adapting to your ${contextData.primary_context.replace('_', ' ')}`,
        timestamp: new Date().toISOString(),
        isAdaptation: true
    };
    
    setTimeout(() => {
        setChatHistory(prev => [...prev, adaptationEntry]);
    }, 1500); // Increase delay
}


    } catch (err) {
        console.error('Enhanced generation failed:', err);
        setChatHistory(prev => [
            ...prev,
            {
                isUser: false,
                message: '⚠️ I\'m having trouble generating a thoughtful response right now. Please try again.',
                timestamp: new Date().toISOString()
            }
        ]);
    } finally {
        setIsLoading(false); // Always reset loading state
    }
};

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const combineAnswersForDatasetStyle = (questions, selectedAnswers) => {
        const responses = selectedAnswers.map((answerIndex, questionIndex) => {
            return questions[questionIndex].options[answerIndex].toLowerCase();
        });
        return `People often describe me as someone who ${responses[0]}, and I tend to ${responses[1]} in conversations. When problem-solving, I usually ${responses[2]} and recall ${responses[3]} most easily. I make decisions by ${responses[4]} and take on the role of someone who ${responses[5]} in group work. My day is usually planned by ${responses[6]}, and my work environment is ${responses[7]}. When plans change, I usually ${responses[8]}, and I ${responses[9]} in discussions. I'm most productive when I ${responses[10]}, and my friends say I'm ${responses[11]}.`.replace(/\s+/g, ' ').trim();
    };

    const summarizeAndPredict = async (questions, answers) => {
        try {
            const token = localStorage.getItem("token");
            const combinedText = combineAnswersForDatasetStyle(questions, answers);
            
            const mbtiResponse = await axios.post('http://localhost:5001/predict', {
                text: combinedText
            });
            
            const mbti = mbtiResponse.data.mbti;
            const confidence = mbtiResponse.data.confidence;
            
            await axios.post("http://localhost:5000/api/chat/update-mbti", {
                mbti: mbti
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUserMbti(mbti);
            setChatHistory(prev => [
                ...prev,
                { 
                    isUser: false, 
                    message: `🎯 **MBTI Type Detected**: ${mbti} (Confidence: ${(confidence * 100).toFixed(1)}%)\n\nGreat! Now I can provide personalized support tailored to your ${mbti} personality. Let's start our conversation - what's on your mind today?`, 
                    timestamp: new Date().toISOString() 
                }
            ]);
        } catch (err) {
            console.error("MBTI prediction failed:", err);
            setChatHistory(prev => [
                ...prev,
                { 
                    isUser: false, 
                    message: "⚠️ Failed to analyze personality. Please try again.", 
                    timestamp: new Date().toISOString() 
                }
            ]);
        }
    };

    // Enhanced MCQ Phase with proper styling
    if (!isMcqCompleted) {
        return (
            <div className="chat-container">
                <div className="mcq-header">
                    <h3>Personality Assessment</h3>
                    <div className="question-counter">
                        Question {mcqIndex + 1} of {initialQuestions.length}
                    </div>
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${((mcqIndex + 1) / initialQuestions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
                
                <div className="mcq-content">
                    <div className="question-text">
                        <h2>{initialQuestions[mcqIndex].q}</h2>
                    </div>
                    
                    <div className="mcq-options">
                        {initialQuestions[mcqIndex].options.map((opt, idx) => (
                            <button 
                                key={idx} 
                                className="mcq-option"
                                onClick={async () => {
                                    const updatedAnswers = [...mcqAnswers, idx];
                                    setMcqAnswers(updatedAnswers);
                                    
                                    if (mcqIndex === initialQuestions.length - 1) {
                                        setIsMcqCompleted(true);
                                        await summarizeAndPredict(initialQuestions, updatedAnswers);
                                    } else {
                                        setMcqIndex(prev => prev + 1);
                                    }
                                }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Enhanced Chat UI
    return (
        <div className="chat-container">
            <div className="chat-header">
                <img src={BOT_AVATAR} alt="Bot Avatar" className="bot-avatar-header" />
                <div className="header-info">
                    <h2>{user?.username || 'User'}'s Adaptive Companion</h2>
                    {userMbti && (
                        <div className="personality-status">
                            <span className="mbti-badge">{userMbti}</span>
                            {currentContext !== 'normal' && (
                                <span className="context-indicator">🔄 {currentContext.replace('_', ' ')}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="chat-history">
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`message-bubble ${msg.isUser ? 'user' : 'bot'} ${msg.isAdaptation ? 'adaptation' : ''}`}>
                        {!msg.isUser && (
                            <div className="bot-meta">
                                <img src={BOT_AVATAR} alt="Bot" className="bot-avatar" />
                                {userMbti && <span className="mbti-badge">{userMbti}</span>}
                                {msg.adaptationInfo && (
                                    <span className="adaptation-badge">Adapted</span>
                                )}
                            </div>
                        )}
                        <div 
                            className="message-text" 
                            dangerouslySetInnerHTML={{ __html: msg.message.replace(/\n/g, '<br/>') }} 
                        />
                        <span className="timestamp">
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                        </span>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
         <div className="message-input-fixed">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    onKeyDown={handleInputKeyDown}
                    rows={1}
                    style={{
                        width: '100%',
                        minHeight: '44px',
                        maxHeight: '120px',
                        padding: '12px 16px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '20px',
                        fontSize: '15px',
                        fontFamily: 'inherit',
                        resize: 'none',
                        outline: 'none',
                        backgroundColor: '#f8f9fa',
                        boxSizing: 'border-box'
                    }}
                />
                <button 
                    onClick={handleSend} 
                    disabled={!message.trim()}
                    style={{
                        width: '80px',
                        height: '44px',
                        backgroundColor: '#6c5ce7',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginLeft: '12px'
                    }}
                >
                    Send
                </button>
            </div>

        </div>
    );
};

export default ChatInterface;
