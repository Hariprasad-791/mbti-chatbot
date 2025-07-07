// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Auth translations
      "welcome": "Welcome Back",
      "createAccount": "Create Account",
      "email": "Email",
      "password": "Password",
      "username": "Username",
      "login": "Login",
      "signup": "Sign Up",
      "alreadyAccount": "Already have an account?",
      "noAccount": "Don't have an account?",
      
      // Chat translations
      "chatTitle": "Adaptive Personality Companion",
      "personalityAssessment": "Personality Assessment",
      "questionCounter": "Question {{current}} of {{total}}",
      "typingPlaceholder": "Type your message here...",
      "send": "Send",
      "mbtiDetected": "MBTI Type Detected: {{type}} (Confidence: {{confidence}}%)",
      "personalizedSupport": "Now I can provide personalized support tailored to your {{type}} personality!",
      "startConversation": "Let's start our conversation - what's on your mind today?",
      
      // MCQ Questions
 "freeTimeQuestion": "How do you prefer to spend your free time?",
  "freeTimeOptions": {
    "social": "Attending social events or meeting new people",
    "alone": "Spending time alone or with a close friend",
    "nature": "Exploring nature or observing your surroundings",
    "reflect": "Reflecting on abstract ideas or journaling"
  },

  "conversationQuestion": "In conversations, you usually:",
  "conversationOptions": {
    "ideas": "Talk about ideas and possibilities",
    "facts": "Focus on concrete facts and details",
    "experiences": "Share personal experiences and feelings",
    "solutions": "Discuss practical solutions"
  },

  "problemSolvingQuestion": "When solving problems, you tend to:",
  "problemSolvingOptions": {
    "creative": "Think of many creative solutions",
    "systematic": "Follow a structured, step-by-step method",
    "people": "Consider how it affects people",
    "logical": "Analyze data and logical patterns"
  },

  "recallQuestion": "You most easily recall:",
  "recallOptions": {
    "concepts": "Overall concepts and the big picture",
    "details": "Specific details and factual information",
    "feelings": "How things made you feel",
    "structure": "Structured logical frameworks"
  },

  "decisionQuestion": "You make decisions by:",
  "decisionOptions": {
    "gut": "Following your gut instinct and values",
    "pros": "Weighing pros and cons objectively",
    "relationships": "Considering impact on relationships",
    "analysis": "Using logical analysis and data"
  },

  "groupWorkQuestion": "In group work, you are often the one who:",
  "groupWorkOptions": {
    "motivator": "Generates ideas and motivates others",
    "organizer": "Organizes and ensures completion",
    "mediator": "Supports and resolves conflict",
    "analyzer": "Leads and makes decisions"
  },

  "planningQuestion": "Your day is usually planned by:",
  "planningOptions": {
    "flexible": "Keeping it open to spontaneous activities",
    "structured": "Following a fixed schedule with clear time slots",
    "balanced": "Balancing scheduled tasks and free time",
    "priority": "Focusing on priority tasks without strict timing"
  },

  "workEnvironmentQuestion": "Your ideal work environment is:",
  "workEnvironmentOptions": {
    "dynamic": "Fast-paced and full of new challenges",
    "organized": "Structured with clear procedures and deadlines",
    "collaborative": "Collaborative with supportive teammates",
    "independent": "Independent with minimal interruptions"
  },

  "changeQuestion": "When plans change unexpectedly, you:",
  "changeOptions": {
    "adapt": "Adapt quickly and see it as an opportunity",
    "stressed": "Feel stressed and prefer to stick to original plans",
    "flow": "Go with the flow as long as no one is hurt",
    "evaluate": "Evaluate if the change makes logical sense"
  },

  "discussionQuestion": "In discussions, you tend to:",
  "discussionOptions": {
    "explore": "Enjoy exploring different viewpoints",
    "facts": "Prioritize facts before contributing",
    "common": "Focus on finding common ground",
    "arguments": "Enjoy logical arguments and presenting evidence"
  },

  "productiveQuestion": "You are most productive when you:",
  "productiveOptions": {
    "bursts": "Work in short, intense bursts",
    "routine": "Follow a consistent routine",
    "collaborate": "Collaborate with others",
    "uninterrupted": "Have uninterrupted thinking time"
  },

  "friendsQuestion": "Your friends would describe you as:",
  "friendsOptions": {
    "enthusiastic": "Enthusiastic and full of ideas",
    "reliable": "Reliable and detail-oriented",
    "caring": "Caring and understanding",
    "logical": "Logical and efficient"
  },
      
      // Language selector
      "selectLanguage": "Select Your Language",
      "chooseLanguage": "Choose your preferred language to continue",
      "continue": "Continue"
    }
  },
  kn: {
    translation: {
      // Auth translations
      "welcome": "ಮತ್ತೆ ಸ್ವಾಗತ",
      "createAccount": "ಖಾತೆ ರಚಿಸಿ",
      "email": "ಇಮೇಲ್",
      "password": "ಪಾಸ್‌ವರ್ಡ್",
      "username": "ಬಳಕೆದಾರ ಹೆಸರು",
      "login": "ಲಾಗಿನ್",
      "signup": "ಸೈನ್ ಅಪ್",
      "alreadyAccount": "ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?",
      "noAccount": "ಖಾತೆ ಇಲ್ಲವೇ?",
      
      // Chat translations
      "chatTitle": "ಅಡಾಪ್ಟಿವ್ ವ್ಯಕ್ತಿತ್ವ ಸಹಚರ",
      "personalityAssessment": "ವ್ಯಕ್ತಿತ್ವ ಮೌಲ್ಯಮಾಪನ",
      "questionCounter": "ಪ್ರಶ್ನೆ {{current}} / {{total}}",
      "typingPlaceholder": "ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...",
      "send": "ಕಳುಹಿಸಿ",
      "mbtiDetected": "MBTI ಪ್ರಕಾರ ಪತ್ತೆಯಾಗಿದೆ: {{type}} (ವಿಶ್ವಾಸ: {{confidence}}%)",
      "personalizedSupport": "ಈಗ ನಾನು ನಿಮ್ಮ {{type}} ವ್ಯಕ್ತಿತ್ವಕ್ಕೆ ಸೂಕ್ತವಾದ ವೈಯಕ್ತಿಕ ಬೆಂಬಲವನ್ನು ಒದಗಿಸಬಲ್ಲೆ!",
      "startConversation": "ನಮ್ಮ ಸಂಭಾಷಣೆಯನ್ನು ಪ್ರಾರಂಭಿಸೋಣ - ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಏನಿದೆ?",
      
    // MCQ Questions in Kannada
      "freeTimeQuestion": "ನಿಮ್ಮ ಬಿಡುವಿನ ವೇಳೆಯನ್ನು ಹೇಗೆ ಕಳೆಯಲು ಇಷ್ಟಪಡುತ್ತೀರಿ?",
      "conversationQuestion": "ಸಂಭಾಷಣೆಗಳಲ್ಲಿ, ನೀವು ಸಾಮಾನ್ಯವಾಗಿ:",
      "problemSolvingQuestion": "ಸಮಸ್ಯೆ ಪರಿಹಾರದಲ್ಲಿ, ನೀವು ಸಾಮಾನ್ಯವಾಗಿ:",
      "recallQuestion": "ನೀವು ಸುಲಭವಾಗಿ ನೆನಪಿಸಿಕೊಳ್ಳುವುದು:",
      "decisionQuestion": "ನೀವು ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವುದು:",
      "groupWorkQuestion": "ಗುಂಪು ಕೆಲಸದಲ್ಲಿ, ನೀವು ಯಾರೊಬ್ಬರ ಪಾತ್ರವನ್ನು ವಹಿಸುತ್ತೀರಿ:",
      "planningQuestion": "ನಿಮ್ಮ ದಿನವನ್ನು ಸಾಮಾನ್ಯವಾಗಿ ಯೋಜಿಸುವುದು:",
      "workEnvironmentQuestion": "ನಿಮ್ಮ ಆದರ್ಶ ಕೆಲಸದ ವಾತಾವರಣ:",
      "changeQuestion": "ಯೋಜನೆಗಳು ಅನಿರೀಕ್ಷಿತವಾಗಿ ಬದಲಾದಾಗ, ನೀವು ಸಾಮಾನ್ಯವಾಗಿ:",
      "discussionQuestion": "ಚರ್ಚೆಗಳಲ್ಲಿ, ನೀವು:",
      "productiveQuestion": "ನೀವು ಹೆಚ್ಚು ಉತ್ಪಾದಕವಾಗಿರುವುದು:",
      "friendsQuestion": "ನಿಮ್ಮ ಸ್ನೇಹಿತರು ನಿಮ್ಮನ್ನು ಹೇಳುತ್ತಾರೆ:",
      
      // MCQ Options in Kannada
      "freeTimeOptions": {
        "social": "ಸಾಮಾಜಿಕ ಕಾರ್ಯಕ್ರಮಗಳಿಗೆ ಹಾಜರಾಗುವುದು ಅಥವಾ ಹೊಸ ಜನರನ್ನು ಭೇಟಿಯಾಗುವುದು",
        "alone": "ಒಬ್ಬಂಟಿಯಾಗಿ ಅಥವಾ ನಿಕಟ ಸ್ನೇಹಿತರೊಂದಿಗೆ ಸಮಯ ಕಳೆಯುವುದು",
        "nature": "ಪ್ರಕೃತಿಯನ್ನು ಅನ್ವೇಷಿಸುವುದು ಅಥವಾ ಸುತ್ತಮುತ್ತಲಿನ ವಾತಾವರಣವನ್ನು ಗಮನಿಸುವುದು",
        "reflect": "ಅಮೂರ್ತ ವಿಚಾರಗಳ ಬಗ್ಗೆ ಚಿಂತಿಸುವುದು ಅಥವಾ ಡೈರಿ ಬರೆಯುವುದು"
      },
      
      "conversationOptions": {
        "ideas": "ವಿಚಾರಗಳು ಮತ್ತು ಸಾಧ್ಯತೆಗಳ ಬಗ್ಗೆ ಮಾತನಾಡುವುದು",
        "facts": "ಕಾಂಕ್ರೀಟ್ ಸತ್ಯಗಳು ಮತ್ತು ವಿವರಗಳ ಮೇಲೆ ಗಮನಹರಿಸುವುದು",
        "experiences": "ವೈಯಕ್ತಿಕ ಅನುಭವಗಳು ಮತ್ತು ಭಾವನೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳುವುದು",
        "solutions": "ಸಮಸ್ಯೆಗಳಿಗೆ ತಾರ್ಕಿಕ ಪರಿಹಾರಗಳನ್ನು ಚರ್ಚಿಸುವುದು"
      },
      
      "problemSolvingOptions": {
        "creative": "ಅನೇಕ ಸೃಜನಾತ್ಮಕ ಪರಿಹಾರಗಳನ್ನು ಚಿಂತಿಸುವುದು",
        "systematic": "ವ್ಯವಸ್ಥಿತ, ಹಂತ-ಹಂತದ ವಿಧಾನವನ್ನು ಅನುಸರಿಸುವುದು",
        "people": "ಅದು ಜನರ ಮೇಲೆ ಹೇಗೆ ಪರಿಣಾಮ ಬೀರುತ್ತದೆ ಎಂದು ಪರಿಗಣಿಸುವುದು",
        "logical": "ಡೇಟಾ ಮತ್ತು ತಾರ್ಕಿಕ ಸಂಪರ್ಕಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುವುದು"
      },
      
      "recallOptions": {
        "concepts": "ಒಟ್ಟಾರೆ ಪರಿಕಲ್ಪನೆಗಳು ಮತ್ತು ದೊಡ್ಡ ಚಿತ್ರ",
        "details": "ನಿರ್ದಿಷ್ಟ ವಿವರಗಳು ಮತ್ತು ವಾಸ್ತವಿಕ ಮಾಹಿತಿ",
        "feelings": "ಸನ್ನಿವೇಶಗಳು ನಿಮಗೆ ಹೇಗೆ ಅನಿಸಿದವು",
        "structure": "ಮಾಹಿತಿಯ ತಾರ್ಕಿಕ ರಚನೆ"
      },
      
      "decisionOptions": {
        "gut": "ನಿಮ್ಮ ಅಂತಃಪ್ರಜ್ಞೆ ಮತ್ತು ಮೌಲ್ಯಗಳನ್ನು ಅನುಸರಿಸುವುದು",
        "pros": "ಸಕಾರಾತ್ಮಕ ಮತ್ತು ನಕಾರಾತ್ಮಕ ಅಂಶಗಳನ್ನು ವಸ್ತುನಿಷ್ಠವಾಗಿ ತೂಗುವುದು",
        "relationships": "ಸಂಬಂಧಗಳ ಮೇಲಿನ ಪರಿಣಾಮವನ್ನು ಪರಿಗಣಿಸುವುದು",
        "analysis": "ತಾರ್ಕಿಕ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಡೇಟಾವನ್ನು ಬಳಸುವುದು"
      },
      
      "groupWorkOptions": {
        "motivator": "ವಿಚಾರಗಳನ್ನು ಸೃಷ್ಟಿಸುವ ಮತ್ತು ಇತರರನ್ನು ಪ್ರೇರೇಪಿಸುವ",
        "organizer": "ಕಾರ್ಯಗಳನ್ನು ಸಂಘಟಿಸುವ ಮತ್ತು ಪೂರ್ಣಗೊಳಿಸುವುದನ್ನು ಖಚಿತಪಡಿಸುವ",
        "mediator": "ಸಂಘರ್ಷಗಳನ್ನು ಮಧ್ಯಸ್ಥಿಕೆ ಮಾಡುವ ಮತ್ತು ತಂಡದ ಸದಸ್ಯರನ್ನು ಬೆಂಬಲಿಸುವ",
        "analyzer": "ಸಮಸ್ಯೆಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುವ ಮತ್ತು ಪರಿಹಾರಗಳನ್ನು ಒದಗಿಸುವ"
      },
      
      "planningOptions": {
        "flexible": "ಸ್ವಯಂಪ್ರೇರಿತ ಚಟುವಟಿಕೆಗಳಿಗೆ ಹೊಂದಿಕೊಳ್ಳುವಂತೆ ಇಡುವುದು",
        "structured": "ನಿಗದಿತ ಸಮಯಗಳೊಂದಿಗೆ ರಚನಾತ್ಮಕ ವೇಳಾಪಟ್ಟಿ ಹೊಂದುವುದು",
        "balanced": "ಯೋಜಿತ ಚಟುವಟಿಕೆಗಳನ್ನು ಮುಕ್ತ ಸಮಯದೊಂದಿಗೆ ಸಮತೋಲನಗೊಳಿಸುವುದು",
        "priority": "ಕಟ್ಟುನಿಟ್ಟಾದ ಸಮಯಸೀಮೆಯಿಲ್ಲದೆ ಆದ್ಯತೆಯ ಕಾರ್ಯಗಳ ಮೇಲೆ ಗಮನಹರಿಸುವುದು"
      },
      
      "workEnvironmentOptions": {
        "dynamic": "ವೈವಿಧ್ಯತೆ ಮತ್ತು ಹೊಸ ಸವಾಲುಗಳೊಂದಿಗೆ ಕ್ರಿಯಾಶೀಲ",
        "organized": "ಸ್ಪಷ್ಟ ಕಾರ್ಯವಿಧಾನಗಳು ಮತ್ತು ಗಡುವುಗಳೊಂದಿಗೆ ಸಂಘಟಿತ",
        "collaborative": "ಬೆಂಬಲಿಸುವ ಸಹೋದ್ಯೋಗಿಗಳೊಂದಿಗೆ ಸಹಯೋಗದ",
        "independent": "ಕನಿಷ್ಠ ಅಡಚಣೆಗಳೊಂದಿಗೆ ಸ್ವತಂತ್ರ"
      },
      
      "changeOptions": {
        "adapt": "ತ್ವರಿತವಾಗಿ ಹೊಂದಿಕೊಳ್ಳುವುದು ಮತ್ತು ಅದನ್ನು ಅವಕಾಶವಾಗಿ ನೋಡುವುದು",
        "stressed": "ಒತ್ತಡ ಅನುಭವಿಸುವುದು ಮತ್ತು ಮೂಲ ಯೋಜನೆಗಳಿಗೆ ಅಂಟಿಕೊಳ್ಳಲು ಆದ್ಯತೆ ನೀಡುವುದು",
        "flow": "ಅದು ಯಾರನ್ನೂ ನೋಯಿಸದಿದ್ದರೆ ಹರಿವಿನೊಂದಿಗೆ ಹೋಗುವುದು",
        "evaluate": "ಬದಲಾವಣೆಯು ತಾರ್ಕಿಕ ಅರ್ಥವನ್ನು ಮಾಡುತ್ತದೆಯೇ ಎಂದು ಮೌಲ್ಯಮಾಪನ ಮಾಡುವುದು"
      },
      
      "discussionOptions": {
        "explore": "ವಿವಿಧ ದೃಷ್ಟಿಕೋನಗಳನ್ನು ಅನ್ವೇಷಿಸುವುದನ್ನು ಆನಂದಿಸುವುದು",
        "facts": "ಕೊಡುಗೆ ನೀಡುವ ಮೊದಲು ಎಲ್ಲಾ ಸತ್ಯಗಳನ್ನು ಹೊಂದಲು ಆದ್ಯತೆ ನೀಡುವುದು",
        "common": "ಸಾಮಾನ್ಯ ನೆಲೆಯನ್ನು ಕಂಡುಹಿಡಿಯುವುದರ ಮೇಲೆ ಗಮನಹರಿಸುವುದು",
        "arguments": "ತಾರ್ಕಿಕ ವಾದಗಳು ಮತ್ತು ಪುರಾವೆಗಳನ್ನು ಪ್ರಸ್ತುತಪಡಿಸುವುದು"
      },
      
      "productiveOptions": {
        "bursts": "ಸ್ಫೂರ್ತಿಯ ಸ್ಫೋಟಗಳಲ್ಲಿ ಕೆಲಸ ಮಾಡುವುದು",
        "routine": "ಸ್ಥಿರವಾದ ದಿನಚರಿಯನ್ನು ಅನುಸರಿಸುವುದು",
        "collaborate": "ಇತರರೊಂದಿಗೆ ಸಹಯೋಗ ಮಾಡುವುದು",
        "uninterrupted": "ಅಡಚಣೆಯಿಲ್ಲದ ಚಿಂತನೆಯ ಸಮಯವನ್ನು ಹೊಂದುವುದು"
      },
      
      "friendsOptions": {
        "enthusiastic": "ಉತ್ಸಾಹಭರಿತ ಮತ್ತು ವಿಚಾರಗಳಿಂದ ತುಂಬಿದ",
        "reliable": "ವಿಶ್ವಾಸಾರ್ಹ ಮತ್ತು ವಿವರ-ಆಧಾರಿತ",
        "caring": "ಕಾಳಜಿವಹಿಸುವ ಮತ್ತು ಇತರರನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವಲ್ಲಿ ಉತ್ತಮ",
        "logical": "ತಾರ್ಕಿಕ ಮತ್ತು ಸಮಸ್ಯೆಗಳನ್ನು ಪರಿಹರಿಸುವಲ್ಲಿ ಉತ್ತಮ"
      },
      
      
      // Language selector
      "selectLanguage": "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ",
      "chooseLanguage": "ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ",
      "continue": "ಮುಂದುವರಿಸಿ"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
