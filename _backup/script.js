/* ══════════════════════════════════════════════
   HETRON AI — Voice Assistant JavaScript
   ⚡ HET + ELECTRON — Power · Precision · Intelligence
   ══════════════════════════════════════════════ */

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;
let isFemale = true;
let voices = [];
let chatStarted = false;

// ══════════════════════════════════════════════
// 🌌 SPACE BACKGROUND
// ══════════════════════════════════════════════
function createSpaceBackground() {
    const spaceBg = document.querySelector('.space-bg');
    if (!spaceBg) return;

    const starsLayer = document.createElement('div');
    starsLayer.className = 'stars-layer';
    for (let i = 0; i < 120; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 3 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.setProperty('--dur', (2 + Math.random() * 4) + 's');
        star.style.animationDelay = Math.random() * 5 + 's';
        starsLayer.appendChild(star);
    }
    spaceBg.appendChild(starsLayer);

    for (let i = 0; i < 3; i++) {
        const ss = document.createElement('div');
        ss.className = 'shooting-star';
        ss.style.setProperty('--dur', (6 + Math.random() * 8) + 's');
        ss.style.setProperty('--delay', (i * 4 + Math.random() * 3) + 's');
        ss.style.setProperty('--top', (5 + Math.random() * 40) + '%');
        spaceBg.appendChild(ss);
    }

    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'cosmic-particle';
        const colors = ['rgba(0,240,255,0.4)', 'rgba(0,200,150,0.4)', 'rgba(0,136,204,0.3)', 'rgba(0,230,118,0.3)'];
        p.style.setProperty('--left', Math.random() * 100 + 'vw');
        p.style.setProperty('--dur', (6 + Math.random() * 8) + 's');
        p.style.setProperty('--delay', Math.random() * 10 + 's');
        p.style.setProperty('--size', (1.5 + Math.random() * 3) + 'px');
        p.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
        document.body.appendChild(p);
    }
}

// ─── Load Voices ───
function loadVoices() { voices = window.speechSynthesis.getVoices(); }
loadVoices();
window.speechSynthesis.onvoiceschanged = loadVoices;

function getVoice() {
    if (isFemale)
        return voices.find(v => /karen/i.test(v.name)) || voices.find(v => /samantha|zira|victoria|female/i.test(v.name)) || voices[1] || voices[0];
    return voices.find(v => /david|alex|daniel|mark|male/i.test(v.name)) || voices[0];
}

// ══════════════════════════════════════════════
// TEXT-TO-SPEECH
// ══════════════════════════════════════════════
function speak(text) {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const v = getVoice();
    if (v) utt.voice = v;
    utt.rate = 1;
    utt.pitch = isFemale ? 1.2 : 0.85;
    utt.onstart = () => setUIState('speaking');
    utt.onend = () => setUIState('idle');
    window.speechSynthesis.speak(utt);
}

// ══════════════════════════════════════════════
// WIKIPEDIA API (FREE)
// ══════════════════════════════════════════════
async function fetchWikipedia(query) {
    try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        return data.extract || null;
    } catch { return null; }
}

// ══════════════════════════════════════════════
// 🚀 OPEN APP FUNCTION — Instant open!
// ══════════════════════════════════════════════
function openApp(url, name, emoji) {
    window.open(url, '_blank');
    return `${emoji} Opening **${name}** for you!`;
}

// ══════════════════════════════════════════════
// 🧠 HETRON REPLY ENGINE — FAST, All Commands
// ══════════════════════════════════════════════
async function novaReply(text) {
    const t = text.toLowerCase().trim();

    // ─── Greetings ───
    if (/^(hello|hi|hey|namaste|hola|yo|sup)/i.test(t))
        return "Hello! 👋 I'm Hetron! How can I help you? ⚡";
    if (/your name|who are you|what are you/.test(t))
        return "I'm Hetron — your AI Voice Assistant! Power · Precision · Intelligence. I can open WhatsApp, Instagram, Facebook, ChatGPT, Grok, Gemini, Google Lens, search Wikipedia, open files and more! 🌟";
    if (/how are you|how do you do|kaise ho/.test(t))
        return "I'm great! 😊 Ready to help!";

    // ─── Time & Date ───
    if (/what time|current time|time now|time please|kitne baje|samay|time bata/.test(t))
        return `🕐 Time is **${new Date().toLocaleTimeString()}**`;
    if (/what.*(date|day)|today.*(date|day)|today's date|aaj ki date|date bata/.test(t))
        return `📅 Today is **${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**`;

    // ─── Jokes ───
    if (/joke|funny|laugh|mazaak|maza/.test(t)) {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything! 😄",
            "What do you call a fake noodle? An impasta! 🍝",
            "Why did the scarecrow win an award? Outstanding in his field! 🌾",
            "Why do programmers prefer dark mode? Light attracts bugs! 🐛",
            "Why do astronauts use Linux? Can't open Windows in space! 🚀",
            "What's an astronaut's favorite key? The space bar! ⌨️"
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // ─── Math ───
    if (/calculate|what is \d/.test(t)) {
        try {
            const expr = t.replace(/calculate|what is|what's|equals/gi, '').trim();
            const result = Function('"use strict"; return (' + expr + ')')();
            if (typeof result === 'number' && isFinite(result)) return `🔢 Answer: **${result}**`;
        } catch { }
    }

    // ══════════════════════════════════════════
    //  🌐 ALL APP COMMANDS — FAST OPEN!
    // ══════════════════════════════════════════

    // WhatsApp
    if (/open whatsapp|whatsapp kholo|whatsapp open/.test(t))
        return openApp('https://web.whatsapp.com', 'WhatsApp', '💬');

    // Instagram
    if (/open instagram|instagram kholo|instagram open/.test(t))
        return openApp('https://www.instagram.com', 'Instagram', '📸');

    // Facebook
    if (/open facebook|facebook kholo|facebook open/.test(t))
        return openApp('https://www.facebook.com', 'Facebook', '👥');

    // YouTube
    if (/open youtube|play youtube|youtube kholo|youtube open/.test(t))
        return openApp('https://www.youtube.com', 'YouTube', '▶');

    // ChatGPT
    if (/open (chatgpt|chat gpt)|chatgpt kholo|chatgpt open/.test(t))
        return openApp('https://chat.openai.com', 'ChatGPT', '✦');

    // Grok (xAI)
    if (/open grok|grok kholo|grok open/.test(t))
        return openApp('https://grok.com', 'Grok AI', '🤖');

    // Gemini (Google)
    if (/open gemini|gemini kholo|gemini open/.test(t))
        return openApp('https://gemini.google.com', 'Gemini AI', '💎');

    // Google Lens
    if (/open (google lens|lens)|google lens kholo|lens open/.test(t))
        return openApp('https://lens.google.com', 'Google Lens', '🔍');

    // Google
    if (/open google(?! lens)/.test(t))
        return openApp('https://www.google.com', 'Google', '🔍');

    // Wikipedia
    if (/open wikipedia|open wiki|wikipedia kholo/.test(t))
        return openApp('https://www.wikipedia.org', 'Wikipedia', '📚');

    // GitHub
    if (/open github|github kholo/.test(t))
        return openApp('https://github.com', 'GitHub', '⌘');

    // Twitter / X
    if (/open (twitter|x\.com|x )/i.test(t))
        return openApp('https://x.com', 'X (Twitter)', '🐦');

    // LinkedIn
    if (/open linkedin/.test(t))
        return openApp('https://www.linkedin.com', 'LinkedIn', '💼');

    // Gmail
    if (/open (gmail|email|mail)/.test(t))
        return openApp('https://mail.google.com', 'Gmail', '📧');

    // Spotify
    if (/open spotify/.test(t))
        return openApp('https://open.spotify.com', 'Spotify', '🎵');

    // Netflix
    if (/open netflix/.test(t))
        return openApp('https://www.netflix.com', 'Netflix', '🎬');

    // Amazon
    if (/open amazon/.test(t))
        return openApp('https://www.amazon.in', 'Amazon', '🛒');

    // Flipkart
    if (/open flipkart/.test(t))
        return openApp('https://www.flipkart.com', 'Flipkart', '🛍');

    // ─── Open Files ───
    if (/open file|file explorer|file manager|folder|my files|files kholo|file kholo/.test(t)) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.display = 'none';
        fileInput.multiple = true;
        document.body.appendChild(fileInput);
        fileInput.click();
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                const names = files.map(f => f.name).join(', ');
                addMessage(`📄 Files: **${names}**`, 'nova');
                speak(`You selected ${files.length} file${files.length > 1 ? 's' : ''}`);
            }
            fileInput.remove();
        });
        return "📁 File picker opened! Select your files.";
    }

    // ─── Shutdown PC ───
    if (/shutdown|shut down|pc band karo|computer off|power off|pc off/.test(t)) {
        showShutdownConfirm();
        return "⚠️ **Shutdown** confirmation shown!";
    }

    // ─── Wikipedia Search ───
    if (/search wikipedia|wiki search|search wiki/.test(t) || /search (.+) on wikipedia/.test(t)) {
        let query = t.replace(/search wikipedia for|search wiki for|search wikipedia|wiki search|search wiki|wikipedia|search|on wikipedia|for/gi, '').trim();
        if (query.length > 1) {
            const result = await fetchWikipedia(query);
            if (result) return `📚 **${query}**\n\n${result}`;
            return `❌ Nothing found for "${query}". Try different words!`;
        }
    }

    // General search - last resort for "search X"
    if (/^search (.+)/.test(t)) {
        let query = t.replace(/^search\s*/i, '').trim();
        if (query.length > 1) {
            const result = await fetchWikipedia(query);
            if (result) return `📚 **${query}**\n\n${result}`;
            // Fall through to Google search
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
            return `🔍 Searching Google for "**${query}**"!`;
        }
    }

    // ─── Goodbye ───
    if (/bye|goodbye|see you|good night|alvida/.test(t))
        return "Goodbye! 👋 See you soon! ⚡";
    if (/thank|thanks|thx|shukriya|dhanyavaad/.test(t))
        return "Welcome! 😊";

    // ─── Help ───
    if (/help|what can you do|features|kya kar sakte/.test(t))
        return "⚡ **Hetron Commands:**\n\n💬 \"Open WhatsApp\"\n📸 \"Open Instagram\"\n👥 \"Open Facebook\"\n✦ \"Open ChatGPT\"\n🤖 \"Open Grok\"\n💎 \"Open Gemini\"\n🔍 \"Open Google Lens\"\n▶ \"Open YouTube\"\n📧 \"Open Gmail\"\n📁 \"Open Files\"\n📚 \"Search Wikipedia for [topic]\"\n🕐 \"What time is it?\"\n😄 \"Tell me a joke\"\n⚡ \"Shutdown PC\"\n🎵 \"Open Spotify\"\n🎬 \"Open Netflix\"\n🛒 \"Open Amazon\"\n\nBas bolo, main karunga! ⚡";

    // ─── Weather ───
    if (/weather|mausam|temperature/.test(t))
        return "🌤 Check weather.com or your phone for live weather!";

    // ─── Default — Smart reply ───
    return `I heard: "${text}"\n\n💡 Try: "Open Instagram", "Open ChatGPT", "Open Grok", "Open Gemini", "Search Wikipedia for India", "Tell a joke"`;
}

// ══════════════════════════════════════════════
// ⚡ SHUTDOWN MODAL
// ══════════════════════════════════════════════
function showShutdownConfirm() {
    const existing = document.getElementById('shutdownModal');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'shutdownModal';
    overlay.innerHTML = `
        <div class="modal-box">
            <h3>⚡ Shutdown PC?</h3>
            <p>Are you sure? This will close all programs.</p>
            <div class="modal-actions">
                <button class="btn-cancel" onclick="closeShutdownModal()">Cancel</button>
                <button class="btn-confirm" onclick="executeShutdown()">Shutdown</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    speak("Shutdown confirm karo.");
}

function closeShutdownModal() {
    const m = document.getElementById('shutdownModal');
    if (m) m.remove();
    addMessage("❌ Shutdown cancelled.", 'nova');
}

function executeShutdown() {
    const m = document.getElementById('shutdownModal');
    if (m) m.remove();
    addMessage("⚡ Shutdown command!\n\n💡 **Run this in CMD:**\n`shutdown /s /t 30`\n\nOr press **Win + X → Shut Down**", 'nova');
    speak("Browser can't shutdown directly. Run shutdown command in CMD.");
}

// ══════════════════════════════════════════════
// UI STATE
// ══════════════════════════════════════════════
function setUIState(mode) {
    const orb = document.getElementById('headerOrb');
    const status = document.getElementById('statusText');
    const micBtn = document.getElementById('micBtn');
    orb.className = 'header-orb';
    status.className = '';
    micBtn.classList.remove('recording');

    if (mode === 'listening') {
        orb.classList.add('listening');
        status.classList.add('listening-st');
        status.textContent = '🎙 Listening...';
        micBtn.classList.add('recording');
    } else if (mode === 'speaking') {
        orb.classList.add('speaking');
        status.classList.add('speaking-st');
        status.textContent = '🔊 Speaking...';
    } else {
        status.textContent = '● Online';
    }
}

// ══════════════════════════════════════════════
// CHAT FUNCTIONS
// ══════════════════════════════════════════════
function hideWelcome() {
    const hero = document.getElementById('welcomeHero');
    if (hero) { hero.style.display = 'none'; chatStarted = true; }
}

function addMessage(text, sender) {
    hideWelcome();
    const area = document.getElementById('chatArea');
    const div = document.createElement('div');
    div.className = `msg ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = sender === 'nova' ? '🎙' : '👤';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code style="background:rgba(0,240,255,0.1);padding:2px 6px;border-radius:4px;font-size:12px;">$1</code>')
        .replace(/\n/g, '<br>');

    div.appendChild(avatar);
    div.appendChild(bubble);
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
    return div;
}

function addTyping() {
    hideWelcome();
    const area = document.getElementById('chatArea');
    const div = document.createElement('div');
    div.className = 'msg nova';
    div.id = 'typingMsg';
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = '🎙';
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble typing-indicator';
    bubble.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    div.appendChild(avatar);
    div.appendChild(bubble);
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
}

function removeTyping() {
    const t = document.getElementById('typingMsg');
    if (t) t.remove();
}

async function sendMessage(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    addTyping();
    const reply = await novaReply(text);
    removeTyping();
    addMessage(reply, 'nova');
    speak(reply.replace(/\*\*/g, '').replace(/`(.+?)`/g, '$1').replace(/\n/g, '. '));
}

function sendFromInput() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendMessage(text);
}

function clearChat() {
    const area = document.getElementById('chatArea');
    chatStarted = false;
    area.innerHTML = `
    <div class="welcome-hero" id="welcomeHero">
      <div class="welcome-orb-wrap">
        <div class="welcome-ring"></div>
        <div class="welcome-ring"></div>
        <div class="welcome-orb"></div>
      </div>
      <h1>HETRON ⚡</h1>
      <p>AI Voice Assistant — Say any command. Open WhatsApp, Instagram, Facebook, ChatGPT, Grok, Gemini, Google Lens & more!</p>
      <div class="suggestion-chips">
        <button class="chip" onclick="sendMessage('Hello Hetron!')">👋 Hello</button>
        <button class="chip" onclick="sendMessage('Open WhatsApp')">💬 WhatsApp</button>
        <button class="chip" onclick="sendMessage('Open Instagram')">📸 Instagram</button>
        <button class="chip" onclick="sendMessage('Open ChatGPT')">✦ ChatGPT</button>
        <button class="chip" onclick="sendMessage('Open Grok')">🤖 Grok</button>
        <button class="chip" onclick="sendMessage('What can you do?')">⚡ Commands</button>
      </div>
    </div>`;
}

function searchWikipedia() {
    const query = prompt('Wikipedia search topic:');
    if (query) sendMessage(`Search Wikipedia for ${query}`);
}

// ══════════════════════════════════════════════
// VOICE RECOGNITION
// ══════════════════════════════════════════════
function toggleListen() {
    if (!SR) { alert('Use Chrome or Edge for voice!'); return; }
    if (isListening) { recognition && recognition.stop(); return; }

    recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => { isListening = true; setUIState('listening'); };
    recognition.onend = () => {
        isListening = false;
        if (document.getElementById('statusText').textContent.includes('Listening'))
            setUIState('idle');
    };
    recognition.onresult = (e) => {
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) final += e.results[i][0].transcript;
        }
        if (final) { setUIState('idle'); sendMessage(final); }
    };
    recognition.onerror = (e) => {
        isListening = false; setUIState('idle');
        addMessage('⚠ Voice error: ' + e.error, 'nova');
    };
    recognition.start();
}

// ══════════════════════════════════════════════
// VOICE TOGGLE
// ══════════════════════════════════════════════
function switchVoice() {
    isFemale = !isFemale;
    const toggle = document.getElementById('voiceToggle');
    const label = document.getElementById('voiceLabel');
    if (isFemale) {
        toggle.classList.add('active');
        label.textContent = '♀ Hetron Female';
        label.classList.add('female');
        speak("Female voice active!");
    } else {
        toggle.classList.remove('active');
        label.textContent = '♂ Hetron Male';
        label.classList.remove('female');
        speak("Male voice active!");
    }
}

// ══════════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════════
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('show');
}
function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => { createSpaceBackground(); });
