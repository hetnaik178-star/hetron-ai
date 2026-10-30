# ⚡ HETRON AI — All-in-One Voice Assistant & Programs Dock

> **Power · Precision · Intelligence**  
> Modern AI Voice Assistant with full mobile & desktop responsive interface, 25+ app deep-linking shortcuts, interactive widgets, cosmic visual system, and Python system controls.

---

## ✨ Features

- 🎙️ **Voice Recognition & Speech Synthesis**: Full hands-free voice control (Chrome/Edge Web Speech API) + natural speech feedback.
- 📱 **100% Mobile & Tablet Responsive**:
  - Optimized for phones (iOS Safari, Android Chrome) and tablets.
  - Safe-area insets (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`) for notched phones.
  - Virtual keyboard handling (`interactive-widget=resizes-content`, `user-scalable=no`).
  - Slide-in touch navigation sidebar with auto-close on selection.
  - Floating panels convert to native mobile bottom-sheets.
- 🚀 **Smart App Launcher & Deep Linking**:
  - 25+ apps supported: WhatsApp, Instagram, YouTube, Facebook, ChatGPT, Grok, Gemini, Google Lens, GitHub, Twitter/X, Spotify, Netflix, Amazon, Flipkart, Maps, Telegram, Discord, GPay, Paytm, Snapchat, etc.
  - Native mobile app schemes (`whatsapp://`, `vnd.youtube://`, `instagram://`, etc.) with fallback `.app-open-card` buttons inside the chat.
- 🌌 **Cosmic Visual System & Rich Animations**:
  - High-density HTML5 interactive particle canvas with dynamic color-adaptive nodal webs.
  - Animated nebula clouds & multi-band undulating aurora overlays.
  - Twinkling star field with dynamic shooting star streaks.
  - Glowing animated center voice orb and listening ripples.
- 🧮 **Built-in Power Tools**:
  - Scientific Calculator with trigonometry & logarithmic functions.
  - Password Generator with customizable length and entropy rules.
  - Persistent Reminders & Sticky Notes with local storage retention.
  - Live Weather with Open-Meteo API.
  - Ambient Music Player with Web Audio API synthesis and volume control.
  - System Info (Battery status, network connection, live clock).
  - Live Translator (English ↔ Hindi).
  - Live News Headlines, Tic-Tac-Toe AI game & 10-question Quiz Game.
  - 10 Gorgeous Aesthetic Themes (Galaxy, Ocean, Sunset, Gold, Neon, Forest, Arctic, Crimson, Amber, Midnight).
- 🖥️ **Desktop Backend Server (`server.py`)**:
  - Integrated HTTP server on port 5050 serving both the frontend web app and system dock commands.
  - Hands-free voice file search assistant (`voice_file_search.py`).
  - Remote system power controls (Shutdown, Restart, Sleep, Lock).

---

## 🚀 How to Run

### Option 1: Full-Stack Web + System Dock (Recommended)
Run the Python server to access both the web app and desktop system controls:
```bash
python server.py
```
Open **[http://localhost:5050](http://localhost:5050)** in any browser (Chrome or Edge recommended for voice features).

### Option 2: Standalone Web Interface
Simply open `index.html` in your favorite web browser or host it on GitHub Pages, Vercel, or Netlify.

### Option 3: Standalone Voice File Search
```bash
python voice_file_search.py
```

---

## 🗣️ Example Voice Commands

| What You Say | Action |
|---|---|
| *"Open WhatsApp"* / *"WhatsApp kholo"* | Launches WhatsApp (Native app on phone, Web on PC) |
| *"Open ChatGPT"* / *"Open Grok"* | Launches AI assistants |
| *"Weather"* / *"Mausam kaisa hai"* | Fetches real-time weather for your location |
| *"Open calculator"* / *"Hisaab karo"* | Opens the scientific calculator |
| *"Set alarm for 5 minutes"* | Starts countdown timer with voice alert |
| *"Play music"* / *"Gaana bajao"* | Starts ambient cosmic synthesizer player |
| *"Translate hello to Hindi"* | Translates text between languages |
| *"Generate password"* | Creates a high-entropy secure password |
| *"Play tic tac toe"* | Starts interactive game against AI |
| *"Midnight theme"* / *"Ocean theme"* | Switches color palette instantaneously |
| *"Shutdown PC"* | Prompts confirmation and executes Windows shutdown |

---

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, ES6+ JavaScript (Zero external framework bloat, instant load)
- **Visuals**: HTML5 Canvas 2D, WebGL/CSS Blend Modes, SVG
- **Speech**: Web Speech API (`SpeechRecognition` & `SpeechSynthesisUtterance`)
- **Backend**: Python 3 standard library (`http.server`, `subprocess`, `threading`, `json`)
- **APIs**: Open-Meteo Weather API, Wikipedia REST API

---

## 📄 License
MIT License. Free to use, modify, and distribute.
