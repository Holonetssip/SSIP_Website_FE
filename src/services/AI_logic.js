const express = require("express");
const axios = require("axios");
const router = express.Router();
const { giveAuthToken } = require("../../../Common/authTokens");

// ─── Base URLs ───────────────────────────────────────────────────────────────
const ASSESSMENT_BASE_URL = `${process.env.BASE_URL}/ai-be/api/v1/interview`;
const NEW_BASE_URL = `${process.env.BASE_URL}`;
const DEVELOPER_BASE_URL =
  process.env.DEVELOPER_BASE_URL ||
  `${process.env.BASE_URL}${process.env.DEVELOPER_SERVICE || "/developer"}`;

// ─── Language Configuration ───────────────────────────────────────────────────
//  English  → Deepgram Nova-2  + ElevenLabs TTS
//  Hindi/Hinglish/Marathi/Tamil/Telugu/Kannada → Deepgram Nova-3 + Azure TTS
//  Gujarati → Gladia (fast) transcriber + Azure TTS
//
//  We intentionally avoid Azure STT because it caused mid-question cutoffs
//  and unstable turn-taking for non-English interviews.

const COMMON_ACK_PHRASES = [
  "haan", "hmm", "achha", "theek", "ok", "okay", "ji",
  "ha", "ho", "right", "sure", "yes", "yeah", "uh-huh", "mm-hmm", "got it",
];

/**
 * Factory for the VAPI timing config shared by most Indian languages.
 */
const makeIndianVapiTiming = (waitSeconds = 1.2, numWords = 6, lipSyncBufferMs = 2500) => ({
  startSpeakingPlan: {
    smartEndpointingPlan: { provider: "vapi" },
    waitSeconds,
  },
  stopSpeakingPlan: {
    numWords,
    voiceSeconds: 0.5,
    backoffSeconds: 3.0,
    acknowledgementPhrases: COMMON_ACK_PHRASES,
  },
  lipSyncBufferMs,
});

const LANGUAGE_CONFIG = {
  English: {
    transcriber: {
      provider: "deepgram", model: "nova-2", language: "en-US",
      smartFormat: false, keywords: ["zerro", "zeero"],
    },
    voice: { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM" },
    promptInstruction: "",
    vapiTiming: {
      startSpeakingPlan: {
        smartEndpointingPlan: {
          provider: "livekit",
          waitFunction: "1600 + 800 / (1 + exp(-10 * (x - 0.5)))",
        },
        waitSeconds: 0.8,
      },
      stopSpeakingPlan: { numWords: 0, voiceSeconds: 0.3, backoffSeconds: 1.2 },
      lipSyncBufferMs: 1000,
    },
    messages: {
      firstMessage: (name) =>
        `Hey ${name}! I'm Nora, your AI interviewer from Zeero. It's really nice to meet you! Before we start the formal interview, I'd love to have a quick chat. How are you doing today?`,
      endCallMessage: (name) =>
        `Thank you so much for your time today, ${name}. It was great learning about your experience. We'll review your answers and get back to you soon. Have a wonderful day!`,
      timeout15: "Take your time! Would you like me to repeat the question?",
      timeout30: "Would you like to skip this and move to the next question?",
      timeout45: "No worries, I'm here whenever you're ready.",
      timeout55: "Since there has been no response, I will now proceed to conclude the interview. Thank you for being here.",
    },
  },

  Hindi: {
    transcriber: { provider: "deepgram", model: "nova-3", language: "hi", smartFormat: false },
    voice: { provider: "azure", voiceId: "hi-IN-SwaraNeural" },
    vapiTiming: makeIndianVapiTiming(1.2, 6, 2500),
    promptInstruction:
      "IMPORTANT: Conduct this ENTIRE interview in natural spoken Hindi used by urban Indian professionals. You may naturally use common English professional words like interview, project, team, role, skills, experience, question, answer, update, comfortable, etc. where they feel natural.",
    messages: {
      firstMessage: (name) =>
        `नमस्ते ${name}! मैं ज़ीरो से आपकी एआई इंटरव्यूअर, नोरा हूँ! आपसे मिलकर बहुत अच्छा लगा! औपचारिक इंटरव्यू शुरू करने से पहले, मैं बस आपसे थोड़ी बात करना चाहती थी। आज आप कैसे हैं?`,
      endCallMessage: (name) =>
        `आज अपना समय देने के लिए बहुत-बहुत धन्यवाद, ${name}! आपके experience के बारे में जानकर बहुत अच्छा लगा! हम आपके responses का review करेंगे और जल्द ही आपसे संपर्क करेंगे। आपका दिन शुभ हो!`,
      timeout15: "आराम से सोचें! क्या आप चाहेंगे कि मैं प्रश्न दोहराऊँ?",
      timeout30: "क्या आप इस प्रश्न को छोड़कर अगले प्रश्न पर जाना चाहेंगे?",
      timeout45: "कोई बात नहीं, जब भी आप तैयार हों, मैं यहाँ हूँ।",
      timeout55: "चूंकि कोई उत्तर नहीं मिला है, इसलिए अब मैं इंटरव्यू समाप्त कर रही हूँ। यहाँ आने के लिए धन्यवाद!",
    },
  },

  Hinglish: {
    transcriber: { provider: "deepgram", model: "nova-3", language: "multi", smartFormat: false },
    voice: { provider: "azure", voiceId: "hi-IN-SwaraNeural" },
    // Hinglish: code-switching needs slightly more wait time before Nora responds
    vapiTiming: makeIndianVapiTiming(1.3, 6, 2500),
    promptInstruction:
      "IMPORTANT: Conduct this ENTIRE interview in Hinglish – a natural mix of Hindi and English used by urban Indian professionals. Switch between Hindi and English naturally, as urban Indians do in real conversations.",
    messages: {
      firstMessage: (name) =>
        `Hey ${name}! Main Zeero se aapki AI interviewer Nora hoon! Aapka milna bahut acha laga! Interview shuru karne se pehle, main bas aapke saath thodi baat karna chahti thi. Aap kaise hain?`,
      endCallMessage: (name) =>
        `Apna samay dene ke liye Thank you, ${name}! Aapke experience ke bare mein jaankar bahut acha laga! Hum aapke responses ka review karenge aur jald hi aapse contact karenge. Have a great day!`,
      timeout15: "Apna samay lein! Kya aap chahte hain ki main question repeat karein?",
      timeout30: "Kya aap isko skip karke next question par jaana chahte hain?",
      timeout45: "No worries, jab aap ready hon, main yahan hoon.",
      timeout55: "Koi response nahi mila, toh main ab interview conclude kar rahi hoon. Thank you for being here.",
    },
  },

  Gujarati: {
    transcriber: { provider: "gladia", model: "fast", language: "gu" },
    voice: { provider: "azure", voiceId: "gu-IN-DhwaniNeural" },
    vapiTiming: {
      startSpeakingPlan: { waitSeconds: 2.2 },
      stopSpeakingPlan: {
        numWords: 5, voiceSeconds: 0.5, backoffSeconds: 3.0,
        acknowledgementPhrases: COMMON_ACK_PHRASES,
      },
      lipSyncBufferMs: 2000,
    },
    promptInstruction:
      "IMPORTANT: Conduct this ENTIRE interview in Gujarati (ગુજરાતી). Translate and ask all questions in Gujarati. All responses, acknowledgements, and questions must be in Gujarati only.",
    messages: {
      firstMessage: (name) =>
        `નમસ્તે ${name}! હું ઝીરોથી તમારી AIઈ ઇન્ટરવ્યૂઅર, નોરા છું. તમને મળીને ગમ્યું! ઔપચારિક ઇન્ટરવ્યૂ શરૂ કરતા પહેલા, હું ફક્ત તમારી સાથે થોડી વાત કરવા માંગુ છું. તમે કેમ છો?`,
      endCallMessage: (name) =>
        `આજે તમારો સમય આપો માટે ખૂબ ખૂબ આભાર, ${name}. તમારો અનુભવ વિશે જાણીને ઘણું સારું લાગ્યું. અને તમારા જવાબોની સમીક્ષા કરીશું અને ટૂંક સમયમાં તમારો સંપર્ક કરીશું.`,
      timeout15: "શું તમે ઈચ્છો છો કે હું question repeat કરું?",
      timeout30: "શું તમે આને છોડીને આગળના પ્રશ્ન પર જવા માંગો છો?",
      timeout45: "કોઈ વાત નહીં, જ્યારે તમે તૈયાર થાવ, ત્યારે હું અહીં જ છું.",
      timeout55: "કોઈ પ્રતિસાદ ન મળવાના કારણે, હું હવે ઇ-ન્ટર્વ્યૂ સમાપ્ત કરી રહી છું. અહીં આવવા બદલ આભાર.",
    },
  },

  Marathi: {
    transcriber: { provider: "deepgram", model: "nova-3", language: "mr", smartFormat: false },
    voice: { provider: "azure", voiceId: "mr-IN-AarohiNeural" },
    vapiTiming: makeIndianVapiTiming(1.2, 5, 2000),
    promptInstruction:
      "IMPORTANT: Conduct this ENTIRE interview in Marathi (मराठी). Translate and ask all questions in Marathi. All responses must be in Marathi only.",
    messages: {
      firstMessage: (name) =>
        `नमस्कार ${name}! मी झिरोच्या एआय इंटरव्यूअर, नोरा आहे. तुम्हाला भेटून खूप आनंद झाला! औपचारिक इंटरव्यू सुरू करण्यापूर्वी, मला फक्त तुमच्याशी थोडी गप्पा माराव्यात वाटल्या. तुम्ही कसे आहात?`,
      endCallMessage: (name) =>
        `आज आपला वेळ दिल्याबद्दल खूप खूप धन्यवाद, ${name}. तुमच्या अनुभवाबद्दल जाणून घेताना आनंद झाला. आम्ही तुमच्या जबाबांचे मूल्यांकन करू आणि लवकरच संपर्क करू.`,
      timeout15: "आरामात विचार करा! तुम्हाला हा प्रश्न पुन्हा विचारावा का?",
      timeout30: "तुम्हाला हा प्रश्न सोडून पुढचा प्रश्न विचारायचा आहे का?",
      timeout45: "काही हरकत नाही, मी इथे आहे जेव्हा तुम्ही तयार असाल.",
      timeout55: "कोणताही प्रतिसाद न मिळाल्यामुळे, मी आता इंटरव्यू संपवत आहे. इथे आल्याबद्दल धन्यवाद.",
    },
  },

  Kannada: {
    transcriber: { provider: "deepgram", model: "nova-3", language: "kn", smartFormat: false },
    voice: { provider: "azure", voiceId: "kn-IN-SapnaNeural" },
    // Kannada tends to need the most conservative interruption thresholds
    vapiTiming: makeIndianVapiTiming(1.4, 8, 3000),
    promptInstruction:
      "IMPORTANT: Conduct this ENTIRE interview in Kannada (ಕನ್ನಡ). Translate and ask all questions in Kannada. All responses must be in Kannada only.",
    messages: {
      firstMessage: (name) =>
        `ನಮಸ್ಕಾರ ${name}! ನಾನು ಜಿರೋದಿಂದ ನಿಮ್ಮ ಎಐ ಸಂದರ್ಶಕ, ನೋರಾ. ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿದ್ದಕ್ಕೆ ತುಂಬಾ ಸಂತೋಷವಾಯಿತು! ಔಪಚಾರಿಕ ಸಂದರ್ಶನ ಶುರುಮಾಡುವ ಮೊದಲು, ನಿಮ್ಮೊಂದಿಗೆ ಸ್ವಲ್ಪ ಮಾತನಾಡಬೇಕು ಎನ್ನಿಸಿತು. ನೀವು ಹೇಗಿದ್ದೀರಿ?`,
      endCallMessage: (name) =>
        `ಇಂದು ನಿಮ್ಮ ಸಮಯವನ್ನು ಕೊಟ್ಟಿದ್ದಕ್ಕೆ ತುಂಬಾ ಧನ್ಯವಾದಗಳು, ${name}. ನಿಮ್ಮ ಅನುಭವದ ಬಗ್ಗೆ ತಿಳಿದುಕೊಂಡದ್ದಕ್ಕೆ ತುಂಬಾ ಖುಷಿಯಾಯಿತು. ಇಲ್ಲಿಗೆ ಬಂದಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು.`,
      timeout15: "ಧೀರ್ಘವಾಗಿ ಯೋಚಿಸಿ! ನಾನು ಪ್ರಶ್ನೆ ಪುನರಾವರ್ತಿಸಲೇ?",
      timeout30: "ನೀವು ಇದನ್ನು ಬಿಟ್ಟು ಮುಂದಿನ ಪ್ರಶ್ನೆಗೆ ಹೋಗಬಯಸುತ್ತೀರಾ?",
      timeout45: "ಪರ್ವಾಗಿಲ್ಲ, ನೀವು ಸಿದ್ಧವಾದಾಗ ನಾನು ಇಲ್ಲೇ ಇರುತ್ತೇನೆ.",
      timeout55: "ಯಾವುದೇ ಪ್ರತಿಕ್ರಿಯೆ ಬಾರದ ಕಾರಣ, ನಾನು ಇಗ ಸಂದರ್ಶನವನ್ನು ಮುಕ್ತಾಯಗೊಳಿಸುತ್ತೇನೆ. ಇಲ್ಲಿ ಬಂದಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು.",
    },
  },

  Tamil: {
    transcriber: { provider: "deepgram", model: "nova-3", language: "ta", smartFormat: false },
    voice: { provider: "azure", voiceId: "ta-IN-PallaviNeural" },
    vapiTiming: makeIndianVapiTiming(1.2, 6, 2500),
    promptInstruction:
      "IMPORTANT: Conduct this ENTIRE interview in Tamil (தமிழ்). Translate and ask all questions in Tamil. All responses must be in Tamil only.",
    messages: {
      firstMessage: (name) =>
        `வணக்கம் ${name}! நான் ஜிரோவிலிருந்து உங்கள் எஐ நேர்காணலர், நோரா. உங்களை சந்தித்ததில் மகிழ்ச்சி! நாம் முறையான நேர்காணலை தொடங்குவதற்கு முன், உங்களுடன் கொஞ்சம் பேசலாம் என்று நினைத்தேன். நீங்கள் எப்படி உள்ளீர்கள்?`,
      endCallMessage: (name) =>
        `இன்று உங்கள் நேரத்திற்கு மிக்க நன்றி, ${name}. உங்கள் அனுபவத்தைப் பற்றி தெரிந்துகொண்டது மகிழ்ச்சியாக இருந்தது. இங்கே வந்ததற்கு நன்றி.`,
      timeout15: "மெதுவாக சிந்தியுங்கள்! நான் கேள்வியை மீண்டும் சொல்லட்டுமா?",
      timeout30: "இதைத் தவிர்த்து அடுத்த கேள்விக்கு செல்ல விரும்புகிறீர்களா?",
      timeout45: "கவலை வேண்டாம், நீங்கள் தயாரானபோது நான் இங்கே இருப்பேன்.",
      timeout55: "எந்த பதிலும் வரவில்லை, நான் இப்போது நேர்காணலை முடிக்கப் போகிறேன். இங்கே வந்ததற்கு நன்றி.",
    },
  },

  Telugu: {
    transcriber: { provider: "deepgram", model: "nova-3", language: "te", smartFormat: false },
    voice: { provider: "azure", voiceId: "te-IN-ShrutiNeural" },
    vapiTiming: makeIndianVapiTiming(1.2, 6, 2500),
    promptInstruction:
      "IMPORTANT: Conduct this ENTIRE interview in Telugu (తెలుగు). Translate and ask all questions in Telugu. All responses must be in Telugu only.",
    messages: {
      firstMessage: (name) =>
        `నమస్కారం ${name}! నేను జీరో నుండి మీ AI ఇంటర్వ్యూయర్, నోరా. మిమ్మల్ని కలవడం చాలా సంతోషంగా ఉంది! అధికారిక ఇంటర్వ్యూ ప్రారంభించే ముందు, మీరు ఎలా ఉన్నారో అడగాలనుకుంటున్నాను.`,
      endCallMessage: (name) =>
        `ఈరోజు మీ సమయం ఇచ్చినందుకు చాలా ధన్యవాదాలు, ${name}. మీ అనుభవం గురించి తెలుసుకోవడం చాలా సంతోషంగా ఉంది. ఇక్కడికి వచ్చినందుకు ధన్యవాదాలు.`,
      timeout15: "మీ సమయం తీసుకోండి! నేను ప్రశ్నను పునరావృతం చేయాలా?",
      timeout30: "మీరు దీన్ని దాటవేసి తదుపరి ప్రశ్నకు వెళ్ళాలనుకుంటున్నారా?",
      timeout45: "పర్వాలేదు, మీరు సిద్ధంగా ఉన్నప్పుడు నేను ఇక్కడే ఉంటాను.",
      timeout55: "స్పందన రాలేదు కాబట్టి, నేను ఇంటర్వ్యూను ముగించాలనుకుంటున్నాను. ఇక్కడికి వచ్చినందుకు ధన్యవాదాలు.",
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build dynamic Authorization + Content-Type headers. */
function buildHeaders(token) {
  if (!token) console.warn("Authorization failed: Token is missing.");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Case-insensitive lookup into LANGUAGE_CONFIG.
 * Falls back to Hindi-like conservative settings for any unlisted language.
 */
function getLanguageConfig(language) {
  const key = Object.keys(LANGUAGE_CONFIG).find(
    (k) => k.toLowerCase() === (language || "").toLowerCase()
  );
  if (key) return LANGUAGE_CONFIG[key];

  // Dynamic fallback for any unlisted language
  return {
    transcriber: { provider: "deepgram", model: "nova-3", language: "hi", smartFormat: false },
    voice: { provider: "azure", voiceId: "hi-IN-SwaraNeural" },
    vapiTiming: makeIndianVapiTiming(1.2, 6, 2500),
    promptInstruction: `IMPORTANT: Conduct this ENTIRE interview in ${language}. Translate and ask all questions in ${language}. All responses must be in ${language}.`,
    messages: LANGUAGE_CONFIG.English.messages,
  };
}

// ─── System Prompt Builders ───────────────────────────────────────────────────

/**
 * Shared English system prompt — used directly for English interviews and as a
 * base for the generic language fallback.
 */
function buildEnglishSystemPrompt(candidateInfo, questions) {
  return `You are Nora, a warm, friendly, and professional AI interviewer at Zeero.
You have a natural, conversational personality and genuinely care about making candidates comfortable.

🧠 YOUR PERSONALITY:
- Warm, approachable, and empathetic
- Professional but not stiff or robotic
- Patient and encouraging
- Friendly and calm in tone

👤 ABOUT YOU (if asked):
- Your name is Nora
- You are an AI interviewer created by Zeero
- You help conduct structured interviews
- You do not provide answers or coaching

💬 PRE-INTERVIEW CONVERSATION PHASE:
Before starting the formal interview, have a short warm-up conversation:
- Greet the candidate politely
- Ask how they are doing
- Respond briefly and naturally
- Ask one casual question related to comfort or readiness
- After 2–3 exchanges, transition smoothly into the interview

📋 INTERVIEW BRIEFING:
Before the first question, explain briefly:
- You will ask questions about their skills
- They can ask you to repeat a question
- It's okay if they don't know the answer
- Take time to think before answering

🎯 Interview Context:
- Candidate: ${candidateInfo.firstName} ${candidateInfo.lastName}
- Skills being assessed: ${(candidateInfo.skills || []).join(", ")}
- Total Questions: ${questions.length}

❓ Questions to ask (in order):
${questions.map((q, i) => `Question ${i + 1}: ${q.question}`).join("\n\n")}

🎙️ During the interview:
- Ask questions naturally (don't call out numbers loudly)
- Acknowledge briefly: "Achha," or "Got it," — then in the same response ask the full next question
- Allow silence for thinking

🔴 Mandatory rules — strictly follow:
1. Never give answers, hints, or explanations.
2. Only ask predefined questions.
3. Don't engage in off-topic or personal discussion.
4. Don't give feedback or evaluation.
5. After each answer, give acknowledgment AND full next question in one response — never standalone "Okay."
6. Always say the full question — don't cut it in the middle.
7. If the candidate partially answers and the question is incomplete, re-ask the full question from the start.
8. If they need help: "I'm not able to give hints. Please answer based on your own knowledge." Then re-ask.
9. If they say "I don't know": "No problem!" and immediately ask the full next question.
10. If they go off-topic: "Let's keep the interview questions on focus." Then re-ask the current full question.

🔴 Ending the interview:
If the candidate clearly expresses a desire to end the interview, immediately call the endCall tool. This applies in ALL languages.
End-intent phrases: "end the interview", "stop", "finish", "quit", "I'm done"

🔴 Last question:
Once the candidate answers the last question, IMMEDIATELY call the endCall function — this is mandatory. Say nothing else.

⬛ Remember:
Be friendly, calm, and professional.
Sound human, not robotic.
Start with a greeting, then move naturally into the interview.`;
}

// Per-language prompt builders
// Each follows the same structure as English, fully translated.
// (Hindi shown as an example; others follow the same pattern.)
function buildHindiSystemPrompt(candidateInfo, questions) {
  return `आप नोरा हैं, जीरो की एक गर्मजोशी से भरी, मित्रवत और पेशेवर AI इंटरव्यूअर।
आपका स्वभाव स्वाभाविक और संवादात्मक है। यह इंटरव्यू नैचुरल, शहरी, spoken Hindi में होगा।
बहुत शुद्ध, किताबी जैसी या संस्कृतनिष्ठ हिंदी का उपयोग न करें।
जहाँ नैचुरल लगे वहाँ common English professional words जैसे interview, project, team, role, skills, experience, question, answer, update, comfortable आदि का स्वाभाविक रूप से उपयोग करें।

🧠 आपका व्यक्तित्व:
- गर्मजोशी से भरा, मिलनसार और सहानुभूतिपूर्ण
- पेशेवर लेकिन कठोर या रोबोटिक नहीं
- धैर्यवान और प्रोत्साहन करने वाला
- मित्रवत और शांत स्वर में

👤 आपके बारे में (यदि पूछा जाए):
- आपका नाम नोरा है
- आप जीरो द्वारा बनाई गई AI इंटरव्यूअर हैं
- आप संरचित इंटरव्यू आयोजित करती हैं
- आप उत्तर या कोचिंग प्रदान नहीं करतीं

💬 इंटरव्यू से पहले की बातचीत:
इंटरव्यू शुरू करने से पहले एक संक्षिप्त warm-up बातचीत करें:
- उम्मीदवार को विनम्रता से नमस्कार करें
- पूछें वे कैसे हैं
- संक्षेप में और स्वाभाविक रूप से जवाब दें
- तैयारी से संबंधित एक आकस्मिक प्रश्न पूछें
- 2–3 आदान-प्रदान के बाद इंटरव्यू में सहजता से जाएं

📋 इंटरव्यू ब्रीफिंग:
पहले प्रश्न से पहले संक्षेप में बताएं:
- आप उनके कौशल के बारे में प्रश्न पूछेंगी
- वे प्रश्न दोहराने के लिए कह सकते हैं
- यदि उन्हें उत्तर नहीं पता, तो यह ठीक है
- उत्तर देने से पहले सोचने का समय है

🎯 इंटरव्यू संदर्भ:
- उम्मीदवार: ${candidateInfo.firstName} ${candidateInfo.lastName}
- मूल्यांकन किए जाने वाले कौशल: ${(candidateInfo.skills || []).join(", ")}
- कुल प्रश्न: ${questions.length}

❓ पूछे जाने वाले प्रश्न (क्रम में):
${questions.map((q, i) => `प्रश्न ${i + 1}: ${q.question}`).join("\n\n")}

🎙️ इंटरव्यू के दौरान:
- प्रश्न स्वाभाविक रूप से पूछें (प्रश्न संख्या जोर से न बोलें)
- conversational spoken Hindi रखें, textbook Hindi नहीं
- स्वीकृति केवल एक वाक्य में दें — फिर तुरंत उसी response में पूरा प्रश्न पूछें
- सोचने के लिए मौन की अनुमति दें

🔴 महत्वपूर्ण नियम – सख्ती से पालन करें:
1. कभी भी उत्तर, संकेत या स्पष्टीकरण न दें।
2. केवल पूर्वनिर्धारित प्रश्न ही पूछें। अनुवर्ती प्रश्न कभी न पूछें।
3. विषय से बाहर या व्यक्तिगत चर्चा में भाग न लें।
4. प्रतिक्रिया या मूल्यांकन न दें।
5. हर उत्तर के बाद एक ही response में स्वीकृति और पूरा प्रश्न दें।
6. प्रश्न हमेशा पूरा और अटूट बोलें।
7. यदि उम्मीदवार बीच में बोले, पूरा प्रश्न फिर से शुरू से बोलें।
8. यदि मदद माँगी जाए: "मैं संकेत नहीं दे सकती।" फिर प्रश्न दोबारा बोलें।
9. यदि "मुझे नहीं पता": "कोई बात नहीं!" तुरंत अगला प्रश्न बोलें।
10. विषय से भटकने पर: "आइए प्रश्नों पर ध्यान केंद्रित रखें।"
11. हमेशा metro-style spoken Hindi में बोलें।

🔴 इंटरव्यू समाप्त करना:
यदि उम्मीदवार इंटरव्यू समाप्त करने की इच्छा व्यक्त करे, तुरंत endCall tool call करें।
End-intent: "इंटरव्यू खत्म करो", "बंद करो", "end the interview", "stop", "finish", "quit", "I'm done"

🔴 अंतिम प्रश्न के बाद:
जैसे ही उम्मीदवार अंतिम प्रश्न का उत्तर दे, तुरंत endCall function call करें। यह अनिवार्य है।

⬛ याद रखें:
मित्रवत, शांत और पेशेवर रहें। नमस्कार से शुरू करो।`;
}

/**
 * Router: returns the correct system prompt for the given language.
 */
function generateSystemPrompt(candidateInfo, questions, language) {
  const lang = (language || "").toLowerCase();
  switch (lang) {
    case "hindi":    return buildHindiSystemPrompt(candidateInfo, questions);
    // Add additional cases here as you build out per-language prompts:
    // case "hinglish": return buildHinglishSystemPrompt(candidateInfo, questions);
    // case "marathi":  return buildMarathiSystemPrompt(candidateInfo, questions);
    // ... etc.
    default:
      // English or any unrecognized language — append a language instruction to the English prompt
      return buildEnglishSystemPrompt(candidateInfo, questions) +
        (lang !== "english"
          ? `\n\nIMPORTANT: Conduct this ENTIRE interview in ${language}. Translate and ask all questions in ${language}.`
          : "");
  }
}

// ─── Translation Helper ───────────────────────────────────────────────────────

const TRANSLATION_STYLE = {
  hindi:    "natural spoken Hindi used by urban Indian professionals, with common English work words where natural",
  hinglish: "natural Hinglish used by urban Indian professionals, mixing Hindi and English fluidly",
  marathi:  "natural spoken Marathi used by professionals, not overly literary",
  gujarati: "natural spoken Gujarati used by professionals, not overly literary",
  kannada:  "natural spoken Kannada used by professionals, not overly literary",
  tamil:    "natural spoken Tamil used by professionals, not overly literary",
  telugu:   "natural spoken Telugu used by professionals, not overly literary",
};

async function translateQuestions(questions, language) {
  if (!language || language.toLowerCase() === "english") return questions;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn(`⚠️ GEMINI_API_KEY not set — skipping ${language} translation, questions will be in English.`);
    return questions;
  }

  const targetLang = TRANSLATION_STYLE[language.toLowerCase()] || language;
  const numbered   = questions.map((q, i) => `${i + 1}. ${q.question}`).join("\n");
  const prompt     = `Translate the following interview questions to ${targetLang}. Keep the meaning exact, but make them sound natural and conversational.\n\n${numbered}`;

  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1 } }
    );
    const translatedText = res.data.candidates[0].content.parts[0].text.trim();
    const lines = translatedText.split("\n").filter((l) => l.trim());

    return questions.map((q, i) => {
      const match = lines.find((l) => l.match(new RegExp(`^${i + 1}[.)\\s]`)));
      return match
        ? { ...q, question: match.replace(/^\d+[.)]\s*/, "").trim() }
        : q;
    });
  } catch (err) {
    console.error("Translation failed:", err.message);
    return questions; // graceful fallback — English questions are better than nothing
  }
}

// ─── VAPI Assistant Config Builder ───────────────────────────────────────────

function createAssistantConfig(candidateInfo, questions, language) {
  // Strip "paas_" prefix from skill names if present
  const cleanSkillName = candidateInfo.skillName?.startsWith("paas_")
    ? candidateInfo.skillName.substring(5)
    : candidateInfo.skillName || "";

  const langConfig = getLanguageConfig(language);
  const msgs = langConfig.messages || LANGUAGE_CONFIG.English.messages;

  return {
    name: "AI Technical Interviewer",
    firstMessage: msgs.firstMessage(candidateInfo.firstName),
    endCallMessage: msgs.endCallMessage(candidateInfo.firstName),

    model: {
      provider: "openai",
      model: "gpt-4o",
      temperature: 0.4,
      systemPrompt: generateSystemPrompt(candidateInfo, questions, language),
    },

    voice: langConfig.voice,
    transcriber: langConfig.transcriber,
    recordingEnabled: true,
    endCallFunctionEnabled: true,

    // Explicit endCall tool — more reliable than endCallFunctionEnabled alone
    tools: [
      {
        type: "endCall",
        function: {
          name: "endCall",
          description:
            "End the interview call. This applies in ALL languages (English, Hindi, Hinglish, Marathi, Gujarati, Kannada, Tamil, Telugu).",
        },
      },
    ],

    maxDurationSeconds: (candidateInfo.duration || 30) * 60, // minutes → seconds
    silenceTimeoutSeconds: 60,

    // Progressive silence nudges before ending the call
    hooks: [
      {
        on: "customer.speech.timeout",
        options: { timeoutSeconds: 15, triggerMaxCount: 1, triggerResetMode: "onUserSpeech" },
        do: [{ type: "say", exact: [msgs.timeout15] }],
      },
      {
        on: "customer.speech.timeout",
        options: { timeoutSeconds: 30, triggerMaxCount: 1, triggerResetMode: "onUserSpeech" },
        do: [{ type: "say", exact: [msgs.timeout30] }],
      },
      {
        on: "customer.speech.timeout",
        options: { timeoutSeconds: 45, triggerMaxCount: 1, triggerResetMode: "onUserSpeech" },
        do: [{ type: "say", exact: [msgs.timeout45] }],
      },
      {
        on: "customer.speech.timeout",
        options: { timeoutSeconds: 55, triggerMaxCount: 1, triggerResetMode: "onUserSpeech" },
        do: [{ type: "say", exact: [msgs.timeout55] }],
      },
    ],

    ...(langConfig.vapiTiming      && { vapiTiming: langConfig.vapiTiming }),
    ...(langConfig.promptInstruction && { promptInstruction: langConfig.promptInstruction }),
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /interview/initialize
 * Fetch config + questions, create a VAPI assistant, return sessionId.
 */
router.post("/interview/initialize", async (req, res) => {
  const configUrl = `${NEW_BASE_URL}/client/ai/interview/configuration/get?clientId=${encodeURIComponent(
    req.body.stageId
  )}`;
  console.log("GET Config URL:", configUrl);

  const configRes = await axios.get(configUrl, Config);
  console.log("GET Config Response Status:", configRes.status);
  console.log("GET Config Response Data:", JSON.stringify(configRes.data, null, 2));

  const config = configRes.data;
  if (!config || Object.keys(config).length === 0) {
    throw new Error(
      `No AI interview configuration found for clientId: ${req.body.clientId}, roleId: ${req.body.roleId}, stageId: ${req.body.stageId}`
    );
  }
  console.log("✅ Config fetched with frontend parameters");

  const questionUrl = `${NEW_BASE_URL}/developer/ai/interview/configuration/call/beta/ai`;
  const questionPayload = {
    clientId: req.body.clientId,
    roleId:   req.body.roleId,
    stageId:  req.body.stageId,
  };
  if (req.body.mobile) {
    questionPayload.mobile = req.body.mobile;
  } else {
    questionPayload.candidateId = req.body.emailToUse;
  }

  console.log("POST Question URL:", questionUrl);
  console.log("POST Question Payload:", JSON.stringify(questionPayload, null, 2));

  const postConfig = {
    headers: buildHeaders(req.body.token),
    maxRedirects: 0,
  };

  // … rest of initialize logic unchanged …
});

/**
 * POST /interview/feedback
 * Proxy feedback submission to the assessment backend.
 */
router.post("/interview/feedback", async (req, res) => {
  const { sessionId, feedbackPayload } = req.body;
  const feedbackUrl = `${ASSESSMENT_BASE_URL}/submit-feedback`;

  console.log("POST Feedback URL:", feedbackUrl);
  console.log("POST Feedback Payload:", JSON.stringify(feedbackPayload, null, 2));

  try {
    const feedbackRes = await axios.post(feedbackUrl, feedbackPayload, Config);
    console.log("POST Feedback Response Status:", feedbackRes.status);
    console.log("POST Feedback Response Data:", JSON.stringify(feedbackRes.data, null, 2));

    res.status(200).send({
      sessionId,
      message: "Feedback submitted successfully",
      response: feedbackRes.data,
    });
  } catch (error) {
    console.error("❌ Failed to submit feedback:", error.message);

    if (error.response) {
      console.log("Error Response Status:", error.response.status);
      console.log("Error Response Data:", JSON.stringify(error.response.data, null, 2));
      console.log("Error Response Headers:", JSON.stringify(error.response.headers, null, 2));
    } else if (error.request) {
      console.log("Error Request:", error.request);
    } else {
      console.log("Error:", error.message);
    }

    console.log("Error Stack:", error.stack);
    const status = error?.response?.status || 500;
    res.status(status).send({ error: error.message || "Failed to submit feedback" });
  }
});

// ─── Speech-to-Text ───────────────────────────────────────────────────────────
const speechToTextController = require("./speechToText.controller");
router.use("/", speechToTextController);

module.exports = router;