const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');

// Quiz questions JSON file එක load කරගැනීම
const QUIZ_QUESTIONS_FILE = path.join(__dirname, '../data/quiz_questions.json'); 
let quizQuestions = [];
try {
    quizQuestions = JSON.parse(fs.readFileSync(QUIZ_QUESTIONS_FILE, 'utf8'));
    // Validate each question to ensure 'correct_answer_text' exists
    quizQuestions = quizQuestions.filter(q => {
        if (!q.correct_answer_text) {
            console.warn(`Question "${q.question}" is missing 'correct_answer_text' and will be skipped.`);
            return false;
        }
        return true;
    });
    if (quizQuestions.length === 0) {
        console.warn("quiz_questions.json is empty or contains no valid questions with 'correct_answer_text'.");
    }
} catch (error) {
    console.error(`Error loading quiz_questions.json from ${QUIZ_QUESTIONS_FILE}:`, error.message);
    quizQuestions = []; 
}

// Quiz answers (explanations) JSON file එක load කරගැනීම
const QUIZ_ANSWERS_FILE = path.join(__dirname, '../data/quiz_answers.json'); 
let quizExplanations = {}; // { correct_answer_letter: "Explanation text" }
try {
    quizExplanations = JSON.parse(fs.readFileSync(QUIZ_ANSWERS_FILE, 'utf8'));
} catch (error) {
    console.error(`Error loading quiz_answers.json from ${QUIZ_ANSWERS_FILE}:`, error.message);
    quizExplanations = {};
}

// Quiz ක්‍රියාත්මක වන group JID එක ගබඩා කිරීමට
const QUIZ_STATE_FILE = path.join(__dirname, '../data/quiz_state.json'); 
let quizEnabledGroupJid = null;
let quizIntervalId = null;
let currentQuizQuestionIndex = -1; // දැනට ක්‍රියාත්මක ප්‍රශ්නයේ index එක
let activeQuizQuestionJid = null; // ප්‍රශ්නය යැවූ JID
let activeQuizQuestionMessageId = null; // ප්‍රශ්න message එකේ ID එක (quoted reply සඳහා)
let answeredParticipants = new Set(); // දැනට ක්‍රියාත්මක ප්‍රශ්නයට පිළිතුරු දුන් අයගේ JIDs

// Bot start වන විට, කලින් තිබූ state එක load කරගැනීම
function loadQuizState() {
    try {
        if (fs.existsSync(QUIZ_STATE_FILE)) {
            const state = JSON.parse(fs.readFileSync(QUIZ_STATE_FILE, 'utf8'));
            if (state && state.groupJid) {
                quizEnabledGroupJid = state.groupJid;
                console.log(`Loaded quiz state: Quiz enabled for JID ${quizEnabledGroupJid}`);
            }
        }
    } catch (error) {
        console.error("Error loading quiz_state.json:", error);
    }
}

// Quiz state එක save කිරීම
function saveQuizState() {
    try {
        const dataDir = path.dirname(QUIZ_STATE_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        const state = { groupJid: quizEnabledGroupJid };
        fs.writeFileSync(QUIZ_STATE_FILE, JSON.stringify(state, null, 2), 'utf8'); 
        console.log(`Quiz state saved for JID: ${quizEnabledGroupJid}`);
    } catch (error) {
        console.error("Error saving quiz_state.json:", error);
    }
}

// Quiz Interval එක ආරම්භ කිරීමේ function එක
function startQuizInterval(conn, jid) {
    if (quizIntervalId) {
        clearInterval(quizIntervalId); 
        console.log(`Cleared existing quiz interval for ${jid}`);
    }
    quizIntervalId = setInterval(async () => {
        const activeConn = global.currentConn || global.client; 
        if (activeConn && quizEnabledGroupJid) {
            await sendQuizQuestion(activeConn, quizEnabledGroupJid);
        } else {
            console.warn("No active connection object found or quiz not enabled for any group. Stopping interval.");
            if (quizIntervalId) {
                clearInterval(quizIntervalId);
                quizIntervalId = null;
            }
        }
    }, 60 * 60 * 1000); // 1 hour (60 minutes * 60 seconds * 1000 milliseconds)
    console.log(`Quiz interval started for ${jid}`);
}

// Bot ආරම්භ වන විට state එක load කරන්න.
loadQuizState(); 

// --- Helper Functions ---

function getContentType(message) {
    if (message.imageMessage) return 'imageMessage';
    if (message.videoMessage) return 'videoMessage';
    if (message.extendedTextMessage) return 'extendedTextMessage';
    if (message.buttonsResponseMessage) return 'buttonsResponseMessage';
    if (message.listResponseMessage) return 'listResponseMessage';
    if (message.templateButtonReplyMessage) return 'templateButtonReplyMessage';
    if (message.text) return 'text';
    return null;
}

// --- Quiz Commands ---

// ප්‍රශ්නයක් text එකක් ලෙස යැවීම සඳහා වන function එක
async function sendQuizQuestion(conn, jid) {
    if (quizQuestions.length === 0) {
        await conn.sendMessage(jid, { text: "මට පෙන්වීමට ප්‍රශ්න නැත. කරුණාකර quiz_questions.json ගොනුව නිවැරදිව සකසා ඇති බවට තහවුරු කරන්න, 'correct_answer_text' fields ඇතුළත්ව." });
        return false; 
    }

    currentQuizQuestionIndex = Math.floor(Math.random() * quizQuestions.length);
    const questionData = quizQuestions[currentQuizQuestionIndex];

    let quizMessage = `*ප්‍රශ්නය:* ${questionData.question}\n\n`;
    questionData.options.forEach((option, index) => {
        quizMessage += `${String.fromCharCode(65 + index)}. ${option}\n`; // A. Option1, B. Option2, ... E. Option5
    });
    quizMessage += "\n*නිවැරදි පිළිතුරේ අකුර හෝ 'answer: [ඔබගේ පිළිතුර]' ලෙස type කරන්න.*"; // උපදෙස් වෙනස් කර ඇත

    const sentMsg = await conn.sendMessage(jid, { text: quizMessage });
    
    activeQuizQuestionJid = jid;
    activeQuizQuestionMessageId = sentMsg.key.id; // ප්‍රශ්න message එකේ ID එක ගබඩා කරන්න
    answeredParticipants.clear(); // අලුත් ප්‍රශ්නයක් එවන විට පිළිතුරු දුන් අයගේ ලැයිස්තුව clear කරන්න
    console.log(`Sent quiz question (Text) to ${jid}. Question index: ${currentQuizQuestionIndex}, Message ID: ${activeQuizQuestionMessageId}`);
    return true; 
}


// .startmrdai Command (පැයෙන් පැයට Quiz එක ආරම්භ කිරීමට) - දැන් ඕනෑම කෙනෙකුට භාවිතා කළ හැක
cmd({
    pattern: "startmrdai",
    react: "✅",
    desc: "Start MR D AI quiz in this group (hourly).",
    category: "quiz",
    use: '.startmrdai',
    filename: __filename,
},
async(conn, mek, m,{from, isGroup, reply}) => { 
    // Global connection object එක set කරන්න
    global.currentConn = conn; 

    if (!isGroup) return reply("❌ *මෙම command එක Groups වලට පමණක් භාවිතා කළ හැක!*");

    if (quizEnabledGroupJid === from) {
        return reply("✅ *Quiz එක දැනටමත් මෙම Group එකේ සක්‍රීයයි!*");
    }

    quizEnabledGroupJid = from;
    saveQuizState(); 

    // Group metadata ලබා ගැනීමට උත්සාහ කිරීම
    let groupName = "මෙම Group එකේ"; 
    try {
        const metadata = await conn.groupMetadata(from);
        if (metadata && metadata.subject) {
            groupName = `"${metadata.subject}" Group එකේ`;
        }
    } catch (e) {
        console.error("Error fetching group metadata in quiz.js (startmrdai):", e.message);
    }

    reply(`✅ *MR D AI Quiz එක ${groupName} ආරම්භ කරන ලදී. සෑම පැයකට වරක්ම ප්‍රශ්නයක් එවනු ලැබේ.*`);
    
    // වහාම පළමු ප්‍රශ්නය යවන්න, පසුව interval එක ආරම්භ කරන්න
    await sendQuizQuestion(conn, from);
    startQuizInterval(conn, from); 
});


// .stopmrdai Command (Quiz එක නැවැත්වීමට) - දැන් ඕනෑම කෙනෙකුට භාවිතා කළ හැක
cmd({
    pattern: "stopmrdai",
    react: "❌",
    desc: "Stop MR D AI quiz in this group.",
    category: "quiz",
    use: '.stopmrdai',
    filename: __filename,
},
async(conn, mek, m,{from, isGroup, reply}) => { 
    if (!isGroup) return reply("❌ *මෙම command එක Groups වලට පමණක් භාවිතා කළ හැක!*");

    if (quizEnabledGroupJid !== from) {
        return reply("❌ *Quiz එක දැනටමත් මෙම Group එකේ සක්‍රීය නැත!*");
    }

    if (quizIntervalId) {
        clearInterval(quizIntervalId);
        quizIntervalId = null;
    }
    quizEnabledGroupJid = null;
    activeQuizQuestionJid = null;
    activeQuizQuestionMessageId = null;
    answeredParticipants.clear(); 
    saveQuizState(); 

    reply("🛑 *MR D AI Quiz එක නවත්වන ලදී.*");
});

// .getmrdai Command (එසැණින් ප්‍රශ්නයක් ලබා ගැනීමට) - දැන් ඕනෑම කෙනෙකුට භාවිතා කළ හැක
cmd({
    pattern: "getmrdai",
    react: "💡",
    desc: "Get a new MR D AI quiz question instantly.",
    category: "quiz",
    use: '.getmrdai',
    filename: __filename
},
async(conn, mek, m,{from, isGroup, reply}) => { 
    // Global connection object එක set කරන්න
    global.currentConn = conn;

    if (!isGroup) return reply("❌ *මෙම command එක Groups වලට පමණක් භාවිතා කළ හැක!*");
    
    const sent = await sendQuizQuestion(conn, from);
    if (!sent) {
        reply("😔 *දැනට ප්‍රශ්නයක් යැවීමට නොහැක.* කරුණාකර quiz_questions.json ගොනුව පරීක්ෂා කරන්න.");
    }
});

// --- Baileys messages.upsert event listener එක Quiz module එක තුළින්ම register කිරීම ---
let attempts = 0;
const MAX_ATTEMPTS = 5; 
const INITIAL_DELAY = 15000; 
const RETRY_DELAY = 5000; 

function tryRegisterQuizListener() {
    const connInstance = global.currentConn || global.client;
    if (connInstance && connInstance.ev && !connInstance._quizMessageUpsertHandlerRegistered) {
        console.log("Registering quiz message upsert handler...");
        
        connInstance.ev.on('messages.upsert', async ({ messages }) => {
            for (let i = 0; i < messages.length; i++) {
                const mek = messages[i];
                if (mek.key.fromMe || mek.key.remoteJid === 'status@broadcast') continue;

                const from = mek.key.remoteJid;
                const isGroup = from && from.endsWith('@g.us');

                if (isGroup && quizEnabledGroupJid === from && currentQuizQuestionIndex !== -1) {
                    const sender = mek.key.participant || from; 
                    
                    if (answeredParticipants.has(sender)) {
                        continue; 
                    }

                    const questionData = quizQuestions[currentQuizQuestionIndex];
                    if (!questionData || typeof questionData.answer_index === 'undefined' || !questionData.correct_answer_text) {
                        console.error("Invalid question data for current quiz question index (missing answer_index or correct_answer_text):", currentQuizQuestionIndex);
                        continue;
                    }

                    const correctAnswerIndex = questionData.answer_index;
                    const correctAnswerLetter = String.fromCharCode(65 + correctAnswerIndex); 
                    const correctTextAnswer = questionData.correct_answer_text.toLowerCase().trim(); // නිවැරදි පිළිතුර lowercase, trim කරගන්න

                    const messageType = getContentType(mek.message);
                    let userAnswerText = '';
                    
                    if (messageType === 'extendedTextMessage') {
                        userAnswerText = mek.message.extendedTextMessage.text;
                    } else if (messageType === 'text') {
                        userAnswerText = mek.message.text;
                    } else {
                        continue; 
                    }
                    
                    const userAnswer = userAnswerText.toLowerCase().trim(); // user ගේ පිළිතුර lowercase, trim කරගන්න

                    const botPrefix = global.config?.PREFIX || '!'; 
                    if (userAnswer.startsWith(botPrefix.toLowerCase())) { // prefix එකත් lowercase කරන්න
                        continue;
                    }

                    // පිළිතුරේ අකුර (A, B, C) හෝ සම්පූර්ණ පිළිතුර (answer: [text])
                    let isCorrect = false;
                    let answerType = ''; // "letter" or "text"

                    // 1. අකුරින් පිළිතුරු පරීක්ෂා කිරීම (A, B, C...)
                    if (userAnswer.toUpperCase() === correctAnswerLetter) {
                        isCorrect = true;
                        answerType = 'letter';
                    } 
                    // 2. "answer: [ඔබගේ පිළිතුර]" ආකෘතිය පරීක්ෂා කිරීම
                    else if (userAnswer.startsWith('answer:')) {
                        const submittedAnswer = userAnswer.substring('answer:'.length).trim();
                        if (submittedAnswer === correctTextAnswer) {
                            isCorrect = true;
                            answerType = 'text';
                        }
                    }
                    // 3. සෘජුව සම්පූර්ණ පිළිතුර text ලෙස type කිරීම පරීක්ෂා කිරීම (පිළිතුර 'answer:' prefix එකකින් තොරව)
                    else if (userAnswer === correctTextAnswer) {
                        isCorrect = true;
                        answerType = 'text_direct';
                    }


                    if (isCorrect) {
                        const userName = await connInstance.getName(sender);
                        const explanationText = quizExplanations[correctAnswerLetter] || "ඔබගේ පිළිතුර නිවැරදියි!";
                        
                        const replyMessage = `🎉 *${userName}*, ඔබගේ පිළිතුර නිවැරදියි! ${explanationText}`;

                        if (activeQuizQuestionMessageId && activeQuizQuestionJid === from) {
                            await connInstance.sendMessage(from, { text: replyMessage }, { 
                                quoted: { 
                                    key: { remoteJid: from, id: activeQuizQuestionMessageId, fromMe: false }, 
                                    message: { conversation: questionData.question } 
                                } 
                            });
                        } else {
                            await connInstance.sendMessage(from, { text: replyMessage });
                        }

                        answeredParticipants.add(sender);
                        console.log(`Correct answer from ${userName} (${sender}). Answered type: ${answerType}, Correct text: ${questionData.correct_answer_text}. Explanation: ${explanationText}`);
                    }
                }
            }
        });
        connInstance._quizMessageUpsertHandlerRegistered = true; 
        
        if (quizEnabledGroupJid) {
            console.log(`Attempting to restart quiz interval for ${quizEnabledGroupJid} on bot start.`);
            startQuizInterval(connInstance, quizEnabledGroupJid);
        }
    } else if (connInstance && connInstance._quizMessageUpsertHandlerRegistered) {
        console.log("Quiz message upsert handler already registered.");
    } else {
        attempts++;
        if (attempts <= MAX_ATTEMPTS) {
            console.log(`No connection instance (global.currentConn or global.client) found or it's not ready yet. Retrying in ${RETRY_DELAY / 1000} seconds... (Attempt ${attempts}/${MAX_ATTEMPTS})`);
            setTimeout(tryRegisterQuizListener, RETRY_DELAY);
        } else {
            console.error("Failed to register quiz upsert handler after multiple attempts. Connection object not available.");
        }
    }
}

setTimeout(tryRegisterQuizListener, INITIAL_DELAY); 

// Quiz module එක export කරන්න
module.exports = {
    quizEnabledGroupJid,
    quizIntervalId,
    currentQuizQuestionIndex,
    quizQuestions,
    activeQuizQuestionJid,
    activeQuizQuestionMessageId,
    loadQuizState, 
    startQuizInterval,
};
