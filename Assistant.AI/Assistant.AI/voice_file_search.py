"""
╔══════════════════════════════════════════════════════════════╗
║         Voice-Controlled File Search Assistant               ║
║         Uses: speech_recognition, pyttsx3, os               ║
╚══════════════════════════════════════════════════════════════╝

Commands you can say:
  - "Open my resume"
  - "Find Java file"
  - "Search for project report pdf"
  - "Open python program"
"""

import os
import sys
import time
import platform
import subprocess
import threading

# ──────────────────────────────────────────────
# Dependency check & install helper
# ──────────────────────────────────────────────
def install_if_missing(package, import_name=None):
    """Install a pip package if it cannot be imported."""
    import_name = import_name or package
    try:
        __import__(import_name)
    except ImportError:
        print(f"[SETUP] Installing '{package}' ...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package, "-q"])

install_if_missing("SpeechRecognition", "speech_recognition")
install_if_missing("pyttsx3")
install_if_missing("pyaudio")           # microphone driver for SpeechRecognition

import speech_recognition as sr        # noqa: E402  (installed above)
import pyttsx3                         # noqa: E402


# ══════════════════════════════════════════════
#  TEXT-TO-SPEECH ENGINE
# ══════════════════════════════════════════════
class VoiceEngine:
    """Wrapper around pyttsx3 that also prints every utterance."""

    def __init__(self):
        self._engine = pyttsx3.init()
        self._engine.setProperty("rate", 160)   # words per minute
        self._engine.setProperty("volume", 1.0) # 0.0 – 1.0

    def speak(self, text: str):
        """Print and speak *text*."""
        print(f"\n🔊 Assistant: {text}")
        self._engine.say(text)
        self._engine.runAndWait()


# ══════════════════════════════════════════════
#  COMMAND PARSER
# ══════════════════════════════════════════════

# Keywords that trigger a search
TRIGGER_WORDS = {"open", "find", "search", "locate", "look"}

# Common extension aliases the user might say
EXTENSION_ALIASES: dict[str, list[str]] = {
    "pdf":          [".pdf"],
    "word":         [".docx", ".doc"],
    "excel":        [".xlsx", ".xls", ".csv"],
    "powerpoint":   [".pptx", ".ppt"],
    "python":       [".py"],
    "java":         [".java"],
    "text":         [".txt"],
    "image":        [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"],
    "video":        [".mp4", ".avi", ".mkv", ".mov"],
    "audio":        [".mp3", ".wav", ".flac", ".aac"],
    "zip":          [".zip", ".rar", ".7z", ".tar"],
    "html":         [".html", ".htm"],
    "javascript":   [".js"],
    "css":          [".css"],
    "cpp":          [".cpp", ".cc", ".cxx"],
    "c":            [".c", ".h"],
    "kotlin":       [".kt"],
    "swift":        [".swift"],
    "ruby":         [".rb"],
    "go":           [".go"],
    "rust":         [".rs"],
    "sql":          [".sql"],
    "json":         [".json"],
    "xml":          [".xml"],
    "markdown":     [".md"],
}

# Noise words to strip from the keyword
STOP_WORDS = {
    "a", "an", "the", "my", "for", "file", "files",
    "document", "documents", "program", "programs",
    "script", "scripts", "folder", "report",
}


def parse_command(text: str) -> tuple[str | None, list[str]]:
    """
    Parse a voice command into (keyword, extensions).

    Returns
    -------
    keyword   : cleaned search term (may be empty string)
    extensions: list of file extensions to filter by (empty = all)
    """
    words = text.lower().split()

    # Must contain a trigger word
    if not any(w in TRIGGER_WORDS for w in words):
        return None, []

    # Remove trigger words and filler from the front
    filtered = [w for w in words if w not in TRIGGER_WORDS and w != "for"]

    # Detect extension aliases
    extensions: list[str] = []
    remaining:  list[str] = []

    for word in filtered:
        if word in EXTENSION_ALIASES:
            extensions.extend(EXTENSION_ALIASES[word])
        elif word.startswith(".") and len(word) > 1:
            extensions.append(word)          # user said ".pdf" literally
        elif word not in STOP_WORDS:
            remaining.append(word)

    keyword = " ".join(remaining).strip()
    return keyword, extensions


# ══════════════════════════════════════════════
#  FILE SYSTEM SEARCH
# ══════════════════════════════════════════════

# Folders that are almost certainly not useful and can slow the search
SKIP_DIRS = {
    # Windows
    "windows", "system32", "syswow64", "winsxs",
    "$recycle.bin", "system volume information",
    # macOS / Linux
    "proc", "sys", "dev", "run",
    # Common noise
    "__pycache__", ".git", "node_modules",
}

# Maximum files to return so we don't flood the terminal
MAX_RESULTS = 20

# Per-drive timeout (seconds) — prevents hanging on network drives
DRIVE_TIMEOUT = 15


def get_search_roots() -> list[str]:
    """Return root paths to search based on the operating system."""
    os_name = platform.system()

    if os_name == "Windows":
        import string
        import ctypes
        drives = []
        bitmask = ctypes.windll.kernel32.GetLogicalDrives()
        for letter in string.ascii_uppercase:
            if bitmask & 1:
                drives.append(f"{letter}:\\")
            bitmask >>= 1
        return drives

    elif os_name == "Darwin":   # macOS
        roots = ["/Users", "/Applications", "/Documents"]
        # also add mounted volumes
        if os.path.isdir("/Volumes"):
            roots += [os.path.join("/Volumes", v) for v in os.listdir("/Volumes")]
        return roots

    else:   # Linux
        home = os.path.expanduser("~")
        return [home, "/media", "/mnt", "/opt"]


def _search_in_root(root: str, keyword: str, extensions: list[str],
                    results: list[str], stop_event: threading.Event) -> None:
    """
    Walk *root* and append matching paths to *results*.
    Respects *stop_event* to allow timeout cancellation.
    """
    kw_lower = keyword.lower()

    for dirpath, dirnames, filenames in os.walk(root, topdown=True, onerror=None):
        if stop_event.is_set():
            break

        # Prune directories we should not descend into
        dirnames[:] = [
            d for d in dirnames
            if d.lower() not in SKIP_DIRS and not d.startswith(".")
        ]

        for fname in filenames:
            if stop_event.is_set():
                return

            fname_lower = fname.lower()
            name_no_ext, ext = os.path.splitext(fname_lower)

            # Extension filter
            if extensions and ext not in extensions:
                continue

            # Keyword filter (partial match on name without extension)
            if kw_lower and kw_lower not in name_no_ext and kw_lower not in fname_lower:
                continue

            full_path = os.path.join(dirpath, fname)
            results.append(full_path)

            if len(results) >= MAX_RESULTS:
                stop_event.set()
                return


def search_files(keyword: str, extensions: list[str]) -> list[str]:
    """
    Search all relevant drives/roots for files matching *keyword* and *extensions*.
    Each root is searched in a separate thread with a timeout.
    """
    roots   = get_search_roots()
    results: list[str] = []
    threads: list[threading.Thread] = []

    print(f"\n🔍 Searching for: '{keyword or '<any>'}'"
          f"  |  extensions: {extensions or ['<any>']}")
    print(f"   Roots: {roots}\n")

    for root in roots:
        if not os.path.isdir(root):
            continue

        stop_event = threading.Event()
        t = threading.Thread(
            target=_search_in_root,
            args=(root, keyword, extensions, results, stop_event),
            daemon=True,
        )
        t.start()
        threads.append((t, stop_event))

    # Wait for all threads, honouring per-drive timeout
    for t, stop_event in threads:
        t.join(timeout=DRIVE_TIMEOUT)
        if t.is_alive():
            print(f"   ⏱  Timeout reached for a drive — moving on.")
            stop_event.set()

    return list(dict.fromkeys(results))  # deduplicate while preserving order


# ══════════════════════════════════════════════
#  FILE OPENER
# ══════════════════════════════════════════════

def open_file(path: str) -> bool:
    """Open *path* with the default system application. Returns True on success."""
    try:
        os_name = platform.system()
        if os_name == "Windows":
            os.startfile(path)
        elif os_name == "Darwin":
            subprocess.Popen(["open", path])
        else:
            subprocess.Popen(["xdg-open", path])
        return True
    except Exception as exc:
        print(f"   ❌ Could not open file: {exc}")
        return False


# ══════════════════════════════════════════════
#  SPEECH RECOGNISER
# ══════════════════════════════════════════════

class MicrophoneListener:
    """Listens to the microphone and returns recognised text."""

    def __init__(self):
        self._recogniser = sr.Recognizer()
        # Adjust for ambient noise on first use
        self._recogniser.dynamic_energy_threshold = True

    def listen(self, timeout: int = 8) -> str | None:
        """
        Block until speech is detected or *timeout* seconds pass.
        Returns the recognised text, or None on failure.
        """
        with sr.Microphone() as source:
            print("\n🎙  Listening ... (speak now)")
            try:
                self._recogniser.adjust_for_ambient_noise(source, duration=0.5)
                audio = self._recogniser.listen(source, timeout=timeout, phrase_time_limit=10)
            except sr.WaitTimeoutError:
                print("   (no speech detected)")
                return None

        try:
            text = self._recogniser.recognize_google(audio)
            print(f"   You said: \"{text}\"")
            return text
        except sr.UnknownValueError:
            print("   (could not understand audio)")
            return None
        except sr.RequestError as exc:
            print(f"   ❌ Speech service error: {exc}")
            return None


# ══════════════════════════════════════════════
#  MAIN ASSISTANT LOOP
# ══════════════════════════════════════════════

def run_assistant():
    """Main loop: listen → parse → search → respond."""
    voice  = VoiceEngine()
    listener = MicrophoneListener()

    banner = (
        "Voice File Search Assistant ready!\n"
        "Say 'quit' or 'exit' to stop.\n"
        "Example commands:\n"
        "  • 'Open my resume'\n"
        "  • 'Find Java file'\n"
        "  • 'Search for project report pdf'\n"
        "  • 'Open python program'\n"
    )
    print("\n" + "═" * 60)
    print(banner)
    print("═" * 60)
    voice.speak("Voice File Search Assistant is ready. Say a command.")

    while True:
        # ── Step 1: Get voice input ──────────────────────────────
        text = listener.listen()

        if text is None:
            voice.speak("I did not catch that. Please try again.")
            continue

        # ── Step 2: Check for exit ───────────────────────────────
        if any(word in text.lower() for word in ("quit", "exit", "stop", "bye")):
            voice.speak("Goodbye!")
            break

        # ── Step 3: Parse command ────────────────────────────────
        keyword, extensions = parse_command(text)

        if keyword is None:
            voice.speak(
                "Sorry, I did not understand. "
                "Try saying 'open', 'find', or 'search' followed by a file name."
            )
            continue

        if not keyword and not extensions:
            voice.speak("Please tell me what file to search for.")
            continue

        # ── Step 4: Search ───────────────────────────────────────
        voice.speak(f"Searching for {keyword or 'files'} {'of type ' + ', '.join(extensions) if extensions else ''}. Please wait.")

        start = time.time()
        results = search_files(keyword, extensions)
        elapsed = time.time() - start
        print(f"\n⏱  Search completed in {elapsed:.1f}s  —  {len(results)} result(s) found.")

        # ── Step 5: Respond ──────────────────────────────────────
        if not results:
            voice.speak("File not found. Please try a different search term.")

        elif len(results) == 1:
            path = results[0]
            voice.speak(f"Found one file: {os.path.basename(path)}. Opening it now.")
            print(f"\n✅ Opening: {path}")
            if not open_file(path):
                voice.speak("I found the file but could not open it automatically.")

        else:
            voice.speak(f"Found {len(results)} matching files. Here are the results:")
            print("\n📂 Results:")
            for i, path in enumerate(results, 1):
                print(f"  {i:>2}. {path}")
            voice.speak(
                "Multiple files were found. Please check the terminal for the full list. "
                "Which file number would you like to open?"
            )

            # ── Optional: let user pick by number ────────────────
            pick_text = listener.listen(timeout=6)
            if pick_text:
                for token in pick_text.split():
                    if token.isdigit():
                        idx = int(token) - 1
                        if 0 <= idx < len(results):
                            chosen = results[idx]
                            voice.speak(f"Opening {os.path.basename(chosen)}.")
                            print(f"\n✅ Opening: {chosen}")
                            open_file(chosen)
                        else:
                            voice.speak("That number is out of range.")
                        break
                else:
                    voice.speak("No valid number heard. No file was opened.")

        print()


# ══════════════════════════════════════════════
#  ENTRY POINT
# ══════════════════════════════════════════════

if __name__ == "__main__":
    try:
        run_assistant()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user. Exiting.")
