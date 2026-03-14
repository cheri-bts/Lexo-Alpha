# Lexo-Alpha
"Lexo-Alpha is an AI-powered accessibility tool that lives directly in the browser. It takes standard, difficult-to-read web pages and dynamically reshapes the text, layout, and colors to reduce cognitive load, while utilizing a cloud-based AI to simplify complex jargon in real-time.”
# Lexo Alpha: AI-Powered Web Accessibility for Neurodiversity

Lexo Alpha is a modern Chrome Extension (Manifest V3) designed to bridge the accessibility gap for users with dyslexia and ADHD. It utilizes real-time DOM manipulation and Generative AI to simplify, restructure, and vocalize web content.

## 🚀 Key Features
- **Dyslexia Mode:** Injects custom CSS to apply OpenDyslexic fonts and high-contrast, low-glare backgrounds.
- **Bionic Reading:** Uses a Depth-First Search (DFS) traversal to apply midpoint fixation bolding to text nodes.
- **AI Magic Menu:** Connects to **Gemini 2.5 Flash** via REST API to summarize or simplify complex jargon.
- **Hover-to-Hear:** Implements the native Web Speech API for zero-latency text-to-speech.
- **Reading Ruler:** A coordinate-tracking focus window to reduce visual cognitive load.

## 🛠️ Tech Stack
- **Languages:** JavaScript (ES6+), HTML5, CSS3
- **Architecture:** Client-Cloud (Serverless API integration)
- **Framework:** Chrome Extension Manifest V3
- **AI Engine:** Google Gemini 2.5 Flash API
- **Algorithms:** TreeWalker DOM Traversal, Regex Tokenization, Midpoint Fixation Math.

## 📊 System Architecture
The system follows a stateless, non-blocking architecture. 
1. **Frontend:** Injected Content Scripts & Popup UI.
2. **Communication:** Asynchronous HTTPS POST requests using JSON payloads.
3. **Backend:** Gemini AIaaS (AI-as-a-Service) for NLP tasks.

## 🛡️ Security & Privacy
- **Privacy by Design:** No user data is stored; all processing is transient and stateless.
- **Encryption:** All API communication is secured via TLS/HTTPS.
- **Least Privilege:** Permissions are restricted to `activeTab` to ensure user security.

## 🚧 Technical Challenges & Solutions
- **Event Propagation:** Resolved race conditions between injected UI and host page listeners using conditional event shielding.
- **DOM Integrity:** Utilized the TreeWalker API to ensure bionic formatting did not break parent HTML tags or links.
- **Latency Management:** Implemented the 'Flash' variant of Gemini to ensure sub-second response times for a seamless reading experience.
