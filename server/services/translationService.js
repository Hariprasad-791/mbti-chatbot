// server/services/translationService.js
const { Translate } = require('@google-cloud/translate').v2;

// Set up authentication
const translate = new Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

exports.translateText = async (text, targetLanguage, sourceLanguage = null) => {
  try {
    const options = sourceLanguage ? { from: sourceLanguage, to: targetLanguage } : { to: targetLanguage };
    const [translation] = await translate.translate(text, options);
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text if translation fails
  }
};
