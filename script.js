setTimeout(function () { document.getElementById('hetronLoader').classList.add('hidden') }, 3000);

/* ══════════════════════════════════════
   HETRON AI — ALL-IN-ONE JAVASCRIPT
   Voice + All Commands
   ══════════════════════════════════════ */

// ─── CURSOR PARTICLE SYSTEM (DISABLED) ───
// Custom cursor and particle effects removed for clean UX


// ─── SPACE BACKGROUND STARS ───
(function createSpace() {
    const bg = document.getElementById('spaceBg');
    if (!bg) return;
    for (let i = 0; i < 120; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        const sz = Math.random() * 3 + 1;
        s.style.width = sz + 'px'; s.style.height = sz + 'px';
        s.style.left = Math.random() * 100 + '%';
        s.style.top = Math.random() * 100 + '%';
        s.style.setProperty('--dur', (2 + Math.random() * 4) + 's');
        s.style.animationDelay = Math.random() * 5 + 's';
        bg.appendChild(s);
    }
    for (let i = 0; i < 3; i++) {
        const ss = document.createElement('div');
        ss.className = 'shooting-star';
        ss.style.setProperty('--dur', (6 + Math.random() * 8) + 's');
        ss.style.setProperty('--delay', (i * 4 + Math.random() * 3) + 's');
        ss.style.setProperty('--top', (5 + Math.random() * 40) + '%');
        bg.appendChild(ss);
    }
    for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className = 'cosmic-particle';
        const arb = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim() || '0,240,255';
        const a2rb = getComputedStyle(document.documentElement).getPropertyValue('--accent2-rgb').trim() || '0,200,150';
        const c = [`rgba(${arb},0.4)`, `rgba(${a2rb},0.4)`, `rgba(${arb},0.3)`, `rgba(${a2rb},0.3)`];
        p.style.setProperty('--left', Math.random() * 100 + 'vw');
        p.style.setProperty('--dur', (6 + Math.random() * 8) + 's');
        p.style.setProperty('--delay', Math.random() * 10 + 's');
        p.style.setProperty('--size', (1.5 + Math.random() * 3) + 'px');
        p.style.setProperty('--color', c[Math.floor(Math.random() * c.length)]);
        document.body.appendChild(p);
    }
})();

// ─── STATE ───
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null, isListening = false, isFemale = true, voices = [], chatStarted = false;

function loadVoices() { voices = window.speechSynthesis.getVoices() }
loadVoices();
window.speechSynthesis.onvoiceschanged = loadVoices;

function getVoice() {
    if (isFemale) return voices.find(v => /karen/i.test(v.name)) || voices.find(v => /samantha|zira|victoria|female/i.test(v.name)) || voices[1] || voices[0];
    return voices.find(v => /david|alex|daniel|mark|male/i.test(v.name)) || voices[0];
}

function speak(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = getVoice(); if (v) u.voice = v;
    u.rate = 1; u.pitch = isFemale ? 1.2 : 0.85;
    u.onstart = () => setUIState('speaking');
    u.onend = () => setUIState('idle');
    window.speechSynthesis.speak(u);
}

async function fetchWikipedia(q) {
    try { const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`); if (!r.ok) return null; const d = await r.json(); return d.extract || null } catch { return null }
}

// ─── MOBILE DETECTION & SMART APP LAUNCHER ───
function isMobile() {
    return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '') || (window.innerWidth <= 768);
}

const APP_REGISTRY = {
    whatsapp: { name: 'WhatsApp', emoji: '💬', webUrl: 'https://web.whatsapp.com', mobileUrl: 'whatsapp://send', desc: 'Chat & Calls' },
    instagram: { name: 'Instagram', emoji: '📸', webUrl: 'https://www.instagram.com', mobileUrl: 'instagram://app', desc: 'Reels & Stories' },
    facebook: { name: 'Facebook', emoji: '👥', webUrl: 'https://www.facebook.com', mobileUrl: 'fb://facewebmodal/f?href=https://www.facebook.com', desc: 'Social & Feed' },
    youtube: { name: 'YouTube', emoji: '▶', webUrl: 'https://www.youtube.com', mobileUrl: 'vnd.youtube://', desc: 'Videos & Music' },
    chatgpt: { name: 'ChatGPT', emoji: '✦', webUrl: 'https://chatgpt.com', mobileUrl: 'https://chatgpt.com', desc: 'OpenAI Intelligence' },
    grok: { name: 'Grok AI', emoji: '🤖', webUrl: 'https://grok.com', mobileUrl: 'https://grok.com', desc: 'xAI Intelligence' },
    gemini: { name: 'Gemini AI', emoji: '💎', webUrl: 'https://gemini.google.com', mobileUrl: 'https://gemini.google.com', desc: 'Google Multimodal AI' },
    google_lens: { name: 'Google Lens', emoji: '🔍', webUrl: 'https://lens.google.com', mobileUrl: 'https://lens.google.com', desc: 'Visual Search' },
    google: { name: 'Google', emoji: '🔍', webUrl: 'https://www.google.com', mobileUrl: 'https://www.google.com', desc: 'Web Search' },
    wikipedia: { name: 'Wikipedia', emoji: '📚', webUrl: 'https://www.wikipedia.org', mobileUrl: 'https://www.wikipedia.org', desc: 'Encyclopedia' },
    github: { name: 'GitHub', emoji: '⌘', webUrl: 'https://github.com', mobileUrl: 'https://github.com', desc: 'Code & Repos' },
    twitter: { name: 'X (Twitter)', emoji: '🐦', webUrl: 'https://x.com', mobileUrl: 'twitter://', desc: 'Posts & Trends' },
    linkedin: { name: 'LinkedIn', emoji: '💼', webUrl: 'https://www.linkedin.com', mobileUrl: 'linkedin://', desc: 'Professional Network' },
    gmail: { name: 'Gmail', emoji: '📧', webUrl: 'https://mail.google.com', mobileUrl: 'googlegmail://', desc: 'Email Inbox' },
    spotify: { name: 'Spotify', emoji: '🎵', webUrl: 'https://open.spotify.com', mobileUrl: 'spotify://', desc: 'Music & Podcasts' },
    netflix: { name: 'Netflix', emoji: '🎬', webUrl: 'https://www.netflix.com', mobileUrl: 'nflx://', desc: 'Movies & Series' },
    amazon: { name: 'Amazon', emoji: '🛒', webUrl: 'https://www.amazon.in', mobileUrl: 'https://www.amazon.in', desc: 'Shopping' },
    flipkart: { name: 'Flipkart', emoji: '🛍', webUrl: 'https://www.flipkart.com', mobileUrl: 'https://www.flipkart.com', desc: 'Shopping' },
    maps: { name: 'Google Maps', emoji: '🗺', webUrl: 'https://maps.google.com', mobileUrl: 'https://maps.google.com', desc: 'Navigation' },
    telegram: { name: 'Telegram', emoji: '📨', webUrl: 'https://web.telegram.org', mobileUrl: 'tg://', desc: 'Fast Messaging' },
    discord: { name: 'Discord', emoji: '🎮', webUrl: 'https://discord.com', mobileUrl: 'discord://', desc: 'Communities & Chat' },
    reddit: { name: 'Reddit', emoji: '🤖', webUrl: 'https://reddit.com', mobileUrl: 'https://reddit.com', desc: 'Discussions' },
    pinterest: { name: 'Pinterest', emoji: '📌', webUrl: 'https://pinterest.com', mobileUrl: 'pinterest://', desc: 'Ideas & Boards' },
    gpay: { name: 'Google Pay', emoji: '💰', webUrl: 'https://pay.google.com', mobileUrl: 'https://pay.google.com', desc: 'UPI & Payments' },
    paytm: { name: 'Paytm', emoji: '💳', webUrl: 'https://paytm.com', mobileUrl: 'paytmmp://', desc: 'Wallet & Recharges' },
    snapchat: { name: 'Snapchat', emoji: '🐻', webUrl: 'https://snapchat.com', mobileUrl: 'snapchat://', desc: 'Snaps & Stories' }
};

function openApp(target, name, emoji, deepLink) {
    let appKey = (typeof target === 'string' && APP_REGISTRY[target.toLowerCase()]) ? target.toLowerCase() : null;
    let url = target;
    let displayName = name || (appKey ? APP_REGISTRY[appKey].name : 'App');
    let displayEmoji = emoji || (appKey ? APP_REGISTRY[appKey].emoji : '🚀');
    let sub = isMobile() ? 'Tap to launch app / web' : 'Click to launch in new tab';

    if (appKey) {
        const app = APP_REGISTRY[appKey];
        displayName = app.name;
        displayEmoji = app.emoji;
        url = (isMobile() && app.mobileUrl) ? app.mobileUrl : app.webUrl;
        sub = isMobile() ? (app.mobileUrl.includes('://') && !app.mobileUrl.startsWith('http') ? 'Tap to open native app' : 'Tap to open web app') : app.desc;
    } else if (isMobile() && deepLink) {
        url = deepLink;
        sub = 'Tap to open';
    }

    try {
        window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
        /* popup blocked gracefully handled by card below */
    }

    return `${displayEmoji} Opening **${displayName}**!\n\n<a href="${url}" target="_blank" rel="noopener noreferrer" class="app-open-card"><span class="aoc-emoji">${displayEmoji}</span><span class="aoc-text"><span class="aoc-label">Open ${displayName}</span><span class="aoc-sub">${sub} ↗</span></span></a>`;
}

function launchApp(key, e) {
    if (e && e.preventDefault) e.preventDefault();
    const app = APP_REGISTRY[key.toLowerCase()];
    if (!app) return;
    const url = (isMobile() && app.mobileUrl) ? app.mobileUrl : app.webUrl;
    try {
        window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {}
    if (isMobile()) closeSidebar();
}

// ─── REPLY ENGINE ───
async function novaReply(text) {
    const t = text.toLowerCase().trim();

    if (/^(hello|hi|hey|namaste|hola|yo|sup)/i.test(t)) return "Hello! 👋 I'm Hetron! ⚡";
    if (/your name|who are you/.test(t)) return "I'm Hetron — your AI Voice Assistant! Power · Precision · Intelligence. WhatsApp, Instagram, Facebook, ChatGPT, Grok, Gemini, Google Lens, Files sab open kar sakta hoon! 🌟";
    if (/how are you|kaise ho/.test(t)) return "Great! 😊 Ready to help!";

    if (/what time|current time|time now|kitne baje|time bata/.test(t)) return `🕐 **${new Date().toLocaleTimeString()}**`;
    if (/what.*(date|day)|today.*(date|day)|today's date|aaj ki date/.test(t)) return `📅 **${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**`;

    if (/joke|funny|laugh|mazaak/.test(t)) {
        const j = ["Why don't scientists trust atoms? They make up everything! 😄", "What do you call a fake noodle? An impasta! 🍝", "Why do programmers prefer dark mode? Light attracts bugs! 🐛", "Why do astronauts use Linux? Can't open Windows in space! 🚀", "What's an astronaut's fav key? Space bar! ⌨️", "Why did scarecrow win award? Outstanding in his field! 🌾"];
        return j[Math.floor(Math.random() * j.length)];
    }

    if (/calculate|what is \d/.test(t)) { try { const e = t.replace(/calculate|what is|what's|equals/gi, '').trim(); const r = Function('"use strict";return(' + e + ')')(); if (typeof r === 'number' && isFinite(r)) return `🔢 **${r}**` } catch { } }

    if (/open whatsapp|whatsapp kholo|whatsapp open|whatsapp chalao/.test(t)) return openApp('whatsapp');
    if (/open instagram|instagram kholo|insta kholo|insta open/.test(t)) return openApp('instagram');
    if (/open facebook|facebook kholo|fb kholo/.test(t)) return openApp('facebook');
    if (/open youtube|youtube kholo|yt kholo|youtube chalao/.test(t)) return openApp('youtube');
    if (/open (chatgpt|chat gpt)|chatgpt kholo|chatgpt open/.test(t)) return openApp('chatgpt');
    if (/open grok|grok kholo|grok open/.test(t)) return openApp('grok');
    if (/open gemini|gemini kholo|gemini open/.test(t)) return openApp('gemini');
    if (/open (google lens|lens)|lens kholo|lens open/.test(t)) return openApp('google_lens');
    if (/open google(?! lens)|google kholo/.test(t)) return openApp('google');
    if (/open wikipedia|wikipedia kholo|wiki kholo/.test(t)) return openApp('wikipedia');
    if (/open github|github kholo/.test(t)) return openApp('github');
    if (/open (twitter|x )|twitter kholo|x kholo/.test(t)) return openApp('twitter');
    if (/open linkedin|linkedin kholo/.test(t)) return openApp('linkedin');
    if (/open (gmail|email|mail)|gmail kholo|mail kholo/.test(t)) return openApp('gmail');
    if (/open spotify|spotify kholo/.test(t)) return openApp('spotify');
    if (/open netflix|netflix kholo/.test(t)) return openApp('netflix');
    if (/open amazon|amazon kholo/.test(t)) return openApp('amazon');
    if (/open flipkart|flipkart kholo/.test(t)) return openApp('flipkart');

    if (/open file|file explorer|file manager|open folder|my folder|my files|show files|browse files|files kholo|file kholo|open my files|show my files|folder kholo|folders kholo/.test(t)) {
        return await openWorkspaceFiles();
    }

    // Smart file/folder open — matches "open [name] folder/file"
    const folderMatch = t.match(/open\s+(.+?)(?:\s+folder|\s+file)?$/i);
    if (folderMatch && !(/whatsapp|instagram|facebook|youtube|chatgpt|chat gpt|grok|gemini|google|wikipedia|github|twitter|linkedin|gmail|email|mail|spotify|netflix|amazon|flipkart|maps|telegram|discord|reddit|pinterest|gpay|paytm|snapchat|calculator|music|files?\b/i.test(folderMatch[1]))) {
        const searchName = folderMatch[1].trim();
        if (searchName.length > 1 && !/^(the|a|an|my|this|that)$/i.test(searchName)) {
            return await openSpecificFileOrFolder(searchName);
        }
    }

    if (/shutdown|shut down|pc band karo|computer off|power off|pc off/.test(t)) { showShutdownConfirm(); return "⚠️ Confirm shutdown!"; }

    if (/search wikipedia|wiki search|search wiki/.test(t) || /search (.+) on wikipedia/.test(t)) {
        let q = t.replace(/search wikipedia for|search wiki for|search wikipedia|wiki search|search wiki|wikipedia|search|on wikipedia|for/gi, '').trim();
        if (q.length > 1) { const r = await fetchWikipedia(q); if (r) return `📚 **${q}**\n\n${r}`; return `❌ Nothing found for "${q}"` }
    }
    if (/^search (.+)/.test(t)) { let q = t.replace(/^search\s*/i, '').trim(); if (q.length > 1) { const r = await fetchWikipedia(q); if (r) return `📚 **${q}**\n\n${r}`; window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank'); return `🔍 Searching "**${q}**"!` } }

    // ─── Weather ───
    if (/weather|mausam|temperature|barish|garmi|sardi/.test(t)) { fetchWeather(); return '🌦 Fetching live weather for your location...'; }

    // ─── Alarm & Timer ───
    let alarmM = t.match(/set\s+(?:an?\s+)?(?:alarm|timer|reminder)\s+(?:for\s+)?(\d+)\s*(minute|minutes|min|mins|second|seconds|sec|secs|hour|hours|hr|hrs)/i);
    if (!alarmM) alarmM = t.match(/(\d+)\s*(minute|minutes|min|mins|second|seconds|sec|secs|hour|hours|hr|hrs)\s*(?:ka\s+|ke\s+|ka\s*)?(?:alarm|timer|reminder|set|laga)/i);
    if (!alarmM) alarmM = t.match(/(?:alarm|timer|reminder)\s+(?:for\s+)?(\d+)\s*(minute|minutes|min|mins|second|seconds|sec|secs|hour|hours|hr|hrs)/i);
    if (!alarmM) alarmM = t.match(/(?:remind\s+me|wake\s+me\s+up|alert\s+me)\s+(?:in\s+)?(\d+)\s*(minute|minutes|min|mins|second|seconds|sec|secs|hour|hours|hr|hrs)/i);
    if (alarmM) {
        const num = parseInt(alarmM[1]);
        const unit = (alarmM[2] || '').toLowerCase();
        let secs = num;
        if (/^(min|mins|minute|minutes)$/i.test(unit)) secs = num * 60;
        if (/^(hour|hours|hr|hrs)$/i.test(unit)) secs = num * 3600;
        const unitLabel = /^(min|mins|minute|minutes)$/i.test(unit) ? (num === 1 ? 'minute' : 'minutes') : /^(hour|hours|hr|hrs)$/i.test(unit) ? (num === 1 ? 'hour' : 'hours') : (num === 1 ? 'second' : 'seconds');
        startCountdown(secs);
        setAlarmIn(secs / 60, 'Hetron Alert');
        return `⏰ **Alarm set for ${num} ${unitLabel}!** Timer started — I'll remind you! 📲`;
    }
    if (/start timer|stopwatch|timer start|timer kholo|stopwatch kholo/.test(t)) { toggleTimer(); return '⏱ **Stopwatch opened!** Press Start to begin.'; }

    // ─── Notes ───
    if (/\bnote\b|todo|quick note|notes kholo|yaad karo|reminder note/.test(t)) { toggleNotes(); return '📝 **Quick Notes** opened! Type anything to save.'; }

    // ─── Themes ───
    if (/theme.*space|space.*theme|theme.*galaxy|galaxy.*theme/.test(t)) { setTheme(0); return '🎨 **Galaxy theme** activated!'; }
    if (/theme.*ocean|ocean.*theme/.test(t)) { setTheme(1); return '🎨 **Ocean theme** activated!'; }
    if (/theme.*sunset|sunset.*theme/.test(t)) { setTheme(2); return '🎨 **Sunset theme** activated!'; }
    if (/theme.*gold|gold.*theme/.test(t)) { setTheme(3); return '🎨 **Gold theme** activated!'; }
    if (/theme.*neon|neon.*theme/.test(t)) { setTheme(4); return '🎨 **Neon theme** activated!'; }

    // ─── Battery ───
    if (/battery|charge|charger/.test(t)) {
        if (navigator.getBattery) {
            navigator.getBattery().then(b => {
                addMessage(`🔋 **Battery: ${Math.round(b.level * 100)}%** ${b.charging ? '⚡ Charging' : '🔋 Not charging'}`, 'nova');
                speak(`Battery is ${Math.round(b.level * 100)} percent`);
            });
            return '🔋 Checking battery...';
        }
        return '🔋 Battery API not supported here.';
    }

    // ─── Coin Flip ───
    if (/flip.?coin|coin.?flip|heads.?or.?tails|toss.?coin|sikka/.test(t)) {
        const rr = Math.random() > 0.5 ? 'Heads' : 'Tails';
        return '\ud83e\ude99 Coin tossed: **' + rr + '**!';
    }

    // ─── Random Number ───
    if (/random number|lucky number|random num/.test(t)) {
        return `🎲 Your lucky number is **${Math.floor(Math.random() * 100) + 1}**!`;
    }

    // ─── Motivation ───
    if (/motivat|inspire|quote|suvichar|himmat|hausla/.test(t)) {
        const q = [
            '"The only way to do great work is to love what you do." — Steve Jobs 🚀',
            '"Believe you can and you\'re halfway there." — Theodore Roosevelt ⭐',
            '"Koshish karne walon ki kabhi haar nahi hoti." — Harivansh Rai Bachchan 🇮🇳',
            '"Your time is limited, don\'t waste it living someone else\'s life." — Steve Jobs ❤',
            '"It does not matter how slowly you go as long as you do not stop." — Confucius 💪'
        ];
        return `💫 **Quote:**\n\n${q[Math.floor(Math.random() * q.length)]}`;
    }

    // ─── Riddles ───
    if (/riddle|puzzle|paheli/.test(t)) {
        const r = [
            '**Riddle:** I speak without a mouth and hear without ears. What am I?\n\n> Echo 🎤',
            '**Riddle:** The more you take, the more you leave behind. What am I?\n\n> Footsteps 👣',
            '**Riddle:** I\'m light as a feather, but the strongest man can\'t hold me for 5 min. What am I?\n\n> Breath 💨'
        ];
        return '🧩 ' + r[Math.floor(Math.random() * r.length)];
    }

    // ─── Extra Apps ───
    if (/open maps|google maps|directions|map kholo|raasta batao/.test(t)) return openApp('maps');
    if (/open telegram|telegram kholo/.test(t)) return openApp('telegram');
    if (/open discord|discord kholo/.test(t)) return openApp('discord');
    if (/open reddit|reddit kholo/.test(t)) return openApp('reddit');
    if (/open pinterest|pinterest kholo/.test(t)) return openApp('pinterest');
    if (/open gpay|google pay|gpay kholo/.test(t)) return openApp('gpay');
    if (/open paytm|paytm kholo/.test(t)) return openApp('paytm');
    if (/open snapchat|snapchat kholo/.test(t)) return openApp('snapchat');

    // ─── More Hindi ───
    if (/bhai|yaar|dost/.test(t)) return 'Haan bhai! 🤜 Batao kya kaam hai?';
    if (/accha|thik hai|okay boss/.test(t)) return '👍 Accha! Aur kuch?';
    if (/good morning|subah|naya din/.test(t)) return `Good Morning! ☀️ Aaj ka din — **${new Date().toLocaleDateString('en-IN', { weekday: 'long' })}** — bahut achha jayega! 💪`;
    if (/good night|shubh ratri|so jao/.test(t)) return 'Good Night! 🌙 Sweet dreams! ⭐';
    if (/kal ka din|kal kya hai/.test(t)) return `📅 Kal **${new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}** hai!`;

    // ─── Goodbye / Thanks ───
    if (/bye|goodbye|see you|alvida|chalo/.test(t)) return 'Goodbye! 👋 See you soon! 🌟';
    if (/thank|thanks|thx|shukriya|dhanyavaad|shukriya/.test(t)) return 'Welcome! 😊 Kuch aur chahiye?';

    // ─── Sound/Volume commands ───
    if (/\b(mute|mute sound|sound off|volume off|awaaz band|sound mute|mute audio)\b/.test(t)) {
        if (mpVolGain) mpVolGain.gain.value = 0;
        document.getElementById('mpVolume').value = 0;
        window.speechSynthesis.cancel();
        return '🔇 **Sound muted!** Volume set to 0.';
    }
    if (/\b(unmute|unmute sound|sound on|volume on|awaaz chalu|sound unmute)\b/.test(t)) {
        if (mpVolGain) mpVolGain.gain.value = 0.7;
        document.getElementById('mpVolume').value = 0.7;
        return '🔊 **Sound unmuted!** Volume restored.';
    }
    if (/\b(volume up|sound up|awaaz badha|louder|increase volume|turn up volume|volume increase)\b/.test(t)) {
        const slider = document.getElementById('mpVolume');
        const newVol = Math.min(1, parseFloat(slider.value) + 0.2);
        slider.value = newVol;
        if (mpVolGain) mpVolGain.gain.value = newVol;
        return `🔊 **Volume up!** Now at ${Math.round(newVol * 100)}%.`;
    }
    if (/\b(volume down|sound down|awaaz kam|softer|quieter|decrease volume|turn down volume|volume decrease)\b/.test(t)) {
        const slider = document.getElementById('mpVolume');
        const newVol = Math.max(0, parseFloat(slider.value) - 0.2);
        slider.value = newVol;
        if (mpVolGain) mpVolGain.gain.value = newVol;
        return `🔉 **Volume down!** Now at ${Math.round(newVol * 100)}%.`;
    }

    // ─── Music Player commands ───
    if (/play music|open music|music player|music bajao|music chalao|ambient|gaana|start music|play song|play songs/.test(t)) {
        toggleMusicPlayer();
        setTimeout(() => { mpPlay(); }, 300);
        return '🎵 **Music Player** opened! Enjoy ambient vibes 🌌';
    }
    if (/stop music|pause music|music band|music roko|stop song|pause song/.test(t)) {
        if (mpPlaying) mpPause();
        return '⏸ Music paused.';
    }
    if (/next song|next track|agla gaana|skip song/.test(t)) {
        mpNext(); return '⏭ Skipping to next track...';
    }
    if (/prev song|previous song|pehla gaana|last song|previous track/.test(t)) { mpPrev(); return '⏮ Going to previous track...'; }

    // ─── System Info commands ───
    if (/system info|device info|system status|sysinfo|device status|network info/.test(t)) {
        toggleSysInfo();
        return '📊 **System Info** panel opened! Checking battery, network & more...';
    }

    // ─── Calculator ───
    if (/\b(calculator|open calculator|calc|calculator kholo|calculator open)\b/.test(t)) {
        toggleCalc();
        return '🧮 **Scientific Calculator** opened! Ready to crunch numbers.';
    }

    // ─── Password Generator ───
    if (/generate password|create password|password generate|password banao|new password|random password|strong password/.test(t)) {
        togglePwdGen();
        setTimeout(() => generatePwd(), 300);
        return '🔐 **Password Generator** opened! Your secure password is ready.';
    }

    // ─── Reminders ───
    const remindMatch = t.match(/remind me (?:to\s+)?(.+)/i);
    if (remindMatch) {
        const reminderText = remindMatch[1].trim();
        addReminder(reminderText);
        return `📅 **Reminder added!** "${reminderText}" — I'll keep track of it.`;
    }
    if (/show reminders|my reminders|reminders kholo|open reminders|reminders dikhao/.test(t)) {
        toggleReminders();
        return '📅 **Reminders** panel opened!';
    }
    if (/clear reminders|delete all reminders|sab reminders delete/.test(t)) {
        clearAllReminders();
        return '🗑 All reminders cleared!';
    }

    // ─── Translation ───
    const transMatch = t.match(/translate\s+(.+?)\s+(?:to|in|into)\s+(hindi|english|urdu)/i);
    if (transMatch) {
        const textToTrans = transMatch[1];
        const targetLang = transMatch[2].toLowerCase();
        if (targetLang === 'hindi') { transDir = 'en|hi' } else { transDir = 'hi|en' }
        toggleTranslate();
        document.getElementById('transInput').value = textToTrans;
        setTimeout(() => doTranslate(textToTrans), 500);
        return `🌍 Translating "${textToTrans}" to ${targetLang}...`;
    }
    if (/\b(translate|translation|translator|anuvad|translate kholo)\b/.test(t)) {
        toggleTranslate();
        return '🌍 **Translator** opened! Type text and select language.';
    }

    // ─── News ───
    if (/\b(news|headlines|top stories|khabar|samachar|latest news|aaj ki khabar|news dikhao)\b/.test(t)) {
        toggleNews();
        return '📰 **News Headlines** loading! Stay updated with the latest.';
    }

    // ─── Games ───
    if (/play tic tac toe|tic tac toe|ttt|play ttt|tic tac toe khelo/.test(t)) {
        toggleTTT();
        return '🎮 **Tic Tac Toe** started! You are X — make your move!';
    }
    if (/play quiz|quiz game|quiz khelo|start quiz|quiz start|trivia|knowledge test/.test(t)) {
        toggleQuiz();
        return '🧠 **Quiz Game** started! 10 random questions — test your knowledge!';
    }

    // ─── New Themes ───
    if (/forest theme|green theme|jungle theme/.test(t)) { setTheme(5); return '🌲 **Forest theme** activated! Deep green vibes!' }
    if (/arctic theme|ice theme|blue theme|cold theme/.test(t)) { setTheme(6); return '🧊 **Arctic theme** activated! Cool blue vibes!' }
    if (/crimson theme|red theme|fire theme/.test(t)) { setTheme(7); return '🔥 **Crimson theme** activated! Fiery red vibes!' }
    if (/amber theme|warm theme|brown theme/.test(t)) { setTheme(8); return '🍂 **Amber theme** activated! Warm amber tones!' }
    if (/midnight theme|dark theme|indigo theme|deep blue theme/.test(t)) { setTheme(9); return '🌌 **Midnight theme** activated! Deep indigo vibes!' }

    // ─── Help (updated) ───
    if (/help|what can you do|features|kya kar sakte/.test(t)) return `⚡ **Hetron Commands:**\n\n🌦 "Weather" — Live weather\n⏰ "Set alarm for 5 minutes"\n⏱ "Start timer" — Stopwatch\n📝 "Quick notes"\n🎵 "Play music" — Ambient player\n🔇 "Mute" / 🔊 "Unmute" / "Volume up/down"\n📁 "Open files" / "Show my files"\n📊 "System info" — Battery & network\n🧮 "Calculator" — Scientific calc\n🔐 "Generate password" — Secure password\n📅 "Remind me to..." — Persistent reminders\n🌍 "Translate hello to hindi"\n📰 "News" — Live headlines\n🎮 "Play tic tac toe" — vs AI\n🧠 "Play quiz" — 10 questions\n🎨 "Forest theme" / "Arctic theme"\n💫 "Motivate me" — Quotes\n🪙 "Flip a coin" / 🎲 "Random number"\n💬 WhatsApp, Instagram, YouTube...\n🤖 ChatGPT, Grok, Gemini...\n\nBas bolo, main karunga! ⚡`;

    return `I heard: "${text}"\n\n💡 Try: "Play music", "Calculator", "Translate", "News", "Play quiz", "Generate password"`;
}

// ─── SYSTEM POWER CONTROLS ───
const SYSTEM_SERVER = 'http://localhost:5050';

function showShutdownConfirm() {
    const e = document.getElementById('shutdownModal'); if (e) e.remove();
    const o = document.createElement('div'); o.className = 'modal-overlay'; o.id = 'shutdownModal';
    o.innerHTML = `<div class="modal-box">
        <h3>⚡ System Power</h3>
        <p>Choose an action. Requires <code>server.py</code> running.</p>
        <div class="modal-actions" style="flex-wrap:wrap;gap:8px;">
            <button class="btn-cancel" onclick="closeShutdownModal()">Cancel</button>
            <button class="btn-confirm" onclick="executeSystemAction('lock')" style="background:#6366f1">🔒 Lock</button>
            <button class="btn-confirm" onclick="executeSystemAction('sleep')" style="background:#8b5cf6">😴 Sleep</button>
            <button class="btn-confirm" onclick="executeSystemAction('restart')" style="background:#f59e0b">🔄 Restart</button>
            <button class="btn-confirm" onclick="executeSystemAction('shutdown')">⚡ Shutdown</button>
        </div>
        <p style="font-size:10px;opacity:0.5;margin-top:10px;">Run <code>python server.py</code> to enable system controls</p>
    </div>`;
    document.body.appendChild(o); speak("Choose a system action.");
}

function closeShutdownModal() { const m = document.getElementById('shutdownModal'); if (m) m.remove(); addMessage("❌ Cancelled.", 'nova') }

async function executeSystemAction(action) {
    const m = document.getElementById('shutdownModal'); if (m) m.remove();
    const labels = { shutdown: '⚡ Shutting down', restart: '🔄 Restarting', sleep: '😴 Going to sleep', lock: '🔒 Locking PC', cancel: '🚫 Cancelling shutdown' };
    
    addMessage(`${labels[action] || action}...`, 'nova');
    speak(`${action} initiated`);

    try {
        const r = await fetch(`${SYSTEM_SERVER}/system?action=${action}&confirm=yes`, { signal: AbortSignal.timeout(3000) });
        const data = await r.json();
        if (data.ok) {
            addMessage(`✅ **${action.charAt(0).toUpperCase() + action.slice(1)}** command sent successfully!\n\n${action === 'shutdown' || action === 'restart' ? '⏳ Your PC will ' + action + ' in 5 seconds.\n\nSay **"cancel shutdown"** to abort!' : ''}`, 'nova');
        } else {
            throw new Error(data.error || 'Server error');
        }
    } catch(e) {
        // Server not running — show fallback
        const cmds = {
            shutdown: 'shutdown /s /t 5',
            restart: 'shutdown /r /t 5',
            sleep: 'rundll32.exe powrprof.dll,SetSuspendState 0,1,0',
            lock: 'rundll32.exe user32.dll,LockWorkStation',
            cancel: 'shutdown /a'
        };
        const cmd = cmds[action] || cmds.shutdown;
        
        // Create a downloadable .bat file as fallback
        const batContent = `@echo off\necho.\necho  HETRON AI - System ${action}\necho  ========================\necho.\n${cmd}\n`;
        const blob = new Blob([batContent], {type: 'application/bat'});
        const url = URL.createObjectURL(blob);
        
        addMessage(`⚠️ **Server offline** — cannot execute directly.\n\n**Option 1:** Start the server:\n\`\`\`\npython server.py\n\`\`\`\n\n**Option 2:** Run in CMD:\n\`\`\`\n${cmd}\n\`\`\`\n\n**Option 3:** <a href="${url}" download="hetron_${action}.bat" class="fb-grant-btn" style="font-size:12px;padding:8px 16px;text-decoration:none;display:inline-block;margin-top:4px;">⬇ Download ${action}.bat</a>`, 'nova');
        speak(`Server is offline. Download the batch file or run the command manually.`);
    }
}

// Override old executeShutdown for backward compatibility
function executeShutdown() { executeSystemAction('shutdown'); }

// ─── UI ───
function setUIState(mode) {
    const o = document.getElementById('headerOrb'), s = document.getElementById('statusText'), m = document.getElementById('micBtn');
    o.className = 'header-orb'; s.className = ''; m.classList.remove('recording');
    if (mode === 'listening') { o.classList.add('listening'); s.classList.add('listening-st'); s.textContent = '🎙 Listening...'; m.classList.add('recording') }
    else if (mode === 'speaking') { o.classList.add('speaking'); s.classList.add('speaking-st'); s.textContent = '🔊 Speaking...' }
    else { s.textContent = '● Online' }
}

function hideWelcome() { const h = document.getElementById('welcomeHero'); if (h) { h.style.display = 'none'; chatStarted = true } }

function addMessage(text, sender) {
    hideWelcome(); const a = document.getElementById('chatArea');
    const d = document.createElement('div'); d.className = `msg ${sender}`;
    const av = document.createElement('div'); av.className = 'msg-avatar'; av.textContent = sender === 'nova' ? '🎙' : '👤';
    const b = document.createElement('div'); b.className = 'msg-bubble';
    b.innerHTML = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code style="background:rgba(var(--accent-rgb),0.1);padding:2px 6px;border-radius:4px;font-size:11px">$1</code>').replace(/\n/g, '<br>');
    d.appendChild(av); d.appendChild(b); a.appendChild(d); a.scrollTop = a.scrollHeight; return d;
}

function addTyping() { hideWelcome(); const a = document.getElementById('chatArea'); const d = document.createElement('div'); d.className = 'msg nova'; d.id = 'typingMsg'; const av = document.createElement('div'); av.className = 'msg-avatar'; av.textContent = '🎙'; const b = document.createElement('div'); b.className = 'msg-bubble typing-indicator'; b.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>'; d.appendChild(av); d.appendChild(b); a.appendChild(d); a.scrollTop = a.scrollHeight }
function removeTyping() { const t = document.getElementById('typingMsg'); if (t) t.remove() }

async function sendMessage(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    addTyping();
    const r = await novaReply(text);
    removeTyping();
    addMessage(r, 'nova');
    const speechText = r
        .replace(/<[^>]*>/g, ' ')
        .replace(/\*\*/g, '')
        .replace(/`(.+?)`/g, '$1')
        .replace(/\n+/g, '. ')
        .replace(/\s+/g, ' ')
        .trim();
    speak(speechText);
}

function sendFromInput() { const i = document.getElementById('chatInput'); const t = i.value.trim(); if (!t) return; i.value = ''; sendMessage(t) }

function clearChat() {
    const a = document.getElementById('chatArea'); chatStarted = false;
    a.innerHTML = `<div class="welcome-hero" id="welcomeHero"><div class="welcome-orb-wrap"><div class="welcome-ring"></div><div class="welcome-ring"></div><div class="welcome-orb"></div></div><h1>HETRON ⚡</h1><p>AI Voice Assistant — Say any command. Open WhatsApp, Instagram, Facebook, ChatGPT, Grok, Gemini, Google Lens & more!</p><div class="suggestion-chips"><button class="chip" onclick="sendMessage('Hello Hetron!')">👋 Hello</button><button class="chip" onclick="sendMessage('Open WhatsApp')">💬 WhatsApp</button><button class="chip" onclick="sendMessage('Open Instagram')">📸 Instagram</button><button class="chip" onclick="sendMessage('Open ChatGPT')">✦ ChatGPT</button><button class="chip" onclick="sendMessage('Open Grok')">🤖 Grok</button><button class="chip" onclick="sendMessage('Open Gemini')">💎 Gemini</button><button class="chip" onclick="sendMessage('What can you do?')">⚡ Commands</button></div></div>`;
}

function searchWikipedia() { const q = prompt('Wikipedia topic:'); if (q) sendMessage(`Search Wikipedia for ${q}`) }

// ─── VOICE ───
function toggleListen() {
    if (!SR) {
        addMessage('⚠️ Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.', 'nova');
        return;
    }
    if (isListening) {
        if (recognition) try { recognition.stop(); } catch (e) {}
        return;
    }
    try {
        recognition = new SR();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => { isListening = true; setUIState('listening'); };
        recognition.onend = () => {
            isListening = false;
            const st = document.getElementById('statusText');
            if (st && st.textContent.includes('Listening')) setUIState('idle');
        };
        recognition.onresult = (e) => {
            let f = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                if (e.results[i].isFinal) f += e.results[i][0].transcript;
            }
            if (f) {
                setUIState('idle');
                sendMessage(f);
            }
        };
        recognition.onerror = (e) => {
            isListening = false;
            setUIState('idle');
            if (e.error === 'no-speech') return;
            if (e.error === 'not-allowed') {
                addMessage('⚠️ Microphone access blocked. Please allow microphone permissions in your browser settings.', 'nova');
            } else {
                addMessage('⚠️ Voice error: ' + e.error, 'nova');
            }
        };
        recognition.start();
    } catch (err) {
        isListening = false;
        setUIState('idle');
        addMessage('⚠️ Microphone error: ' + (err.message || err), 'nova');
    }
}

function switchVoice() {
    isFemale = !isFemale; const tg = document.getElementById('voiceToggle'), lb = document.getElementById('voiceLabel');
    if (isFemale) { tg.classList.add('active'); lb.textContent = '♀ Hetron Female'; lb.classList.add('female'); speak("Female voice!") }
    else { tg.classList.remove('active'); lb.textContent = '♂ Hetron Male'; lb.classList.remove('female'); speak("Male voice!") }
}

function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('sidebarOverlay');
    if (sb) sb.classList.toggle('open');
    if (ov) ov.classList.toggle('show');
}
function closeSidebar() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('sidebarOverlay');
    if (sb) sb.classList.remove('open');
    if (ov) ov.classList.remove('show');
}

// Auto-close sidebar on mobile when action is tapped
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        const sb = document.getElementById('sidebar');
        if (sb && sb.classList.contains('open')) {
            if (e.target.closest('.action-btn') || e.target.closest('.chip') || (e.target.closest('a') && e.target.closest('#sidebar'))) {
                setTimeout(closeSidebar, 200);
            }
        }
    }
});

// ══════════════════════════════════════════
// 🌦 LIVE WEATHER — Open-Meteo (Free, No Key)
// ══════════════════════════════════════════
async function fetchWeather() {
    const card = document.getElementById('weatherCard');
    const desc = document.getElementById('weatherDesc');
    const temp = document.getElementById('weatherTemp');
    const icon = document.getElementById('weatherIcon');
    const meta = document.getElementById('weatherMeta');
    card.classList.add('show');
    desc.textContent = 'Getting location...';
    icon.textContent = '🌍';
    addMessage('🌦 Fetching live weather...', 'nova');
    if (!navigator.geolocation) {
        desc.textContent = 'Geolocation not supported.';
        return;
    }
    navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
            const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,windspeed_10m`);
            const d = await r.json();
            const w = d.current_weather;
            const wc = w.weathercode;
            const icons = { 0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️', 45: '🌫', 48: '🌫', 51: '🌦', 61: '🌧', 71: '❄️', 80: '🌦', 95: '⛈', 99: '⛈' };
            const names = { 0: 'Clear Sky', 1: 'Mostly Clear', 2: 'Partly Cloudy', 3: 'Overcast', 45: 'Foggy', 48: 'Foggy', 51: 'Drizzle', 61: 'Rain', 71: 'Snow', 80: 'Showers', 95: 'Thunderstorm', 99: 'Heavy Thunderstorm' };
            const closest = Object.keys(icons).reduce((a, b) => Math.abs(b - wc) < Math.abs(a - wc) ? b : a);
            icon.textContent = icons[closest] || '🌡';
            temp.textContent = w.temperature + '°C';
            desc.textContent = names[closest] || 'Weather Code: ' + wc;
            meta.innerHTML = `<span>💨 ${w.windspeed} km/h</span><span>📍 ${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E</span>`;
            addMessage(`${icons[closest]} **Weather Update**\n\n🌡 Temperature: **${w.temperature}°C**\nCondition: **${names[closest] || 'Clear'}**\n💨 Wind: ${w.windspeed} km/h`, 'nova');
            speak(`Current temperature is ${w.temperature} degrees celsius. ${names[closest] || 'Clear sky'}.`);
        } catch (e) { desc.textContent = 'Could not fetch weather.'; addMessage('❌ Weather fetch failed. Check internet connection.', 'nova'); }
    }, () => { desc.textContent = 'Location denied.'; addMessage('❌ Location access denied. Please allow location for weather.', 'nova'); });
}

// ══════════════════════════════════════════
// 📝 QUICK NOTES
// ══════════════════════════════════════════
function toggleNotes() {
    const p = document.getElementById('notesPanel');
    p.classList.toggle('show');
    if (p.classList.contains('show')) {
        const saved = localStorage.getItem('nova_notes') || '';
        document.getElementById('notesText').value = saved;
    }
}
function saveNote() {
    const txt = document.getElementById('notesText').value;
    localStorage.setItem('nova_notes', txt);
    showAlarmToast('📝 Note saved!');
}
function clearNote() {
    document.getElementById('notesText').value = '';
    localStorage.removeItem('nova_notes');
}

// ══════════════════════════════════════════
// ⏱ STOPWATCH / TIMER
// ══════════════════════════════════════════
let timerInterval = null, timerRunning = false, timerMs = 0, countdownTarget = 0, isCountdown = false;
function toggleTimer() { document.getElementById('timerPanel').classList.toggle('show'); }
function timerToggle() {
    if (!timerRunning) {
        timerRunning = true;
        document.getElementById('timerStartBtn').textContent = '⏸ Pause';
        timerInterval = setInterval(() => {
            if (isCountdown) {
                const rem = countdownTarget - Date.now();
                if (rem <= 0) { clearInterval(timerInterval); timerRunning = false; document.getElementById('timerDisplay').textContent = '00:00:00'; document.getElementById('timerStartBtn').textContent = '▶ Start'; showAlarmToast('⏰ Timer Done!'); speak('Timer is done!'); isCountdown = false; return; }
                updateTimerDisplay(rem);
            } else { timerMs += 100; updateTimerDisplay(timerMs); }
        }, 100);
    } else { clearInterval(timerInterval); timerRunning = false; document.getElementById('timerStartBtn').textContent = '▶ Start'; }
}
function timerReset() {
    clearInterval(timerInterval); timerRunning = false; timerMs = 0; isCountdown = false;
    document.getElementById('timerDisplay').textContent = '00:00:00';
    document.getElementById('timerStartBtn').textContent = '▶ Start';
    document.getElementById('timerLabel').textContent = 'Stopwatch';
}
function updateTimerDisplay(ms) {
    const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
    document.getElementById('timerDisplay').textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function startCountdown(seconds) {
    timerReset(); isCountdown = true; countdownTarget = Date.now() + seconds * 1000;
    document.getElementById('timerLabel').textContent = 'Countdown';
    document.getElementById('timerPanel').classList.add('show');
    timerToggle();
}

// ══════════════════════════════════════════
// ⏰ ALARM SYSTEM
// ══════════════════════════════════════════
const alarmTimeouts = [];
function showAlarmToast(msg) {
    const t = document.getElementById('alarmToast');
    document.getElementById('alarmMsg').textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4000);
}
function setAlarmIn(minutes, label) {
    const ms = minutes * 60 * 1000;
    const id = setTimeout(() => {
        showAlarmToast(`⏰ ${label || 'Alarm!'} - ${minutes} min alarm`);
        speak(`${label || 'Alarm'}! Your ${minutes} minute reminder is done!`);
        addMessage(`⏰ **Alarm!** ${label || ''} — ${minutes} minute timer done!`, 'nova');
    }, ms);
    alarmTimeouts.push(id);
}

// ══════════════════════════════════════════
// 🎨 THEME SWITCHER — 10 FULL PALETTES
// ══════════════════════════════════════════
const themes = [
    {
        name: 'Cosmic Bloom', emoji: '🌌', desc: 'Classic purple & teal glow',
        colors: ['#c084fc','#818cf8','#e879f9','#a78bfa','#7c3aed'],
        grad: 'linear-gradient(135deg,#c084fc,#818cf8,#e879f9)',
        bg: '#0b041c', bg2: '#160838',
        accent: '#c084fc', accent2: '#818cf8', accent3: '#e879f9',
        accentRgb: '192, 132, 252', accent2Rgb: '129, 140, 248',
        purple: '#c084fc', blue: '#818cf8', cyan: '#e879f9'
    },
    {
        name: 'Deep Ocean', emoji: '🌊', desc: 'Bioluminescent deep-sea calm',
        colors: ['#34d399','#06b6d4','#3b82f6','#0ea5e9','#14b8a6'],
        grad: 'linear-gradient(135deg,#34d399,#06b6d4,#3b82f6)',
        bg: '#00120a', bg2: '#001a10',
        accent: '#34d399', accent2: '#06b6d4', accent3: '#3b82f6',
        accentRgb: '52, 211, 153', accent2Rgb: '6, 182, 212',
        purple: '#34d399', blue: '#06b6d4', cyan: '#3b82f6'
    },
    {
        name: 'Cherry Blossom', emoji: '🌸', desc: 'Soft pinks & warm petals',
        colors: ['#f472b6','#fb923c','#fbbf24','#f9a8d4','#e879f9'],
        grad: 'linear-gradient(135deg,#f472b6,#fb923c,#fbbf24)',
        bg: '#0f050a', bg2: '#1a050c',
        accent: '#f472b6', accent2: '#fb923c', accent3: '#fbbf24',
        accentRgb: '244, 114, 182', accent2Rgb: '251, 146, 60',
        purple: '#f472b6', blue: '#fb923c', cyan: '#fbbf24'
    },
    {
        name: 'Sunset Gold', emoji: '🌅', desc: 'Warm amber & twilight glow',
        colors: ['#fbbf24','#f59e0b','#fb923c','#f97316','#eab308'],
        grad: 'linear-gradient(135deg,#fbbf24,#f59e0b,#fb923c)',
        bg: '#0f0900', bg2: '#1a1000',
        accent: '#fbbf24', accent2: '#f59e0b', accent3: '#fb923c',
        accentRgb: '251, 191, 36', accent2Rgb: '245, 158, 11',
        purple: '#fbbf24', blue: '#f59e0b', cyan: '#fb923c'
    },
    {
        name: 'Dark Nebula', emoji: '✨', desc: 'Intense violet & mystical haze',
        colors: ['#e879f9','#8b5cf6','#ec4899','#a855f7','#d946ef'],
        grad: 'linear-gradient(135deg,#e879f9,#8b5cf6,#ec4899)',
        bg: '#0a0010', bg2: '#12001c',
        accent: '#e879f9', accent2: '#8b5cf6', accent3: '#ec4899',
        accentRgb: '232, 121, 249', accent2Rgb: '139, 92, 246',
        purple: '#e879f9', blue: '#8b5cf6', cyan: '#ec4899'
    },
    {
        name: 'Northern Lights', emoji: '🌲', desc: 'Emerald & jade forest serenity',
        colors: ['#22c55e','#16a34a','#059669','#10b981','#34d399'],
        grad: 'linear-gradient(135deg,#22c55e,#16a34a,#059669)',
        bg: '#031208', bg2: '#041a0c',
        accent: '#22c55e', accent2: '#16a34a', accent3: '#059669',
        accentRgb: '34, 197, 94', accent2Rgb: '22, 163, 74',
        purple: '#22c55e', blue: '#16a34a', cyan: '#059669'
    },
    {
        name: 'Arctic Frost', emoji: '🧊', desc: 'Crystalline ice & silver mist',
        colors: ['#7dd3fc','#38bdf8','#0ea5e9','#67e8f9','#a5f3fc'],
        grad: 'linear-gradient(135deg,#7dd3fc,#38bdf8,#0ea5e9)',
        bg: '#020e1a', bg2: '#031624',
        accent: '#7dd3fc', accent2: '#38bdf8', accent3: '#0ea5e9',
        accentRgb: '125, 211, 252', accent2Rgb: '56, 189, 248',
        purple: '#7dd3fc', blue: '#38bdf8', cyan: '#0ea5e9'
    },
    {
        name: 'Ember Glow', emoji: '🔥', desc: 'Smoldering crimson & flame',
        colors: ['#f87171','#ef4444','#dc2626','#fb7185','#f43f5e'],
        grad: 'linear-gradient(135deg,#f87171,#ef4444,#dc2626)',
        bg: '#140404', bg2: '#1c0606',
        accent: '#f87171', accent2: '#ef4444', accent3: '#dc2626',
        accentRgb: '248, 113, 113', accent2Rgb: '239, 68, 68',
        purple: '#f87171', blue: '#ef4444', cyan: '#dc2626'
    },
    {
        name: 'Desert Amber', emoji: '🍂', desc: 'Warm amber & golden sand',
        colors: ['#fbbf24','#d97706','#b45309','#f59e0b','#ca8a04'],
        grad: 'linear-gradient(135deg,#fbbf24,#d97706,#b45309)',
        bg: '#120c02', bg2: '#1a1004',
        accent: '#fbbf24', accent2: '#d97706', accent3: '#b45309',
        accentRgb: '251, 191, 36', accent2Rgb: '217, 119, 6',
        purple: '#fbbf24', blue: '#d97706', cyan: '#b45309'
    },
    {
        name: 'Midnight Void', emoji: '🌑', desc: 'Deep indigo & cosmic silence',
        colors: ['#6366f1','#4f46e5','#4338ca','#818cf8','#a5b4fc'],
        grad: 'linear-gradient(135deg,#6366f1,#4f46e5,#4338ca)',
        bg: '#06061a', bg2: '#0a0a24',
        accent: '#6366f1', accent2: '#4f46e5', accent3: '#4338ca',
        accentRgb: '99, 102, 241', accent2Rgb: '79, 70, 229',
        purple: '#6366f1', blue: '#4f46e5', cyan: '#4338ca'
    }
];
let currentTheme = 0;
let themePage = 0;
const THEMES_PER_PAGE = 5;

function applyThemeVars(t) {
    const r = document.documentElement.style;
    r.setProperty('--grad', t.grad);
    r.setProperty('--bg', t.bg);
    r.setProperty('--bg2', t.bg2);
    r.setProperty('--accent', t.accent);
    r.setProperty('--accent2', t.accent2);
    r.setProperty('--accent3', t.accent3);
    r.setProperty('--accent-rgb', t.accentRgb);
    r.setProperty('--accent2-rgb', t.accent2Rgb);
    r.setProperty('--purple', t.purple);
    r.setProperty('--blue', t.blue);
    r.setProperty('--cyan', t.cyan);
    r.setProperty('--green', t.accent2);
    r.setProperty('--pink', t.accent);
    r.setProperty('--border', `rgba(${t.accentRgb}, 0.08)`);
    document.body.style.background = t.bg;
}

function setTheme(i) {
    if (i < 0 || i >= themes.length) return;
    const t = themes[i]; currentTheme = i;
    applyThemeVars(t);
    document.querySelectorAll('.theme-dot').forEach((d, k) => {
        const globalIdx = themePage * THEMES_PER_PAGE + k;
        d.classList.toggle('active', globalIdx === i);
    });
    addMessage(`🎨 Theme changed to **${t.name}**!`, 'nova');
    localStorage.setItem('hetron_theme', i);
}

function renderThemeDots() {
    const row = document.getElementById('themeRow');
    if (!row) return;
    row.innerHTML = '';
    const start = themePage * THEMES_PER_PAGE;
    const end = Math.min(start + THEMES_PER_PAGE, themes.length);
    for (let i = start; i < end; i++) {
        const dot = document.createElement('div');
        dot.className = 'theme-dot' + (i === currentTheme ? ' active' : '');
        dot.style.background = themes[i].grad;
        dot.title = themes[i].name;
        dot.onclick = () => setTheme(i);
        row.appendChild(dot);
    }
    // Update page indicator
    const indicator = document.getElementById('themePageIndicator');
    if (indicator) {
        indicator.textContent = `${themePage + 1}/${Math.ceil(themes.length / THEMES_PER_PAGE)}`;
    }
}

function cycleThemePage() {
    const totalPages = Math.ceil(themes.length / THEMES_PER_PAGE);
    themePage = (themePage + 1) % totalPages;
    renderThemeDots();
    // Animate the cycle button
    const btn = document.getElementById('themeCycleBtn');
    if (btn) {
        btn.classList.add('spin');
        setTimeout(() => btn.classList.remove('spin'), 500);
    }
}

// Initialize theme dots on load
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('hetron_theme');
    if (saved !== null) {
        const idx = parseInt(saved);
        if (idx >= 0 && idx < themes.length) {
            themePage = Math.floor(idx / THEMES_PER_PAGE);
            // Apply silently (no chat message)
            const t = themes[idx]; currentTheme = idx;
            document.documentElement.style.setProperty('--grad', t.grad);
            document.documentElement.style.setProperty('--bg', t.bg);
            document.documentElement.style.setProperty('--bg2', t.bg2);
            document.documentElement.style.setProperty('--purple', t.purple);
            document.documentElement.style.setProperty('--blue', t.blue);
            document.documentElement.style.setProperty('--cyan', t.cyan);
            document.body.style.background = t.bg;
        }
    }
    renderThemeDots();
});

// ══════════════════════════════════════════
// ⬇ SCROLL TO BOTTOM
// ══════════════════════════════════════════
function scrollToBottom() { const a = document.getElementById('chatArea'); a.scrollTop = a.scrollHeight; }
document.getElementById('chatArea').addEventListener('scroll', function () {
    const a = this, btn = document.getElementById('scrollBtn');
    const atBottom = a.scrollHeight - a.clientHeight - a.scrollTop < 60;
    btn.style.display = atBottom ? 'none' : 'flex';
});

// ══════════════════════════════════════════
// 🎵 HINDI INSTRUMENTAL PLAYER — Web Audio API
// Real melodies: Bollywood + Classical Ragas
// ══════════════════════════════════════════

// Note frequencies Hz (Indian Sargam / Western)
const MN = {
    C3: 130.81, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, Gb3: 185.00, G3: 196.00, Ab3: 207.65, A3: 220.00, Bb3: 233.08, B3: 246.94,
    C4: 261.63, Db4: 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, Gb4: 369.99, G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
    C5: 523.25, Db5: 554.37, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, Gb5: 739.99, G5: 783.99, Ab5: 830.61, A5: 880.00, B5: 987.77,
    _: 0
};

// Each track: name, artist, emoji, inst (instrument type), drone bass notes, melody
// inst types: 'flute','dholak','casio','sitar','violin','piano','guitar'
const mpTracks = [
    {
        name: 'Tum Hi Ho', artist: 'Aashiqui 2 - Violin', emoji: '💕', inst: 'violin',
        drone: [MN.A3, MN.E4],
        seq: [
            [MN.A4, 0.9], [MN.C5, 0.45], [MN.B4, 0.45], [MN.A4, 0.9], [MN.G4, 0.45], [MN.A4, 0.45],
            [MN.G4, 0.9], [MN.E4, 0.9], [MN._, 0.5], [MN.A4, 0.45], [MN.G4, 0.45],
            [MN.F4, 0.9], [MN.G4, 0.9], [MN.A4, 1.8], [MN._, 0.5],
            [MN.C5, 0.9], [MN.B4, 0.45], [MN.A4, 0.45], [MN.G4, 0.9], [MN.A4, 0.9], [MN.E4, 2.7]
        ]
    },
    {
        name: 'Teri Mitti', artist: 'Kesari - Flute', emoji: '🙏', inst: 'flute',
        drone: [MN.D3, MN.A3],
        seq: [
            [MN.D4, 1.0], [MN.E4, 0.5], [MN.F4, 0.5], [MN.G4, 1.0], [MN.F4, 0.5], [MN.E4, 0.5],
            [MN.D4, 1.0], [MN.C4, 1.0], [MN._, 0.5], [MN.D4, 0.5], [MN.E4, 0.5],
            [MN.F4, 1.0], [MN.G4, 1.0], [MN.A4, 1.0], [MN.G4, 0.5], [MN.F4, 0.5],
            [MN.G4, 1.0], [MN.F4, 0.5], [MN.E4, 0.5], [MN.D4, 3.0]
        ]
    },
    {
        name: 'Chaudhary', artist: 'Amit Trivedi - Flute', emoji: '🪈', inst: 'flute',
        drone: [MN.D3, MN.A3],
        seq: [
            [MN.A4, 0.6], [MN.G4, 0.3], [MN.F4, 0.3], [MN.E4, 0.6], [MN.D4, 0.6], [MN._, 0.3],
            [MN.F4, 0.3], [MN.G4, 0.6], [MN.A4, 0.6], [MN.C5, 0.6], [MN.A4, 0.3], [MN.G4, 0.3],
            [MN.F4, 0.6], [MN.E4, 0.3], [MN.D4, 0.6], [MN._, 0.3],
            [MN.D4, 0.3], [MN.E4, 0.3], [MN.F4, 0.6], [MN.A4, 0.6], [MN.G4, 0.6], [MN.F4, 0.3], [MN.E4, 0.3], [MN.D4, 1.2]
        ]
    },
    {
        name: 'Kesariya', artist: 'Brahmastra - Guitar', emoji: '🌸', inst: 'guitar',
        drone: [MN.E3, MN.B3],
        seq: [
            [MN.B4, 0.4], [MN.A4, 0.4], [MN.G4, 0.6], [MN.Gb4, 0.4], [MN.E4, 0.6], [MN._, 0.3],
            [MN.Gb4, 0.4], [MN.G4, 0.4], [MN.A4, 0.6], [MN.B4, 0.6], [MN._, 0.3],
            [MN.B4, 0.4], [MN.D5, 0.6], [MN.B4, 0.6], [MN.A4, 0.6], [MN._, 0.3],
            [MN.G4, 0.4], [MN.A4, 0.4], [MN.B4, 0.6], [MN.A4, 0.6], [MN.G4, 1.2]
        ]
    },
    {
        name: 'Nagada Sang Dhol', artist: 'Goliyon Ki - Dholak', emoji: '🪘', inst: 'dholak',
        drone: [MN.D3, MN.A3],
        seq: [
            [MN.D4, 0.2], [MN._, 0.1], [MN.D4, 0.2], [MN.D4, 0.15], [MN.A4, 0.2], [MN._, 0.15],
            [MN.D4, 0.2], [MN._, 0.1], [MN.G4, 0.2], [MN.D4, 0.2], [MN._, 0.15],
            [MN.A4, 0.2], [MN.A4, 0.15], [MN.D4, 0.2], [MN._, 0.1], [MN.D4, 0.2], [MN.G4, 0.2], [MN._, 0.15],
            [MN.D4, 0.2], [MN.D4, 0.15], [MN.A4, 0.2], [MN.D4, 0.2], [MN._, 0.1], [MN.D4, 0.2], [MN.D4, 0.15], [MN._, 0.3]
        ]
    },
    {
        name: 'Raag Bhairav', artist: 'Sitar Classical', emoji: '🎸', inst: 'sitar',
        drone: [MN.C3, MN.G3],
        seq: [
            [MN.C4, 1.4], [MN.Db4, 0.7], [MN.E4, 0.7], [MN.F4, 1.4], [MN._, 0.5],
            [MN.G4, 0.7], [MN.Ab4, 0.7], [MN.B4, 1.4], [MN.C5, 2.1], [MN._, 0.7],
            [MN.B4, 0.7], [MN.Ab4, 0.7], [MN.G4, 1.4], [MN._, 0.5],
            [MN.F4, 0.7], [MN.E4, 0.7], [MN.Db4, 0.7], [MN.C4, 2.8]
        ]
    },
    {
        name: 'Tere Bina', artist: 'Guru - Piano', emoji: '🎹', inst: 'piano',
        drone: [MN.G3, MN.D4],
        seq: [
            [MN.G4, 0.7], [MN.A4, 0.35], [MN.B4, 0.7], [MN.D5, 0.7], [MN.C5, 0.35], [MN.B4, 0.7],
            [MN.A4, 0.7], [MN.G4, 1.4], [MN._, 0.5], [MN.G4, 0.35], [MN.A4, 0.35],
            [MN.B4, 0.7], [MN.D5, 1.4], [MN.C5, 0.7], [MN.B4, 0.7],
            [MN.A4, 0.7], [MN.B4, 0.7], [MN.G4, 2.1]
        ]
    },
    {
        name: 'Tujhe Dekha', artist: 'DDLJ - Casio', emoji: '🎛️', inst: 'casio',
        drone: [MN.C3, MN.G3],
        seq: [
            [MN.E4, 0.5], [MN.G4, 0.5], [MN.A4, 0.5], [MN.G4, 0.5], [MN.E4, 0.5], [MN._, 0.25],
            [MN.D4, 0.5], [MN.E4, 0.5], [MN.G4, 1.0], [MN._, 0.25],
            [MN.A4, 0.5], [MN.B4, 0.5], [MN.C5, 0.5], [MN.B4, 0.5], [MN.A4, 0.5], [MN._, 0.25],
            [MN.G4, 0.5], [MN.A4, 0.5], [MN.E4, 1.5]
        ]
    },
    {
        name: 'Lag Ja Gale', artist: 'Classic - Violin', emoji: '🎻', inst: 'violin',
        drone: [MN.C3, MN.G3],
        seq: [
            [MN.E4, 1.1], [MN.G4, 0.55], [MN.A4, 0.55], [MN.B4, 1.1], [MN.A4, 0.55], [MN.G4, 0.55],
            [MN.E4, 1.1], [MN.D4, 0.55], [MN.C4, 0.55], [MN._, 0.55],
            [MN.D4, 1.1], [MN.E4, 1.1], [MN.G4, 1.1], [MN.A4, 0.55], [MN.G4, 0.55],
            [MN.E4, 1.1], [MN.D4, 0.55], [MN.E4, 0.55], [MN.C4, 2.2]
        ]
    },
    {
        name: 'Dil Se Re', artist: 'Dil Se - Dholak', emoji: '🥁', inst: 'dholak',
        drone: [MN.A3, MN.E4],
        seq: [
            [MN.A4, 0.25], [MN._, 0.1], [MN.A4, 0.25], [MN.C5, 0.25], [MN._, 0.1], [MN.A4, 0.25],
            [MN.E4, 0.5], [MN._, 0.15], [MN.A4, 0.25], [MN.A4, 0.2],
            [MN.D5, 0.25], [MN._, 0.1], [MN.C5, 0.25], [MN.A4, 0.25], [MN._, 0.1],
            [MN.C5, 0.25], [MN.A4, 0.25], [MN.E4, 0.25], [MN._, 0.1], [MN.A4, 0.5], [MN._, 0.3]
        ]
    },
    {
        name: 'Raag Yaman', artist: 'Bansuri Classical', emoji: '🪈', inst: 'flute',
        drone: [MN.C3, MN.G3],
        seq: [
            [MN.C4, 1.1], [MN.D4, 0.55], [MN.E4, 0.55], [MN.Gb4, 1.1], [MN.G4, 0.55], [MN.A4, 0.55],
            [MN.B4, 1.1], [MN.C5, 2.2], [MN._, 0.7],
            [MN.B4, 0.55], [MN.A4, 0.55], [MN.G4, 1.1], [MN.Gb4, 0.55], [MN.E4, 0.55],
            [MN.D4, 0.55], [MN.C4, 2.8]
        ]
    },
    {
        name: 'Raag Desh', artist: 'Classical - Flute', emoji: '🇮🇳', inst: 'flute',
        drone: [MN.C3, MN.G3],
        seq: [
            [MN.C4, 0.8], [MN.E4, 0.4], [MN.F4, 0.4], [MN.G4, 0.8], [MN.A4, 0.4], [MN.Bb4, 0.4],
            [MN.C5, 1.2], [MN._, 0.4],
            [MN.Bb4, 0.4], [MN.A4, 0.4], [MN.G4, 0.8], [MN.F4, 0.4], [MN.E4, 0.4],
            [MN.D4, 0.4], [MN.C4, 2.0], [MN._, 0.6]
        ]
    },
    {
        name: 'Jai Ho', artist: 'Slumdog - Casio', emoji: '🎆', inst: 'casio',
        drone: [MN.A3, MN.E4],
        seq: [
            [MN.A4, 0.3], [MN.A4, 0.3], [MN.C5, 0.3], [MN.A4, 0.3], [MN.E4, 0.6], [MN._, 0.3],
            [MN.A4, 0.3], [MN.A4, 0.3], [MN.D5, 0.3], [MN.C5, 0.3], [MN.B4, 0.6], [MN._, 0.3],
            [MN.E5, 0.3], [MN.D5, 0.3], [MN.C5, 0.3], [MN.B4, 0.3], [MN.A4, 0.6], [MN._, 0.3],
            [MN.A4, 0.3], [MN.C5, 0.3], [MN.E5, 0.6], [MN.D5, 0.3], [MN.C5, 0.3], [MN.A4, 0.9]
        ]
    }
];

// ── Sequencer State ──
let mpCtx = null, mpVolGain = null, mpDroneNodes = [];
let mpCurrentIdx = 0, mpPlaying = false, mpElapsed = 0;
let mpSeqPos = 0, mpNextNoteTime = 0, mpSchedulerTimer = null, mpUITimer = null;

function mpGetCtx() {
    if (!mpCtx) mpCtx = new (window.AudioContext || window.webkitAudioContext)();
    return mpCtx;
}

function toggleMusicPlayer() {
    document.getElementById('musicPlayer').classList.toggle('show');
    mpRenderPlaylist();
}

function mpRenderPlaylist() {
    document.getElementById('mpPlaylist').innerHTML = mpTracks.map((tr, i) => `
        <div class="mp-track ${i === mpCurrentIdx ? 'active' : ''}" onclick="mpSelectTrack(${i})">
            <span class="mp-track-num">${i === mpCurrentIdx && mpPlaying ?
            '<span class="mp-eq"><span></span><span></span><span></span></span>' : (i + 1)}</span>
            <div class="mp-track-info">
                <div class="mp-track-name">${tr.emoji} ${tr.name}</div>
                <div class="mp-track-dur">${tr.artist}</div>
            </div>
        </div>`).join('');
}

function mpSelectTrack(idx) {
    const was = mpPlaying;
    mpStop(false);
    mpCurrentIdx = idx; mpElapsed = 0;
    const tr = mpTracks[idx];
    document.getElementById('mpSongName').textContent = tr.name;
    document.getElementById('mpArtist').textContent = tr.artist;
    document.getElementById('mpDisc').textContent = tr.emoji;
    mpRenderPlaylist();
    if (was) mpPlay();
}

// ══════════════════════════════════════════
// 🎵 INSTRUMENT SYNTHESIS FUNCTIONS
// ══════════════════════════════════════════

// 🪈 FLUTE — sine + breathy noise + soft overtone
function mpPlayFlute(freq, dur, startTime) {
    if (!mpCtx || !mpVolGain) return;
    // Main sine tone
    const osc = mpCtx.createOscillator();
    const gain = mpCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const atk = 0.08, rel = Math.min(0.15, dur * 0.3);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.6, startTime + atk);
    gain.gain.setValueAtTime(0.55, startTime + dur - rel);
    gain.gain.linearRampToValueAtTime(0, startTime + dur);
    osc.connect(gain); gain.connect(mpVolGain);
    osc.start(startTime); osc.stop(startTime + dur + 0.05);
    // Soft overtone (octave up, quiet)
    const osc2 = mpCtx.createOscillator();
    const g2 = mpCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2;
    g2.gain.setValueAtTime(0, startTime);
    g2.gain.linearRampToValueAtTime(0.08, startTime + atk);
    g2.gain.linearRampToValueAtTime(0, startTime + dur);
    osc2.connect(g2); g2.connect(mpVolGain);
    osc2.start(startTime); osc2.stop(startTime + dur + 0.05);
    // Breathy noise
    const bufLen = mpCtx.sampleRate * dur;
    const buf = mpCtx.createBuffer(1, bufLen, mpCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * 0.015;
    const noise = mpCtx.createBufferSource();
    noise.buffer = buf;
    const ng = mpCtx.createGain();
    ng.gain.setValueAtTime(0, startTime);
    ng.gain.linearRampToValueAtTime(0.12, startTime + atk);
    ng.gain.linearRampToValueAtTime(0, startTime + dur);
    noise.connect(ng); ng.connect(mpVolGain);
    noise.start(startTime); noise.stop(startTime + dur + 0.05);
}

// 🪘 DHOLAK — noise burst + pitched membrane thump
function mpPlayDholak(freq, dur, startTime) {
    if (!mpCtx || !mpVolGain) return;
    // Membrane thump oscillator (pitched down quickly)
    const osc = mpCtx.createOscillator();
    const gain = mpCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.5, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, startTime + 0.12);
    gain.gain.setValueAtTime(0.8, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + Math.min(dur, 0.3));
    osc.connect(gain); gain.connect(mpVolGain);
    osc.start(startTime); osc.stop(startTime + 0.35);
    // Noise burst (slap)
    const noiseDur = Math.min(dur, 0.15);
    const bufLen = Math.max(1, Math.floor(mpCtx.sampleRate * noiseDur));
    const buf = mpCtx.createBuffer(1, bufLen, mpCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);
    const noise = mpCtx.createBufferSource();
    noise.buffer = buf;
    const ng = mpCtx.createGain();
    const filt = mpCtx.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = freq * 2; filt.Q.value = 1.5;
    ng.gain.setValueAtTime(0.5, startTime);
    ng.gain.exponentialRampToValueAtTime(0.001, startTime + noiseDur);
    noise.connect(filt); filt.connect(ng); ng.connect(mpVolGain);
    noise.start(startTime); noise.stop(startTime + noiseDur + 0.01);
}

// 🎛️ CASIO — detuned square waves + PWM feel
function mpPlayCasio(freq, dur, startTime) {
    if (!mpCtx || !mpVolGain) return;
    const atk = 0.02, rel = Math.min(0.1, dur * 0.2);
    // Main square
    const osc1 = mpCtx.createOscillator();
    const g1 = mpCtx.createGain();
    osc1.type = 'square';
    osc1.frequency.value = freq;
    g1.gain.setValueAtTime(0, startTime);
    g1.gain.linearRampToValueAtTime(0.25, startTime + atk);
    g1.gain.setValueAtTime(0.22, startTime + dur - rel);
    g1.gain.linearRampToValueAtTime(0, startTime + dur);
    osc1.connect(g1); g1.connect(mpVolGain);
    osc1.start(startTime); osc1.stop(startTime + dur + 0.05);
    // Detuned sawtooth (slight chorus)
    const osc2 = mpCtx.createOscillator();
    const g2 = mpCtx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.value = freq * 1.003;
    g2.gain.setValueAtTime(0, startTime);
    g2.gain.linearRampToValueAtTime(0.15, startTime + atk);
    g2.gain.linearRampToValueAtTime(0, startTime + dur);
    osc2.connect(g2); g2.connect(mpVolGain);
    osc2.start(startTime); osc2.stop(startTime + dur + 0.05);
    // Sub octave
    const osc3 = mpCtx.createOscillator();
    const g3 = mpCtx.createGain();
    osc3.type = 'square';
    osc3.frequency.value = freq * 0.5;
    g3.gain.setValueAtTime(0, startTime);
    g3.gain.linearRampToValueAtTime(0.1, startTime + atk);
    g3.gain.linearRampToValueAtTime(0, startTime + dur);
    osc3.connect(g3); g3.connect(mpVolGain);
    osc3.start(startTime); osc3.stop(startTime + dur + 0.05);
}

// 🎸 SITAR — triangle + harmonics + quick bend
function mpPlaySitar(freq, dur, startTime) {
    if (!mpCtx || !mpVolGain) return;
    const osc = mpCtx.createOscillator();
    const gain = mpCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq * 0.98, startTime);
    osc.frequency.linearRampToValueAtTime(freq, startTime + 0.06);
    const atk = 0.02, rel = Math.min(0.2, dur * 0.3);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.5, startTime + atk);
    gain.gain.exponentialRampToValueAtTime(0.15, startTime + dur * 0.5);
    gain.gain.linearRampToValueAtTime(0, startTime + dur);
    const filt = mpCtx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 2500; filt.Q.value = 2;
    osc.connect(filt); filt.connect(gain); gain.connect(mpVolGain);
    osc.start(startTime); osc.stop(startTime + dur + 0.05);
    // Sympathetic string (octave up, quiet ring)
    const osc2 = mpCtx.createOscillator();
    const g2 = mpCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.value = freq * 2;
    g2.gain.setValueAtTime(0.06, startTime + atk);
    g2.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
    osc2.connect(g2); g2.connect(mpVolGain);
    osc2.start(startTime); osc2.stop(startTime + dur + 0.05);
}

// 🎻 VIOLIN — triangle + vibrato LFO
function mpPlayViolin(freq, dur, startTime) {
    if (!mpCtx || !mpVolGain) return;
    const osc = mpCtx.createOscillator();
    const gain = mpCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    // Vibrato
    const lfo = mpCtx.createOscillator();
    const lfoGain = mpCtx.createGain();
    lfo.type = 'sine'; lfo.frequency.value = 5.5;
    lfoGain.gain.value = freq * 0.012;
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
    lfo.start(startTime + 0.15); lfo.stop(startTime + dur + 0.05);
    const atk = 0.06, rel = Math.min(0.15, dur * 0.25);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.65, startTime + atk);
    gain.gain.setValueAtTime(0.6, startTime + dur - rel);
    gain.gain.linearRampToValueAtTime(0, startTime + dur);
    osc.connect(gain); gain.connect(mpVolGain);
    osc.start(startTime); osc.stop(startTime + dur + 0.05);
}

// 🎹 PIANO — sine + quick decay + harmonics
function mpPlayPiano(freq, dur, startTime) {
    if (!mpCtx || !mpVolGain) return;
    [1, 2, 3].forEach((h, idx) => {
        const osc = mpCtx.createOscillator();
        const gain = mpCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq * h;
        const vol = [0.6, 0.12, 0.04][idx];
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(vol * 0.15, startTime + dur * 0.6);
        gain.gain.linearRampToValueAtTime(0, startTime + dur);
        osc.connect(gain); gain.connect(mpVolGain);
        osc.start(startTime); osc.stop(startTime + dur + 0.05);
    });
}

// 🎸 GUITAR — pluck with fast decay + harmonics
function mpPlayGuitar(freq, dur, startTime) {
    if (!mpCtx || !mpVolGain) return;
    const osc = mpCtx.createOscillator();
    const gain = mpCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.7, startTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.08, startTime + dur * 0.4);
    gain.gain.linearRampToValueAtTime(0, startTime + dur);
    const filt = mpCtx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(3000, startTime);
    filt.frequency.exponentialRampToValueAtTime(800, startTime + dur);
    osc.connect(filt); filt.connect(gain); gain.connect(mpVolGain);
    osc.start(startTime); osc.stop(startTime + dur + 0.05);
    // Body resonance
    const osc2 = mpCtx.createOscillator();
    const g2 = mpCtx.createGain();
    osc2.type = 'sine'; osc2.frequency.value = freq * 0.5;
    g2.gain.setValueAtTime(0.15, startTime);
    g2.gain.exponentialRampToValueAtTime(0.001, startTime + dur * 0.5);
    osc2.connect(g2); g2.connect(mpVolGain);
    osc2.start(startTime); osc2.stop(startTime + dur + 0.05);
}

// Schedule a note using the current track's instrument
function mpScheduleNote(freq, dur, startTime) {
    if (!mpCtx || !mpVolGain || freq === 0) return;
    const inst = mpTracks[mpCurrentIdx].inst || 'flute';
    switch (inst) {
        case 'flute': mpPlayFlute(freq, dur, startTime); break;
        case 'dholak': mpPlayDholak(freq, dur, startTime); break;
        case 'casio': mpPlayCasio(freq, dur, startTime); break;
        case 'sitar': mpPlaySitar(freq, dur, startTime); break;
        case 'violin': mpPlayViolin(freq, dur, startTime); break;
        case 'piano': mpPlayPiano(freq, dur, startTime); break;
        case 'guitar': mpPlayGuitar(freq, dur, startTime); break;
        default: mpPlayFlute(freq, dur, startTime); break;
    }
}

// Start tanpura drone (Sa + Pa)
function mpStartDrone(drones) {
    drones.forEach(freq => {
        const o = mpCtx.createOscillator();
        const g = mpCtx.createGain();
        o.type = 'sine'; o.frequency.value = freq;
        g.gain.value = 0.06;
        o.connect(g); g.connect(mpVolGain);
        o.start();
        mpDroneNodes.push({ o, g });
    });
}

function mpStopDrone() {
    mpDroneNodes.forEach(n => { try { n.o.stop(); } catch (e) { } });
    mpDroneNodes = [];
}

// Look-ahead scheduler (Chris Wilson pattern)
const MP_LOOKAHEAD = 0.15;
function mpRunScheduler() {
    const seq = mpTracks[mpCurrentIdx].seq;
    while (mpNextNoteTime < mpCtx.currentTime + MP_LOOKAHEAD) {
        const [freq, dur] = seq[mpSeqPos % seq.length];
        mpScheduleNote(freq, dur, mpNextNoteTime);
        mpNextNoteTime += dur;
        mpSeqPos++;
    }
}

function mpPlay() {
    if (mpPlaying) return;
    const ctx = mpGetCtx();
    if (ctx.state === 'suspended') ctx.resume();
    mpVolGain = ctx.createGain();
    mpVolGain.gain.value = parseFloat(document.getElementById('mpVolume').value);
    mpVolGain.connect(ctx.destination);
    mpStartDrone(mpTracks[mpCurrentIdx].drone);
    mpSeqPos = 0;
    mpNextNoteTime = ctx.currentTime + 0.1;
    mpPlaying = true;
    mpSchedulerTimer = setInterval(mpRunScheduler, 50);
    mpUITimer = setInterval(() => {
        mpElapsed += 0.5;
        const m = Math.floor(mpElapsed / 60), s = Math.floor(mpElapsed % 60);
        document.getElementById('mpCurrent').textContent = m + ':' + String(s).padStart(2, '0');
        const total = mpTracks[mpCurrentIdx].seq.reduce((a, n) => a + n[1], 0);
        document.getElementById('mpFill').style.width = ((mpElapsed % total) / total * 100) + '%';
    }, 500);
    document.getElementById('mpPlayBtn').innerHTML = '&#9646;&#9646;';
    document.getElementById('mpDuration').textContent = '&#8734;';
    document.getElementById('mpDisc').classList.add('spinning');
    mpRenderPlaylist();
}

function mpStop(resetElapsed) {
    if (!mpPlaying) return;
    clearInterval(mpSchedulerTimer); clearInterval(mpUITimer);
    mpStopDrone();
    if (mpVolGain) { try { mpVolGain.disconnect(); } catch (e) { } mpVolGain = null; }
    mpPlaying = false;
    if (resetElapsed) mpElapsed = 0;
    document.getElementById('mpPlayBtn').innerHTML = '&#9654;';
    document.getElementById('mpDisc').classList.remove('spinning');
    if (mpCtx && mpCtx.state !== 'closed') mpCtx.suspend();
    mpRenderPlaylist();
}

function mpPause() { mpStop(false); }

function mpToggle() { mpPlaying ? mpPause() : mpPlay(); }

function mpNext() {
    const was = mpPlaying; mpStop(true);
    mpCurrentIdx = (mpCurrentIdx + 1) % mpTracks.length;
    const tr = mpTracks[mpCurrentIdx];
    document.getElementById('mpSongName').textContent = tr.name;
    document.getElementById('mpArtist').textContent = tr.artist;
    document.getElementById('mpDisc').textContent = tr.emoji;
    mpRenderPlaylist(); if (was) mpPlay();
}

function mpPrev() {
    const was = mpPlaying; mpStop(true);
    mpCurrentIdx = (mpCurrentIdx - 1 + mpTracks.length) % mpTracks.length;
    const tr = mpTracks[mpCurrentIdx];
    document.getElementById('mpSongName').textContent = tr.name;
    document.getElementById('mpArtist').textContent = tr.artist;
    document.getElementById('mpDisc').textContent = tr.emoji;
    mpRenderPlaylist(); if (was) mpPlay();
}

function mpForward() { mpElapsed = Math.min(mpElapsed + 10, 999); }
function mpRewind() { mpElapsed = Math.max(mpElapsed - 10, 0); mpSeqPos = 0; }

function mpSetVolume(val) {
    if (mpVolGain) mpVolGain.gain.value = parseFloat(val);
    const icons = document.querySelectorAll('.mp-vol-icon');
    if (icons[0]) icons[0].textContent = parseFloat(val) === 0 ? '🔇' : '🔉';
    if (icons[1]) icons[1].textContent = '🔊';
}

function mpSeek(e) {
    const bar = document.getElementById('mpBar');
    const pct = (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth;
    const total = mpTracks[mpCurrentIdx].seq.reduce((a, n) => a + n[1], 0);
    mpElapsed = pct * total; mpSeqPos = 0;
}

function mpFmtTime(s) {
    return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
}

// ══════════════════════════════════════════
// 📊 SYSTEM INFO PANEL
// ══════════════════════════════════════════
let siClockInterval = null;

function toggleSysInfo() {
    const p = document.getElementById('sysinfoPanel');
    p.classList.toggle('show');
    if (p.classList.contains('show')) {
        loadSysInfo();
        clearInterval(siClockInterval);
        siClockInterval = setInterval(() => {
            const now = new Date();
            document.getElementById('siTime').textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }, 1000);
    } else {
        clearInterval(siClockInterval);
    }
}

function loadSysInfo() {
    const now = new Date();
    // Clock
    document.getElementById('siTime').textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('siDate').textContent = now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    // Platform
    const ua = navigator.userAgent;
    let platform = '🖥 Desktop';
    if (/Android/i.test(ua)) platform = '📱 Android';
    else if (/iPhone|iPad/i.test(ua)) platform = '🍎 iOS';
    else if (/Windows/i.test(ua)) platform = '🪟 Windows';
    else if (/Mac/i.test(ua)) platform = '🍎 macOS';
    else if (/Linux/i.test(ua)) platform = '🐧 Linux';
    document.getElementById('siPlatform').textContent = platform;
    document.getElementById('siLang').textContent = navigator.language || 'en-IN';

    // Online status
    const online = navigator.onLine;
    document.getElementById('siOnline').textContent = online ? '🟢 Online' : '🔴 Offline';
    document.getElementById('siOnline').style.color = online ? '#34d399' : '#f87171';

    // Connection type
    const cn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (cn) {
        document.getElementById('siConnType').textContent = `${cn.effectiveType || 'Unknown'} · ${cn.downlink || '--'} Mbps`;
        document.getElementById('siNetwork').textContent = cn.effectiveType || '--';
        document.getElementById('siNetSub').textContent = `↓ ${cn.downlink || '--'} Mbps`;
    } else {
        document.getElementById('siNetwork').textContent = online ? '📶' : '❌';
        document.getElementById('siNetSub').textContent = online ? 'Connected' : 'No connection';
        document.getElementById('siConnType').textContent = 'Connection info N/A';
    }

    // Battery
    if (navigator.getBattery) {
        navigator.getBattery().then(b => {
            const pct = Math.round(b.level * 100);
            const charging = b.charging;
            document.getElementById('siBattery').textContent = pct + '%';
            document.getElementById('siBattStatus').textContent = charging ? '⚡ Charging' : (pct > 20 ? '🔋 Good' : '⚠ Low!');
            const color = pct > 50 ? '#34d399' : pct > 20 ? '#fbbf24' : '#f87171';
            document.getElementById('siBattery').style.color = color;
            document.getElementById('siBattFill').style.width = pct + '%';
            document.getElementById('siBattFill').style.background = charging ? '#60a5fa' : color;
            b.addEventListener('levelchange', loadSysInfo);
            b.addEventListener('chargingchange', loadSysInfo);
        });
    } else {
        document.getElementById('siBattery').textContent = 'N/A';
        document.getElementById('siBattStatus').textContent = 'API not supported';
    }
}

// Online/Offline events
window.addEventListener('online', () => { if (document.getElementById('sysinfoPanel').classList.contains('show')) loadSysInfo(); });
window.addEventListener('offline', () => { if (document.getElementById('sysinfoPanel').classList.contains('show')) loadSysInfo(); });

// ══════════════════════════════════════
// NEW FEATURES — CALCULATOR
// ══════════════════════════════════════
let calcExpr = '';
function toggleCalc() { document.getElementById('calcPanel').classList.toggle('show') }
function calcInput(v) {
    if (calcExpr === '0' && v !== '.') calcExpr = '';
    calcExpr += v; document.getElementById('calcDisplay').textContent = calcExpr;
}
function calcClear() { calcExpr = ''; document.getElementById('calcDisplay').innerHTML = '0' }
function calcEval() {
    try {
        let expr = calcExpr.replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(').replace(/tan\(/g, 'Math.tan(');
        const result = Function('"use strict";return(' + expr + ')')();
        document.getElementById('calcDisplay').innerHTML = `<small>${calcExpr} =</small>${parseFloat(result.toFixed(10))}`;
        calcExpr = '' + parseFloat(result.toFixed(10));
    } catch (e) { document.getElementById('calcDisplay').textContent = 'Error'; calcExpr = '' }
}

// ══════════════════════════════════════
// PASSWORD GENERATOR
// ══════════════════════════════════════
let lastPwd = '';
function togglePwdGen() { document.getElementById('pwdPanel').classList.toggle('show') }
function generatePwd() {
    const len = parseInt(document.getElementById('pwdLen').value);
    let chars = '';
    if (document.getElementById('pwdUpper').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (document.getElementById('pwdLower').checked) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (document.getElementById('pwdNums').checked) chars += '0123456789';
    if (document.getElementById('pwdSyms').checked) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) { chars = 'abcdefghijklmnopqrstuvwxyz0123456789' }
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    lastPwd = Array.from(arr, x => chars[x % chars.length]).join('');
    document.getElementById('pwdOutput').textContent = lastPwd;
}
function copyPwd() {
    if (!lastPwd) { generatePwd() }
    navigator.clipboard.writeText(lastPwd).then(() => {
        const el = document.getElementById('pwdOutput');
        el.style.color = '#34d399'; el.textContent = '✅ Copied!';
        setTimeout(() => { el.style.color = ''; el.textContent = lastPwd }, 1500);
    }).catch(() => { addMessage('❌ Copy failed. Manually copy: ' + lastPwd, 'nova') });
}

// ══════════════════════════════════════
// REMINDERS (localStorage)
// ══════════════════════════════════════
function toggleReminders() { document.getElementById('remindPanel').classList.toggle('show'); renderReminders() }
function getReminders() { try { return JSON.parse(localStorage.getItem('hetron_reminders') || '[]') } catch { return [] } }
function saveReminders(list) { localStorage.setItem('hetron_reminders', JSON.stringify(list)) }
function addReminder(text) {
    if (!text) { text = document.getElementById('remindInput').value.trim() }
    if (!text) return;
    const list = getReminders();
    list.push({ id: Date.now(), text, time: new Date().toLocaleString(), done: false });
    saveReminders(list); document.getElementById('remindInput').value = '';
    renderReminders();
}
function deleteReminder(id) {
    const list = getReminders().filter(r => r.id !== id); saveReminders(list); renderReminders();
}
function toggleReminderDone(id) {
    const list = getReminders(); const r = list.find(x => x.id === id);
    if (r) r.done = !r.done; saveReminders(list); renderReminders();
}
function renderReminders() {
    const list = getReminders(), el = document.getElementById('remindList');
    if (!list.length) { el.innerHTML = '<div class="remind-empty">📋 No reminders yet.<br>Add one below or say "Remind me to..."</div>'; return }
    el.innerHTML = list.map(r => `<div class="remind-item" style="${r.done ? 'opacity:0.5;text-decoration:line-through' : ''}">
        <input type="checkbox" ${r.done ? 'checked' : ''} onchange="toggleReminderDone(${r.id})" style="accent-color:var(--cyan)">
        <div class="remind-text">${r.text}</div>
        <div class="remind-time">${r.time}</div>
        <button class="remind-del" onclick="deleteReminder(${r.id})">✕</button>
    </div>`).join('');
}
function clearAllReminders() { saveReminders([]); renderReminders() }

// ══════════════════════════════════════
// TRANSLATION (MyMemory API — free)
// ══════════════════════════════════════
let transDir = 'en|hi';
function toggleTranslate() { document.getElementById('translatePanel').classList.toggle('show') }
function swapTransLang() {
    transDir = transDir === 'en|hi' ? 'hi|en' : 'en|hi';
    document.getElementById('transFrom').textContent = transDir === 'en|hi' ? '🇺🇸 English' : '🇮🇳 Hindi';
    document.getElementById('transTo').textContent = transDir === 'en|hi' ? '🇮🇳 Hindi' : '🇺🇸 English';
}
async function doTranslate(text) {
    if (!text) text = document.getElementById('transInput').value.trim();
    if (!text) return 'Please type something to translate.';
    document.getElementById('transResult').textContent = '⏳ Translating...';
    try {
        const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${transDir}`);
        const d = await r.json();
        const result = d.responseData.translatedText || 'Translation failed';
        document.getElementById('transResult').textContent = result;
        return result;
    } catch (e) {
        document.getElementById('transResult').textContent = '❌ Translation error';
        return 'Translation error. Check internet connection.';
    }
}
function speakTranslation() { const t = document.getElementById('transResult').textContent; if (t && t !== 'Translation will appear here...') speak(t) }

// ══════════════════════════════════════
// NEWS HEADLINES (RSS2JSON)
// ══════════════════════════════════════
let newsLoaded = false;
function toggleNews() {
    const p = document.getElementById('newsPanel'); p.classList.toggle('show');
    if (p.classList.contains('show') && !newsLoaded) fetchNews();
}
async function fetchNews() {
    document.getElementById('newsList').innerHTML = '<div class="news-loading">⏳ Loading headlines...</div>';
    try {
        const r = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://timesofindia.indiatimes.com/rssfeedstopstories.cms');
        const d = await r.json();
        if (d.items && d.items.length) {
            newsLoaded = true;
            document.getElementById('newsList').innerHTML = d.items.slice(0, 15).map(n => `<div class="news-item" onclick="window.open('${n.link}','_blank')">
                <h4>${n.title}</h4>
                <p>${(n.description || '').replace(/<[^>]*>/g, '').substring(0, 120)}...</p>
                <div class="news-src">📰 ${n.author || 'Times of India'} · ${new Date(n.pubDate).toLocaleDateString()}</div>
            </div>`).join('');
        } else {
            document.getElementById('newsList').innerHTML = '<div class="news-loading">❌ No news found. Try again later.</div>';
        }
    } catch (e) {
        document.getElementById('newsList').innerHTML = '<div class="news-loading">❌ Failed to load news. Check internet.</div>';
    }
}

// ══════════════════════════════════════
// TIC TAC TOE (with minimax AI)
// ══════════════════════════════════════
let tttBoard = Array(9).fill(''), tttTurn = 'X', tttOver = false;
let tttScores = { X: 0, O: 0, D: 0 };
function toggleTTT() { const p = document.getElementById('tttPanel'); p.classList.toggle('show'); if (p.classList.contains('show')) resetTTT() }
function resetTTT() { tttBoard = Array(9).fill(''); tttTurn = 'X'; tttOver = false; renderTTTBoard(); document.getElementById('tttStatus').textContent = 'Your turn! (X)' }
function renderTTTBoard() {
    document.getElementById('tttBoard').innerHTML = tttBoard.map((v, i) =>
        `<div class="ttt-cell ${v ? 'taken ' + v.toLowerCase() : ''}" onclick="tttMove(${i})" role="button" aria-label="Cell ${i + 1}">${v}</div>`
    ).join('');
}
function tttMove(i) {
    if (tttBoard[i] || tttOver || tttTurn !== 'X') return;
    tttBoard[i] = 'X'; renderTTTBoard();
    const w = checkTTTWin(tttBoard);
    if (w) { endTTT(w); return }
    if (!tttBoard.includes('')) { endTTT('D'); return }
    tttTurn = 'O'; document.getElementById('tttStatus').textContent = 'AI thinking...';
    setTimeout(() => {
        const move = tttBestMove();
        tttBoard[move] = 'O'; renderTTTBoard();
        const w2 = checkTTTWin(tttBoard);
        if (w2) { endTTT(w2); return }
        if (!tttBoard.includes('')) { endTTT('D'); return }
        tttTurn = 'X'; document.getElementById('tttStatus').textContent = 'Your turn! (X)';
    }, 400);
}
function checkTTTWin(b) {
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (const [a, c, d] of lines) { if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a] }
    return null;
}
function endTTT(w) {
    tttOver = true;
    if (w === 'D') { tttScores.D++; document.getElementById('tttStatus').textContent = "🤝 It's a draw!" }
    else if (w === 'X') { tttScores.X++; document.getElementById('tttStatus').textContent = '🎉 You win!' }
    else { tttScores.O++; document.getElementById('tttStatus').textContent = '🤖 AI wins!' }
    document.getElementById('tttScoreX').textContent = tttScores.X;
    document.getElementById('tttScoreO').textContent = tttScores.O;
    document.getElementById('tttScoreD').textContent = tttScores.D;
    // Highlight winning cells
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    for (const [a, c, d] of lines) {
        if (tttBoard[a] && tttBoard[a] === tttBoard[c] && tttBoard[a] === tttBoard[d]) {
            const cells = document.querySelectorAll('.ttt-cell');
            [a, c, d].forEach(idx => cells[idx].classList.add('win'));
        }
    }
}
function tttBestMove() {
    let bestScore = -Infinity, bestMove = -1;
    for (let i = 0; i < 9; i++) {
        if (!tttBoard[i]) {
            tttBoard[i] = 'O';
            const score = minimax(tttBoard, 0, false);
            tttBoard[i] = '';
            if (score > bestScore) { bestScore = score; bestMove = i }
        }
    }
    return bestMove;
}
function minimax(board, depth, isMax) {
    const w = checkTTTWin(board);
    if (w === 'O') return 10 - depth;
    if (w === 'X') return depth - 10;
    if (!board.includes('')) return 0;
    if (isMax) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) { if (!board[i]) { board[i] = 'O'; best = Math.max(best, minimax(board, depth + 1, false)); board[i] = '' } }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) { if (!board[i]) { board[i] = 'X'; best = Math.min(best, minimax(board, depth + 1, true)); board[i] = '' } }
        return best;
    }
}

// ══════════════════════════════════════
// QUIZ GAME
// ══════════════════════════════════════
const quizDB = [
    { q: "What is the capital of India?", opts: ["Mumbai", "New Delhi", "Kolkata", "Chennai"], ans: 1 },
    { q: "Which planet is known as the Red Planet?", opts: ["Venus", "Jupiter", "Mars", "Saturn"], ans: 2 },
    { q: "Who invented the telephone?", opts: ["Edison", "Bell", "Tesla", "Marconi"], ans: 1 },
    { q: "What is the chemical symbol for Gold?", opts: ["Go", "Gd", "Au", "Ag"], ans: 2 },
    { q: "Which ocean is the largest?", opts: ["Atlantic", "Indian", "Arctic", "Pacific"], ans: 3 },
    { q: "What is 15 × 15?", opts: ["200", "225", "250", "215"], ans: 1 },
    { q: "Who painted the Mona Lisa?", opts: ["Picasso", "Van Gogh", "Da Vinci", "Michelangelo"], ans: 2 },
    { q: "What is the smallest prime number?", opts: ["0", "1", "2", "3"], ans: 2 },
    { q: "Which gas do plants absorb?", opts: ["Oxygen", "Nitrogen", "CO₂", "Hydrogen"], ans: 2 },
    { q: "What year did World War II end?", opts: ["1943", "1944", "1945", "1946"], ans: 2 },
    { q: "What is the hardest natural substance?", opts: ["Iron", "Diamond", "Quartz", "Titanium"], ans: 1 },
    { q: "Which country has the most population?", opts: ["USA", "India", "China", "Indonesia"], ans: 1 },
    { q: "What is the boiling point of water in °C?", opts: ["90", "95", "100", "110"], ans: 2 },
    { q: "Who wrote Romeo and Juliet?", opts: ["Dickens", "Shakespeare", "Austen", "Twain"], ans: 1 },
    { q: "How many continents are there?", opts: ["5", "6", "7", "8"], ans: 2 },
    { q: "What is the currency of Japan?", opts: ["Won", "Yuan", "Yen", "Ringgit"], ans: 2 },
    { q: "Which animal is known as the King of the Jungle?", opts: ["Tiger", "Lion", "Elephant", "Bear"], ans: 1 },
    { q: "What does DNA stand for?", opts: ["Deoxyribonucleic Acid", "Dynamic Neural Array", "Digital Network Access", "None"], ans: 0 },
    { q: "Which planet has the most moons?", opts: ["Jupiter", "Saturn", "Uranus", "Neptune"], ans: 1 },
    { q: "What is the speed of light (approx km/s)?", opts: ["200,000", "300,000", "400,000", "500,000"], ans: 1 },
    { q: "Which programming language is named after coffee?", opts: ["Python", "C++", "Java", "Ruby"], ans: 2 },
    { q: "What is the tallest mountain in the world?", opts: ["K2", "Kangchenjunga", "Everest", "Lhotse"], ans: 2 },
    { q: "How many bones does an adult human have?", opts: ["186", "196", "206", "216"], ans: 2 },
    { q: "Who discovered gravity?", opts: ["Einstein", "Newton", "Galileo", "Hawking"], ans: 1 },
    { q: "What percentage of the Earth is covered in water?", opts: ["51%", "61%", "71%", "81%"], ans: 2 },
    { q: "Which element has atomic number 1?", opts: ["Helium", "Hydrogen", "Lithium", "Carbon"], ans: 1 },
    { q: "What is the main language spoken in Brazil?", opts: ["Spanish", "Portuguese", "French", "English"], ans: 1 },
    { q: "How many seconds in one hour?", opts: ["3000", "3200", "3600", "4000"], ans: 2 },
    { q: "What is the largest organ in the human body?", opts: ["Heart", "Liver", "Skin", "Lungs"], ans: 2 },
    { q: "In which year did India gain independence?", opts: ["1945", "1946", "1947", "1948"], ans: 2 }
];
let quizCurrent = 0, quizScoreVal = 0, quizQuestions = [], quizAnswered = false;
function toggleQuiz() { const p = document.getElementById('quizPanel'); p.classList.toggle('show'); if (p.classList.contains('show')) startQuiz() }
function startQuiz() {
    quizCurrent = 0; quizScoreVal = 0; quizAnswered = false;
    quizQuestions = [...quizDB].sort(() => Math.random() - 0.5).slice(0, 10);
    showQuizQ();
}
function showQuizQ() {
    if (quizCurrent >= quizQuestions.length) { showQuizResult(); return }
    const q = quizQuestions[quizCurrent]; quizAnswered = false;
    document.getElementById('quizNum').textContent = quizCurrent + 1;
    document.getElementById('quizScore').textContent = quizScoreVal;
    document.getElementById('quizBar').style.width = ((quizCurrent + 1) * 10) + '%';
    document.getElementById('quizQ').textContent = q.q;
    document.getElementById('quizOpts').innerHTML = q.opts.map((o, i) =>
        `<button class="quiz-opt" onclick="answerQuiz(${i})">${String.fromCharCode(65 + i)}. ${o}</button>`
    ).join('');
    document.getElementById('quizNext').style.display = 'none';
}
function answerQuiz(idx) {
    if (quizAnswered) return; quizAnswered = true;
    const q = quizQuestions[quizCurrent];
    const opts = document.querySelectorAll('.quiz-opt');
    opts.forEach((o, i) => {
        o.classList.add('disabled');
        if (i === q.ans) o.classList.add('correct');
        if (i === idx && idx !== q.ans) o.classList.add('wrong');
    });
    if (idx === q.ans) quizScoreVal++;
    document.getElementById('quizScore').textContent = quizScoreVal;
    document.getElementById('quizNext').style.display = 'block';
}
function nextQuizQ() { quizCurrent++; showQuizQ() }
function showQuizResult() {
    const pct = Math.round((quizScoreVal / 10) * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '👏' : '💪';
    document.getElementById('quizQ').innerHTML = `${emoji} <b>Quiz Complete!</b><br>You scored <b>${quizScoreVal}/10</b> (${pct}%)`;
    document.getElementById('quizOpts').innerHTML = `<button class="pwd-btn primary" onclick="startQuiz()" style="width:100%">🔄 Play Again</button>`;
    document.getElementById('quizNext').style.display = 'none';
    document.getElementById('quizBar').style.width = '100%';
}

// ══════════════════════════════════════
// BATTERY ALERTS
// ══════════════════════════════════════
let batteryAlerted = false;
function checkBatteryAlert() {
    if (!navigator.getBattery) return;
    navigator.getBattery().then(b => {
        const pct = Math.round(b.level * 100);
        if (pct <= 15 && !b.charging && !batteryAlerted) {
            batteryAlerted = true;
            speak(`Warning! Battery is critically low at ${pct} percent. Please charge your device.`);
            addMessage(`🔋⚠️ **Low Battery Alert!** Only **${pct}%** remaining. Plug in your charger!`, 'nova');
        }
        if (pct > 20 || b.charging) batteryAlerted = false;
    });
}
setInterval(checkBatteryAlert, 60000); // Check every minute
setTimeout(checkBatteryAlert, 5000); // Initial check after 5s


// ══════════════════════════════════════
// MOBILE SIDEBAR TOGGLE
// ══════════════════════════════════════
(function () {
    if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('open');
    }
})();

// ══════════════════════════════════════════════
// ⚙  PROGRAMS DOCK
// ══════════════════════════════════════════════
const DOCK_SERVER = 'http://localhost:5050';

const DOCK_PROGRAMS = {
    refactor: {
        label: 'Refactor Script',
        icon:  '🔧',
        desc:  'Splits index.html → style.css + script.js',
        interactive: false,
    },
    voice_search: {
        label: 'Voice File Search',
        icon:  '🎙',
        desc:  'Voice-controlled file search assistant',
        interactive: true,
    },
};

let dockOpen        = false;
let dockCurrentPid  = 'refactor';
let dockRunning     = {};   // pid → true/false
let dockEvtSource   = {};   // pid → EventSource
let dockOutputBuf   = {};   // pid → string of HTML
let dockServerOnline = false;
let dockPingTimer   = null;

// ── Open / Close ──────────────────────────────
function toggleDock() {
    dockOpen = !dockOpen;
    const panel = document.getElementById('programsDock');
    if (panel) panel.classList.toggle('dock-open', dockOpen);
    if (dockOpen && !dockPingTimer) dockStartPing();
}

// ── Server ping ───────────────────────────────
function dockStartPing() {
    dockPing();
    dockPingTimer = setInterval(dockPing, 4000);
}

async function dockPing() {
    try {
        const r = await fetch(DOCK_SERVER + '/programs', { signal: AbortSignal.timeout(2000) });
        dockServerOnline = r.ok;
    } catch {
        dockServerOnline = false;
    }
    const dot  = document.getElementById('dockStatusDot');
    const txt  = document.getElementById('dockStatusText');
    if (dot) {
        dot.className = 'dock-status-dot ' + (dockServerOnline ? 'online' : 'offline');
    }
    if (txt) {
        txt.textContent = dockServerOnline ? 'Server online' : 'Server offline';
    }
}

// ── Select a program tab ──────────────────────
function selectDockProgram(pid) {
    dockCurrentPid = pid;

    // Update tab styles
    Object.keys(DOCK_PROGRAMS).forEach(id => {
        const tab = document.getElementById('dockTab-' + id);
        if (tab) tab.classList.toggle('active', id === pid);
    });

    // Update info bar
    const info = DOCK_PROGRAMS[pid];
    const descEl = document.getElementById('dockProgDesc');
    if (descEl) descEl.textContent = info ? info.desc : '';

    // Show/hide stdin row
    const stdinRow = document.getElementById('dockStdinRow');
    if (stdinRow) stdinRow.style.display = info && info.interactive ? 'flex' : 'none';

    // Restore buffered output or show placeholder
    dockRestoreOutput(pid);

    // Update run/kill buttons
    dockSyncButtons(pid);
}

// ── Restore output for the current tab ────────
function dockRestoreOutput(pid) {
    const terminal = document.getElementById('dockTerminal');
    if (!terminal) return;
    if (dockOutputBuf[pid]) {
        terminal.innerHTML = dockOutputBuf[pid];
        terminal.scrollTop = terminal.scrollHeight;
    } else {
        terminal.innerHTML = `
            <div class="dock-terminal-placeholder">
                <span>⚙</span>
                <p>Click <b>▶ Run</b> to execute <b>${DOCK_PROGRAMS[pid]?.label || pid}</b>.</p>
                <p style="font-size:11px;opacity:0.5;margin-top:6px;">
                    Make sure <code>server.py</code> is running: <code>python server.py</code>
                </p>
            </div>`;
    }
}

// ── Sync run/kill button states ────────────────
function dockSyncButtons(pid) {
    const running   = !!dockRunning[pid];
    const runBtn  = document.getElementById('dockRunBtn');
    const killBtn = document.getElementById('dockKillBtn');
    if (runBtn)  runBtn.disabled  = running;
    if (killBtn) killBtn.disabled = !running;

    // Tab pulse
    const tab = document.getElementById('dockTab-' + pid);
    if (tab) tab.classList.toggle('running', running);
}

// ── Run current program ────────────────────────
function dockRunCurrent() {
    if (!dockServerOnline) {
        dockAppendLine(dockCurrentPid,
            '⚠  Server is offline. Start it with: python server.py', 'error');
        return;
    }
    dockRun(dockCurrentPid);
}

function dockRun(pid) {
    // Clear old output & mark running
    dockOutputBuf[pid] = '';
    dockRunning[pid] = true;
    dockSyncButtons(pid);

    // Clear terminal
    if (pid === dockCurrentPid) {
        const terminal = document.getElementById('dockTerminal');
        if (terminal) terminal.innerHTML = '';
    }

    // Close old stream if any
    if (dockEvtSource[pid]) {
        try { dockEvtSource[pid].close(); } catch {}
        dockEvtSource[pid] = null;
    }

    // Open SSE stream
    const es = new EventSource(`${DOCK_SERVER}/run?id=${pid}`);
    dockEvtSource[pid] = es;

    es.addEventListener('start', e => {
        const text = safeJson(e.data);
        dockAppendLine(pid, text, 'start');
    });

    es.addEventListener('msg', e => {
        const text = safeJson(e.data);
        dockAppendLine(pid, text, classifyLine(text));
    });

    es.addEventListener('done', e => {
        const text = safeJson(e.data);
        const cls  = text.includes('successfully') ? 'done success' : 'done error';
        dockAppendLine(pid, text, cls);
        dockRunning[pid] = false;
        dockSyncButtons(pid);
        es.close();
        dockEvtSource[pid] = null;
    });

    es.onerror = () => {
        if (dockRunning[pid]) {
            dockAppendLine(pid, '❌  Connection lost or process ended.', 'error');
            dockRunning[pid] = false;
            dockSyncButtons(pid);
        }
        es.close();
        dockEvtSource[pid] = null;
    };
}

// ── Kill current program ───────────────────────
async function dockKillCurrent() {
    const pid = dockCurrentPid;
    try {
        await fetch(`${DOCK_SERVER}/kill?id=${pid}`);
    } catch {}
    if (dockEvtSource[pid]) {
        try { dockEvtSource[pid].close(); } catch {}
        dockEvtSource[pid] = null;
    }
    dockRunning[pid] = false;
    dockSyncButtons(pid);
    dockAppendLine(pid, '■  Process killed.', 'warning');
}

// ── Clear output ──────────────────────────────
function dockClearOutput() {
    const pid = dockCurrentPid;
    dockOutputBuf[pid] = '';
    const terminal = document.getElementById('dockTerminal');
    if (terminal) terminal.innerHTML = `
        <div class="dock-terminal-placeholder">
            <span>⚙</span>
            <p>Output cleared. Click <b>▶ Run</b> to start again.</p>
        </div>`;
}

// ── Send stdin ────────────────────────────────
async function dockSendStdin() {
    const pid   = dockCurrentPid;
    const input = document.getElementById('dockStdinInput');
    if (!input) return;
    const text = input.value;
    if (!text.trim()) return;

    dockAppendLine(pid, '▷ ' + text, 'dim');
    input.value = '';

    try {
        await fetch(`${DOCK_SERVER}/stdin?id=${pid}`, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: text,
        });
    } catch {
        dockAppendLine(pid, '❌  Failed to send input.', 'error');
    }
}

// ── Append a line to the terminal ─────────────
function dockAppendLine(pid, text, type = '') {
    // Build span
    let cls = 'dock-line';
    if (type === 'start')        cls += ' dock-line-start';
    else if (type === 'done success' || type === 'success') cls += ' dock-line-success';
    else if (type === 'done error'   || type === 'error')   cls += ' dock-line-error';
    else if (type === 'warning')  cls += ' dock-line-warning';
    else if (type === 'info')     cls += ' dock-line-info';
    else if (type === 'dim')      cls += ' dock-line-dim';
    const html = `<span class="${cls}">${escHtml(text)}</span>`;

    // Buffer it
    dockOutputBuf[pid] = (dockOutputBuf[pid] || '') + html;

    // If this tab is active, write directly to DOM
    if (pid === dockCurrentPid) {
        const terminal = document.getElementById('dockTerminal');
        if (!terminal) return;
        // Remove placeholder if present
        const ph = terminal.querySelector('.dock-terminal-placeholder');
        if (ph) ph.remove();
        const span = document.createElement('span');
        span.className = cls;
        span.textContent = text;
        terminal.appendChild(span);
        terminal.scrollTop = terminal.scrollHeight;
    }
}

// ── Line colour classifier ─────────────────────
function classifyLine(text) {
    const t = text.toLowerCase();
    if (t.includes('✅') || t.includes('done') || t.includes('success'))  return 'success';
    if (t.includes('❌') || t.includes('error') || t.includes('fail'))    return 'error';
    if (t.includes('⚠') || t.includes('warn') || t.includes('timeout'))  return 'warning';
    if (t.startsWith('[read]') || t.startsWith('[css]') || t.startsWith('[js]')) return 'info';
    if (t.startsWith('=') || t.startsWith('─') || t.startsWith('═'))     return 'dim';
    return '';
}

// ── Helpers ───────────────────────────────────
function escHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function safeJson(raw) {
    try { return JSON.parse(raw); } catch { return raw; }
}

// ── Init on load ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Select default tab
    selectDockProgram('refactor');
    // Kick off a first ping quietly
    dockPing();
});

// ══════════════════════════════════════════════════════
// 📁 WORKSPACE FILE BROWSER — System File Access
// Gesture-aware: voice commands show clickable grant
// buttons, cached workspace for instant subsequent searches
// ══════════════════════════════════════════════════════
let workspaceDirHandle = null;
let workspaceFiles = []; // cached {name, kind, handle, path}
let pendingFileSearch = null; // stores a search query when workspace isn't set

function getFileIcon(name, kind) {
    if (kind === 'directory') return '📁';
    const ext = name.split('.').pop().toLowerCase();
    const icons = {
        html:'🌐', css:'🎨', js:'⚡', ts:'💎', json:'📋', py:'🐍', java:'☕',
        png:'🖼', jpg:'🖼', jpeg:'🖼', gif:'🖼', svg:'🖼', webp:'🖼', ico:'🖼',
        mp3:'🎵', wav:'🎵', ogg:'🎵', mp4:'🎬', avi:'🎬', mkv:'🎬', webm:'🎬',
        pdf:'📄', doc:'📝', docx:'📝', txt:'📝', md:'📝', csv:'📊', xlsx:'📊',
        zip:'📦', rar:'📦', '7z':'📦', exe:'⚙', bat:'⚙', sh:'⚙',
        ppt:'📊', pptx:'📊', xml:'📋', yaml:'📋', yml:'📋', ini:'⚙', cfg:'⚙'
    };
    return icons[ext] || '📄';
}

function getFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

async function scanDirectory(dirHandle, path = '', depth = 0) {
    if (depth > 4) return []; // max 4 levels deep
    const items = [];
    try {
        for await (const entry of dirHandle.values()) {
            if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
            const itemPath = path ? `${path}/${entry.name}` : entry.name;
            items.push({ name: entry.name, kind: entry.kind, handle: entry, path: itemPath, depth });
            if (entry.kind === 'directory' && items.length < 800) {
                try {
                    const subItems = await scanDirectory(entry, itemPath, depth + 1);
                    items.push(...subItems);
                } catch(e) { /* skip inaccessible dirs */ }
            }
        }
    } catch(e) { /* skip errors */ }
    return items;
}

// ── Grant Workspace Access (must be called from user gesture) ──
async function grantWorkspaceAccess(searchQuery) {
    try {
        const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
        workspaceDirHandle = dirHandle;
        addMessage(`📂 **Scanning workspace:** ${dirHandle.name}...`, 'nova');

        workspaceFiles = await scanDirectory(dirHandle);
        const dirs = workspaceFiles.filter(f => f.kind === 'directory').length;
        const fils = workspaceFiles.filter(f => f.kind === 'file').length;

        // If there was a pending search, execute it now
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matches = workspaceFiles.filter(f =>
                f.name.toLowerCase().includes(query) || f.path.toLowerCase().includes(query)
            );
            if (matches.length > 0) {
                showFileBrowserPanel(matches, searchQuery);
                speak(`Found ${matches.length} items matching ${searchQuery}`);
                addMessage(`🔍 **Found ${matches.length} items** matching "**${searchQuery}**":\n\n${matches.slice(0,6).map(f => `${getFileIcon(f.name, f.kind)} \`${f.path}\``).join('\n')}${matches.length > 6 ? `\n\n...and ${matches.length - 6} more` : ''}`, 'nova');
            } else {
                showFileBrowserPanel(workspaceFiles);
                addMessage(`❌ No match for "**${searchQuery}**" in "${dirHandle.name}". Showing all ${workspaceFiles.length} items.`, 'nova');
            }
        } else {
            showFileBrowserPanel(workspaceFiles);
            speak(`Workspace loaded with ${workspaceFiles.length} items`);
            addMessage(`📁 **Workspace "${dirHandle.name}"** loaded!\n\n📊 **${dirs}** folders · **${fils}** files\n\n💡 Now say **"Open [name]"** to instantly find any file or folder!`, 'nova');
        }
        pendingFileSearch = null;
    } catch(e) {
        if (e.name === 'AbortError') {
            addMessage('❌ Folder selection was cancelled.', 'nova');
        } else {
            addMessage('❌ Error: ' + e.message, 'nova');
        }
    }
}

// ── Open Workspace Files (voice-triggered) ──
async function openWorkspaceFiles() {
    // If workspace already cached, just show it
    if (workspaceFiles.length > 0 && workspaceDirHandle) {
        showFileBrowserPanel(workspaceFiles);
        speak(`Showing workspace files. ${workspaceFiles.length} items loaded.`);
        return `📁 **Workspace files** — ${workspaceFiles.length} items loaded.\n\n💡 Say **"Open [name]"** to search, or click 📂 **Set Workspace** below to change directory.`;
    }

    // Need user gesture — show clickable permission button in chat
    pendingFileSearch = null;
    return showAccessPrompt(null);
}

// ── Open Specific File/Folder (voice-triggered) ──
async function openSpecificFileOrFolder(searchName) {
    // Workspace cached — instant search
    if (workspaceFiles.length > 0) {
        const query = searchName.toLowerCase();
        const matches = workspaceFiles.filter(f =>
            f.name.toLowerCase().includes(query) || f.path.toLowerCase().includes(query)
        );

        if (matches.length > 0) {
            showFileBrowserPanel(matches, searchName);
            speak(`Found ${matches.length} items matching ${searchName}`);
            return `🔍 **Found ${matches.length} items** matching "**${searchName}**":\n\n${matches.slice(0,6).map(f => `${getFileIcon(f.name, f.kind)} \`${f.path}\``).join('\n')}${matches.length > 6 ? `\n\n...and ${matches.length - 6} more` : ''}`;
        } else {
            return `❌ No match for "**${searchName}**" in workspace.\n\n💡 Say **"Open files"** to set a new workspace.`;
        }
    }

    // No workspace — show permission button with pending search
    pendingFileSearch = searchName;
    return showAccessPrompt(searchName);
}

// ── Show Permission Prompt with clickable button ──
function showAccessPrompt(searchQuery) {
    const searchLabel = searchQuery ? ` and find "${searchQuery}"` : '';
    // We inject a clickable button directly into the message using a data attribute
    const btnId = 'grantAccessBtn_' + Date.now();
    setTimeout(() => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                btn.disabled = true;
                btn.textContent = '⏳ Opening picker...';
                grantWorkspaceAccess(searchQuery);
            });
        }
    }, 100);

    return `📂 **System File Access Required**\n\nTo browse your files${searchLabel}, Hetron needs permission to access a folder.\n\n<button id="${btnId}" class="fb-grant-btn">📁 Grant Folder Access</button>\n\n🔒 *Your files are only accessed locally — nothing is uploaded.*`;
}

// ── File Browser Panel ──
function showFileBrowserPanel(files, highlight) {
    let panel = document.getElementById('fileBrowserPanel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'fileBrowserPanel';
        panel.className = 'file-browser-panel';
        panel.innerHTML = `
            <div class="panel-hdr">
                <h3>📁 WORKSPACE FILES</h3>
                <div style="display:flex;gap:6px;align-items:center;">
                    <button class="fb-change-btn" onclick="grantWorkspaceAccess(null)" title="Change workspace">📂 Change</button>
                    <button class="p-close" onclick="this.closest('.file-browser-panel').classList.remove('show')">✕</button>
                </div>
            </div>
            <div class="fb-search-row">
                <input type="text" class="fb-search" id="fbSearch" placeholder="🔍 Search files & folders..." oninput="filterFileBrowser()" autocomplete="off">
            </div>
            <div class="fb-stats" id="fbStats"></div>
            <div class="fb-list" id="fbList"></div>
        `;
        document.body.appendChild(panel);
    }

    panel._allFiles = files;
    const stats = document.getElementById('fbStats');
    const dirs = files.filter(f => f.kind === 'directory').length;
    const fils = files.filter(f => f.kind === 'file').length;
    const wsName = workspaceDirHandle ? workspaceDirHandle.name : 'Workspace';
    stats.innerHTML = `<span class="fb-ws-name">📂 ${wsName}</span> · ${dirs} folders · ${fils} files`;

    const searchInput = document.getElementById('fbSearch');
    if (searchInput && highlight) searchInput.value = highlight;

    renderFileBrowserList(files, highlight);
    panel.classList.add('show');
}

function renderFileBrowserList(files, highlight) {
    const list = document.getElementById('fbList');
    if (!list) return;
    const sorted = [...files].sort((a,b) => {
        if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
    });

    list.innerHTML = sorted.slice(0, 150).map(f => {
        const icon = getFileIcon(f.name, f.kind);
        const hl = highlight && f.name.toLowerCase().includes(highlight.toLowerCase());
        const indent = f.depth ? `padding-left:${12 + f.depth * 16}px;` : '';
        const escapedPath = f.path.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        return `<div class="fb-item ${hl ? 'fb-highlight' : ''}" onclick="fbOpenItem('${escapedPath}', '${f.kind}')" title="${f.path}" style="${indent}">
            <span class="fb-icon">${icon}</span>
            <div class="fb-info">
                <div class="fb-name">${f.name}</div>
                <div class="fb-path">${f.path}</div>
            </div>
            <span class="fb-kind-tag fb-kind-${f.kind}">${f.kind === 'directory' ? 'DIR' : f.name.split('.').pop().toUpperCase()}</span>
        </div>`;
    }).join('') + (sorted.length > 150 ? `<div class="fb-more">...and ${sorted.length - 150} more items</div>` : '');
}

function filterFileBrowser() {
    const panel = document.getElementById('fileBrowserPanel');
    const query = document.getElementById('fbSearch').value.toLowerCase();
    if (!panel || !panel._allFiles) return;
    const filtered = query ? panel._allFiles.filter(f =>
        f.name.toLowerCase().includes(query) || f.path.toLowerCase().includes(query)
    ) : panel._allFiles;
    renderFileBrowserList(filtered, query);
    const dirs = filtered.filter(f => f.kind === 'directory').length;
    const fils = filtered.filter(f => f.kind === 'file').length;
    const wsName = workspaceDirHandle ? workspaceDirHandle.name : 'Workspace';
    document.getElementById('fbStats').innerHTML = `<span class="fb-ws-name">📂 ${wsName}</span> · ${dirs} folders · ${fils} files`;
}

// ── Open/Preview File Items ──
async function fbOpenItem(path, kind) {
    if (kind === 'directory') {
        // Navigate into directory — filter to show only its contents
        const query = path + '/';
        const children = workspaceFiles.filter(f => f.path.startsWith(query) && !f.path.slice(query.length).includes('/'));
        if (children.length > 0) {
            showFileBrowserPanel(children);
            addMessage(`📂 **${path}** — ${children.length} items`, 'nova');
        } else {
            addMessage(`📂 **${path}** (empty folder)`, 'nova');
        }
        speak(`Opened folder ${path.split('/').pop()}`);
        return;
    }

    // Try to read and preview file content
    const file = workspaceFiles.find(f => f.path === path);
    if (file && file.handle) {
        try {
            const fileObj = await file.handle.getFile();
            const ext = file.name.split('.').pop().toLowerCase();
            const textExts = ['txt','md','html','css','js','ts','json','py','java','xml','yaml','yml','csv','ini','cfg','bat','sh','log','env','gitignore','sql','php','rb','go','rs','c','cpp','h','hpp'];
            const imgExts = ['png','jpg','jpeg','gif','svg','webp','ico','bmp'];

            if (textExts.includes(ext)) {
                const text = await fileObj.text();
                const preview = text.length > 2000 ? text.substring(0, 2000) + '\n\n... (truncated)' : text;
                addMessage(`📄 **${file.name}** (${getFileSize(fileObj.size)})\n\n\`\`\`${ext}\n${preview}\n\`\`\``, 'nova');
                speak(`Opened ${file.name}`);
            } else if (imgExts.includes(ext)) {
                const url = URL.createObjectURL(fileObj);
                addMessage(`🖼 **${file.name}** (${getFileSize(fileObj.size)})\n\n<img src="${url}" style="max-width:400px;max-height:300px;border-radius:12px;border:1px solid rgba(var(--accent-rgb),0.2);" alt="${file.name}">`, 'nova');
                speak(`Showing image ${file.name}`);
            } else {
                addMessage(`📄 **${file.name}** (${getFileSize(fileObj.size)}) — ${ext.toUpperCase()} file\n\n💡 This file type cannot be previewed in browser.`, 'nova');
                speak(`Selected ${file.name}`);
            }
        } catch(e) {
            addMessage(`❌ Could not read **${file.name}**: ${e.message}`, 'nova');
        }
    } else {
        addMessage(`📄 Selected: **${path}**`, 'nova');
    }
}

// ══════════════════════════════════════════════════════
// 🎨 FLOATING THEME WIDGET + HIGH-DENSITY PARTICLE ENGINE
// ══════════════════════════════════════════════════════

// ── Theme Widget Toggle ──
function toggleThemeWidget() {
    const w = document.getElementById('themeWidget');
    if (w) w.classList.toggle('open');
}

// ── Render Theme Widget Cards ──
function renderThemeWidgetCards() {
    const grid = document.getElementById('twGrid');
    if (!grid) return;
    grid.innerHTML = themes.map((t, i) => `
        <div class="tw-card ${i === currentTheme ? 'active' : ''}" onclick="setThemeFromWidget(${i})" title="${t.name}">
            <div class="tw-preview">
                ${t.colors.map(c => `<div class="tw-preview-bar" style="background:${c}"></div>`).join('')}
            </div>
            <div class="tw-name">${t.name}</div>
            <div class="tw-desc">${t.desc}</div>
            <span class="tw-emoji">${t.emoji}</span>
        </div>
    `).join('');
}

function setThemeFromWidget(i) {
    if (i < 0 || i >= themes.length) return;
    const t = themes[i]; currentTheme = i;
    applyThemeVars(t);
    // Update sidebar dots too
    document.querySelectorAll('.theme-dot').forEach((d, k) => {
        const globalIdx = themePage * THEMES_PER_PAGE + k;
        d.classList.toggle('active', globalIdx === i);
    });
    // Flash effect
    createThemeFlash();
    // Update widget cards
    renderThemeWidgetCards();
    // Update particles
    if (typeof updateParticleColors === 'function') updateParticleColors();
    // Message
    addMessage(`🎨 Theme changed to **${t.name}**!`, 'nova');
    localStorage.setItem('hetron_theme', i);
}

// Override original setTheme to also update widget
const _origSetTheme = setTheme;
setTheme = function(i) {
    if (i < 0 || i >= themes.length) return;
    const t = themes[i]; currentTheme = i;
    applyThemeVars(t);
    document.querySelectorAll('.theme-dot').forEach((d, k) => {
        const globalIdx = themePage * THEMES_PER_PAGE + k;
        d.classList.toggle('active', globalIdx === i);
    });
    createThemeFlash();
    renderThemeWidgetCards();
    if (typeof updateParticleColors === 'function') updateParticleColors();
    addMessage(`🎨 Theme changed to **${t.name}**!`, 'nova');
    localStorage.setItem('hetron_theme', i);
};

function createThemeFlash() {
    const flash = document.createElement('div');
    flash.className = 'theme-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 700);
}

// ══════════════════════════════════════════════════════
// 🌌 HIGH-DENSITY CANVAS PARTICLE SYSTEM
// ══════════════════════════════════════════════════════
const pCanvas = document.getElementById('particleCanvas');
const pCtx = pCanvas ? pCanvas.getContext('2d') : null;
let particles = [];
const PARTICLE_COUNT = 180;
let pColors = [];
let pW = 0, pH = 0;

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return {r,g,b};
}

function getParticleColors() {
    const t = themes[currentTheme] || themes[0];
    return t.colors.map(c => hexToRgb(c));
}

function resizeParticleCanvas() {
    if (!pCanvas) return;
    pW = window.innerWidth;
    pH = window.innerHeight;
    pCanvas.width = pW;
    pCanvas.height = pH;
}

function createParticle(randomY) {
    const colors = pColors.length ? pColors : getParticleColors();
    const c = colors[Math.floor(Math.random() * colors.length)];
    const size = 1 + Math.random() * 3;
    const type = Math.random();
    return {
        x: Math.random() * pW,
        y: randomY ? Math.random() * pH : pH + 20,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(0.3 + Math.random() * 0.8),
        size: size,
        color: c,
        alpha: 0.2 + Math.random() * 0.6,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.03,
        type: type < 0.7 ? 'dot' : type < 0.9 ? 'ring' : 'glow',
        life: 1,
        maxLife: 300 + Math.random() * 600
    };
}

function initParticles() {
    pColors = getParticleColors();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle(true));
    }
}

function updateParticleColors() {
    pColors = getParticleColors();
    particles.forEach(p => {
        p.color = pColors[Math.floor(Math.random() * pColors.length)];
    });
}

function drawParticles() {
    if (!pCtx) return;
    pCtx.clearRect(0, 0, pW, pH);

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;
        p.life++;

        const fadeIn = Math.min(p.life / 60, 1);
        const fadeOut = p.y < 0 ? 0 : (p.y < 50 ? p.y / 50 : 1);
        const pulseAlpha = 0.5 + 0.5 * Math.sin(p.pulse);
        const alpha = p.alpha * fadeIn * fadeOut * pulseAlpha;

        if (p.y < -20 || p.life > p.maxLife || alpha <= 0) {
            particles[i] = createParticle(false);
            continue;
        }

        const {r, g, b} = p.color;

        if (p.type === 'glow') {
            const grad = pCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
            grad.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.8})`);
            grad.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 0.3})`);
            grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
            pCtx.fillStyle = grad;
            pCtx.beginPath();
            pCtx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
            pCtx.fill();
        } else if (p.type === 'ring') {
            pCtx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.6})`;
            pCtx.lineWidth = 0.5;
            pCtx.beginPath();
            pCtx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            pCtx.stroke();
        }

        // Core dot
        pCtx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        pCtx.fill();
    }

    // Draw connection lines between nearby particles
    const maxDist = 100;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < maxDist) {
                const {r, g, b} = particles[i].color;
                const lineAlpha = (1 - dist / maxDist) * 0.08;
                pCtx.strokeStyle = `rgba(${r},${g},${b},${lineAlpha})`;
                pCtx.lineWidth = 0.5;
                pCtx.beginPath();
                pCtx.moveTo(particles[i].x, particles[i].y);
                pCtx.lineTo(particles[j].x, particles[j].y);
                pCtx.stroke();
            }
        }
    }

    requestAnimationFrame(drawParticles);
}

// Initialize
window.addEventListener('resize', resizeParticleCanvas);
if (pCanvas) {
    resizeParticleCanvas();
    initParticles();
    drawParticles();
}

// Render widget on load
document.addEventListener('DOMContentLoaded', () => {
    renderThemeWidgetCards();
    // Apply saved theme fully
    const saved = localStorage.getItem('hetron_theme');
    if (saved !== null) {
        const idx = parseInt(saved);
        if (idx >= 0 && idx < themes.length) {
            currentTheme = idx;
            applyThemeVars(themes[idx]);
            renderThemeWidgetCards();
            if (typeof updateParticleColors === 'function') updateParticleColors();
        }
    }
});