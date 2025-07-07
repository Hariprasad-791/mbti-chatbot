// ChatInterface.jsx - Replace the entire file

import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import TextareaAutosize from 'react-textarea-autosize';
import { useTranslation } from 'react-i18next';
const BOT_AVATAR = '/bot-avatar.png';
// Add this after your imports and before the ChatInterface component
const shouldAnalyzeEmotion = (message) => {
    const basicQueries = [
        'what', 'how', 'when', 'where', 'who', 'why',
        'explain', 'tell me', 'show me', 'help',
        'thanks', 'thank you', 'ok', 'okay', 'yes', 'no'
    ];
    
    const emotionalKeywords = [
        'feel', 'feeling', 'sad', 'happy', 'angry', 'frustrated',
        'stressed', 'worried', 'excited', 'nervous', 'anxious',
        'depressed', 'overwhelmed', 'confused', 'hurt', 'disappointed'
    ];
    
    const messageLower = message.toLowerCase();
    
    // Skip emotion detection for very short messages
    if (message.length < 10) return false;
    
    // Skip if it's clearly a basic informational query
    const isBasicQuery = basicQueries.some(keyword => 
        messageLower.startsWith(keyword) || messageLower.includes(`${keyword} `)
    );
    
    // Force emotion detection if emotional keywords are present
    const hasEmotionalContent = emotionalKeywords.some(keyword => 
        messageLower.includes(keyword)
    );
    
    return hasEmotionalContent || !isBasicQuery;
};

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
     const { t, i18n } = useTranslation();
    
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        {
            isUser: false,
            message: `Hi ${user?.username || 'there'}! I'm your ${t('chatTitle')}. Let's start by understanding your personality type through a quick assessment. 🌟`,
            timestamp: new Date().toISOString()
        }
    ]);
    const [userMbti, setUserMbti] = useState(user?.mbti || null);
    const [messageCount, setMessageCount] = useState(0);
    const [mcqIndex, setMcqIndex] = useState(0);
    const [mcqAnswers, setMcqAnswers] = useState([]);
    const [isMcqCompleted, setIsMcqCompleted] = useState(!!user?.mbti);
    const [previousContext, setPreviousContext] = useState('normal');
    const [currentContext, setCurrentContext] = useState('normal');
    const [isLoading, setIsLoading] = useState(false);
    const [emotionContext, setEmotionContext] = useState({
    current: 'normal',
    confidence: 0.0,
    lastAnalyzed: 0,
    persistenceCount: 0
});
     const [recentMessages, setRecentMessages] = useState([]);
    const chatEndRef = useRef(null);

    const analyzeRecentMessages = async (currentMessage) => {
        try {
            // Combine current message with last 2 messages for context
            const messagesToAnalyze = [...recentMessages.slice(-2), currentMessage];
            const combinedText = messagesToAnalyze.join(' ');
            
            console.log('Analyzing combined messages:', combinedText);
            
            const contextData = await EnhancedContextDetector.detectContext(combinedText);
            return contextData;
        } catch (error) {
            console.error('Batch emotion analysis failed:', error);
            // Fallback to single message analysis
            return await EnhancedContextDetector.detectContext(currentMessage);
        }
    };


    // Complete translated MCQ questions using useMemo
    const initialQuestions = useMemo(() => [
        {
            q: t("freeTimeQuestion"),
            options: [
                t("freeTimeOptions.social"),
                t("freeTimeOptions.alone"),
                t("freeTimeOptions.nature"),
                t("freeTimeOptions.reflect")
            ]
        },
        {
            q: t("conversationQuestion"),
            options: [
                t("conversationOptions.ideas"),
                t("conversationOptions.facts"),
                t("conversationOptions.experiences"),
                t("conversationOptions.solutions")
            ]
        },
        {
            q: t("problemSolvingQuestion"),
            options: [
                t("problemSolvingOptions.creative"),
                t("problemSolvingOptions.systematic"),
                t("problemSolvingOptions.people"),
                t("problemSolvingOptions.logical")
            ]
        },
        {
            q: t("recallQuestion"),
            options: [
                t("recallOptions.concepts"),
                t("recallOptions.details"),
                t("recallOptions.feelings"),
                t("recallOptions.structure")
            ]
        },
        {
            q: t("decisionQuestion"),
            options: [
                t("decisionOptions.gut"),
                t("decisionOptions.pros"),
                t("decisionOptions.relationships"),
                t("decisionOptions.analysis")
            ]
        },
        {
            q: t("groupWorkQuestion"),
            options: [
                t("groupWorkOptions.motivator"),
                t("groupWorkOptions.organizer"),
                t("groupWorkOptions.mediator"),
                t("groupWorkOptions.analyzer")
            ]
        },
        {
            q: t("planningQuestion"),
            options: [
                t("planningOptions.flexible"),
                t("planningOptions.structured"),
                t("planningOptions.balanced"),
                t("planningOptions.priority")
            ]
        },
        {
            q: t("workEnvironmentQuestion"),
            options: [
                t("workEnvironmentOptions.dynamic"),
                t("workEnvironmentOptions.organized"),
                t("workEnvironmentOptions.collaborative"),
                t("workEnvironmentOptions.independent")
            ]
        },
        {
            q: t("changeQuestion"),
            options: [
                t("changeOptions.adapt"),
                t("changeOptions.stressed"),
                t("changeOptions.flow"),
                t("changeOptions.evaluate")
            ]
        },
        {
            q: t("discussionQuestion"),
            options: [
                t("discussionOptions.explore"),
                t("discussionOptions.facts"),
                t("discussionOptions.common"),
                t("discussionOptions.arguments")
            ]
        },
        {
            q: t("productiveQuestion"),
            options: [
                t("productiveOptions.bursts"),
                t("productiveOptions.routine"),
                t("productiveOptions.collaborate"),
                t("productiveOptions.uninterrupted")
            ]
        },
        {
            q: t("friendsQuestion"),
            options: [
                t("friendsOptions.enthusiastic"),
                t("friendsOptions.reliable"),
                t("friendsOptions.caring"),
                t("friendsOptions.logical")
            ]
        }
    ], [t]);

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
    
    setIsLoading(true);
    const userMessage = message.trim();
    setMessage('');
    
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    
    try {
        setPreviousContext(currentContext);
        
        // Add message to recent messages for context
        setRecentMessages(prev => [...prev.slice(-4), userMessage]);
        
        let contextData;
        
        // Enhanced conditions for emotion analysis
        const shouldAnalyze = 
            messageCount === 0 || // First message
            messageCount - emotionContext.lastAnalyzed >= 5 || // Every 5 messages
            shouldAnalyzeEmotion(userMessage) || // Emotional content detected
            emotionContext.confidence < 0.3; // Low confidence context
        
        if (shouldAnalyze) {
            console.log('🔍 Performing emotion analysis...');
            
            // Use batch analysis for better context
            contextData = await analyzeRecentMessages(userMessage);
            
            setEmotionContext({
                current: contextData.primary_context,
                confidence: contextData.confidence,
                lastAnalyzed: messageCount,
                persistenceCount: 0
            });
            
            setCurrentContext(contextData.primary_context);
            
            console.log('✅ Emotion detected:', contextData.primary_context, 
                       'Confidence:', contextData.confidence);
        } else {
            console.log('📋 Using persisted emotion context...');
            
            // Use persisted context with gradually decreasing confidence
            const decayFactor = Math.max(0.1, 1 - (emotionContext.persistenceCount * 0.1));
            
            contextData = {
                primary_context: emotionContext.current,
                confidence: emotionContext.confidence * decayFactor,
                detected_emotions: [['neutral', 0.5]],
                all_contexts: {},
                persisted: true,
                decay_factor: decayFactor
            };
            
            setEmotionContext(prev => ({
                ...prev,
                persistenceCount: prev.persistenceCount + 1,
                confidence: prev.confidence * decayFactor
            }));
            
            console.log('📉 Persisted context:', emotionContext.current, 
                       'Decayed confidence:', contextData.confidence);
        }
        
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

        // Enhanced API call with language parameter
        const geminiRes = await axios.post('http://localhost:5001/enhanced_adaptive_generate', {
            user_query: userMessage,
            user_personality: userMbti,
            chat_history: chatHistoryForGemini,
            context_data: contextData,
            user_language: selectedLanguage
        });

        const botMessage = geminiRes.data.response;
        const adaptationInfo = geminiRes.data.adaptation_info;
        const emotionAnalysis = geminiRes.data.emotion_analysis;
        
        const botEntry = {
            isUser: false,
            message: botMessage,
            timestamp: new Date().toISOString(),
            adaptationInfo: adaptationInfo,
            emotionAnalysis: emotionAnalysis,
            contextUsed: contextData.persisted ? 'persisted' : 'analyzed'
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
            contextData.confidence > 0.6 && 
            contextData.primary_context !== previousContext &&
            !contextData.persisted) {
            
            const getKannadaContext = (context) => {
                const contextMap = {
                    'stress': 'ಒತ್ತಡ',
                    'social_anxiety': 'ಸಾಮಾಜಿಕ ಆತಂಕ',
                    'curiosity': 'ಕುತೂಹಲ',
                    'academic_pressure': 'ಶೈಕ್ಷಣಿಕ ಒತ್ತಡ',
                    'positive': 'ಧನಾತ್ಮಕ ಭಾವನೆ'
                };
                return contextMap[context] || context;
            };
            
            const adaptationEntry = {
                isUser: false,
                message: selectedLanguage === 'kn' 
                    ? `🔄 ನಿಮ್ಮ ${getKannadaContext(contextData.primary_context)}ಗೆ ಹೊಂದಿಕೊಳ್ಳುತ್ತಿದೆ`
                    : `🔄 Adapting to your ${contextData.primary_context.replace('_', ' ')}`,
                timestamp: new Date().toISOString(),
                isAdaptation: true
            };
            
            setTimeout(() => {
                setChatHistory(prev => [...prev, adaptationEntry]);
            }, 1000);
        }

    } catch (err) {
        console.error('Enhanced generation failed:', err);
        
        const errorMessage = selectedLanguage === 'kn' 
            ? '⚠️ ನಾನು ಈಗ ಉತ್ತರ ನೀಡಲು ಕಷ್ಟಪಡುತ್ತಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
            : '⚠️ I\'m having trouble generating a thoughtful response right now. Please try again.';
        
        setChatHistory(prev => [
            ...prev,
            {
                isUser: false,
                message: errorMessage,
                timestamp: new Date().toISOString()
            }
        ]);
    } finally {
        setIsLoading(false);
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
                    <h3>{t('personalityAssessment')}</h3>
                    <div className="question-counter">
                        {t('questionCounter', { current: mcqIndex + 1, total: initialQuestions.length })}
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
                    placeholder={t('typingPlaceholder')}
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
                    {t('send')}
                </button>
            </div>

        </div>
    );
};

export default ChatInterface;
